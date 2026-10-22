"""Memoria conversacional.

Decisión de arquitectura: el historial NO se guarda en el ai-service. El backend
es la única fuente de verdad (tabla ``chat_history``), filtra por el ``user_id``
del JWT y por ``session_id`` y envía los últimos turnos en cada petición.

Ventajas frente a un checkpointer de LangGraph:
- Un solo sistema de memoria (sin duplicar ``chat_history``).
- Aislamiento entre usuarios garantizado por la autenticación del backend.
- El ai-service sigue sin estado: sobrevive a reinicios y suspensiones del Space.
- Sin dependencias ni tablas nuevas.

Este módulo convierte ese historial en mensajes de LangChain y lo recorta para
controlar el consumo de tokens.
"""

from __future__ import annotations

from typing import Iterable, Literal

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from pydantic import BaseModel, Field, field_validator


class HistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=8000)

    @field_validator("content")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()


def _truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def build_history_messages(
    history: Iterable[HistoryItem | dict] | None,
    current_message: str,
    max_turns: int = 6,
    max_chars: int = 6000,
    item_max_chars: int = 1500,
) -> list[BaseMessage]:
    """Devuelve los turnos previos como mensajes, en orden cronológico.

    - Descarta entradas vacías o con rol desconocido.
    - Evita duplicar el mensaje actual si el cliente ya lo incluyó al final.
    - Conserva como máximo ``max_turns`` pares y ``max_chars`` caracteres,
      priorizando los turnos más recientes.
    - Garantiza que el primer mensaje devuelto sea del usuario.
    """
    items: list[HistoryItem] = []
    for raw in history or []:
        try:
            item = raw if isinstance(raw, HistoryItem) else HistoryItem(**raw)
        except Exception:
            continue
        if item.content:
            items.append(item)

    current = (current_message or "").strip()
    if items and items[-1].role == "user" and items[-1].content == current:
        items.pop()

    kept: list[HistoryItem] = []
    total = 0
    for item in reversed(items[-max_turns * 2:]):
        text = _truncate(item.content, item_max_chars)
        if total + len(text) > max_chars:
            break
        kept.append(HistoryItem(role=item.role, content=text))
        total += len(text)
    kept.reverse()

    while kept and kept[0].role != "user":
        kept.pop(0)

    return [HumanMessage(content=i.content) if i.role == "user" else AIMessage(content=i.content) for i in kept]


def last_user_text(messages: Iterable[BaseMessage]) -> str:
    """Último mensaje del usuario (ignora mensajes de herramientas y del asistente)."""
    for m in reversed(list(messages)):
        if isinstance(m, HumanMessage):
            return m.content if isinstance(m.content, str) else str(m.content)
    return ""


def previous_user_text(messages: Iterable[BaseMessage]) -> str:
    """Penúltimo mensaje del usuario, o cadena vacía si es el primer turno."""
    found = 0
    for m in reversed(list(messages)):
        if isinstance(m, HumanMessage):
            found += 1
            if found == 2:
                return m.content if isinstance(m.content, str) else str(m.content)
    return ""
