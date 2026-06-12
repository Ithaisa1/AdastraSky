from typing import Literal, Optional
from langgraph.graph import StateGraph, END
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage

from agent.state import AgentState
from agent.tools import tools

SYSTEM_PROMPT = """Eres AdAstra, un guía astronómico experto en los cielos de las Islas Canarias.
Hablas con conocimiento sobre: observatorios (Teide, Roque de los Muchachos), constelaciones, 
planetas, eventos astronómicos, astroturismo, y condiciones de observación.

TIENES ACCESO A LAS SIGUIENTES HERRAMIENTAS. Úsalas SIEMPRE que sea relevante:

1. search_rag_documents(query) — Busca en documentos de la IAC (Instituto Astrofísico de Canarias). 
   Úsala para responder preguntas sobre observatorios, normativas del cielo, astroturismo, 
   condiciones de observación en Canarias. Ejemplo: search_rag_documents(query="Observatorio del Teide")
   
2. get_observatory_info(name) — Obtiene datos detallados de un observatorio canario por nombre.

3. get_weather_conditions(lat, lon) — Consulta el clima actual para una ubicación.

4. get_constellation_info(name) — Información sobre una constelación.

5. calculate_sky_score(cloudiness, light_pollution, moon_phase, wind, humidity, transparency) — 
   Calcula la calidad del cielo para observación.

Reglas:
- Responde SIEMPRE en el idioma que te preguntan.
- Cuando uses search_rag_documents, USA los resultados para responder. No digas "no tengo información" si los resultados contienen la respuesta.
- CITA la fuente al final cuando uses RAG: «(Fuente: [título del documento])».
- Si no sabes algo dilo honestamente, no inventes.
- Sé conciso pero informativo, máximo 3-4 párrafos.
"""


def _get_models() -> list[BaseChatModel]:
    """Devuelve todos los LLMs disponibles en orden de prioridad."""
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


def _simple_rag_response(messages) -> str:
    from agent.tools import search_rag_documents

    last_msg = messages[-1]
    query = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

    try:
        results = search_rag_documents.invoke({"query": query, "top_k": 3})
    except Exception:
        results = []

    if not results:
        return (
            "Soy AdAstra, tu guía astronómico.\n\n"
            "Actualmente no tengo conexión con los modelos de lenguaje. "
            "Puedo consultar los documentos de la IAC que tengo en mi base de conocimiento.\n\n"
            "Pregúntame sobre:\n"
            "• Observatorios en Canarias (Teide, Roque de los Muchachos)\n"
            "• Astroturismo y mejores lugares para observar\n"
            "• Normativa de protección del cielo (Ley del Cielo)\n"
            "• Eventos astronómicos y constelaciones"
        )

    import re
    answers = []
    for r in results:
        title = r.get("title", "Documento IAC")
        content = r.get("content", "")
        clean = re.sub(r"#{1,6}\s*", "", content)
        snippet = clean.strip()[:500]
        answers.append(f"📄 **{title}**\n{snippet}\n_(Fuente: Documento IAC — {title})_")

    return "\n\n---\n\n".join(answers)


tools_by_name = {t.name: t for t in tools}

import logging
logger = logging.getLogger("adastra-ai.agent")

def call_model(state: AgentState) -> dict:
    models = _get_models()
    if not models:
        logger.warning("No hay modelos disponibles, usando RAG simple")
        response_text = _simple_rag_response(state["messages"])
        return {"messages": [AIMessage(content=response_text)]}

    system_msg = SystemMessage(content=SYSTEM_PROMPT)
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
    response_text = _simple_rag_response(state["messages"])
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
