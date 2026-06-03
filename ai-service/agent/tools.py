from langchain_core.tools import tool
from langchain_core.documents import Document
import httpx
from typing import Optional

from rag.vector_store import get_vector_store
from config import get_settings

settings = get_settings()


@tool
def search_rag_documents(query: str, top_k: int = 3) -> list[dict]:
    """Busca documentos astronómicos relevantes usando RAG. Útil para preguntas sobre observatorios, cielos de Canarias, astroturismo, normativas IAC."""
    store = get_vector_store()
    results = store.similarity_search(query, k=top_k)
    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", "Documento IAC"),
            "title": doc.metadata.get("title", ""),
        }
        for doc in results
    ]


@tool
def get_observatory_info(name: str) -> dict:
    """Obtiene información detallada de un observatorio astronómico en Canarias por nombre."""
    db_results = _query_db(
        "SELECT name, island, altitude, bortle_scale, description, institution, "
        "established, research_areas, telescopes "
        "FROM sky_quality_zones WHERE category = 'observatory' AND LOWER(name) LIKE LOWER(%s)",
        (f"%{name}%",),
    )
    if db_results:
        return db_results[0]
    return {"error": f"No se encontró el observatorio: {name}"}


@tool
def get_weather_conditions(latitude: float, longitude: float) -> dict:
    """Obtiene condiciones meteorológicas actuales para una ubicación (latitud, longitud)."""
    if not settings.openweather_api_key:
        return {"temperature": 18, "cloudiness": 15, "wind_speed": 12, "humidity": 45, "visibility": 25}
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": latitude,
                    "lon": longitude,
                    "appid": settings.openweather_api_key,
                    "units": "metric",
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "temperature": round(data["main"]["temp"]),
                "cloudiness": data["clouds"]["all"],
                "wind_speed": round(data["wind"]["speed"] * 3.6),
                "humidity": data["main"]["humidity"],
                "visibility": round(data["visibility"] / 1000),
            }
    except Exception:
        return {"error": "No se pudieron obtener datos meteorológicos"}


@tool
def get_constellation_info(name: str) -> dict:
    """Obtiene información sobre una constelación por nombre o nombre latino."""
    db_results = _query_db(
        "SELECT * FROM constellations WHERE LOWER(name) LIKE LOWER(%s) OR LOWER(latin_name) LIKE LOWER(%s)",
        (f"%{name}%", f"%{name}%"),
    )
    if db_results:
        return db_results[0]
    return {"error": f"No se encontró la constelación: {name}"}


def _query_db(sql: str, params: tuple) -> list[dict]:
    """Helper para consultas PostgreSQL."""
    if not settings.database_url:
        return [{"info": "Base de datos no disponible"}]
    import psycopg2
    try:
        conn = psycopg2.connect(settings.database_url, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute(sql, params)
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
        conn.close()
        return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return [{"info": "Base de datos no disponible", "detail": str(e)}]


tools = [search_rag_documents, get_observatory_info, get_weather_conditions, get_constellation_info]
