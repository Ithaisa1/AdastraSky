FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema necesarias para chromadb y sentence-transformers
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Quitar langchain-openai y psycopg2 que no necesita el ai-service
RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    "pydantic>=2.0,<3.0" \
    "pydantic-settings>=2.0,<3.0" \
    "langchain>=0.3.21" \
    "langchain-community>=0.3.20" \
    "langchain-groq>=1.0.0" \
    "langchain-chroma>=0.2.4" \
    "langchain-huggingface>=0.1.2" \
    "langgraph>=0.3.22" \
    "chromadb>=1.0.9" \
    "sentence-transformers>=3.0,<4.0" \
    "httpx>=0.28,<1.0" \
    "python-dotenv>=1.0,<2.0"

COPY . .

# Ejecutar ingesta — los documentos .md están en el repo
RUN python -m rag.ingest

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]