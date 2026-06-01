from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
from uuid import uuid4

from agent.agent import build_agent

router = APIRouter(prefix="/api/chat", tags=["chat"])

_agent = None


def get_agent():
    global _agent
    if _agent is None:
        _agent = build_agent()
    return _agent


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Mensaje del usuario")
    language: str = Field(default="es", pattern="^(es|en|de)$")
    user_id: str | None = None
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: list[dict] = []


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    agent = get_agent()
    session_id = request.session_id or str(uuid4())

    config = {"configurable": {"thread_id": session_id}}
    inputs = {
        "messages": [HumanMessage(content=request.message)],
        "session_id": session_id,
        "language": request.language,
        "user_id": request.user_id,
    }

    try:
        result = await agent.ainvoke(inputs, config)
        last_msg = result["messages"][-1]
        response_text = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

        sources = []
        for msg in result["messages"]:
            if hasattr(msg, "additional_kwargs") and msg.additional_kwargs.get("source"):
                sources.append(msg.additional_kwargs["source"])

        return ChatResponse(response=response_text, session_id=session_id, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error del agente: {str(e)}")


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    return {"session_id": session_id, "history": []}
