# Capítulo 7: Despliegue y Seguridad

## 7.1 Infraestructura Cloud

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
│              https://github.com/Ithaisa1/AdastraSky          │
│                           main branch                        │
└────────┬────────────┬────────────────────┬───────────────────┘
         │            │                    │
         ▼            ▼                    ▼
┌──────────────┐ ┌──────────┐ ┌──────────────────────┐
│   Vercel     │ │  Render  │ │   Render (Neon)      │
│  Frontend    │ │ Backend  │ │   PostgreSQL          │
│  React SPA   │ │ Node.js  │ │   Free Tier          │
│  Free Tier   │ │ Free Tier│ │   512MB RAM          │
│              │ │ 512MB RAM│ │                      │
│ Auto-deploy  │ │ Auto-    │ │                      │
│ desde GitHub │ │ deploy   │ │                      │
└──────────────┘ └────┬─────┘ └──────────────────────┘
                      │
                      ▼
              ┌──────────────────┐
              │ Render AI Service│
              │ FastAPI Python   │
              │ Free Tier        │
              │ 512MB RAM        │
              │ Cold start ~30s  │
              └──────────────────┘
```

## 7.2 Render Blueprint (`render.yaml`)

El archivo `render.yaml` define la infraestructura como código. Render lo usa para crear y conectar automáticamente los servicios.

### Backend Service
```yaml
- type: web
  name: adastra-sky-backend
  runtime: node
  rootDir: backend
  plan: free
  buildCommand: npm install
  startCommand: node server.js
  healthCheckPath: /health
```

### AI Service
```yaml
- type: web
  name: adastra-sky-ai
  runtime: python
  rootDir: ai-service
  plan: free
  buildCommand: pip install -r requirements.txt
  startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
  healthCheckPath: /health
```

### Database
```yaml
- type: database
  name: adastra-sky-db
  databaseName: adastrasky
  plan: free
  postgresMajorVersion: 18
```

## 7.3 Variables de Entorno (Producción)

### Render — Backend (`adastra-sky-backend`)
| Variable | Cómo se setea | Valor |
|---|---|---|
| `NODE_ENV` | render.yaml | `production` |
| `PORT` | render.yaml | `5000` |
| `JWT_SECRET` | **Dashboard manual** (sync:false) | String aleatorio |
| `JWT_EXPIRES_IN` | render.yaml | `7d` |
| `DATABASE_URL` | render.yaml (desde DB) | Generada automáticamente |
| `AI_SERVICE_URL` | render.yaml | `https://adastra-sky-ai.onrender.com` |
| `FRONTEND_URL` | render.yaml | `https://adastra-sky.vercel.app` |
| `OPENWEATHER_API_KEY` | **Dashboard manual** (sync:false) | API key de OpenWeather |
| `NASA_API_KEY` | **Dashboard manual** (sync:false) | API key de NASA |

### Render — AI Service (`adastra-sky-ai`)
| Variable | Cómo se setea | Valor |
|---|---|---|
| `PORT` | render.yaml | `10000` |
| `NODE_ENV` | render.yaml | `production` |
| `GROQ_API_KEY` | **Dashboard manual** (sync:false) | API key de Groq |
| `HF_TOKEN` | **Dashboard manual** (sync:false) | HuggingFace token |
| `HF_MODEL` | render.yaml | `mistralai/Mistral-7B-Instruct-v0.3` |
| `FRONTEND_URL` | render.yaml | `https://adastra-sky.vercel.app` |

### Vercel — Frontend
| Variable | Cómo se setea | Valor |
|---|---|---|
| `VITE_API_URL` | Vercel Dashboard → Environment | `https://aadastra-sky-backend.onrender.com` |

## 7.4 Seguridad

### 7.4.1 Autenticación JWT
- **Algoritmo**: HS256
- **Payload**: `{ id, email, role, iat, exp }`
- **Expiración**: 7 días (`JWT_EXPIRES_IN=7d`)
- **Transporte**: Header `Authorization: Bearer <token>`
- **Almacenamiento**: `localStorage` (clave `adastra_session`)
- **Rotación**: Sin refresh token (alcance educativo)

### 7.4.2 Control de Roles
- **`authMiddleware`**: Verifica JWT y adjunta `req.user`
- **`requireAdmin`**: Lee `req.user.role` y verifica `== 'admin'`
- El rol se incluye en el payload JWT, NO se consulta BD en cada request

### 7.4.3 Validación de Entrada
- **Backend**: Joi schemas en todos los endpoints críticos
- **Frontend**: Validación en formularios (React Hook Form)
- **AI Service**: Pydantic models con validación de tipos

### 7.4.4 Cabeceras HTTP (Helmet)
```javascript
app.use(helmet({
  contentSecurityPolicy: false,  // Desactivado para mapas Leaflet
  crossOriginEmbedderPolicy: false,
}));
```

### 7.4.5 CORS
```javascript
const corsOptions = {
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 7.4.6 Seguridad de Contraseñas
- Hash con **bcryptjs** (salt rounds: 10)
- Mínimo 6 caracteres (validación en backend y frontend)
- Sin almacenamiento en texto plano
- Token de reseteo con expiración

### 7.4.7 Seguridad en Producción
| Medida | Implementación |
|---|---|
| Validación JWT_SECRET | Server.js lanza error si falta en producción |
| SSL forzado | Render termina SSL, backend recibe HTTP interno |
| CORS restringido | Solo orígenes permitidos |
| Sin stack traces | errorHandler.js oculta detalle en producción |
| Rate limiting | 100 requests / 15 minutos por IP |

## 7.5 Limpieza de API Keys

⚠️ **ADVERTENCIA DE SEGURIDAD**

Las siguientes API keys han sido expuestas en el repositorio público y DEBEN ser rotadas:

| Key | Estado | Acción necesaria |
|---|---|---|
| `GROQ_API_KEY` (gsk_PcOG3S...) | Revocada (401) | Generar nueva en console.groq.com |
| `HF_TOKEN` (hf_yuziFZl...) | Permisos insuficientes (403) | Generar nuevo en huggingface.co/settings/tokens |
| `OPENWEATHER_API_KEY` (b9e204e...) | Expuesta | Rotar en openweathermap.org |
| `NASA_API_KEY` (RS1MpF7...) | Expuesta | Rotar en api.nasa.gov |

El archivo `.gitignore` ya excluye `.env` para evitar futuras exposiciones.

## 7.6 Cold Start (Render Free Tier)

Render duerme los servicios gratuitos tras **15 minutos de inactividad**:
- **Primera request**: ~30 segundos de cold start
- **Siguientes requests**: normales (~200ms)
- **Mitigación**: El backend hace warm-up del AI Service al iniciar (`GET /health`)

**Para evitar cold start durante la demo**: Mantener una pestaña con la app abierta o usar un servicio de ping (ej. cron-job.org) que haga GET a `/health` cada 10 minutos.

## 7.7 Scripts Útiles

### Local
```bash
# Iniciar todos los servicios (desde raíz)
npm run dev

# Iniciar solo backend
cd backend && npm run dev

# Iniciar solo frontend
cd frontend && npm run dev

# Iniciar solo AI Service
cd ai-service && uvicorn main:app --reload --port 8001

# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test

# Seeds
cd backend && npm run seed
```

### Producción (Render)
```bash
# Ver logs backend
render logs adastra-sky-backend --tail

# Ver logs AI service
render logs adastra-sky-ai --tail

# Ver estado deploy
render deploy list
```
