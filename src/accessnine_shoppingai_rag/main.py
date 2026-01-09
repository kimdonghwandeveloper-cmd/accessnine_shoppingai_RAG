import argparse
import json
import sys
from accessnine_shoppingai_rag.agent import get_sales_agent

# Mock data store acting as retrieval result
MOCK_PRODUCT_DB = """
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

[상품 ID: 103]
상품명: 다목적 수성 프라이머 (PrimeOne 4L)
카테고리: 페인트/도장
특징: 강력한 부착력, 냄새 적음, 빠른 건조
가격: 22,000원

[상품 ID: 104]
상품명: 고강도 반생 (10번선) 1묶음
카테고리: 철물/자재
특징: 결속력 우수, 현장 필수 자재, 부식 방지 처리
가격: 45,000원
"""

def main():
    parser = argparse.ArgumentParser(description="Access Nine Shopping AI Assistant CLI")
    parser.add_argument("query", nargs="?", help="User query string")
    parser.add_argument("--context", help="Inject custom context (optional)", default=MOCK_PRODUCT_DB)
    
    args = parser.parse_args()
    
    query = args.query
    if not query:
        # Interactive mode if no argument provided
        print("엑세스나인 AI 영업 사원입니다. 무엇을 도와드릴까요? (종료: q)")
        while True:
            try:
                query = input("\n질문: ")
                if query.lower() in ('q', 'quit', 'exit'):
                    break
                if not query.strip():
                    continue
                
                process_query(query, args.context)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")
    else:
        process_query(query, args.context)

def process_query(query: str, context: str):
    agent = get_sales_agent()
    print("생각 중...", file=sys.stderr)
    try:
        response = agent.invoke({"context": context, "question": query})
        print(json.dumps(response, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"Error generating response: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
