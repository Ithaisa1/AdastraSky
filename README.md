# AdAstra Sky

**Plataforma inteligente de astroturismo para las Islas Canarias**

AdAstra Sky es una aplicación web fullstack que integra mapas interactivos de zonas de observación astronómica, un asistente IA con RAG sobre documentación del Instituto de Astrofísica de Canarias (IAC), un motor de puntuación de calidad del cielo, y herramientas para astrónomos aficionados y astrofotógrafos.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3.4 + Framer Motion |
| Backend | Node.js + Express 4 + Sequelize ORM |
| Base de datos | PostgreSQL 18 (Neon serverless) |
| AI Service | FastAPI + LangGraph + ChromaDB + Groq/OpenAI |
| Mapas | Leaflet + React-Leaflet |
| Internacionalización | i18next (es/en/de) |
| Automatización | n8n workflows |
| APIs externas | OpenWeatherMap, AstronomyAPI, NASA |
| Despliegue | Vercel (frontend) + Render (backend + AI + DB) |

---

## Arquitectura

```
Frontend ──▶ Backend (Express + JWT) ──▶ AI Service (FastAPI + RAG)
                  │                              │
                  ▼                              │
           PostgreSQL (Neon)                     │
                  │                              │
                  └── Proxy weather ──────────────┘
```

El frontend consume la API REST del backend con autenticación JWT. El backend gestiona CRUD, auth, y proxy al AI Service. El AI Service ejecuta un agente LangGraph con ChromaDB (RAG local) sobre 6 documentos del IAC.

---

## Funcionalidades

### Mapa Interactivo
- 95 zonas de observación geolocalizadas en 8 islas + La Graciosa
- 2 observatorios, 33 miradores astronómicos, 60 paisajísticos
- Filtros por isla y categoría con iconos diferenciados
- Exportación GeoJSON y CSV
- Panel de santuarios estelares (Bortle 1-2)

### Sky Score Algorithm
- Puntuación 0-100 basada en Astro Score + Photo Score + Tourism Score
- Recomendaciones: mejor zona para esta noche, mejor para astrofotografía
- Implementado en backend (Node) y AI Service (Python)

### Asistente IA — AdAstra
- Agente LangGraph con Groq (LLaMA 3.3 70B) o fallback OpenAI
- RAG sobre 6 documentos del IAC (ChromaDB + embeddings locales)
- Herramientas: búsqueda RAG, info observatorios, clima, constelaciones, sky score
- Multilingüe (es/en/de) con modo offline

### Catálogo Astronómico
- 88 constelaciones con áreas exactas (deg²), magnitudes, objetos Messier, mitología
- 9 planetas con datos físicos y visibilidad desde Canarias
- 12 eventos astronómicos 2026-2027

### Explorador de Islas
- Información detallada de cada isla
- Zonas recomendadas por isla con datos de accesibilidad y Bortle

### Usuarios y Admin
- Registro/login JWT con roles user/admin
- Perfiles con preferencia de idioma
- Panel admin: CRUD zonas + gestión usuarios
- Rate limiting (auth: 10/15min, contacto: 5/hora, global: 100/15min)

### Experiencias
- Los usuarios comparten experiencias con imágenes
- Upload con Multer + Sharp

---

## Inicio Rápido

### Requisitos
- Node.js ≥ 18, npm ≥ 9
- Python ≥ 3.10
- PostgreSQL ≥ 12 (o Neon serverless)

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
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python rag/ingest.py       # Poblar ChromaDB
python main.py             # http://localhost:8001
```

### 4. Todo a la vez (dev)
```bash
npm run dev    # Lanza backend + frontend + AI service con concurrently
```

---

## API Reference

### Backend (`localhost:5000/api`)

#### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | ✗ | Registro de usuario |
| POST | `/auth/login` | ✗ | Login (devuelve JWT) |
| GET | `/auth/profile` | ✓ | Perfil del usuario |
| PATCH | `/auth/profile` | ✓ | Actualizar perfil |

#### Sky Zones
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/sky/zones` | ✗ | Todas las zonas activas |
| GET | `/sky/zones/geojson` | ✗ | Formato GeoJSON |
| GET | `/sky/zones/csv` | ✗ | Exportar CSV |
| GET | `/sky/zones/query` | ✗ | Búsqueda avanzada |
| GET | `/sky/zones/recommend/tonight` | ✗ | Mejores zonas para esta noche |
| GET | `/sky/zones/recommend/photo` | ✗ | Mejores para astrofotografía |
| GET | `/sky/zones/:id` | ✗ | Detalle de zona |
| GET | `/sky/zones/islands/:island` | ✗ | Zonas por isla |
| GET | `/sky/zones/category/:category` | ✗ | Zonas por categoría |

#### Sky Score
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/sky/score` | API Key | Guardar score (desde n8n) |
| GET | `/sky/score/latest` | ✗ | Último score |
| GET | `/sky/score/history` | ✗ | Historial |

#### Chat
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/chat/message` | ✓ | Mensaje al agente IA |
| GET | `/chat/history` | ✓ | Historial de conversaciones |

#### Islands, Events, Experiences, Contact, Weather
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/islands` | ✗ | Todas las islas |
| GET | `/islands/:name` | ✗ | Detalle de isla |
| GET | `/events` | ✗ | Eventos astronómicos |
| GET | `/events/:id` | ✗ | Detalle de evento |
| GET | `/experiences` | ✗ | Experiencias de usuarios |
| POST | `/experiences` | ✓ | Crear experiencia |
| POST | `/contact` | ✗ | Formulario de contacto |
| GET | `/weather/current?lat=&lon=` | ✗ | Clima por coordenadas |

#### Admin
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/admin/zones` | Admin | CRUD zonas |
| POST | `/admin/zones` | Admin | Crear zona |
| PUT | `/admin/zones/:id` | Admin | Actualizar zona |
| DELETE | `/admin/zones/:id` | Admin | Eliminar zona |
| GET | `/admin/users` | Admin | Lista usuarios |
| PUT | `/admin/users/:id` | Admin | Actualizar usuario |

### AI Service (`localhost:8001`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat con agente astronómico |
| POST | `/api/sky-score` | Calcular Sky Score (0-10) |
| GET | `/api/what-to-see` | Qué observar esta noche |

---

## Variables de Entorno

### Backend
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
OPENWEATHER_API_KEY=tu_clave
NASA_API_KEY=tu_clave
```

### AI Service
```env
PORT=8001
GROQ_API_KEY=gsk_your_key
OPENAI_API_KEY=sk-your-key
FRONTEND_URL=http://localhost:3000
CHROMA_PERSIST_DIR=./rag/chroma_db
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
```

---

## Tests

```bash
cd backend && npm test           # 24 tests (Jest + Supertest)
cd frontend && npm test          # 2 tests (Vitest)
cd ai-service && python -m pytest  # Sin tests aún
```

---

## Despliegue

| Servicio | Plataforma | URL |
|---|---|---|
| Frontend | Vercel | `https://adastra-sky.vercel.app` |
| Backend | Render + Neon | `https://aadastra-sky-backend.onrender.com` |
| AI Service | Render | Pendiente |

El blueprint de Render está definido en `render.yaml`.  
Ver `docs/deployment_guide.md` para instrucciones detalladas.

---

## Usuarios Demo (Seed)

| Email | Contraseña | Rol |
|---|---|---|
| `demo@adastra.sky` | `demo123` | user |
| `admin@adastra.sky` | `admin123` | admin |

---

## Documentación Técnica

- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Especificación de APIs](./docs/api_specification.md)
- [Convenciones de Código](./docs/CONVENTIONS.md)
- [Guía de Despliegue](./docs/deployment_guide.md)
- [Colección Postman](./docs/AdAstraSky.postman_collection.json)
- [Auditoría Completa](./AUDITORIA_2026-06-10_COMPLETA.md)

---

## Licencia

MIT
