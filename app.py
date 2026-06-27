from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent.graph import app as tax_agent

app = FastAPI(title="🧠 Agentic Tax Assistant API", version="1.0")

# تفعيل الـ CORS لمنع حظر الاتصال من واجهات الويب
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str  
    question: str    

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        init_state = {
            "session_id": request.session_id,
            "question": request.question,
            "rewritten_question": "",
            "category": "",
            "topic": "",
            "context": "",
            "answer": "",
            "use_web": False,
            "retry_with_web": False
        }
        
        # استدعاء الجراف
        result = tax_agent.invoke(init_state)
        
        return {
            "status": "success",
            "answer": result.get("answer", "عذراً، لم نتمكن من صياغة إجابة.")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))