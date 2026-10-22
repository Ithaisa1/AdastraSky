"""Endpoints HTTP, autenticación entre servicios y herramientas."""

from langchain_core.messages import AIMessage

from agent.tools import calculate_sky_score, get_constellation_info, get_observatory_info, get_weather_conditions
from config import get_settings
from tests.conftest import FakeLLM


def test_health(client):
    assert client.get("/health").json()["status"] == "healthy"


def test_debug_config_removed(client):
    assert client.get("/debug/config").status_code == 404


def test_api_key_required_when_configured(client, use_providers):
    use_providers(FakeLLM([AIMessage(content="ok")]))
    get_settings().ai_service_api_key = "secreto-de-prueba"
    body = {"message": "¿Qué es una estrella?"}
    assert client.post("/api/chat", json=body).status_code == 401
    assert client.post("/api/chat", json=body, headers={"X-API-Key": "otra"}).status_code == 401
    assert client.post("/api/chat", json=body, headers={"X-API-Key": "secreto-de-prueba"}).status_code == 200
    assert client.post("/api/planner", json={"target": "Saturno"}).status_code == 401


def test_open_when_no_key_configured(client, use_providers):
    use_providers(FakeLLM([AIMessage(content="ok")]))
    assert client.post("/api/chat", json={"message": "¿Qué es una estrella?"}).status_code == 200


def test_chat_validation(client):
    assert client.post("/api/chat", json={"message": ""}).status_code == 422
    assert client.post("/api/chat", json={"message": "x", "language": "fr"}).status_code == 422
    assert client.post("/api/chat", json={"message": "x" * 4001}).status_code == 422


def test_chat_response_shape(client, use_providers):
    use_providers(FakeLLM([AIMessage(content="Una estrella es una esfera de plasma.")]))
    r = client.post("/api/chat", json={"message": "¿Qué es una estrella?", "session_id": "abc"}).json()
    assert set(r) == {"response", "session_id", "sources", "metadata"}
    assert r["session_id"] == "abc" and r["metadata"]["mode"] == "llm"


def test_planner_endpoint(client):
    r = client.post("/api/planner", json={"target": "Saturno", "start_date": "2026-10-24", "days": 1, "language": "en"})
    assert r.status_code == 200 and r.json()["target"]["key"] == "saturn"
    assert client.post("/api/planner", json={"target": "Saturno", "latitude": 40.4, "longitude": -3.7}).status_code == 422
    assert client.post("/api/planner", json={"target": "Saturno", "when": "someday"}).status_code == 422


def test_sky_score_endpoint_localized(client):
    body = {"cloudiness": 0, "light_pollution": 0, "moon_phase": 0, "wind": 0, "humidity": 0, "language": "de"}
    r = client.post("/api/sky-score", json=body).json()
    assert r["sky_score"] >= 8.5 and r["recommendation"].startswith("Ausgezeichnete")


def test_what_to_see_is_computed(client):
    r = client.get("/api/what-to-see?latitude=28.3&longitude=-16.5&date=2026-10-24").json()
    assert "Saturn" in r["visible_objects"]["planets"] and "Venus" not in r["visible_objects"]["planets"]
    assert client.get("/api/what-to-see?latitude=28.3&longitude=-16.5&date=24-10-2026").status_code == 400


def test_events_endpoint(client):
    r = client.get("/api/events?days_ahead=60&language=en").json()
    assert r["total"] == len(r["events"]) > 0
    assert all({"name", "date", "type", "visibility_score"} <= set(e) for e in r["events"])


# ── Herramientas ───────────────────────────────────────────────────────────

def test_weather_tool_never_invents_values():
    r = get_weather_conditions.invoke({"latitude": 28.3, "longitude": -16.5})
    assert r["available"] is False and "temperature" not in r


def test_observatory_tool_uses_real_zone_fields():
    r = get_observatory_info.invoke({"name": "Teide"})
    assert r["found"] and r["altitude"] == 2390 and r["bortle_scale"] == 2


def test_observatory_tool_unknown_name():
    assert get_observatory_info.invoke({"name": "Observatorio de Marte"})["found"] is False


def test_constellation_tool_multilingual():
    assert get_constellation_info.invoke({"name": "Osa Mayor", "lang": "de"})["name"] == "Großer Bär"
    assert get_constellation_info.invoke({"name": "Orion", "lang": "es"})["brightest_star"] == "Rigel"
    assert get_constellation_info.invoke({"name": "Ophiuchus"})["found"] is False


def test_sky_score_tool_localized():
    assert calculate_sky_score.invoke({"cloudiness": 1, "light_pollution": 1, "lang": "en"})["recommendation"].startswith("Not a good night")
