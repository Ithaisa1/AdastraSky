---
title: AdAstra Sky AI Service
emoji: 🌌
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# AdAstra Sky AI Service

Microservicio de agente astronómico con RAG ligero para las Islas Canarias.

Stack: **FastAPI + LangGraph + scikit-learn TF-IDF RAG + Groq LLaMA 3.3 70B**.

## Endpoints

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/health` | GET | Health check |
| `/api/chat` | POST | Chat con el agente astronómico |
| `/api/sky-score` | POST | Calcular Sky Score (0-10) |
| `/api/what-to-see` | GET | Qué observar esta noche |

## Variables de Entorno

Ver `.env.example` para la lista completa.
