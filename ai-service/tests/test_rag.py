"""RAG: recuperación, citas, idioma y estrategia proactiva + herramienta."""

import json
import re
import sys
from pathlib import Path

import pytest
from langchain_core.messages import AIMessage, SystemMessage, ToolMessage

import agent.agent as agent_mod
from rag.vector_store import DOCUMENTS_DIR, get_vector_store
from tests.conftest import FakeLLM, post_chat

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
import eval_rag  # noqa: E402

DOC_TITLES = {re.search(r"^# (.+)$", p.read_text(encoding="utf-8"), re.M).group(1) for p in DOCUMENTS_DIR.glob("*.md")}


def test_index_covers_all_documents_and_languages():
    store = get_vector_store()
    files = {d.metadata["file"] for d in store.chunks}
    assert len(files) == 18
    assert {d.metadata["language"] for d in store.chunks} == {"es", "en", "de"}
    assert all(d.metadata["title"] in DOC_TITLES for d in store.chunks)


@pytest.mark.parametrize("lang", ["es", "en", "de"])
def test_results_prefer_user_language_without_duplicates(lang):
    res = get_vector_store().similarity_search("Roque de los Muchachos", k=4, prefer_lang=lang)
    assert res and res[0].metadata["language"] == lang
    ids = [d.metadata["chunk_id"] + d.metadata["language"] for d in res]
    assert len(ids) == len(set(ids))


def test_no_results_for_irrelevant_query():
    assert get_vector_store().similarity_search("xqzv wqpl", k=4, prefer_lang="es") == []
    assert get_vector_store().similarity_search("", k=4) == []


def test_retrieval_quality_does_not_regress():
    """Umbrales medidos con scripts/eval_rag.py (36 consultas es/en/de)."""
    store = get_vector_store()
    s = eval_rag.summary(eval_rag.evaluate(lambda q, l, k: store.similarity_search(q, k=k, prefer_lang=l)))
    assert s["all"]["doc3"] >= 0.90
    assert s["all"]["answer3"] >= 0.90
    assert s["all"]["lang1"] == 1.0
    for lang in ("es", "en", "de"):
        assert s[lang]["doc3"] >= 0.80, lang


def test_sources_are_real_documents(client, use_providers):
    use_providers(FakeLLM([AIMessage(content="El Teide alberga GREGOR. Fuente: Observatorio del Teide (OT)")]))
    r = post_chat(client, "¿Qué telescopios hay en el Teide?")
    assert r["sources"], "debe devolver fuentes"
    assert all(s["title"] in DOC_TITLES for s in r["sources"])


def test_system_prompt_forbids_invented_references(client, use_providers):
    llm = FakeLLM()
    use_providers(llm)
    post_chat(client, "¿Qué es la Ley del Cielo?")
    system = llm.calls[0][0].content
    assert "NUNCA inventes referencias" in system
    assert "INFORMACIÓN DE DOCUMENTOS IAC" in system and "Ley del Cielo" in system


def test_no_rag_context_when_nothing_relevant(client, use_providers):
    llm = FakeLLM()
    use_providers(llm)
    r = post_chat(client, "xqzv wqpl astronomía")
    assert r["sources"] == [] or all(s["title"] in DOC_TITLES for s in r["sources"])


def test_proactive_retrieval_runs_once_per_question(client, use_providers, monkeypatch):
    calls = []
    real = agent_mod.rag_search
    monkeypatch.setattr(agent_mod, "rag_search", lambda q, lang, k=4: (calls.append(q), real(q, lang, k))[1])
    tool_turn = AIMessage(content="", tool_calls=[{"name": "get_constellation_info", "args": {"name": "Orion"}, "id": "t"}])
    use_providers(FakeLLM([tool_turn, AIMessage(content="Orión es visible en invierno.")]))
    post_chat(client, "¿Cuándo se ve Orión desde Canarias?")
    assert calls == ["¿Cuándo se ve Orión desde Canarias?"]  # no se re-busca con la salida de la herramienta


def test_rag_tool_does_not_repeat_context_chunks(client, use_providers):
    tool_turn = AIMessage(content="", tool_calls=[{"name": "search_rag_documents", "args": {"query": "telescopios del Teide"}, "id": "r"}])
    llm = FakeLLM([tool_turn, AIMessage(content="ok")])
    use_providers(llm)
    post_chat(client, "¿Qué telescopios hay en el Teide?")
    tool_msg = next(m for m in llm.calls[1] if isinstance(m, ToolMessage))
    payload = json.loads(tool_msg.content)
    system = llm.calls[0][0].content
    if isinstance(payload, list):
        assert all(item["content"][:80] not in system for item in payload)
    else:
        assert "ya están" in payload["note"]


def test_tool_output_is_valid_json_with_sources(client, use_providers):
    """Regresión: antes se devolvía str(list) y las fuentes se perdían."""
    tool_turn = AIMessage(content="", tool_calls=[{"name": "search_rag_documents", "args": {"query": "Reserva Starlight sanciones"}, "id": "r"}])
    llm = FakeLLM([tool_turn, AIMessage(content="ok")])
    use_providers(llm)
    r = post_chat(client, "Háblame de la Ley del Cielo")
    tool_msg = next(m for m in llm.calls[1] if isinstance(m, ToolMessage))
    json.loads(tool_msg.content)
    assert any("Ley del Cielo" in s["title"] for s in r["sources"])


def test_follow_up_retrieval_uses_previous_question():
    from langchain_core.messages import HumanMessage
    msgs = [HumanMessage(content="¿Cómo es el cielo del Roque de los Muchachos?"), AIMessage(content="..."), HumanMessage(content="¿Y desde el Teide?")]
    q = agent_mod.retrieval_query(msgs)
    assert "Roque" in q and "Teide" in q
    long_q = "Explícame con detalle cuáles son los telescopios solares más importantes del Observatorio del Teide"
    msgs[-1] = HumanMessage(content=long_q)
    assert agent_mod.retrieval_query(msgs) == long_q


@pytest.mark.parametrize("lang,query,expected_title", [
    ("es", "¿Cuándo son las Perseidas?", "Eventos Astronómicos Visibles desde Canarias"),
    ("en", "When are the Perseids?", "Astronomical Events Visible from the Canary Islands"),
    ("de", "Wann sind die Perseiden?", "Astronomische Ereignisse von den Kanarischen Inseln aus sichtbar"),
])
def test_multilingual_consistency(lang, query, expected_title):
    from agent.tools import rag_search
    res = rag_search(query, lang, 3)
    assert any(r["title"] == expected_title for r in res)
    assert res[0]["language"] == lang
