from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "AdAstraSky AI Service",
        "version": "1.0.0",
    }
