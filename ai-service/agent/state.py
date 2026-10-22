from typing import Annotated, Optional, Sequence, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    session_id: str
    language: str
    user_id: Optional[str]
    # Memoria / caché
    cacheable: bool            # True solo en el primer turno de una conversación
    # RAG: contexto recuperado una vez por pregunta y fragmentos ya entregados
    rag_context: str
    rag_seen: list[str]
    # Trazabilidad de la respuesta
    sources: list[dict]
    used_tools: list[str]
    provider: Optional[str]
    mode: str                  # llm | cache | greeting | guard_* | offline | degraded
