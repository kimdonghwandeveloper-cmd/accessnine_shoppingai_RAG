from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from accessnine_shoppingai_rag.agent import get_sales_agent, MOCK_PRODUCT_DB, SalesResponse

app = FastAPI(title="AccessNine Shopping AI API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: str = MOCK_PRODUCT_DB

@app.post("/api/chat", response_model=SalesResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        agent = get_sales_agent()
        response = agent.invoke({"context": request.context, "question": request.message})
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("accessnine_shoppingai_rag.server:app", host="0.0.0.0", port=8000, reload=True)
