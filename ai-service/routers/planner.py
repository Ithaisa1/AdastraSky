import asyncio

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from security import require_api_key
from sky_engine.planner import plan_observation

router = APIRouter(prefix="/api/planner", tags=["planner"])


class PlannerRequest(BaseModel):
    target: str = Field(..., min_length=1, max_length=100, examples=["Saturno"])
    when: str | None = Field(default=None, pattern="^(tonight|tomorrow|weekend|week)$")
    start_date: str | None = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    days: int | None = Field(default=None, ge=1, le=7)
    latitude: float | None = Field(default=None, ge=27.0, le=30.0)
    longitude: float | None = Field(default=None, ge=-19.0, le=-13.0)
    island: str | None = Field(default=None, max_length=40)
    max_distance_km: float | None = Field(default=None, gt=0, le=300)
    language: str = Field(default="es", pattern="^(es|en|de)$")


@router.post("", dependencies=[Depends(require_api_key)])
async def planner(req: PlannerRequest):
    try:
        return await asyncio.to_thread(
            plan_observation, req.target, req.language, req.when, req.start_date, req.days,
            req.latitude, req.longitude, req.island, req.max_distance_km,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
