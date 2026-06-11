from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    port: int = 7860  # HF Spaces
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    hf_token: str = ""
    hf_model: str = "mistralai/Mistral-7B-Instruct-v0.3"
    database_url: str = ""
    openweather_api_key: str = ""
    chroma_persist_dir: str = str(Path(__file__).parent / "rag" / "chroma_db")
    frontend_url: str = "https://adastra-sky.vercel.app"

    class Config:
        env_file = Path(__file__).parent / ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()