# Capítulo 2: Arquitectura General

## 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET (Usuario)                           │
└──────────┬─────────────────────────────────────┬───────────────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────────┐
│   Vercel (Frontend)  │          │   Render (Backend)       │
│   React + Vite +     │          │   Node.js + Express      │
│   Tailwind CSS       │◄────────►│   Puerto 5000            │
│   Puerto 3000        │  REST    │                          │
│                      │  API     │   JWT Auth               │
│   adastra-sky        │          │   Sequelize ORM          │
│   .vercel.app        │          │   Swagger Docs           │
└──────────────────────┘          └──────────┬───────────────┘
                                             │
                    ┌────────────────────────┼────────────────────┐
                    │                        │                     │
                    ▼                        ▼                     ▼
    ┌──────────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │ Render (AI Service)      │  │ Render (Postgres) │  │ APIs Externas    │
    │ FastAPI + LangGraph      │  │ Neon PostgreSQL   │  │                  │
    │ Puerto 10000             │  │ Puerto 5432       │  │ - OpenWeather    │
    │                          │  │                   │  │ - NASA           │
    │ - Agente LangGraph       │  │ 7 tablas:         │  │ - Groq AI        │
    │ - RAG TF-IDF             │  │ Users             │  │ - HuggingFace    │
    │ - Sky Engine             │  │ ChatHistory       │  │ - HF Inference   │
    │ - 6 docs IAC             │  │ SkyQualityZones   │  │                  │
    └──────────────────────────┘  │ SkyScores         │  └──────────────────┘
                                  │ Events            │
                                  │ Experiences       │
                                  │ ContactMessages   │
                                  └──────────────────┘
```

## 2.2 Flujo de Datos Completo

### 2.2.1 Autenticación
```
Register/Login → POST /api/auth/register|login
  → auth.controller.js
    → bcryptjs (hash/compare password)
    → jwt.sign({id, role, email})
    → { token, user }
  ← Frontend guarda token en localStorage("adastra_session")
  ← AuthContext actualiza estado global
```

### 2.2.2 Consulta de Zonas de Cielo
```
GET /api/sky/zones?island=Tenerife&category=mirador
  → sky.controller.getAll()
    → SkyQualityZone.findAll({where, include: SkyScore})
    → { zones: [...] }
  ← Frontend renderiza en InteractiveMap.jsx
```

### 2.2.3 Chat con IA
```
POST /api/chat { message, language, session_id }
  → authMiddleware (verifica JWT)
  → chat.controller.sendMessage()
    → axios.post(AI_SERVICE_URL/api/chat, { message, language, user_id })
      → AI Service FastAPI
        → LangGraph Agent (call_model)
          → _get_models(): prueba Groq → OpenAI → HuggingFace
          → Si falla: _simple_rag_response()
            → TF-IDF similarity search
            → Devuelve fragmentos de documentos IAC
        → Respuesta { response, session_id, sources }
      ← Backend recibe respuesta
    → ChatHistory.create({user_id, message, response, ...})
  ← Frontend muestra respuesta
```

### 2.2.4 Sky Score
```
GET /api/sky/scores?zoneId=5
  → sky.controller.getScores()
    → SkyScore.findAll({where: {zoneId}})
  ← { scores: [...] }

POST /api/sky-score { cloudiness, light_pollution, moon_phase, ... }
  → skyScore.controller.calculateAndSave()
    → SkyScoreAlgorithm.calculate({factors})
    → SkyScore.create({zoneId, astroScore, photoScore, ...})
  ← { sky_score, recommendation }
```

## 2.3 Estructura de Archivos (Completa)

### Backend (`backend/`)
```
backend/
├── server.js                         # Entry point (Express app)
├── package.json                      # Dependencias y scripts
├── jest.config.js                    # Configuración de Jest
├── .env.example                      # Plantilla de variables de entorno
│
├── src/
│   ├── config/
│   │   └── database.js              # Configuración Sequelize + PostgreSQL
│   │
│   ├── models/
│   │   ├── index.js                 # Asociaciones entre modelos
│   │   ├── User.js                  # Usuarios (auth, roles)
│   │   ├── SkyQualityZone.js        # Zonas de observación
│   │   ├── SkyScore.js              # Puntuaciones de cielo
│   │   ├── ChatHistory.js           # Historial de chat
│   │   ├── Event.js                 # Eventos astronómicos
│   │   ├── Experience.js            # Experiencias de usuarios
│   │   └── ContactMessage.js        # Mensajes de contacto
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, profile, password
│   │   ├── sky.controller.js        # Zonas + estados del cielo
│   │   ├── skyScore.controller.js   # Cálculo y guardado de scores
│   │   ├── chat.controller.js       # Proxy al AI Service
│   │   ├── admin.controller.js      # Panel de administración
│   │   ├── events.controller.js     # CRUD eventos astronómicos
│   │   ├── island.controller.js     # Información de islas
│   │   ├── contact.controller.js    # Formulario de contacto
│   │   ├── experiences.controller.js# Experiencias de usuarios
│   │   └── weather.controller.js    # Datos meteorológicos
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # Verificación JWT
│   │   ├── apiKeyAuth.js            # API Key para acceso externo
│   │   ├── requireAdmin.js          # Validación de rol admin
│   │   ├── errorHandler.js          # Manejador global de errores
│   │   └── notFound.js              # Ruta 404
│   │
│   ├── routes/
│   │   ├── auth.routes.js           # /api/auth
│   │   ├── sky.routes.js            # /api/sky
│   │   ├── chat.routes.js           # /api/chat
│   │   ├── admin.routes.js          # /api/admin
│   │   ├── island.routes.js         # /api/islands
│   │   ├── contact.routes.js        # /api/contact
│   │   ├── events.routes.js         # /api/events
│   │   ├── weather.routes.js        # /api/weather
│   │   └── experiences.routes.js    # /api/experiences
│   │
│   ├── swagger.js                   # Documentación OpenAPI 3.0
│   │
│   ├── seed/
│   │   ├── seedUsers.js             # Seed de usuarios iniciales
│   │   └── setAdmin.js              # Script para promocionar a admin
│   │
│   └── utils/
│       ├── skyScoring.js            # Algoritmo de scoring
│       └── astronomyEvents.js       # Cálculos astronómicos
│
└── __tests__/
    ├── setup.js                     # Configuración de tests
    ├── health.test.js               # Health check + API info
    ├── auth.test.js                 # Tests de autenticación
    ├── sky.test.js                  # Tests de zonas de cielo
    ├── events.test.js               # Tests de eventos
    └── middleware.test.js           # Tests de middlewares
```

### Frontend (`frontend/`)
```
frontend/
├── package.json
├── vite.config.js                   # Vite + React plugin
├── tailwind.config.js               # Tema personalizado (astroDark, astroAccent)
├── postcss.config.js
├── eslintrc.cjs
├── vercel.json                      # Reglas SPA para Vercel
├── .env.example
│
├── index.html
│
├── public/
│   └── locales/                     # Archivos de traducción (es, en, de)
│
├── src/
│   ├── main.jsx                     # Entry Point React
│   ├── App.jsx                      # Router principal (14 rutas)
│   │
│   ├── assets/                      # Imágenes (15+)
│   │
│   ├── config/
│   │   ├── i18n.js                  # Configuración i18next
│   │   └── site.js                  # Metadatos del sitio
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Estado global de autenticación
│   │
│   ├── hooks/
│   │   └── useLocalStorage.js       # Hook genérico localStorage
│   │
│   ├── services/
│   │   ├── astronomyService.js      # Llamadas a /api/events
│   │   ├── mapService.js            # Llamadas a /api/sky, /api/islands
│   │   └── weatherService.js        # Llamadas a /api/weather
│   │
│   ├── pages/                       # 14 páginas (ver Capítulo 4)
│   ├── components/                  # 13 componentes + 5 UI primitives
│   ├── data/                        # 11 archivos de datos estáticos
│   └── styles/
│       └── index.css                # Estilos globales + tema oscuro
│
└── __tests__/
    ├── setup.js
    ├── App.test.jsx
    └── NotFoundPage.test.jsx
```

### AI Service (`ai-service/`)
```
ai-service/
├── main.py                          # FastAPI entry point
├── config.py                        # Settings con pydantic-settings
├── requirements.txt                 # Dependencias Python
├── .env.example
├── .gitignore
│
├── agent/
│   ├── __init__.py
│   ├── agent.py                     # LangGraph StateGraph + call_model
│   ├── state.py                     # TypedDict AgentState
│   └── tools.py                     # Herramientas del agente (5 tools)
│
├── rag/
│   ├── __init__.py
│   └── vector_store.py              # TF-IDF + cosine similarity in-memory
│
├── routers/
│   ├── __init__.py
│   ├── health.py                    # /health, /debug/config
│   ├── chat.py                      # POST /api/chat
│   └── sky.py                       # POST /api/sky-score, GET /api/what-to-see
│
├── sky_engine/
│   ├── __init__.py
│   ├── sky_score.py                 # SkyScoreAlgorithm
│   └── utils.py                     # calculate_moon_illumination
│
└── documents/                       # 6 documentos IAC en .md
```

## 2.4 Decisiones Técnicas Detalladas

### 2.4.1 Patrón Proxy para Chat
El backend Node.js NO ejecuta código de IA directamente. Actúa como proxy hacia el AI Service Python:
- **Ventaja**: El backend puede escalar independientemente del AI Service
- **Ventaja**: Si el AI Service falla, el backend sigue funcionando (devuelve 503/502)
- **Ventaja**: El AI Service puede reemplazarse sin cambiar el backend

### 2.4.2 Manejo de Errores Encadenado
```
Frontend (Axios catch) ← 4xx/5xx → Backend (errorHandler.js)
                                      ├── Joi → 400
                                      ├── Sequelize → 400/409/400
                                      ├── JWT → 401
                                      ├── Errores con statusCode
                                      └── Error genérico → 500 (solo detail en dev)
```

### 2.4.3 Estrategia de Cache del RAG
El vector store TF-IDF se carga UNA VEZ al iniciar el AI Service (lifespan de FastAPI) y se cachea con `@lru_cache()`. Los ~61 fragmentos de 6 documentos se mantienen en memoria durante toda la vida del proceso.

### 2.4.4 Internacionalización
- Frontend: i18next con detección automática de idioma del navegador
- Idiomas: español (default), inglés, alemán
- Backend: El idioma se pasa como parámetro `language` en las requests de chat
- AI Service: El agente recibe `language` y lo usa en el prompt del sistema

## 2.5 Limitaciones Conocidas

| Limitación | Causa | Mitigación |
|---|---|---|
| Cold start ~30s | Render free plan duerme servicios inactivos | Warm-up en startup del backend |
| 512MB RAM AI Service | Render free plan | RAG TF-IDF ligero en lugar de ChromaDB |
| Sin WebSockets | Chat usa REST polling | Aceptable para el alcance del proyecto |
| Sin caché Redis | No hay servidor de caché | Consultas directas a PostgreSQL |
| Sin rate limiting avanzado | `RATE_LIMIT_MAX_REQUESTS=100` básico | Suficiente para el alcance actual |
| Sin tests de integración AI | No hay mock para el AI Service | Tests unitarios del backend solamente |
