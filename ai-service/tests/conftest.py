"""Configuración común de la suite.

- Ningún test usa red ni consume cuota de proveedores de IA: los LLM son dobles
  de prueba y los servicios de zonas/clima se sustituyen por datos fijos.
- Las variables de entorno de claves se vacían antes de importar la app.
"""

import os
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

for _k in ("GROQ_API_KEY", "OPENAI_API_KEY", "HF_TOKEN", "DATABASE_URL", "OPENWEATHER_API_KEY", "AI_SERVICE_API_KEY"):
    os.environ[_k] = ""
os.environ["BACKEND_URL"] = "http://backend.invalid"

import pytest  # noqa: E402
from langchain_core.messages import AIMessage  # noqa: E402

from agent.llm import Provider  # noqa: E402
from config import get_settings  # noqa: E402

ZONES = [
    {"name": "Mirador Oscuro", "island": "Tenerife", "municipality": "La Orotava", "category": "astronomical_viewpoint",
     "subcategory": None, "latitude": 28.27, "longitude": -16.60, "altitude": 2300, "bortle_scale": 1,
     "sqm_estimate": 21.9, "access_type": "car", "night_access": True, "has_high_wind": False, "safety_risk": 1, "description": ""},
    {"name": "Mirador Costero", "island": "Tenerife", "municipality": "Arona", "category": "landscape_viewpoint",
     "subcategory": None, "latitude": 28.05, "longitude": -16.70, "altitude": 200, "bortle_scale": 4,
     "sqm_estimate": 20.5, "access_type": "car", "night_access": True, "has_high_wind": False, "safety_risk": 1, "description": ""},
    {"name": "Observatorio del Teide", "island": "Tenerife", "municipality": None, "category": "observatory",
     "subcategory": "scientific", "latitude": 28.3078, "longitude": -16.5097, "altitude": 2390, "bortle_scale": 2,
     "sqm_estimate": 21.8, "access_type": "car", "night_access": True, "has_high_wind": False, "safety_risk": 1, "description": "Izaña"},
    {"name": "Mirador del Roque de los Muchachos", "island": "La Palma", "municipality": "Garafía", "category": "astronomical_viewpoint",
     "subcategory": None, "latitude": 28.754, "longitude": -17.885, "altitude": 2400, "bortle_scale": 1,
     "sqm_estimate": 22.0, "access_type": "car", "night_access": True, "has_high_wind": True, "safety_risk": 2, "description": ""},
]


class FakeLLM:
    """Doble de un chat model de LangChain.

    ``replies`` puede contener AIMessage, excepciones (se lanzan) o funciones
    ``f(messages) -> AIMessage``. Registra todos los mensajes recibidos.
    """

    def __init__(self, replies=None, delay: float = 0.0, name: str = "fake"):
        self.replies = list(replies or [AIMessage(content="Respuesta del modelo")])
        self.calls: list[list] = []
        self.delay = delay
        self.name = name
        self.bound_tools = None
        self._lock = threading.Lock()
        self.active = 0
        self.max_active = 0

    def bind_tools(self, tools):
        self.bound_tools = tools
        return self

    def invoke(self, messages):
        with self._lock:
            self.calls.append(list(messages))
            self.active += 1
            self.max_active = max(self.max_active, self.active)
            reply = self.replies.pop(0) if len(self.replies) > 1 else self.replies[0]
        try:
            if self.delay:
                time.sleep(self.delay)
            if isinstance(reply, BaseException):
                raise reply
            if callable(reply):
                return reply(messages)
            # Copia nueva en cada llamada, como un LLM real (LangGraph deduplica por id)
            return reply.model_copy(update={"id": None}) if isinstance(reply, AIMessage) else reply
        finally:
            with self._lock:
                self.active -= 1


@pytest.fixture(autouse=True)
def _isolate(monkeypatch):
    """Sin red, sin estado compartido entre tests."""
    import agent.agent as agent_mod
    import services.weather as weather
    import services.zones as zones
    from rag import vector_store

    zones._cache.update(ts=0.0, zones=None, origin=None)
    monkeypatch.setattr(zones, "_from_backend", lambda: [dict(z) for z in ZONES])
    monkeypatch.setattr(zones, "_from_db", lambda: [])
    monkeypatch.setattr(weather, "get_hourly_forecast",
                        lambda *a, **k: {"available": False, "source": "Open-Meteo", "hours": {}})
    monkeypatch.setattr(weather, "get_current_weather",
                        lambda *a, **k: {"available": False, "error": "sin red en tests"})
    agent_mod.response_cache.clear()
    vector_store._cached_rag = None
    monkeypatch.setattr(agent_mod, "get_providers", lambda: [])
    s = get_settings()
    original = s.model_dump()
    yield
    for k, v in original.items():
        setattr(s, k, v)


@pytest.fixture
def use_providers(monkeypatch):
    """use_providers(llm1, llm2, ...) -> registra la cadena de proveedores."""
    import agent.agent as agent_mod

    def _set(*models):
        names = ["groq", "openai", "huggingface"]
        providers = [Provider(names[i] if i < 3 else f"p{i}", m) for i, m in enumerate(models)]
        monkeypatch.setattr(agent_mod, "get_providers", lambda: providers)
        return providers
    return _set


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    import main
    from routers import chat as chat_router
    chat_router._agent = None
    with TestClient(main.app) as c:
        yield c


def post_chat(client, message, history=None, language="es", session_id=None, headers=None):
    body = {"message": message, "language": language, "history": history or []}
    if session_id:
        body["session_id"] = session_id
    r = client.post("/api/chat", json=body, headers=headers or {})
    assert r.status_code == 200, r.text
    return r.json()


def non_system(messages):
    from langchain_core.messages import SystemMessage
    return [m for m in messages if not isinstance(m, SystemMessage)]
