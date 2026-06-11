from typing import Literal, Optional
from langgraph.graph import StateGraph, END
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage

from agent.state import AgentState
from agent.tools import tools

SYSTEM_PROMPT = """Eres AdAstra, un guía astronómico experto en los cielos de las Islas Canarias.
Hablas con conocimiento sobre: observatorios (Teide, Roque de los Muchachos), constelaciones, 
planetas, eventos astronómicos, astroturismo, y condiciones de observación.

Reglas:
- Responde SIEMPRE en el idioma que te preguntan.
- Cuando uses información de documentos RAG, CITA la fuente al final: «(Fuente: [título del documento])».
- Si no sabes algo dilo honestamente, no inventes.
- Sé conciso pero informativo, máximo 3-4 párrafos.
- Si preguntan por observación nocturna, sugiere consultar el clima con la herramienta adecuada.
"""


def _build_model() -> Optional[BaseChatModel]:
    from config import get_settings
    s = get_settings()
    if s.groq_api_key:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=s.groq_model,
            api_key=s.groq_api_key,
            temperature=0.3,
        )
    if s.openai_api_key:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=s.openai_model,
            api_key=s.openai_api_key,
            temperature=0.3,
        )
    if s.hf_token:
        from langchain_huggingface import HuggingFaceEndpoint
        return HuggingFaceEndpoint(
            repo_id=s.hf_model,
            huggingfacehub_api_token=s.hf_token,
            temperature=0.3,
            max_new_tokens=512,
        )
    return None


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
            "Actualmente estoy en **modo offline** (sin conexión a ningún LLM). "
            "Puedo consultar los documentos de la IAC que tengo en mi base de conocimiento.\n\n"
            "Pregúntame sobre:\n"
            "• Observatorios en Canarias (Teide, Roque de los Muchachos)\n"
            "• Astroturismo y mejores lugares para observar\n"
            "• Normativa de protección del cielo (Ley del Cielo)\n"
            "• Eventos astronómicos y constelaciones\n\n"
            "_Para respuestas más completas, configura GROQ_API_KEY o OPENAI_API_KEY en el .env_"
        )

    answers = []
    for r in results:
        title = r.get("title", "Documento IAC")
        content = r.get("content", "")
        snippet = content.strip()[:600]
        answers.append(f"📄 **{title}**\n{snippet}\n\n_(Fuente: Documento IAC — {title})_")

    return "\n\n---\n\n".join(answers)


tools_by_name = {t.name: t for t in tools}


def call_model(state: AgentState) -> dict:
    llm = _build_model()
    if llm is None:
        response_text = _simple_rag_response(state["messages"])
        return {"messages": [AIMessage(content=response_text)]}

    system_msg = SystemMessage(content=SYSTEM_PROMPT)
    llm_with_tools = llm.bind_tools(tools)
    try:
        response = llm_with_tools.invoke([system_msg] + list(state["messages"]))
        return {"messages": [response]}
    except Exception:
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
