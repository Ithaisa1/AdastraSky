"""Herramientas del agente.

Todas devuelven estructuras serializables a JSON. Ninguna inventa datos: si una
fuente no responde, la herramienta lo indica con ``available: false``.
"""

from __future__ import annotations

import json
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path

from langchain_core.tools import tool

from agent.messages import sky_recommendation
from rag.vector_store import get_cached_rag

DATA_DIR = Path(__file__).parent.parent / "data"
RAG_SNIPPET_CHARS = 900


def rag_search(query: str, lang: str = "es", top_k: int = 4) -> list[dict]:
    """Búsqueda RAG compartida por la recuperación proactiva y la herramienta."""
    docs = get_cached_rag().search(query, k=max(1, min(int(top_k or 4), 8)), prefer_lang=lang if lang in ("es", "en", "de") else None)
    return [
        {
            "chunk_id": d.metadata.get("chunk_id"),
            "title": d.metadata.get("title", ""),
            "section": d.metadata.get("section", ""),
            "source": d.metadata.get("source", "Documento IAC"),
            "language": d.metadata.get("language", "es"),
            "content": d.page_content[:RAG_SNIPPET_CHARS],
        }
        for d in docs
    ]


@tool
def search_rag_documents(query: str, top_k: int = 4, lang: str = "es") -> list[dict]:
    """Busca en la base documental del IAC (observatorios, Ley del Cielo, astroturismo, eventos, telescopios).
    Úsala solo si la información de documentos que ya tienes en el contexto no basta y necesitas buscar con
    otras palabras. Devuelve fragmentos con título y fuente para citarlos."""
    return rag_search(query, lang, top_k)


@tool
def get_observatory_info(name: str) -> dict:
    """Datos de un observatorio o zona de observación de Canarias por nombre (isla, altitud, Bortle, coordenadas, acceso)."""
    from services.zones import find_by_name, get_zones
    _, origin = get_zones()
    if origin == "none":
        return {"available": False, "error": "Los datos de zonas no están disponibles en este momento."}
    matches = find_by_name(name, category="observatory") or find_by_name(name)
    if not matches:
        return {"available": True, "found": False, "message": f"No hay ninguna zona registrada con el nombre «{name}»."}
    z = matches[0]
    return {"available": True, "found": True, "origin": origin,
            **{k: z.get(k) for k in ("name", "island", "municipality", "category", "altitude", "bortle_scale",
                                     "sqm_estimate", "latitude", "longitude", "access_type", "description")}}


@tool
def get_weather_conditions(latitude: float, longitude: float) -> dict:
    """Condiciones meteorológicas ACTUALES reales para una ubicación (nubosidad %, viento km/h, humedad %, temperatura °C).
    Para planificar noches futuras usa plan_observation."""
    from services.weather import get_current_weather
    return get_current_weather(latitude, longitude)


@lru_cache()
def _constellations() -> list[dict]:
    return json.loads((DATA_DIR / "constellations.json").read_text(encoding="utf-8"))["constellations"]


@tool
def get_constellation_info(name: str, lang: str = "es") -> dict:
    """Información de una constelación (nombre latino, estrella principal, mejores meses para verla desde Canarias, objetos destacados)."""
    from agent.guards import normalize
    q = normalize(name)
    for c in _constellations():
        candidates = [c["latin"], c["abbr"], *c["names"].values()]
        if any(q == normalize(x) or (len(q) >= 4 and q in normalize(x)) for x in candidates):
            return {"found": True, "name": c["names"].get(lang, c["names"]["es"]), **{k: c[k] for k in ("latin", "abbr", "brightest_star", "best_months", "highlights")},
                    "source": "Datos de referencia AdAstra Sky (IAU)"}
    return {"found": False, "message": f"No tengo datos de la constelación «{name}» en mi catálogo."}


@tool
def calculate_sky_score(
    cloudiness: float = 0.0,
    light_pollution: float = 0.0,
    moon_phase: float = 0.0,
    wind: float = 0.0,
    humidity: float = 0.0,
    transparency: float = 0.8,
    lang: str = "es",
) -> dict:
    """Calcula el Sky Score (0-10) de calidad del cielo. Factores entre 0 y 1 (nubosidad, contaminación lumínica,
    fase lunar, humedad, transparencia) y viento en km/h. Es una estimación, no garantiza visibilidad."""
    from sky_engine.sky_score import SkyScoreAlgorithm
    factors = {"cloudiness": cloudiness, "light_pollution": light_pollution, "moon_phase": moon_phase,
               "wind": wind, "humidity": humidity, "transparency": transparency}
    score = SkyScoreAlgorithm().calculate_sky_score(factors)
    return {"sky_score": score, "factors": factors, "recommendation": sky_recommendation(score, lang)}


@tool
def plan_observation(
    target: str,
    when: str | None = None,
    start_date: str | None = None,
    days: int | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    island: str | None = None,
    lang: str = "es",
) -> dict:
    """Planifica una observación: recomienda lugares y franjas horarias para ver un objeto (planeta, Luna, M31, M42,
    Pléyades, M13, Vía Láctea) combinando efemérides reales, previsión de nubes, Luna y calidad del cielo.
    when: 'tonight' | 'tomorrow' | 'weekend' | 'week' (o usa start_date YYYY-MM-DD y days 1-7).
    Indica latitude/longitude del usuario o island si se conocen. Explica siempre las limitaciones del resultado."""
    from sky_engine.planner import plan_observation as _plan
    return _plan(target, lang=lang, when=when, start_date=start_date, days=days,
                 latitude=latitude, longitude=longitude, island=island)


@tool
def get_visible_planets(latitude: float = 28.2916, longitude: float = -16.6291, night_date: str | None = None) -> dict:
    """Planetas y Luna visibles una noche concreta desde una ubicación (efemérides reales). night_date YYYY-MM-DD; por defecto hoy."""
    from sky_engine.ephemeris import planets_tonight
    d = date.fromisoformat(night_date) if night_date else datetime.now().date()
    return {**planets_tonight(latitude, longitude, d), "source": "Astronomy Engine"}


tools = [search_rag_documents, get_observatory_info, get_weather_conditions, get_constellation_info,
         calculate_sky_score, plan_observation, get_visible_planets]

# Herramientas cuyas respuestas dependen de datos en tiempo real: no se cachean.
REALTIME_TOOLS = {"get_weather_conditions", "plan_observation", "get_visible_planets"}
