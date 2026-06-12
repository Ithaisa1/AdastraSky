# Manual de Instalación — AdAstra Sky

> Guía para desarrollar y desplegar el proyecto localmente

---

## Requisitos del Sistema

| Componente | Versión Mínima |
|-----------|---------------|
| Node.js | 18+ (recomendado 22+) |
| npm | 9+ |
| Python | 3.11+ |
| PostgreSQL | 14+ |
| Git | Cualquier versión moderna |

---

## 1. Clonar el Repositorio

```bash
git clone https://github.com/Ithaisa1/AdastraSky.git
cd AdastraSky
```

---

## 2. Configurar Base de Datos

### Opción A: PostgreSQL Local
1. Instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/)
2. Crea la base de datos:
```bash
psql -U postgres -c "CREATE DATABASE adastrasky;"
```

### Opción B: Docker (alternativa)
```bash
docker run -d \
  --name adastra-db \
  -e POSTGRES_DB=adastrasky \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=ironhack \
  -p 5432:5432 \
  postgres:16
```

---

## 3. Configurar Backend

```bash
cd backend
cp .env.example .env
npm install
```

### Editar `.env`
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=adastrasky
DB_USER=postgres
DB_PASSWORD=ironhack

JWT_SECRET=genera_un_segur_aleatorio_aqui
JWT_EXPIRES_IN=7d

AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000

OPENWEATHER_API_KEY=tu_clave
NASA_API_KEY=tu_clave

SEED_ADMIN_PASSWORD=Admin1234
SEED_DEMO_PASSWORD=Demo1234
```

### Iniciar Backend
```bash
npm run dev
# Servidor en http://localhost:5000
# Auto-crea tablas y seed de usuarios al iniciar
```

---

## 4. Configurar Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

### Editar `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_DEFAULT_LANGUAGE=es
VITE_MAP_DEFAULT_LAT=28.2917
VITE_MAP_DEFAULT_LNG=-16.5111
VITE_MAP_DEFAULT_ZOOM=8
```

### Iniciar Frontend
```bash
npm run dev
# Servidor en http://localhost:3000
# Proxy /api -> localhost:5000
```

---

## 5. Configurar AI Service

```bash
cd ai-service
cp .env.example .env
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Editar `.env`
```env
PORT=8001
GROQ_API_KEY=gsk_tu_clave_groq
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=sk-tu_clave_openai
FRONTEND_URL=http://localhost:3000
```

### Iniciar AI Service
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
# Servidor en http://localhost:8001
# Documentación: http://localhost:8001/docs
```

---

## 6. Seed de Zonas (95+ zonas)

Una vez que backend y frontend estén funcionando:

### Opción A: Desde la API (recomendado)
```bash
# Registra un usuario admin primero o usa el auto-seed
# POST a /api/auth/register con email y contraseña

# Luego seed de zonas (requiere token admin):
curl -X POST http://localhost:5000/api/admin/zones/seed \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### Opción B: Seed automático
El backend auto-crea tablas con `sequelize.sync()`. Las zonas se cargan desde `backend/src/seed/santuarios.json` vía el endpoint seed.

---

## 7. Verificar Instalación

### Health Checks
```bash
# Backend
curl http://localhost:5000/health
# → {"status":"ok","database":"connected",...}

# AI Service
curl http://localhost:8001/health
# → {"status":"healthy","version":"1.0.0"}

# Frontend
# Abrir http://localhost:3000 en el navegador
```

### Probar Chat IA
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Qué es el Observatorio del Teide?"}'
```

---

## 8. Tests

### Backend
```bash
cd backend
npm test
# 5 suites: health, auth, sky, events, middleware
```

### Frontend
```bash
cd frontend
npm test
# 3 tests: App, NotFoundPage, setup
```

---

## 9. Scripts Disponibles

### Backend
| Script | Comando | Descripción |
|--------|---------|-------------|
| `npm run dev` | `nodemon server.js` | Desarrollo con auto-reload |
| `npm start` | `node server.js` | Producción |
| `npm test` | Jest con coverage | Tests |
| `npm run seed:users` | Seed usuarios | Crea admin + demo |

### Frontend
| Script | Comando | Descripción |
|--------|---------|-------------|
| `npm run dev` | `vite` | Desarrollo en :3000 |
| `npm run build` | `vite build` | Build producción a dist/ |
| `npm run preview` | `vite preview` | Vista previa del build |
| `npm test` | `vitest` | Tests |

### AI Service
| Comando | Descripción |
|---------|-------------|
| `uvicorn main:app --reload --port 8001` | Desarrollo |
| `uvicorn main:app --host 0.0.0.0 --port 8001` | Producción |

---

## 10. Despliegue

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Subir a Vercel:
# - Framework: Vite
- Build: npm run build
- Output: dist
- Añadir VITE_API_URL como env var
```

### Render (Backend + AI + DB)
Ver `render.yaml` para infraestructura como código.

**Servicios:**
1. **PostgreSQL** — Render Managed DB (free)
2. **Backend** — Node.js express, puerto 5000
3. **AI Service** — Python FastAPI, puerto variable

**Variables de entorno requeridas en Render:**
- `JWT_SECRET`, `DATABASE_URL`, `AI_SERVICE_URL`, `FRONTEND_URL`
- `GROQ_API_KEY`, `OPENWEATHER_API_KEY`, `NASA_API_KEY`

---

## 11. Stack Tecnológico Completo

```
Frontend:  React 18 + Vite 5 + Tailwind 3 + Leaflet + Framer Motion
Backend:   Node 22 + Express 4 + Sequelize 6 + JWT + Joi
AI:        Python 3.11 + FastAPI + LangGraph + LangChain + Groq/OpenAI
RAG:       scikit-learn TF-IDF + cosine similarity + 6 docs IAC
DB:        PostgreSQL 14+ con índices en campos de búsqueda
Deploy:    Vercel (frontend) + Render (backend + AI + DB)
Auth:      JWT con rol en payload (user/admin)
API:       REST + OpenAPI/Swagger 3.0
```

---

## 12. Estructura de Directorios

```
AdastraSky/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── config/          # database.js (Sequelize)
│   │   ├── controllers/     # 8 controllers
│   │   ├── middleware/       # 5 middlewares
│   │   ├── models/          # 7 modelos
│   │   ├── routes/          # 9 routers
│   │   ├── seed/            # Seeds (JSON, scripts)
│   │   └── utils/           # scoring, astronomy
│   └── __tests__/           # 5 suites
├── frontend/
│   ├── src/
│   │   ├── pages/           # 14 páginas
│   │   ├── components/      # Componentes reutilizables
│   │   ├── context/         # AuthContext
│   │   ├── config/          # i18n, site config
│   │   ├── data/            # Datos astronómicos
│   │   ├── utils/           # Format, scoring, astronomy
│   │   └── styles/          # CSS
│   └── vercel.json
├── ai-service/
│   ├── main.py
│   ├── agent/               # LangGraph agent logic
│   ├── rag/                 # TF-IDF vector store
│   ├── routers/             # FastAPI routers
│   ├── sky_engine/          # Scoring algorithm
│   └── documents/           # 6 IAC markdown docs
├── docs/                    # Documentación
└── render.yaml              # Render Blueprint
```
