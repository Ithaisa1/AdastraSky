"""Cadena de proveedores Groq -> OpenAI -> HuggingFace, modo offline y límites."""

import concurrent.futures
import time

from langchain_core.messages import AIMessage

from agent.llm import AllProvidersFailed, Provider, build_providers, invoke_with_fallback, reset_providers
from agent.messages import all_variants
from config import get_settings
from tests.conftest import FakeLLM, post_chat


def test_groq_ok_others_not_called(client, use_providers):
    groq, openai, hf = FakeLLM([AIMessage(content="groq")]), FakeLLM(), FakeLLM()
    use_providers(groq, openai, hf)
    r = post_chat(client, "¿Qué es una estrella?")
    assert r["response"] == "groq" and r["metadata"]["provider"] == "groq"
    assert not openai.calls and not hf.calls


def test_groq_fails_openai_used(client, use_providers):
    groq = FakeLLM([RuntimeError("Groq caído")])
    openai = FakeLLM([AIMessage(content="openai")])
    use_providers(groq, openai, FakeLLM())
    r = post_chat(client, "¿Qué es una estrella?")
    assert r["response"] == "openai" and r["metadata"]["provider"] == "openai"


def test_groq_and_openai_fail_huggingface_used(client, use_providers):
    use_providers(FakeLLM([RuntimeError("x")]), FakeLLM([TimeoutError("y")]), FakeLLM([AIMessage(content="hf")]))
    r = post_chat(client, "¿Qué es una estrella?")
    assert r["response"] == "hf" and r["metadata"]["provider"] == "huggingface"


def test_provider_without_tool_support_is_called_without_tools():
    class NoTools(FakeLLM):
        def bind_tools(self, tools):
            raise NotImplementedError
    m = NoTools([AIMessage(content="sin tools")])
    resp, name = invoke_with_fallback([Provider("huggingface", m)], [], tools=[object()])
    assert resp.content == "sin tools" and name == "huggingface"


def test_all_fail_raises_with_errors():
    try:
        invoke_with_fallback([Provider("groq", FakeLLM([RuntimeError("429 Too Many Requests")]))], [], [])
    except AllProvidersFailed as e:
        assert e.rate_limited and e.errors[0][0] == "groq"
    else:
        raise AssertionError("debía fallar")


def test_all_fail_degraded_mode_uses_rag_in_user_language(client, use_providers):
    use_providers(FakeLLM([RuntimeError("a")]), FakeLLM([RuntimeError("b")]), FakeLLM([RuntimeError("c")]))
    r = post_chat(client, "Which telescopes are at the Teide Observatory?", language="en")
    assert r["metadata"]["mode"] == "degraded"
    assert r["response"].startswith("I currently have no connection")
    assert "GREGOR" in r["response"] and "Source:" in r["response"]


def test_all_fail_rate_limited_message(client, use_providers):
    use_providers(FakeLLM([RuntimeError("Error 429: rate_limit_exceeded")]))
    r = post_chat(client, "Wann sind die Perseiden?", language="de")
    assert r["response"].startswith("Der KI-Dienst hat derzeit eine hohe Nachfrage.")


def test_no_providers_offline_mode(client):
    r = post_chat(client, "¿Dónde está el Roque de los Muchachos?")
    assert r["metadata"]["mode"] == "offline"
    assert "Roque de los Muchachos" in r["response"]


def test_offline_without_rag_results_lists_topics(client):
    r = post_chat(client, "¿Qué es un púlsar binario de milisegundos?", language="en")
    assert r["response"] in all_variants("offline_topics") or "I currently have no connection" in r["response"]


def test_empty_model_answer_is_not_returned(client, use_providers):
    use_providers(FakeLLM([AIMessage(content="")]))
    r = post_chat(client, "¿Qué es una estrella?")
    assert r["response"].strip()
    assert r["metadata"]["mode"] == "degraded"


def test_timeout_does_not_block(client, use_providers):
    s = get_settings()
    s.chat_timeout_seconds = 0.3
    use_providers(FakeLLM([AIMessage(content="tarde")], delay=1.0))
    t = time.monotonic()
    r = post_chat(client, "¿Qué es una estrella?")
    assert time.monotonic() - t < 1.0
    assert r["response"] in all_variants("busy") and r["metadata"]["mode"] == "timeout"


def test_infinite_tool_loop_is_cut(client, use_providers):
    loop = AIMessage(content="", tool_calls=[{"name": "get_constellation_info", "args": {"name": "Orion"}, "id": "t1"}])
    use_providers(FakeLLM([loop]))
    r = post_chat(client, "¿Qué es Orión?")
    assert r["metadata"]["mode"] == "recursion_limit" and r["response"]


def test_concurrency_limit_respected(client, use_providers):
    s = get_settings()
    from routers import chat as chat_router
    llm = FakeLLM([AIMessage(content="ok")], delay=0.3)
    use_providers(llm)
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(lambda i: post_chat(client, f"¿Qué es la estrella número {i}?"), range(8)))
    assert len(llm.calls) == 8
    assert llm.max_active <= s.max_concurrent_llm
    assert chat_router._semaphore._value == s.max_concurrent_llm  # el semáforo se libera siempre


def test_build_providers_order_from_env():
    s = get_settings()
    s.groq_api_key, s.openai_api_key, s.hf_token = "gsk_test", "sk-test", ""
    reset_providers()
    try:
        names = [p.name for p in build_providers()]
        assert names == ["groq", "openai"]
    finally:
        s.groq_api_key = s.openai_api_key = ""
        reset_providers()
