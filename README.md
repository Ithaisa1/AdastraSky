# AdAstra Sky — Plataforma de Astroturismo

**Plataforma inteligente de astroturismo y exploración nocturna** enfocada en las Islas Canarias.

---

## Stack Tecnológico

| Componente | Stack |
|-----------|-------|
| Frontend | React 19 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + Sequelize + PostgreSQL |
| AI Service | FastAPI + LangGraph + ChromaDB + Groq (LLaMA 3.3) |
| Sky Engine | Python FastAPI (integrado en AI Service) |
| Automatización | n8n workflows |
| Mapas | Leaflet + React-Leaflet |
| APIs Externas | OpenWeatherMap, AstronomyAPI, NASA |

---

## Estructura del Proyecto

```
adastra-sky/
├── frontend/                # React SPA (Vite)
│   ├── src/pages/           # 21 páginas (11 enrutadas)
│   ├── src/components/      # Componentes reutilizables
│   ├── src/context/         # AuthContext (JWT)
│   └── src/services/        # API clients
│
├── backend/                 # API REST (Express + Sequelize)
│   ├── src/routes/          # auth, sky, chat, islands
│   ├── src/controllers/     # Lógica de negocio
│   ├── src/models/          # User, SkyQualityZone, ChatHistory
│   └── src/middleware/      # JWT auth, error handler
│
├── ai-service/              # Agente IA + Sky Engine (FastAPI + LangGraph)
│   ├── agent/               # StateGraph con Groq/OpenAI
│   ├── sky_engine/          # SkyScore, moon phase, eventos astronómicos
│   ├── rag/                 # ChromaDB vector store
│   ├── routers/             # /health, /api/chat, /api/sky-score
│   └── documents/           # 6 documentos IAC para RAG
│
│
├── database/                # Seeds y documentos RAG
│   ├── seed_bortle_v2.py    # Poblado de zonas
│   └── documents/           # Documentos IAC
│
├── automations/             # Workflows n8n
└── docs/                    # Documentación
```

---

## Inicio Rápido

### Requisitos
- Node.js >= 18
- Python >= 3.10
- PostgreSQL >= 12

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev          # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configurar GROQ_API_KEY en .env
python rag/ingest.py       # Poblar ChromaDB
python main.py             # http://localhost:8001
```

---

> **Nota**: El Sky Engine (cálculos de sky score, eventos, qué observar) está integrado en el AI Service como endpoints `/api/sky-score`, `/api/what-to-see` y `/api/events`.

## APIs

### Backend (`http://localhost:5000`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ✗ | Registro de usuario |
| POST | `/api/auth/login` | ✗ | Login (JWT) |
| GET | `/api/auth/profile` | ✓ | Perfil de usuario |
| GET | `/api/sky/zones` | ✗ | Zonas astronómicas |
| GET | `/api/sky/zones/geojson` | ✗ | Zonas en formato GeoJSON |
| GET | `/api/sky/zones/recommend/tonight` | ✗ | Mejores zonas para esta noche |
| GET | `/api/sky/zones/recommend/photo` | ✗ | Mejores zonas para astrofoto |
| GET | `/api/sky/zones/:id` | ✗ | Detalle de zona |
| GET | `/api/sky/islands/:island` | ✗ | Zonas por isla |
| GET | `/api/sky/category/:category` | ✗ | Zonas por categoría |
| POST | `/api/chat/message` | ✓ | Enviar mensaje al agente IA |
| GET | `/api/chat/history` | ✓ | Historial de chat |
| GET | `/api/islands` | ✗ | Lista de islas |
| GET | `/api/islands/:name` | ✗ | Detalle de isla |
| GET | `/health` | ✗ | Health check |

### AI Service (`http://localhost:8001`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat con el agente astronómico |
| POST | `/api/sky-score` | Calcular Sky Score (0-10) |
| GET | `/api/what-to-see` | Qué observar esta noche |
| GET | `/api/events` | Eventos astronómicos próximos |

---

## AI Assistant — AdAstra

El agente inteligente utiliza LangGraph con un grafo de estados:

1. **LLM**: Groq (`llama-3.3-70b-versatile`) o ChatGPT (según `GROQ_API_KEY` / `OPENAI_API_KEY`)
2. **RAG**: ChromaDB con 6 documentos del IAC (Instituto de Astrofísica de Canarias)
3. **Tools**:
   - `search_rag_documents` — búsqueda semántica en documentos
   - `get_observatory_info` — información de observatorios (BD)
    - `get_weather_conditions` — clima actual por coordenadas
    - `get_constellation_info` — datos de constelaciones (BD)
    - `calculate_sky_score` — calidad del cielo basada en condiciones atmosféricas

**Modo offline**: si no hay API key configurada, responde solo con búsqueda RAG.

---

## Frontend — Páginas

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | HomePage | Público |
| `/login` | LoginPage | Público |
| `/explorador` | Dashboard | Requiere auth |
| `/observatories` | Observatorios | Requiere auth |
| `/map` | Mapa interactivo | Requiere auth |
| `/data` | Base de datos celeste | Requiere auth |
| `/events` | Eventos astronómicos | Requiere auth |
| `/chat` | Chat con AdAstra | Requiere auth |
| `/settings` | Perfil / Ajustes | Requiere auth |
| `/admin` | Panel admin | Requiere auth |
| `/contact` | Contacto | Requiere auth |

---

## Variables de Entorno

### Backend (`.env`)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adastrasky
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5173
```

### AI Service (`.env`)
```env
PORT=8001
GROQ_API_KEY=gsk_your_key
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=sk-your-key       # alternativo
OPENAI_MODEL=gpt-4o-mini
CHROMA_PERSIST_DIR=./rag/chroma_db
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## Documentación

- [Arquitectura](./docs/ARCHITECTURE.md)
- [API Specification](./docs/api_specification.md)
- [Convenciones](./docs/CONVENTIONS.md)
- [Guía de despliegue](./docs/deployment_guide.md)

---

## Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# AI Service
cd ai-service && python -m pytest
```

---

## Despliegue

| Servicio | Plataforma |
|----------|-----------|
| Frontend | Vercel |
| Backend | Render + Neon (PostgreSQL) |
| AI Service | Render |
| Sky Engine | Integrado en AI Service |

Ver [guía de despliegue](./docs/deployment_guide.md) para instrucciones detalladas.

---

## Licencia

MIT
