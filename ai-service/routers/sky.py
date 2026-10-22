import asyncio
from datetime import date, datetime, timedelta

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from agent.messages import sky_recommendation
from sky_engine.ephemeris import planets_tonight
from sky_engine.events import compute_events
from sky_engine.sky_score import SkyScoreAlgorithm
from sky_engine.utils import calculate_moon_illumination

router = APIRouter(prefix="/api", tags=["sky"])


class SkyScoreRequest(BaseModel):
    cloudiness: float = Field(..., ge=0, le=1)
    light_pollution: float = Field(..., ge=0, le=1)
    moon_phase: float = Field(..., ge=0, le=1)
    wind: float = Field(..., ge=0)
    humidity: float = Field(..., ge=0, le=1)
    transparency: float = Field(default=0.8, ge=0, le=1)
    language: str = Field(default="es", pattern="^(es|en|de)$")


@router.post("/sky-score")
async def sky_score(request: SkyScoreRequest):
    factors = request.model_dump(exclude={"language"})
    score = SkyScoreAlgorithm().calculate_sky_score(factors)
    return {"sky_score": score, "factors": factors, "recommendation": sky_recommendation(score, request.language)}


@router.get("/what-to-see")
async def what_to_see(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    date: str | None = None,
    time: str | None = None,  # se mantiene por compatibilidad; el cálculo cubre toda la noche
):
    if date:
        try:
            night = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido, use YYYY-MM-DD")
    else:
        night = datetime.now().date()

    data = await asyncio.to_thread(planets_tonight, latitude, longitude, night)
    planets = [o["names"]["en"] for o in data["objects"] if o["key"] != "moon"]
    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "night_of": night.isoformat(),
        "dark_window_utc": data["window"],
        "visible_objects": {
            "planets": planets,
            "details": data["objects"],
            "moon_phase": data.get("moon_illumination", calculate_moon_illumination(datetime(night.year, night.month, night.day, 22))),
        },
        "source": "Astronomy Engine (efemérides calculadas)",
    }


@router.get("/events")
async def get_events(days_ahead: int = Query(default=30, ge=1, le=365),
                     language: str = Query(default="es", pattern="^(es|en|de)$")):
    today = datetime.now().date()
    events = await asyncio.to_thread(compute_events, today, today + timedelta(days=days_ahead), language)
    return {"events": events, "total": len(events), "source": "Astronomy Engine + IMO"}
