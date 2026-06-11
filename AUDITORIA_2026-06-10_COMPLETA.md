# Auditoría Completa — AdAstra Sky
**Fecha**: 2026-06-10
**Versión**: 1.0.0
**Último commit**: `ece161b` — "proyecto: cambios en frontend"

---

## Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| Backend (JS) | 37 archivos, ~2.995 líneas |
| Frontend (JS/JSX) | 51 archivos, ~8.847 líneas |
| AI Service (Python) | 16 archivos, ~667 líneas |
| Tests backend | 24 (5 suites) |
| Tests frontend | 2 (2 suites) |
| Tests AI Service | 0 |
| Páginas enrutadas | 15 |
| Componentes React | 18 |
| Zonas de observación | 95 (8 islas) |
| Constelaciones | 88 (con áreas exactas deg²) |
| Eventos astronómicos | 12 |
| Planetas | 9 |
| Modelos DB | 6 |
| Documentos RAG | 6 |
| Despliegue | Render (backend+AI+DB) + Vercel (frontend) |

---

## 1. Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2 | UI SPA |
| Vite | 5.0 | Bundler / dev server |
| Tailwind CSS | 3.4 | Estilos utility-first |
| Framer Motion | 10.16 | Animaciones |
| Leaflet + react-leaflet | 1.9 / 4.2 | Mapas interactivos |
| i18next + react-i18next | 23 / 13 | Internacionalización (es/en/de) |
| React Router DOM | 6.30 | Enrutamiento SPA |
| Lucide React | 0.303 | Iconos |
| Axios | 1.6 | HTTP client |
| Vitest + Testing Library | 1.0 / 14 | Testing |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | 4.18 | API REST |
| Sequelize | 6.35 | ORM PostgreSQL |
| PostgreSQL (Neon) | — | Base de datos |
| JWT (jsonwebtoken) | 9.0 | Autenticación |
| Joi | 17.11 | Validación |
| Helmet | 7.1 | Seguridad HTTP |
| express-rate-limit | 7.1 | Rate limiting |
| Multer + Sharp | 2.1 / 0.34 | Upload imágenes |
| Swagger (swagger-jsdoc + swagger-ui-express) | 6.3 / 5.0 | Documentación API |
| Morgan | 1.10 | HTTP logging |
| Jest + Supertest | 29 / 6.3 | Testing |

### AI Service
| Tecnología | Versión | Uso |
|---|---|---|
| Python | ≥3.10 | Runtime |
| FastAPI + Uvicorn | 0.115 / 0.34 | API asíncrona |
| LangChain + LangGraph | 0.3 / 0.3 | Framework agente LLM |
| ChromaDB | 1.0 | Vector store local |
| sentence-transformers | 3.0 | Embeddings local (all-MiniLM-L6-v2) |
| Groq (LLaMA 3.3 70B) / OpenAI (GPT-4o-mini) | — | LLM principal/alternativo |

### Automatización
| Herramienta | Uso |
|---|---|
| n8n | Workflows: sky score diario, consultas programadas |

---

## 2. Arquitectura del Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   AI Service         │
│  React SPA      │     │  Express + JWT   │     │  FastAPI + LangGraph │
│  Vite (5173)    │     │  Render (5000)   │     │  Render (8001)       │
│  Vercel (3000)  │     │                  │     │  + ChromaDB RAG      │
└─────────────────┘     └────────┬─────────┘     └──────────────────────┘
                                 │
                          ┌──────▼───────┐
                          │  PostgreSQL   │
                          │  Neon Serverless
                          └──────────────┘
```

### Flujo de datos
1. **Frontend** → consume API REST del backend (JWT Bearer)
2. **Backend** → proxy al AI Service (chat, sky score), gestiona auth, CRUD, almacena en PostgreSQL
3. **AI Service** → agente LangGraph con RAG sobre documentos IAC, consulta APIs externas (OpenWeather, NASA)
4. **n8n** → automatizaciones externas (sky score diario con API key)

---

## 3. Funcionalidades Implementadas

### 3.1 Mapa Interactivo (Leaflet)
- **95 zonas geolocalizadas** en 8 islas Canarias + La Graciosa
- 2 observatorios, 33 miradores astronómicos, 60 miradores paisajísticos
- Categorías con iconos y colores diferenciados (🔭 observatorios, 🌌 astronómicos, 🏞️ paisajísticos)
- Filtros por isla y categoría
- Marcadores responsivos (28×28px con DivIcon personalizado)
- Exportación GeoJSON y CSV
- Panel de santuarios estelares (zonas Bortle 1-2)
- Coordenadas exactas actualizadas para los 92 miradores

### 3.2 Sky Score Algorithm
- Puntuación global (0-100) basada en:
  - **Astro Score**: Bortle, seeing, transparencia, altitud, nubosidad, humedad
  - **Photo Score**: calidad paisaje, orientación astro, composición, acceso fotógrafo
  - **Tourism Score**: tipo acceso, seguridad, servicios, parking
- Recomendaciones: "Mejor para esta noche", "Mejor para astrofotografía"
- Implementado tanto en backend (`skyScoring.js`) como en AI Service (`sky_score.py`)

### 3.3 Asistente IA — AdAstra
- Agente conversacional con LangGraph (StateGraph)
- LLM: Groq (LLaMA 3.3 70B) o fallback a OpenAI (GPT-4o-mini)
- **RAG** sobre 6 documentos del Instituto de Astrofísica de Canarias:
  1. Introducción al IAC
  2. Observatorio del Roque de los Muchachos
  3. Observatorio del Teide
  4. Ley del Cielo de Canarias
  5. Astroturismo en Canarias
  6. Eventos astronómicos
- Herramientas del agente: `search_rag_documents`, `get_observatory_info`, `get_weather_conditions`, `get_constellation_info`, `calculate_sky_score`
- Multilingüe: español, inglés, alemán
- Modo offline: responde solo con RAG sin API key de LLM

### 3.4 Catálogo Astronómico
- **88 constelaciones** con áreas exactas en deg², magnitudes estelares, objetos Messier, mitología
- **9 planetas** del sistema solar con datos físicos y visibilidad desde Canarias
- **12 eventos astronómicos** (2026-2027): lluvias, eclipses, oposiciones, conjunciones
- Búsqueda y filtrado por hemisferio, estación, tipo

### 3.5 Explorador de Islas
- Información detallada de las 8 islas Canarias + La Graciosa
- Zonas de observación recomendadas por isla
- Datos de accesibilidad, altitud, escala Bortle

### 3.6 Sistema de Usuarios
- Registro y login con JWT (payload: id, email, role)
- Roles: `user` / `admin`
- Perfiles con preferencia de idioma (es/en/de)
- Rate limiting: auth (10/15min), contacto (5/hora), global (100/15min)

### 3.7 Panel de Administración
- CRUD completo de zonas de observación
- Gestión de usuarios
- Protección por middleware `requireAdmin` (JWT role check sin DB query)

### 3.8 Experiencias y Comunidad
- Los usuarios pueden compartir experiencias de observación
- Subida de imágenes (multer + sharp)
- Sistema de calificación

### 3.9 Calendario de Eventos
- Eventos astronómicos con filtros por mes y tipo
- Datos estáticos + dinámicos desde AstronomyAPI/NASA

### 3.10 Internacionalización
- i18next con 3 idiomas: español (es), inglés (en), alemán (de)
- Traducción completa en UI principal
- Alemán con cobertura parcial

---

## 4. Estructura del Proyecto

```
AdastraSky/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/               # 15 páginas
│   │   ├── components/          # 18 componentes (root + map/ + ui/)
│   │   ├── data/                # 3 datasets estáticos
│   │   ├── config/              # i18n + site.js
│   │   ├── services/            # 3 API clients
│   │   ├── utils/               # Utilidades astronómicas
│   │   ├── context/             # AuthContext (JWT)
│   │   ├── hooks/               # Custom hooks
│   │   ├── __tests__/           # 2 tests (Vitest)
│   │   └── assets/              # 15 imágenes locales
│   ├── public/
│   └── package.json
│
├── backend/                     # API REST
│   ├── src/
│   │   ├── controllers/         # 7 controladores
│   │   ├── routes/              # 8 routers
│   │   ├── models/              # 7 modelos Sequelize
│   │   ├── middleware/          # 5 middlewares
│   │   ├── utils/               # Sky scoring + helpers
│   │   ├── seed/                # Seeds de usuarios
│   │   └── config/              # DB + swagger
│   ├── server.js
│   ├── __tests__/               # 24 tests (Jest)
│   └── package.json
│
├── ai-service/                  # Agente IA + Sky Engine
│   ├── agent/                   # LangGraph (state + tools + graph)
│   ├── sky_engine/              # Sky score + moon calc
│   ├── rag/                     # ChromaDB + ingest
│   ├── routers/                 # health, chat, sky
│   ├── documents/               # 6 documentos IAC
│   ├── main.py
│   └── requirements.txt
│
├── automations/                 # Workflows n8n (2 JSON)
├── docs/                        # Documentación técnica
├── database/                    # Seeds (JS + Python + documents)
├── render.yaml                  # Render Blueprint
├── vercel.json                  # Frontend deploy config
├── .gitignore                   # 86 reglas
└── package.json                 # Monorepo orchestrator
```

---

## 5. Base de Datos

### Modelos Sequelize (6+1)

| Modelo | Tabla | Campos | Índices | Estado |
|---|---|---|---|---|
| User | `users` | 10 | email, role | ✅ |
| SkyQualityZone | `sky_quality_zones` | ~50 | islandId, category, hemisphere | 🟡 (muchos campos planos) |
| ChatHistory | `chat_histories` | 7 | session_id, user_id, created_at | ✅ |
| Event | `events` | 6 | date, type | ✅ |
| Experience | `experiences` | 10 | user_id, zone_id, created_at | ✅ |
| ContactMessage | `contact_messages` | 5 | created_at | ✅ |
| SkyScore | `sky_scores` | 8 | zone_id, date | 🟡 (timestamps manuales) |

### Problemas DB 🔴
- **Sin migraciones**: usa `sequelize.sync({alter:true})` (riesgo en prod)
- **Sin soft delete**: Experience se borra físicamente
- **Sin índices compuestos**: `(islandId, category)` en SkyQualityZone
- **Campo hemisphere sin índice**: se filtra frecuentemente

---

## 6. Seguridad

### Implementado ✅
| Medida | Ubicación |
|---|---|
| JWT con role en payload | `middleware/auth.js` |
| Rate limiting auth (10/15min) | `routes/auth.js` |
| Rate limiting contacto (5/hora) | `routes/contact.js` |
| Rate limiting global (100/15min) | `server.js` |
| Helmet (CSP, HSTS, XSS, etc.) | `server.js` |
| CORS whitelist (localhost:3000,5173 + FRONTEND_URL) | `server.js` |
| Joi validation (register/login) | `controllers/auth.controller.js` |
| Field whitelists en admin CRUD | `controllers/admin.controller.js` |
| requireAdmin sin DB query (JWT payload) | `middleware/requireAdmin.js` |
| UUID validation en chat session_id | `controllers/chat.controller.js` |
| JWT_SECRET validation en producción | `server.js` |
| Cache-Control immutable en /uploads | `server.js` |
| API keys en .env (gitignored) | Todos los servicios |
| sanitizeUrl() SSL para Neon | `config/database.js` |

### Pendientes 🟡
- **Sin refresh tokens JWT**: expira en 7d sin rotación
- **Sin CSRF**: riesgo bajo (solo JWT Bearer, sin cookies)
- **Sin fortaleza de contraseña**: solo validación length ≥ 8
- **morgan activo en producción**: log combinado Apache
- **API keys sin rotar**: OpenWeather, NASA, Groq, OpenAI

---

## 7. API Endpoints

### Backend (`/api`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| **Auth** | | | |
| POST | `/auth/register` | ✗ | Registro |
| POST | `/auth/login` | ✗ | Login → JWT |
| GET | `/auth/profile` | ✓ | Perfil usuario |
| PATCH | `/auth/profile` | ✓ | Actualizar perfil |
| **Sky Zones** | | | |
| GET | `/sky/zones` | ✗ | Todas las zonas activas |
| GET | `/sky/zones/geojson` | ✗ | GeoJSON |
| GET | `/sky/zones/csv` | ✗ | CSV export |
| GET | `/sky/zones/query` | ✗ | Búsqueda avanzada |
| GET | `/sky/zones/recommend/tonight` | ✗ | Mejores para esta noche |
| GET | `/sky/zones/recommend/photo` | ✗ | Mejores para astrofoto |
| GET | `/sky/zones/:id` | ✗ | Detalle zona |
| GET | `/sky/zones/islands/:island` | ✗ | Por isla |
| GET | `/sky/zones/category/:category` | ✗ | Por categoría |
| **Sky Score** | | | |
| POST | `/sky/score` | API Key | Guardar score (n8n) |
| GET | `/sky/score/latest` | ✗ | Último score |
| GET | `/sky/score/history` | ✗ | Historial |
| **Chat** | | | |
| POST | `/chat/message` | ✓ | Mensaje al agente IA |
| GET | `/chat/history` | ✓ | Historial conversaciones |
| **Islands** | | | |
| GET | `/islands` | ✗ | Todas las islas |
| GET | `/islands/:name` | ✗ | Detalle isla |
| **Events** | | | |
| GET | `/events` | ✗ | Eventos astronómicos |
| GET | `/events/:id` | ✗ | Detalle evento |
| **Experiences** | | | |
| GET | `/experiences` | ✗ | Experiencias |
| POST | `/experiences` | ✓ | Crear experiencia |
| **Contact** | | | |
| POST | `/contact` | ✗ | Enviar mensaje |
| **Weather** | | | |
| GET | `/weather/current?lat=&lon=` | ✗ | Clima por coordenadas |
| **Admin** | | | |
| GET | `/admin/zones` | Admin | CRUD zonas |
| POST | `/admin/zones` | Admin | Crear zona |
| PUT | `/admin/zones/:id` | Admin | Actualizar zona |
| DELETE | `/admin/zones/:id` | Admin | Eliminar zona |
| GET | `/admin/users` | Admin | Lista usuarios |
| PUT | `/admin/users/:id` | Admin | Actualizar usuario |

### AI Service

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat con agente astronómico |
| POST | `/api/sky-score` | Calcular Sky Score (0-10) |
| GET | `/api/what-to-see` | Qué observar esta noche |
| GET | `/api/events` | Eventos astronómicos próximos |

---

## 8. Testing

### Cobertura

| Funcionalidad | Tests | Unitarios | Integración | E2E |
|---|---|---|---|---|
| Auth | 4 | ✅ | ❌ | ❌ |
| Sky zones | 6 | ✅ | ❌ | ❌ |
| Events | 4 | ✅ | ❌ | ❌ |
| Middleware | 6 | ✅ | ❌ | ❌ |
| Health | 4 | ✅ | ❌ | ❌ |
| Chat | 0 | ❌ | ❌ | ❌ |
| Experiences | 0 | ❌ | ❌ | ❌ |
| Admin | 0 | ❌ | ❌ | ❌ |
| Weather proxy | 0 | ❌ | ❌ | ❌ |
| Frontend (páginas) | 2 | ✅ | ❌ | ❌ |
| AI Service | 0 | ❌ | ❌ | ❌ |

**Total: 26 tests.** Funcionalidad crítica (chat, experiencias, admin, AI) sin cobertura.

### Comandos
```bash
cd backend && npm test           # 24 tests (Jest + Supertest)
cd frontend && npm test          # 2 tests (Vitest)
cd ai-service && python -m pytest  # 0 tests
```

---

## 9. Rendimiento y Deuda Técnica

### Rendimiento

| Aspecto | Estado |
|---|---|
| Bundle frontend | ~685KB (React + Leaflet + Framer Motion) |
| Lazy loading | ❌ No implementado |
| Caché Redis/Memcached | ❌ No implementado |
| Caché HTTP (uploads) | ✅ 7d immutable |
| TTL weather proxy | ❌ Sin TTL |
| Paginación chat history | ✅ findAndCountAll |
| Paginación experiencias | ✅ limit/offset |
| Paginación sky zones | ❌ Devuelve ~95 sin paginar |
| Compresión gzip/brotli | ❌ No implementado |

### Deuda Técnica

| Item | Prioridad | Impacto |
|---|---|---|
| Datos duplicados (zonas, eventos, islas) | Alta | Inconsistencia entre fuentes |
| Sin migraciones DB (sync alter) | Alta | Riesgo en producción |
| Directorios vacíos (layouts/, astronomy/, islands/, weather/) | Baja | Ruido |
| CSS Tailwind custom + nativo mezclados | Media | Mantenibilidad |
| i18n alemán incompleto | Media | UX |
| Sin lazy loading en rutas | Media | Performance |
| Sin TTL en weather proxy | Baja | Rendimiento |
| 3 componentes UI no usados (Badge, Card, StatCard) | Baja | Código muerto |
| Lógica scoring duplicada (backend + frontend) | Media | Mantenibilidad |

---

## 10. Estado del Despliegue

| Servicio | Plataforma | URL | Estado |
|---|---|---|---|
| Frontend | Vercel | `https://adastra-sky.vercel.app` | 🟡 Build previamente roto (CalendarPage fragment) — **fix aplicado** |
| Backend | Render | `https://aadastra-sky-backend.onrender.com` | 🟡 SSL error con Neon — **fix aplicado en database.js** |
| AI Service | Render | Pendiente | 🔴 **No deployado** |
| DB | Neon | Pendiente | 🟡 **No creada o sin DATABASE_URL** |

### Variables Requeridas en Render
- `JWT_SECRET` 🔴 No configurado
- `OPENWEATHER_API_KEY` 🔴 No configurado
- `NASA_API_KEY` 🔴 No configurado
- `GROQ_API_KEY` 🔴 No configurado
- `OPENAI_API_KEY` 🔴 No configurado
- `FRONTEND_URL` debe ser `https://adastra-sky.vercel.app`

### Variables Requeridas en Vercel
- `VITE_API_URL` debe ser `https://aadastra-sky-backend.onrender.com` 🔴 No configurado

---

## 11. Cambios Recientes (Sesión Actual)

| Cambio | Archivos | Estado |
|---|---|---|
| Marcadores de mapa reducidos (40×40 → 28×28) | `InteractiveMap.jsx` | ✅ En disco |
| Coordenadas exactas de 92 miradores | `santuariosData.js` | ✅ En disco |
| Áreas exactas de 88 constelaciones (deg²) | `astronomicalData.js` | ✅ En disco |
| Nombre actualizado: Narices del Teide/Pico Viejo | `santuariosData.js` | ✅ En disco |
| Nombre actualizado: Risco de Famara (El Bosquecillo) | `santuariosData.js` | ✅ En disco |
| Nombre actualizado: Pico Viejo (Sendero) | `santuariosData.js` | ✅ En disco |

---

## 12. Recomendaciones Priorizadas

### 🚨 Inmediato (antes de entregar — 15 Jun)
1. **Commit y push** de cambios actuales
2. Configurar `VITE_API_URL` en Vercel
3. Configurar `FRONTEND_URL` + `JWT_SECRET` + API keys en Render
4. Crear DB en Neon y configurar `DATABASE_URL`

### 🔴 Alta prioridad
5. Unificar datos duplicados (zonas, eventos) en un solo source
6. Añadir tests para chat, experiences, admin endpoints
7. Implementar migraciones Sequelize (evitar `sync alter`)

### 🟡 Media prioridad
8. Añadir paginación a `GET /api/sky/zones`
9. Añadir TTL (30 min) al proxy weather
10. Completar i18n alemán
11. Implementar lazy loading (`React.lazy`) en rutas
12. Eliminar directorios vacíos

### 🟢 Baja prioridad
13. Refresh tokens JWT
14. Compresión gzip/brotli en Express
15. Soft delete en Experience
16. Soporte Safari < 15 (polyfills dvh)

---

*Fin del informe. Generado: 2026-06-10.*
