import json
from typing import List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv

load_dotenv()

# --- Pydantic Models for Output Structure ---
class SalesResponse(BaseModel):
    thought: str = Field(description="사용자의 의도(현장 용어 해석 포함)와 검색된 정보 중 가장 적합한 상품을 선택한 논리적 과정 요약")
    answer: str = Field(description="사용자에게 보여질 실제 친절한 답변 텍스트 (줄바꿈은 \\n 사용)")
    related_tags: List[str] = Field(description="연관 상품 태그 리스트 (예: ['#롤러', '#마스킹테이프'])")

# --- System Prompt Definition ---
SYSTEM_PROMPT = """# Role (역할)
당신은 건설 자재 전문 쇼핑몰 'Access Nine(엑세스나인)'의 숙련된 AI 영업 어시스턴트입니다.
사용자의 질문과 제공된 [검색된 상품 정보(Context)]를 바탕으로 가장 적절한 상품을 추천하고 답변해야 합니다.

# Operational Rules (운영 원칙)
1. **현장 용어 이해 및 응대:**
   - 사용자가 건설 현장 은어(예: 공구리, 우마, 반생, 야마 등)를 사용하면, 이를 표준 자재명으로 이해하고 답변에 자연스럽게 언급하세요.
   - 예시: "찾으시는 공구리(콘크리트) 작업용 자재로는..."
2. **Fact 기반 답변 (No Hallucination):**
   - 반드시 아래 제공되는 [Context] 내에 있는 정보로만 답변하세요.
   - [Context]에 없는 내용은 "죄송하지만 해당 상품 정보는 현재 확인되지 않습니다."라고 답하세요.
3. **영업 지향적 태도:**
   - 상품의 장점, 스펙, 용도를 간결하고 명확하게 설명하여 구매를 유도하세요.
4. **구조화된 출력 (Structured Output):**
   - 최종 답변은 반드시 **JSON 포맷**이어야 합니다. Markdown이나 잡담을 섞지 마세요.

# Output Format (JSON 형식)
{
  "thought": "사용자의 의도(현장 용어 해석 포함)와 검색된 정보 중 가장 적합한 상품을 선택한 논리적 과정 요약",
  "answer": "사용자에게 보여질 실제 친절한 답변 텍스트 (줄바꿈은 \\n 사용)",
  "related_tags": ["#연관상품1", "#연관상품2", "#카테고리명"]
}

# Tag Recommendation Logic (태그 추천 로직)
- 'related_tags'에는 사용자가 검색한 상품과 함께 구매하면 좋은 상품(Cross-selling)이나 상위 카테고리를 3~5개 추천하세요.
- 예: '페인트' 검색 시 -> ["#롤러", "#마스킹테이프", "#신너"]

# Context (검색된 상품 정보)
{context}

---
# User Query (사용자 질문)
{question}
"""

def get_sales_agent():
    # Model initialization
    # Note: Ensure GOOGLE_API_KEY is set in .env
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
    
    parser = JsonOutputParser(pydantic_object=SalesResponse)
    
    prompt = ChatPromptTemplate.from_template(SYSTEM_PROMPT)
    
    chain = prompt | llm | parser
    
    return chain

if __name__ == "__main__":
    # Test execution within the module
    agent = get_sales_agent()
    
    # Mock Context
    mock_context = """
    [상품 ID: 101]
    상품명: 강력 콘크리트 보수제 (FastFix 300)
    카테고리: 보수/방수
    특징: 30분 초속경, 고강도, 크랙 보수용
    가격: 15,000원
    
    [상품 ID: 102]
    상품명: 전문가용 미장 흙손 (Stainless 300mm)
    카테고리: 미장공구
    특징: 녹슬지 않는 스테인리스, 편안한 그립감
    가격: 8,500원
    """
    
    question = "공구리 깨진데 바르는거 좀 줘봐요. 빨리 굳는걸로."
    
    response = agent.invoke({"context": mock_context, "question": question})
    print(json.dumps(response, ensure_ascii=False, indent=2))
