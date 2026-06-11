"""
AdAstraSky AI Service — FastAPI + LangGraph + ChromaDB
Microservicio de agente astronómico con RAG
"""

import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import health, chat, sky
from config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from rag.vector_store import get_vector_store
    try:
        get_vector_store()
        print("[OK] RAG ligero listo con documentos IAC")
    except Exception as e:
        print(f"[WARN] No se pudo inicializar RAG: {e}")
        print("[INFO] El chat funcionará en modo offline")
    yield


app = FastAPI(
    title="AdAstraSky AI Service",
    description="Agente astronómico inteligente con LangGraph y RAG sobre documentos IAC",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [settings.frontend_url, "http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(sky.router)


if __name__ == "__main__":
    import uvicorn
    reload_mode = os.getenv("NODE_ENV") != "production"
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=reload_mode)
