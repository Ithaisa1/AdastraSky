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
│   Puerto 5173        │  REST    │                          │
│                      │  API     │   JWT Auth               │
│   adastra-sky        │          │   Sequelize ORM          │
│   .vercel.app        │          │   Swagger Docs           │
└──────────────────────┘          │   Rate limiting          │
                                  │   PDF export (pdfkit)    │
                                  └──────────┬───────────────┘
                                             │
                     ┌───────────────────────┼──────────────────────┐
                     │                       │                       │
                     ▼                       ▼                       ▼
     ┌──────────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
     │ Render (AI Service)      │  │ Render (Postgres) │  │ APIs Externas    │
     │ FastAPI + LangGraph      │  │ PostgreSQL 18     │  │                  │
     │ Puerto 10000             │  │ SSL               │  │ - OpenWeather    │
     │                          │  │ rejectUnauthorized │  │ - NASA           │
     │ - Agente LangGraph       │  │ : false           │  │ - Groq AI        │
     │ - RAG TF-IDF scikit-learn│  │                   │  │ - OpenAI         │
     │ - Sky Engine             │  │ 7 tablas:         │  │                  │
     │ - 6 docs IAC             │  │ Users             │  └──────────────────┘
     │ - Sin ChromaDB/PyTorch   │  │ ChatHistory       │
     └──────────────────────────┘  │ SkyQualityZones   │
                                  │ SkyScores          │
                                  │ Events             │
                                  │ Experiences        │
                                  │ ContactMessages    │
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
  ← AuthContext actualiza estado global (sin localStorage directo)
  ← Axios interceptor inyecta token desde contexto
```

### 2.2.2 Consulta de Zonas de Cielo
```
GET /api/sky/zones?island=Tenerife&category=mirador
  → sky.controller.getAll()
    → SkyQualityZone.findAll({where, include: SkyScore})
    → { zones: [...] }
  ← Frontend renderiza en InteractiveMap.jsx
     (con flyTo si recibe selectedZone prop)
```

### 2.2.3 Chat con IA
```
POST /api/chat { message, language, session_id }
  → authMiddleware (verifica JWT)
  → chat.controller.sendMessage()
    → axios.post(AI_SERVICE_URL/api/chat, { message, language, user_id })
      → AI Service FastAPI
        → LangGraph Agent (call_model)
          → _get_models(): prueba Groq → OpenAI
          → Si falla o 429: _simple_rag_response()
            → TF-IDF similarity search (scikit-learn)
            → Devuelve fragmentos de documentos IAC
            → Si es 429: mensaje amigable + RAG docs
        → Respuesta { response, session_id, sources }
      ← Backend recibe respuesta
    → ChatHistory.create({user_id, message, response, ...})
  ← Frontend muestra respuesta
```

### 2.2.4 Warm-up (evita cold starts)
```
GET /api/chat/warmup
  → chat.controller.warmup()
    → axios.get(AI_SERVICE_URL/health)
    → { status: "AI service is healthy" } o { status: "warming up" }
  ← ChatPage muestra "Iniciando servicio de IA..." mientras calienta
```

### 2.2.5 Sky Score
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

### 2.2.6 Exportación PDF
```
GET /api/sky/zones/pdf
  → sky.controller.exportPdf()
    → pdfkit genera PDF con branding AdAstra Sky
    → incluye todas las zonas con coordenadas, Bortle, altitud
  ← Content-Type: application/pdf
  ← Content-Disposition: attachment
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
│   │                                  (SSL rejectUnauthorized: false)
│   │
│   ├── models/
│   │   ├── index.js                 # Asociaciones entre modelos
│   │   ├── User.js                  # Usuarios (auth, roles, avatar initials)
│   │   ├── SkyQualityZone.js        # Zonas de observación
│   │   ├── SkyScore.js              # Puntuaciones de cielo
│   │   ├── ChatHistory.js           # Historial de chat
│   │   ├── Event.js                 # Eventos astronómicos
│   │   ├── Experience.js            # Experiencias de usuarios
│   │   └── ContactMessage.js        # Mensajes de contacto
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login, profile, password
│   │   ├── sky.controller.js        # Zonas + PDF export + estados del cielo
│   │   ├── skyScore.controller.js   # Cálculo y guardado de scores
│   │   ├── chat.controller.js       # Proxy al AI Service + warmup
│   │   ├── admin.controller.js      # Panel de administración
│   │   ├── events.controller.js     # CRUD eventos astronómicos
│   │   ├── island.controller.js     # Información de islas
│   │   ├── contact.controller.js    # Formulario de contacto (Joi validado)
│   │   ├── experiences.controller.js# Experiencias de usuarios
│   │   └── weather.controller.js    # Datos meteorológicos
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # Verificación JWT
│   │   ├── apiKeyAuth.js            # API Key para acceso externo
│   │   ├── requireAdmin.js          # Validación de rol admin
│   │   ├── errorHandler.js          # Manejador global de errores (sanitizado)
│   │   ├── notFound.js              # Ruta 404
│   │   └── rateLimiter.js           # Rate limiting por endpoint
│   │
│   ├── routes/
│   │   ├── auth.routes.js           # /api/auth (rate limit: 10/15min)
│   │   ├── sky.routes.js            # /api/sky
│   │   ├── chat.routes.js           # /api/chat + /api/chat/warmup
│   │   ├── admin.routes.js          # /api/admin (rate limit: 60/15min)
│   │   ├── island.routes.js         # /api/islands
│   │   ├── contact.routes.js        # /api/contact (rate limit: 5/hora)
│   │   ├── events.routes.js         # /api/events
│   │   ├── weather.routes.js        # /api/weather
│   │   └── experiences.routes.js    # /api/experiences (rate limit: 10/hora)
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
│   ├── assets/                      # Imágenes reducidas (archivos no usados eliminados)
│   │
│   ├── config/
│   │   ├── i18n.js                  # Configuración i18next
│   │   └── site.js                  # Metadatos del sitio
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Estado global de autenticación (sin localStorage directo)
│   │
│   ├── services/
│   │   ├── astronomyService.js      # Llamadas a /api/events
│   │   ├── mapService.js            # Llamadas a /api/sky, /api/islands
│   │   └── weatherService.js        # Llamadas a /api/weather
│   │
│   ├── pages/                       # 14 páginas (ver Capítulo 4)
│   ├── components/                  # Componentes activos (22 archivos no usados eliminados)
│   ├── data/                        # Archivos de datos estáticos reducidos
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
├── requirements.txt                 # Dependencias Python (sin ChromaDB, sin PyTorch)
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
│   └── vector_store.py              # TF-IDF + cosine similarity in-memory (scikit-learn)
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
Frontend (Axios catch) ← 4xx/5xx → Backend (errorHandler.js sanitizado)
                                      ├── Joi → 400
                                      ├── Sequelize → 400/409/400
                                      ├── JWT → 401
                                      ├── Rate limit → 429 (express-rate-limit)
                                      ├── Errores con statusCode
                                      └── Error genérico → 500 (sin detalles en prod)
```

### 2.4.3 Estrategia de Cache del RAG
El vector store TF-IDF se carga UNA VEZ al iniciar el AI Service (lifespan de FastAPI) y se cachea con `@lru_cache()`. Los ~61 fragmentos de 6 documentos se mantienen en memoria durante toda la vida del proceso. No se utiliza ChromaDB, sentence-transformers ni PyTorch.

### 2.4.4 Internacionalización
- Frontend: i18next con detección automática de idioma del navegador
- Idiomas: español (default), inglés, alemán
- Backend: El idioma se pasa como parámetro `language` en las requests de chat
- AI Service: El agente recibe `language` y lo usa en el prompt del sistema

### 2.4.5 Seguridad (Auditoría)
Se modificaron 11 archivos tras una auditoría de seguridad:
- **errorHandler**: Sanitización de mensajes de error en producción
- **contact.controller**: Validación Joi en todos los campos
- **Rate limiting**: `express-rate-limit` por endpoint
  - Auth: 10 peticiones cada 15 minutos
  - Contacto: 5 peticiones por hora
  - Admin: 60 peticiones cada 15 minutos
  - Experiencias: 10 peticiones por hora
- **Upload**: Límite de 10MB en `express.json()`
- **localStorage**: Eliminado el acceso directo, token solo via AuthContext

## 2.5 Limitaciones Conocidas

| Limitación | Causa | Mitigación |
|---|---|---|
| Cold start ~30s | Render free plan duerme servicios inactivos | Warm-up endpoint (`GET /api/chat/warmup`) + "Iniciando servicio de IA..." |
| 512MB RAM AI Service | Render free plan | RAG TF-IDF ligero en lugar de ChromaDB (sin PyTorch) |
| Sin WebSockets | Chat usa REST polling | Aceptable para el alcance del proyecto |
| Sin caché Redis | No hay servidor de caché | Consultas directas a PostgreSQL |
| Sin tests de integración AI | No hay mock para el AI Service | Tests unitarios del backend solamente (24/24 pasan) |
