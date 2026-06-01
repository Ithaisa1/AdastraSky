"""
AdAstraSky AI Service — FastAPI + LangGraph + ChromaDB
Microservicio de agente astronómico con RAG
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import health, chat
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="AdAstraSky AI Service",
    description="Agente astronómico inteligente con LangGraph y RAG sobre documentos IAC",
    version="1.0.0",
)

# CORS
origins = [settings.frontend_url, "http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(chat.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
