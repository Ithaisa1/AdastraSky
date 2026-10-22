"""Caché de respuestas: reutilización, TTL, claves y no contaminación."""

from langchain_core.messages import AIMessage

from agent.cache import ResponseCache
from tests.conftest import FakeLLM, post_chat


class Clock:
    def __init__(self):
        self.t = 0.0

    def __call__(self):
        return self.t


def test_ttl_expires():
    clock = Clock()
    c = ResponseCache(ttl_seconds=10, clock=clock)
    c.set("¿Qué es Orión?", "es", "Una constelación")
    clock.t = 9
    assert c.get("¿Qué es Orión?", "es") == "Una constelación"
    clock.t = 11
    assert c.get("¿Qué es Orión?", "es") is None
    assert len(c) == 0


def test_key_normalizes_but_separates_language_and_queries():
    c = ResponseCache()
    c.set("¿Qué es ORIÓN?", "es", "A")
    assert c.get("que es orion", "es") == "A"
    assert c.get("¿Qué es Orión?", "en") is None
    assert c.get("¿Qué es Saturno?", "es") is None


def test_empty_values_are_never_stored():
    c = ResponseCache()
    assert not c.set("x", "es", "")
    assert not c.set("x", "es", "   ")
    assert not c.set("¿?", "es", "algo")  # clave vacía tras normalizar
    assert c.get("x", "es") is None


def test_max_entries_evicts_oldest():
    c = ResponseCache(max_entries=2)
    c.set("a", "es", "1"); c.set("b", "es", "2"); c.set("c", "es", "3")
    assert c.get("a", "es") is None and c.get("c", "es") == "3"


def test_valid_answer_is_reused(client, use_providers):
    llm = FakeLLM([AIMessage(content="Orión es una constelación.")])
    use_providers(llm)
    post_chat(client, "¿Qué es Orión?")
    r = post_chat(client, "¿qué es orión")
    assert r["response"] == "Orión es una constelación." and r["metadata"]["mode"] == "cache"
    assert len(llm.calls) == 1


def test_tool_call_turn_is_not_cached_as_empty(client, use_providers):
    """Regresión: antes se cacheaba "" cuando el modelo pedía una herramienta."""
    tool_turn = AIMessage(content="", tool_calls=[{"name": "search_rag_documents", "args": {"query": "Teide telescopios"}, "id": "c1"}])
    llm = FakeLLM([tool_turn, AIMessage(content="En el Teide está GREGOR.")])
    use_providers(llm)
    r1 = post_chat(client, "Háblame del observatorio del Teide")
    assert r1["response"] == "En el Teide está GREGOR."
    r2 = post_chat(client, "Háblame del observatorio del Teide")
    assert r2["response"] == "En el Teide está GREGOR." and r2["metadata"]["mode"] == "cache"


def test_errors_and_degraded_answers_are_not_cached(client, use_providers):
    use_providers(FakeLLM([RuntimeError("caído")]))
    post_chat(client, "¿Qué es una supernova?")
    llm = FakeLLM([AIMessage(content="Una supernova es la explosión de una estrella.")])
    use_providers(llm)
    r = post_chat(client, "¿Qué es una supernova?")
    assert r["response"].startswith("Una supernova") and len(llm.calls) == 1


def test_realtime_tool_answers_are_not_cached(client, use_providers):
    tool_turn = AIMessage(content="", tool_calls=[{"name": "get_weather_conditions", "args": {"latitude": 28.3, "longitude": -16.5}, "id": "w"}])
    llm = FakeLLM([tool_turn, AIMessage(content="Ahora hay 10% de nubes."), AIMessage(content="Ahora hay 80% de nubes.")])
    use_providers(llm)
    post_chat(client, "¿Qué tiempo hace en el Teide ahora?")
    r = post_chat(client, "¿Qué tiempo hace en el Teide ahora?")
    assert r["metadata"]["mode"] != "cache"


def test_cache_keys_never_include_user_data(client, use_providers):
    """La caché no se indexa por usuario y no guarda nada si hay historial (datos de la conversación)."""
    from agent.agent import response_cache
    use_providers(FakeLLM([AIMessage(content="ok")]))
    post_chat(client, "¿Y mi reserva de mañana?", history=[{"role": "user", "content": "Me llamo Ana, DNI 1234"}, {"role": "assistant", "content": "hola Ana"}])
    assert len(response_cache) == 0
