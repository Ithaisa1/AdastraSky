"""Clima actual y previsión horaria.

- Actual: OpenWeather si hay ``OPENWEATHER_API_KEY``; si no, Open-Meteo.
- Previsión: Open-Meteo (gratuito, sin clave, hasta 16 días, nubes por capas).
  Datos de Open-Meteo bajo licencia CC BY 4.0 (https://open-meteo.com).

Nunca se devuelven valores inventados: si no hay datos, ``available`` es False.
"""

from __future__ import annotations

import logging
import threading
import time
from datetime import date

import httpx

from config import get_settings

logger = logging.getLogger("adastra-ai.weather")

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
HOURLY_VARS = ("cloud_cover", "cloud_cover_low", "cloud_cover_mid", "cloud_cover_high",
               "relative_humidity_2m", "wind_speed_10m", "visibility", "precipitation_probability")
_FORECAST_TTL = 1800
_forecast_cache: dict[tuple, tuple[float, dict]] = {}
_lock = threading.Lock()


def get_current_weather(latitude: float, longitude: float) -> dict:
    s = get_settings()
    if s.openweather_api_key:
        try:
            with httpx.Client(timeout=10) as client:
                r = client.get("https://api.openweathermap.org/data/2.5/weather",
                               params={"lat": latitude, "lon": longitude, "appid": s.openweather_api_key, "units": "metric"})
                r.raise_for_status()
                d = r.json()
            return {
                "available": True, "source": "OpenWeather (actual)",
                "temperature": round(d["main"]["temp"]), "cloudiness": d["clouds"]["all"],
                "wind_speed": round(d["wind"]["speed"] * 3.6), "humidity": d["main"]["humidity"],
                "visibility": round(d.get("visibility", 0) / 1000),
            }
        except Exception as e:
            logger.warning("OpenWeather falló, se prueba Open-Meteo: %s", str(e)[:200])
    try:
        with httpx.Client(timeout=10) as client:
            r = client.get(OPEN_METEO_URL, params={
                "latitude": latitude, "longitude": longitude,
                "current": "temperature_2m,cloud_cover,wind_speed_10m,relative_humidity_2m,visibility",
            })
            r.raise_for_status()
            c = r.json()["current"]
        return {
            "available": True, "source": "Open-Meteo (actual, CC BY 4.0)",
            "temperature": round(c["temperature_2m"]), "cloudiness": c["cloud_cover"],
            "wind_speed": round(c["wind_speed_10m"]), "humidity": c["relative_humidity_2m"],
            "visibility": round((c.get("visibility") or 0) / 1000),
        }
    except Exception as e:
        logger.warning("Open-Meteo falló: %s", str(e)[:200])
        return {"available": False, "error": "No se pudieron obtener datos meteorológicos reales en este momento."}


def get_hourly_forecast(latitude: float, longitude: float, start: date, end: date, elevation: float | None = None) -> dict:
    """Previsión horaria en UTC. Devuelve {"available": bool, "hours": {iso: {...}}, "source": str}."""
    key = (round(latitude, 3), round(longitude, 3), start.isoformat(), end.isoformat(), elevation)
    with _lock:
        hit = _forecast_cache.get(key)
        if hit and time.monotonic() - hit[0] < _FORECAST_TTL:
            return hit[1]
    params = {
        "latitude": latitude, "longitude": longitude, "hourly": ",".join(HOURLY_VARS),
        "timezone": "UTC", "start_date": start.isoformat(), "end_date": end.isoformat(),
    }
    if elevation is not None:
        params["elevation"] = elevation
    try:
        with httpx.Client(timeout=10) as client:
            r = client.get(OPEN_METEO_URL, params=params)
            r.raise_for_status()
            h = r.json()["hourly"]
        hours = {}
        for i, t in enumerate(h["time"]):
            hours[t] = {v: (h.get(v) or [None] * len(h["time"]))[i] for v in HOURLY_VARS}
        result = {"available": True, "source": "Open-Meteo (CC BY 4.0)", "hours": hours}
    except Exception as e:
        logger.warning("Previsión no disponible: %s", str(e)[:200])
        result = {"available": False, "source": "Open-Meteo", "hours": {}, "error": str(e)[:200]}
    if result["available"]:  # los fallos no se cachean: se reintenta en la siguiente consulta
        with _lock:
            _forecast_cache[key] = (time.monotonic(), result)
            if len(_forecast_cache) > 256:
                _forecast_cache.pop(next(iter(_forecast_cache)))
    return result
