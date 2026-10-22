from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    port: int = 7860  # HF Spaces
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    hf_token: str = ""
    hf_model: str = "mistralai/Mistral-7B-Instruct-v0.3"
    database_url: str = ""
    openweather_api_key: str = ""
    frontend_url: str = "https://adastra-sky.vercel.app"

    # Clave compartida backend -> ai-service. Si está vacía, los endpoints
    # quedan abiertos (compatibilidad con despliegues antiguos) y se avisa en el log.
    ai_service_api_key: str = ""

    # Backend público del que se leen las zonas de observación (planificador).
    backend_url: str = "https://aadastra-sky-backend.onrender.com"

    # Límites de la memoria conversacional enviada al modelo.
    history_max_turns: int = 6          # pares usuario/asistente
    history_max_chars: int = 6000       # tope total de caracteres de historial
    history_item_max_chars: int = 1500  # tope por mensaje

    # Tiempos de espera
    llm_timeout_seconds: float = 30.0
    chat_timeout_seconds: float = 90.0
    max_concurrent_llm: int = 3


@lru_cache()
def get_settings() -> Settings:
    return Settings()
