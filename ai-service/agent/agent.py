import re
import logging
from typing import Literal, Optional
from langgraph.graph import StateGraph, END
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage

from agent.state import AgentState
from agent.tools import tools, search_rag_documents

logger = logging.getLogger("adastra-ai.agent")

SYSTEM_PROMPT = """Eres AdAstra, un guía astronómico experto en los cielos de las Islas Canarias.
Hablas con conocimiento sobre: observatorios (Teide, Roque de los Muchachos), constelaciones, 
planetas, eventos astronómicos, astroturismo, y condiciones de observación.

TIENES ACCESO A HERRAMIENTAS. Si necesitas información más detallada o datos actualizados,
puedes usar: get_observatory_info (datos de observatorio), get_weather_conditions (clima),
get_constellation_info (constelaciones), calculate_sky_score (calidad del cielo).

Reglas:
- Responde SIEMPRE en el idioma que te preguntan.
- Si la sección INFORMACIÓN DE DOCUMENTOS IAC contiene datos relevantes, USA esa información para responder. No digas "no tengo información" si los documentos la contienen.
- Sé conciso pero informativo, máximo 3-4 párrafos.
"""

def _get_models() -> list[BaseChatModel]:
    from config import get_settings
    s = get_settings()
    import os
    models = []
    groq_key = os.environ.get("GROQ_API_KEY") or s.groq_api_key or ""
    openai_key = os.environ.get("OPENAI_API_KEY") or s.openai_api_key or ""
    groq_model = os.environ.get("GROQ_MODEL") or s.groq_model or "llama-3.3-70b-versatile"
    openai_model = os.environ.get("OPENAI_MODEL") or s.openai_model or "gpt-4o-mini"
    if groq_key:
        from langchain_groq import ChatGroq
        models.append(ChatGroq(model=groq_model, api_key=groq_key, temperature=0.3))
    if openai_key:
        from langchain_openai import ChatOpenAI
        models.append(ChatOpenAI(model=openai_model, api_key=openai_key, temperature=0.3))
    return models


def _format_rag_results(results: list[dict]) -> str:
    if not results:
        return ""
    parts = []
    for r in results:
        title = r.get("title", "Documento IAC")
        content = r.get("content", "")
        clean = re.sub(r"#{1,6}\s*", "", content)
        snippet = clean.strip()[:600]
        parts.append(f"[Documento: {title}]\n{snippet}")
    return "\n\n---\n\n".join(parts)


def _search_rag(query: str) -> list[dict]:
    try:
        return search_rag_documents.invoke({"query": query, "top_k": 5})
    except Exception:
        return []


tools_by_name = {t.name: t for t in tools}


def call_model(state: AgentState) -> dict:
    last_msg = state["messages"][-1]
    query = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

    rag_results = _search_rag(query)
    rag_context = _format_rag_results(rag_results)

    context_block = ""
    if rag_context:
        context_block = (
            "\n\nINFORMACIÓN DE DOCUMENTOS IAC:\n" + rag_context +
            "\n\nUsa esta información para responder. Si los documentos contienen datos relevantes, NUNCA digas que no sabes. Cita la fuente al final."
        )

    system_msg = SystemMessage(content=SYSTEM_PROMPT + context_block)

    try:
        models = _get_models()
    except Exception as e:
        logger.error(f"Error obteniendo modelos: {str(e)}")
        models = []
    if not models:
        response_text = _format_rag_results(rag_results) if rag_results else (
            "Soy AdAstra, tu guía astronómico.\n\n"
            "Actualmente no tengo conexión con los modelos de lenguaje. "
            "Puedo consultar los documentos de la IAC que tengo en mi base de conocimiento.\n\n"
            "Pregúntame sobre:\n"
            "• Observatorios en Canarias (Teide, Roque de los Muchachos)\n"
            "• Astroturismo y mejores lugares para observar\n"
            "• Normativa de protección del cielo (Ley del Cielo)\n"
            "• Eventos astronómicos y constelaciones"
        )
        return {"messages": [AIMessage(content=response_text)]}

    last_error = None
    for llm in models:
        try:
            llm_with_tools = llm.bind_tools(tools)
            response = llm_with_tools.invoke([system_msg] + list(state["messages"]))
            return {"messages": [response]}
        except Exception as e:
            logger.error(f"Error con LLM {llm.__class__.__name__}: {str(e)}")
            last_error = e
            continue

    logger.error(f"Todos los LLMs fallaron. Último error: {last_error}")
    response_text = _format_rag_results(rag_results) if rag_results else "Lo siento, no pude procesar tu consulta. Intenta de nuevo más tarde."
    return {"messages": [AIMessage(content=response_text)]}


def call_tool(state: AgentState) -> dict:
    last_msg = state["messages"][-1]
    tool_calls = last_msg.tool_calls
    results = []
    for tc in tool_calls:
        tool_fn = tools_by_name.get(tc["name"])
        if not tool_fn:
            results.append(ToolMessage(content=f"Tool {tc['name']} no encontrada", tool_call_id=tc["id"]))
            continue
        try:
            result = tool_fn.invoke(tc["args"])
            content = str(result)
            results.append(ToolMessage(content=content, tool_call_id=tc["id"]))
        except Exception as e:
            results.append(ToolMessage(content=f"Error: {str(e)}", tool_call_id=tc["id"]))
    return {"messages": results}


def should_continue(state: AgentState) -> Literal["tools", END]:
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    return END


def build_agent() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("agent", call_model)
    workflow.add_node("tools", call_tool)

    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "agent")

    return workflow.compile()
