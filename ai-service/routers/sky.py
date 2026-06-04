from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
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


@router.post("/sky-score")
async def sky_score(request: SkyScoreRequest):
    algorithm = SkyScoreAlgorithm()
    score = algorithm.calculate_sky_score(request.model_dump())
    if score >= 8.5:
        recommendation = "Excelente noche para observar. ¡Sal ahora!"
    elif score >= 7:
        recommendation = "Buena noche para observar."
    elif score >= 5:
        recommendation = "Condiciones aceptables. Puedes intentarlo."
    else:
        recommendation = "No es buena noche. Espera condiciones mejores."
    return {"sky_score": score, "factors": request.model_dump(), "recommendation": recommendation}


@router.get("/what-to-see")
async def what_to_see(
    latitude: float = Query(...),
    longitude: float = Query(...),
    date: str | None = None,
    time: str | None = None,
):
    from datetime import datetime

    if date:
        try:
            dt = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido, use YYYY-MM-DD")
    else:
        dt = datetime.now()

    moon_illum = calculate_moon_illumination(dt)

    return {
        "location": {"latitude": latitude, "longitude": longitude},
        "visible_objects": {
            "planets": ["Jupiter", "Venus", "Saturn", "Mars"],
            "constellations": ["Orion", "Ursa Major", "Cassiopeia", "Scorpius"],
            "messier_objects": ["M31 (Andromeda)", "M45 (Pleiades)", "M42 (Orion Nebula)"],
            "moon_phase": moon_illum,
        },
    }


@router.get("/events")
async def get_events(days_ahead: int = Query(default=30, ge=1, le=365)):
    from datetime import datetime, timedelta

    base = datetime.now()
    year = base.year
    all_events = [
        {"name": "Lluvia de Perseidas", "date": f"{year}-08-12", "type": "meteor_shower", "visibility_score": 9},
        {"name": "Lluvia de Gemínidas", "date": f"{year}-12-13", "type": "meteor_shower", "visibility_score": 8},
        {"name": "Equinoccio de Primavera", "date": f"{year}-03-20", "type": "seasonal", "visibility_score": 5},
        {"name": "Equinoccio de Otoño", "date": f"{year}-09-22", "type": "seasonal", "visibility_score": 5},
        {"name": "Solsticio de Verano", "date": f"{year}-06-21", "type": "seasonal", "visibility_score": 5},
        {"name": "Solsticio de Invierno", "date": f"{year}-12-21", "type": "seasonal", "visibility_score": 5},
    ]
    cutoff = base + timedelta(days=days_ahead)
    upcoming = []
    for ev in all_events:
        ev_date = datetime.strptime(ev["date"], "%Y-%m-%d")
        if base <= ev_date <= cutoff:
            upcoming.append(ev)
    return {"events": upcoming, "total": len(upcoming)}
