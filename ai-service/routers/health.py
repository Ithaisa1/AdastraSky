from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "AdAstraSky AI Service",
        "version": "1.1.0",
    }

# /debug/config se ha eliminado: era público y mostraba fragmentos de las claves
# de API y de DATABASE_URL. Para depurar la configuración usa los logs del Space.
