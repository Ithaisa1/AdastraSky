# AdAstra Sky — Plataforma de Astroturismo Inteligente

**AdAstra Sky** es una plataforma web inteligente de astroturismo enfocada en las Islas Canarias, uno de los mejores destinos del mundo para la observación astronómica. Combina un mapa interactivo de zonas de observación, un algoritmo de puntuación de calidad del cielo, un asistente IA con RAG sobre documentos del Instituto de Astrofísica de Canarias (IAC), y herramientas para astrónomos aficionados y astrofotógrafos.

---

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3.4 + Framer Motion |
| **Backend API** | Node.js + Express + Sequelize ORM |
| **Base de Datos** | PostgreSQL (Neon serverless) |
| **AI Service** | FastAPI + LangGraph + ChromaDB + Groq (LLaMA 3.3 70B) / OpenAI |
| **Mapas** | Leaflet + React-Leaflet |
| **Internacionalización** | i18next (es, en, de) |
| **Automatización** | n8n workflows |
| **APIs Externas** | OpenWeatherMap, AstronomyAPI, NASA API |
| **Despliegue** | Frontend → Vercel · Backend → Render · DB → Neon |

---

## Estructura del Proyecto

```
AdastraSky/
├── frontend/                 # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/            # 15 páginas (Home, Explorador, Chat, Admin...)
│   │   ├── components/       # Componentes reutilizables (UI, mapa, chat...)
│   │   ├── context/          # AuthContext (JWT)
│   │   ├── services/         # API clients (astronomy, map, weather)
│   │   ├── data/             # Datos estáticos (islas, constelaciones, eventos)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilidades (astronomy, format, scoring)
│   │   ├── config/           # i18n, site constants
│   │   └── assets/           # Imágenes (observatorios, miradores)
│   ├── public/
│   └── __tests__/
│
├── backend/                  # API REST (Express + Sequelize)
│   ├── src/
│   │   ├── controllers/      # auth, sky, skyScore, island, chat, events, admin, experiences
│   │   ├── models/           # User, SkyQualityZone, SkyScore, Event, Experience, ChatHistory, ContactMessage
│   │   ├── routes/           # auth, sky, island, chat, events, experiences, contact, weather, admin
│   │   ├── middleware/       # JWT auth, API key auth, admin check, error handler, 404
│   │   ├── config/           # PostgreSQL/Sequelize connection
│   │   ├── seed/             # seedUsers, setAdmin
│   │   ├── utils/            # skyScoring algorithm
│   │   └── swagger.js        # OpenAPI/Swagger config
│   └── __tests__/
│
├── ai-service/               # Agente IA + Sky Engine (FastAPI + LangGraph)
│   ├── agent/                # LangGraph StateGraph (Groq/OpenAI)
│   ├── sky_engine/           # Sky Score Algorithm (0-10), moon illumination
│   ├── rag/                  # ChromaDB vector store + ingest
│   ├── routers/              # /health, /api/chat, /api/sky
│   └── documents/            # 6 documentos IAC (observatorios, ley cielo, astroturismo)
│
├── database/                 # Seeds y documentos
│   ├── seed.js               # Seed de 10 zonas de observación
│   ├── seed_bortle_v2.py     # Bortle scale seed
│   └── documents/            # Documentos IAC (copia)
│
├── automations/              # Workflows n8n
│   ├── n8n_workflow_sky_query.json
│   └── n8n_workflow_daily_sky_score.json
│
├── docs/                     # Documentación
│   ├── ARCHITECTURE.md       # Arquitectura del sistema
│   ├── api_specification.md  # Especificación de APIs
│   ├── CONVENTIONS.md        # Convenciones de código
│   ├── deployment_guide.md   # Guía de despliegue
│   └── AdAstraSky.postman_collection.json
│
├── render.yaml               # Render Blueprint deployment
├── vercel.json               # Frontend Vercel config
└── package.json              # Monorepo orchestrator (concurrently)
```

---

## Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend  │────▶│   Backend    │────▶│   AI Service     │
│  React SPA  │     │  Express.js  │     │  FastAPI + RAG   │
│  Vercel     │     │  Render      │     │  Render          │
└─────────────┘     └──────┬───────┘     └──────────────────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │  Neon        │
                    └──────────────┘
```

- **Frontend** → Consume API REST del backend
- **Backend** → Proxy al AI Service, gestiona auth, almacena en PostgreSQL
- **AI Service** → Agente LangGraph con RAG, Sky Engine, consultas a APIs externas
- **n8n** → Automatizaciones (sky score diario, consultas programadas)

---

## Funcionalidades Principales

### 🌌 Mapa Interactivo de Zonas de Observación
- Más de 50 zonas geolocalizadas en las 8 islas Canarias
- Clasificación por categoría: observatorios, miradores astronómicos, miradores paisajísticos
- Filtros por isla, categoría, escala Bortle (1-9), accesibilidad
- Exportación GeoJSON y CSV
- Panel de santuarios estelares (zonas Bortle 1-2)

### ⭐ Sky Score Algorithm
- Puntuación global (0-100) basada en múltiples factores:
  - **Astro Score**: Escala Bortle, seeing, transparencia, altitud, nubosidad, humedad
  - **Photo Score**: Calidad paisaje, orientación astro, composición, acceso fotógrafo
  - **Tourism Score**: Tipo de acceso, seguridad, servicios, parking
- Recomendaciones personalizadas: "Mejor para esta noche", "Mejor para astrofotografía"

### 🤖 Asistente IA — AdAstra
- Agente conversacional con LangGraph (StateGraph)
- LLM: Groq (LLaMA 3.3 70B) o OpenAI (GPT-4o-mini)
- RAG sobre 6 documentos del Instituto de Astrofísica de Canarias
- Herramientas del agente:
  - `search_rag_documents` — búsqueda semántica en documentos IAC
  - `get_observatory_info` — información de observatorios
  - `get_weather_conditions` — clima actual por coordenadas (OpenWeatherMap)
  - `get_constellation_info` — datos de constelaciones
  - `calculate_sky_score` — calidad del cielo en tiempo real
- Multilingüe: español, inglés, alemán
- Modo offline: responde solo con RAG si no hay API key de LLM

### 📅 Eventos Astronómicos
- Calendario de eventos astronómicos (lluvias de estrellas, eclipses, conjunciones)
- Datos estáticos + dinámicos desde AstronomyAPI/NASA
- Filtro por mes y tipo de evento

### 🗺️ Explorador de Islas
- Información detallada de las 8 islas Canarias
- Zonas de observación recomendadas por isla

### 👤 Sistema de Usuarios
- Registro y login con JWT
- Perfiles con preferencia de idioma
- Roles: user / admin
- Panel de administración (CRUD de zonas, gestión de usuarios)

### 📝 Experiencias de Usuario
- Los usuarios pueden compartir sus experiencias de observación
- Subida de imágenes (multer + sharp)

### 💬 Chat con Historial
- Conversaciones persistentes con el asistente IA
- Historial por sesión

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
npm run seed
npm run dev          # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:3000
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate  |  Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Configurar GROQ_API_KEY o OPENAI_API_KEY en .env
python rag/ingest.py       # Poblar ChromaDB con documentos IAC
python main.py             # http://localhost:8001
```

### 4. Dashboard (opcional)

```bash
npm run dev          # Lanza frontend + backend + ai-service concurrentemente
```

---

## APIs

### Backend (`http://localhost:5000`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | ✗ | Health check del servidor |
| GET | `/api` | ✗ | Información de la API |
| GET | `/api/docs` | ✗ | Documentación Swagger |
| **Auth** | | | |
| POST | `/api/auth/register` | ✗ | Registro de usuario |
| POST | `/api/auth/login` | ✗ | Login (devuelve JWT) |
| GET | `/api/auth/profile` | ✓ | Perfil del usuario autenticado |
| PATCH | `/api/auth/profile` | ✓ | Actualizar perfil |
| **Sky Zones** | | | |
| GET | `/api/sky/zones` | ✗ | Todas las zonas activas |
| GET | `/api/sky/zones/geojson` | ✗ | Zonas en formato GeoJSON |
| GET | `/api/sky/zones/csv` | ✗ | Exportar zonas como CSV |
| GET | `/api/sky/zones/query` | ✗ | Búsqueda avanzada con filtros |
| GET | `/api/sky/zones/recommend/tonight` | ✗ | Mejores zonas para esta noche |
| GET | `/api/sky/zones/recommend/photo` | ✗ | Mejores zonas para astrofotografía |
| GET | `/api/sky/zones/:id` | ✗ | Detalle de zona por ID |
| GET | `/api/sky/zones/islands/:island` | ✗ | Zonas por isla |
| GET | `/api/sky/zones/category/:category` | ✗ | Zonas por categoría |
| **Sky Score** | | | |
| POST | `/api/sky/score` | API Key | Guardar sky score (desde n8n) |
| GET | `/api/sky/score/latest` | ✗ | Último sky score registrado |
| GET | `/api/sky/score/history` | ✗ | Historial de sky scores |
| **Chat** | | | |
| POST | `/api/chat/message` | ✓ | Enviar mensaje al agente IA |
| GET | `/api/chat/history` | ✓ | Historial de conversaciones |
| **Islands** | | | |
| GET | `/api/islands` | ✗ | Información de todas las islas |
| GET | `/api/islands/:name` | ✗ | Detalle de isla |
| **Events** | | | |
| GET | `/api/events` | ✗ | Eventos astronómicos |
| GET | `/api/events/:id` | ✗ | Detalle de evento |
| **Experiences** | | | |
| GET | `/api/experiences` | ✗ | Experiencias de usuarios |
| POST | `/api/experiences` | ✓ | Crear experiencia |
| **Contact** | | | |
| POST | `/api/contact` | ✗ | Enviar mensaje de contacto |
| **Weather** | | | |
| GET | `/api/weather/current?lat=&lon=` | ✗ | Clima actual por coordenadas |
| **Admin** | | | |
| GET | `/api/admin/zones` | Admin | Todas las zonas (admin) |
| POST | `/api/admin/zones` | Admin | Crear zona |
| PUT | `/api/admin/zones/:id` | Admin | Actualizar zona |
| DELETE | `/api/admin/zones/:id` | Admin | Eliminar zona |
| GET | `/api/admin/users` | Admin | Lista de usuarios |
| PUT | `/api/admin/users/:id` | Admin | Actualizar usuario |

### AI Service (`http://localhost:8001`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat con el agente astronómico |
| POST | `/api/sky-score` | Calcular Sky Score (0-10) |
| GET | `/api/what-to-see` | Qué observar esta noche |
| GET | `/api/events` | Eventos astronómicos próximos |

---

## Variables de Entorno

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adastrasky
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
OPENWEATHER_API_KEY=tu_clave
ASTRONOMY_API_KEY=tu_clave
NASA_API_KEY=tu_clave
N8N_API_KEY=clave_para_automations
```

### AI Service (`.env`)
```env
PORT=8001
GROQ_API_KEY=gsk_your_key
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=http://localhost:3000
CHROMA_PERSIST_DIR=./rag/chroma_db
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## Scripts Disponibles

### Root (monorepo)
```bash
npm run dev     # Lanza backend + frontend + ai-service
```

### Backend
```bash
npm run dev         # Desarrollo con nodemon
npm start           # Producción
npm test            # Tests (Jest + Supertest)
npm run seed        # Poblar base de datos
npm run lint        # ESLint
```

### Frontend
```bash
npm run dev         # Desarrollo (Vite, puerto 3000)
npm run build       # Build producción
npm run preview     # Vista previa del build
npm test            # Tests (Vitest)
```

### AI Service
```bash
python main.py                  # Iniciar servidor
python -m pytest                # Tests
python rag/ingest.py            # Poblar ChromaDB
```

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

| Servicio | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | `https://adastra-sky.vercel.app` |
| Backend | Render + Neon | `https://aadastra-sky-backend.onrender.com` |
| AI Service | Render | `https://adastra-sky-ai.onrender.com` |

Ver [guía de despliegue](./docs/deployment_guide.md) para instrucciones detalladas.

---

## Agente IA — AdAstra

El asistente utiliza LangGraph con un grafo de estados:

1. **LLM**: Groq (`llama-3.3-70b-versatile`) o alternativamente OpenAI (`gpt-4o-mini`)
2. **RAG**: ChromaDB embedido con HuggingFace (`all-MiniLM-L6-v2`) sobre 6 documentos del IAC
3. **Tools**: Búsqueda RAG, info de observatorios, clima, constelaciones, sky score
4. **Modo offline**: Responde solo con RAG si no hay API key de LLM configurada

Documentos indexados en RAG:
- Introducción al IAC
- Observatorio del Roque de los Muchachos
- Observatorio del Teide
- Ley del Cielo de Canarias
- Astroturismo en Canarias
- Eventos astronómicos

---

## Base de Datos — Modelos

| Modelo | Descripción |
|---|---|
| **User** | Usuarios con roles (user/admin), UUID, JWT auth, preferencia de idioma |
| **SkyQualityZone** | Zonas de observación con coordenadas, escala Bortle, accesibilidad, servicios |
| **SkyScore** | Registro histórico de puntuaciones diarias de calidad del cielo |
| **Event** | Eventos astronómicos (lluvias, eclipses, conjunciones) |
| **Experience** | Experiencias compartidas por usuarios |
| **ChatHistory** | Historial de conversaciones con el asistente IA |
| **ContactMessage** | Mensajes del formulario de contacto |

---

## Documentación

- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Especificación de APIs](./docs/api_specification.md)
- [Convenciones de Código](./docs/CONVENTIONS.md)
- [Guía de Despliegue](./docs/deployment_guide.md)
- [Colección Postman](./docs/AdAstraSky.postman_collection.json)

---

## Usuarios Demo (Seed)

| Email | Contraseña | Rol |
|---|---|---|
| `demo@adastra.sky` | `demo123` | user |
| `admin@adastra.sky` | `admin123` | admin |

---

## Licencia

MIT
