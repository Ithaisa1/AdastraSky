"""Zonas de observación (santuarios, miradores, observatorios).

Orden de consulta:
1. Backend público ``GET {BACKEND_URL}/api/sky/zones`` (fuente principal, la
   misma que ve el usuario en el mapa).
2. PostgreSQL directo si ``DATABASE_URL`` está configurada.
3. Snapshot local ``data/zones_snapshot.json`` (generado desde el seed del
   backend) para no quedarse sin datos si el backend está dormido.

Cada respuesta indica de dónde salen los datos (``origin``).
"""

from __future__ import annotations

import json
import logging
import math
import threading
import time
from pathlib import Path

import httpx

from config import get_settings

logger = logging.getLogger("adastra-ai.zones")

SNAPSHOT_PATH = Path(__file__).parent.parent / "data" / "zones_snapshot.json"
_CACHE_TTL = 600
_cache: dict = {"ts": 0.0, "zones": None, "origin": None}
_lock = threading.Lock()

ZONE_FIELDS = ("name", "island", "municipality", "category", "subcategory", "latitude", "longitude", "altitude",
               "bortle_scale", "sqm_estimate", "access_type", "night_access", "has_high_wind", "safety_risk",
               "description")


def _clean(z: dict) -> dict | None:
    try:
        out = {k: z.get(k) for k in ZONE_FIELDS}
        out["latitude"] = float(out["latitude"])
        out["longitude"] = float(out["longitude"])
        out["altitude"] = int(float(out.get("altitude") or 0))
        out["bortle_scale"] = int(out["bortle_scale"]) if out.get("bortle_scale") is not None else None
        if out.get("sqm_estimate") is not None:
            out["sqm_estimate"] = float(out["sqm_estimate"])
        return out
    except (TypeError, ValueError, KeyError):
        return None


def _from_backend() -> list[dict]:
    url = get_settings().backend_url.rstrip("/") + "/api/sky/zones"
    with httpx.Client(timeout=8) as client:
        r = client.get(url)
        r.raise_for_status()
        data = r.json()
    return data.get("data", {}).get("zones", [])


def _from_db() -> list[dict]:
    dsn = get_settings().database_url
    if not dsn:
        return []
    import psycopg2  # import diferido: solo si hay BD configurada
    conn = psycopg2.connect(dsn, connect_timeout=4)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT " + ", ".join(ZONE_FIELDS) + " FROM sky_quality_zones WHERE is_active = true")
            cols = [c[0] for c in cur.description]
            return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()


def _from_snapshot() -> list[dict]:
    return json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8")).get("zones", [])


def get_zones(force_refresh: bool = False) -> tuple[list[dict], str]:
    """Devuelve (zonas, origen). origen ∈ {backend, database, snapshot, none}."""
    with _lock:
        if not force_refresh and _cache["zones"] is not None and time.monotonic() - _cache["ts"] < _CACHE_TTL:
            return _cache["zones"], _cache["origin"]
    for origin, loader in (("backend", _from_backend), ("database", _from_db), ("snapshot", _from_snapshot)):
        try:
            zones = [z for z in (_clean(raw) for raw in loader()) if z]
        except Exception as e:
            logger.warning("Zonas no disponibles desde %s: %s", origin, str(e)[:200])
            continue
        if zones:
            with _lock:
                _cache.update(ts=time.monotonic(), zones=zones, origin=origin)
            return zones, origin
    return [], "none"


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def find_by_name(name: str, category: str | None = None) -> list[dict]:
    from agent.guards import normalize
    zones, _ = get_zones()
    q = normalize(name)
    out = [z for z in zones if q and q in normalize(z["name"]) and (category is None or z.get("category") == category)]
    return out
