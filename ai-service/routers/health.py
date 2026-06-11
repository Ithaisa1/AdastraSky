import os
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    from config import get_settings
    s = get_settings()
    return {
        "status": "healthy",
        "service": "AdAstraSky AI Service",
        "version": "1.0.0",
    }


@router.get("/debug/config")
async def debug_config():
    keys = ["GROQ_API_KEY", "OPENAI_API_KEY", "HF_TOKEN", "GROQ_MODEL", "HF_MODEL", "OPENAI_MODEL", "DATABASE_URL"]
    result = {}
    for k in keys:
        v = os.environ.get(k, "")
        if v:
            masked = v[:6] + "..." + v[-4:] if len(v) > 12 else v[:4] + "..."
            result[k] = masked
        else:
            result[k] = "(not set)"
    return {"env": result}
