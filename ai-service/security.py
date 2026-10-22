"""Autenticación servicio a servicio (backend / n8n -> ai-service).

Si ``AI_SERVICE_API_KEY`` está definida, los endpoints protegidos exigen la
cabecera ``X-API-Key`` con ese valor. Si no está definida, se permiten las
peticiones (compatibilidad con despliegues antiguos) y se avisa en el log al
arrancar. En producción debe definirse siempre.
"""

import hmac
import logging

from fastapi import Header, HTTPException, status

from config import get_settings

logger = logging.getLogger("adastra-ai.security")


def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    expected = get_settings().ai_service_api_key
    if not expected:
        return
    if not x_api_key or not hmac.compare_digest(x_api_key, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API key inválida o ausente")


def warn_if_open() -> None:
    if not get_settings().ai_service_api_key:
        logger.warning("AI_SERVICE_API_KEY no está definida: /api/chat y /api/planner aceptan peticiones sin autenticar.")
