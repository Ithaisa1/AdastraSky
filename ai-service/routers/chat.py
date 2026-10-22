import asyncio
import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.errors import GraphRecursionError
from pydantic import BaseModel, Field

from agent.agent import build_agent
from agent.memory import HistoryItem, build_history_messages
from agent.messages import msg
from config import get_settings
from security import require_api_key

logger = logging.getLogger("adastra-ai.chat")
router = APIRouter(prefix="/api/chat", tags=["chat"])

_agent = None
_settings = get_settings()
_semaphore = asyncio.Semaphore(_settings.max_concurrent_llm)
RECURSION_LIMIT = 10  # ~4 rondas de herramientas como máximo


def get_agent():
    global _agent
    if _agent is None:
        _agent = build_agent()
    return _agent


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="Mensaje del usuario")
    language: str = Field(default="es", pattern="^(es|en|de)$")
    user_id: str | None = None
    session_id: str | None = None
    history: list[HistoryItem] = Field(default_factory=list, max_length=40,
                                       description="Turnos previos de esta sesión en orden cronológico (los aporta el backend)")


class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: list[dict] = []
    metadata: dict = {}


@router.post("", response_model=ChatResponse, dependencies=[Depends(require_api_key)])
async def chat(request: ChatRequest):
    agent = get_agent()
    session_id = request.session_id or str(uuid4())
    s = get_settings()
    history_msgs = build_history_messages(
        request.history, request.message,
        max_turns=s.history_max_turns, max_chars=s.history_max_chars, item_max_chars=s.history_item_max_chars,
    )
    inputs = {
        "messages": history_msgs + [HumanMessage(content=request.message)],
        "session_id": session_id,
        "language": request.language,
        "user_id": request.user_id,
        "cacheable": not history_msgs,
        "sources": [],
        "used_tools": [],
        "rag_seen": [],
    }
    config = {"recursion_limit": RECURSION_LIMIT}
    meta = {"history_turns_used": len(history_msgs)}

    try:
        async with _semaphore:
            result = await asyncio.wait_for(agent.ainvoke(inputs, config), timeout=s.chat_timeout_seconds)
    except asyncio.TimeoutError:
        logger.error("Timeout del agente (%ss) en sesión %s", s.chat_timeout_seconds, session_id)
        return ChatResponse(response=msg("busy", request.language), session_id=session_id, metadata={**meta, "mode": "timeout"})
    except GraphRecursionError:
        logger.error("Límite de pasos del agente alcanzado en sesión %s", session_id)
        return ChatResponse(response=msg("generic_error", request.language), session_id=session_id, metadata={**meta, "mode": "recursion_limit"})
    except Exception as e:
        logger.exception("Error del agente")
        raise HTTPException(status_code=500, detail="Error interno del agente") from e

    last_msg = result["messages"][-1]
    response_text = last_msg.content if isinstance(last_msg, AIMessage) and isinstance(last_msg.content, str) else ""
    if not response_text.strip():
        response_text = msg("generic_error", request.language)
    meta.update(mode=result.get("mode"), provider=result.get("provider"), tools=result.get("used_tools", []))
    return ChatResponse(response=response_text, session_id=session_id, sources=result.get("sources", []), metadata=meta)


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    return {
        "session_id": session_id,
        "history": [],
        "note": "El historial se guarda en el backend: GET /api/chat/history/{session_id}",
    }
