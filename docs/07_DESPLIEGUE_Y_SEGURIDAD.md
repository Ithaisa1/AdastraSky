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

## 7.8 Auditoría de Seguridad Completa (12/06/2026)

### CRÍTICOS

| # | Vulnerabilidad | Archivo | Líneas |
|---|---------------|---------|--------|
| 1 | GROQ_API_KEY expuesta en `.env` local | `ai-service/.env` | 2 |
| 2 | HF_TOKEN expuesto en `.env` local | `ai-service/.env` | 4 |
| 3 | JWT_SECRET en `.env` local (rotación necesaria) | `backend/.env` | 14 |
| 4 | N8N_API_KEY expuesta | `backend/.env` | 21 |
| 5 | OPENWEATHER_API_KEY expuesta | `backend/.env` | 28 |
| 6 | NASA_API_KEY expuesta | `backend/.env` | 29 |
| 7 | Admin creds en Postman collection | `docs/AdAstraSky.postman_collection.json` | 31 |

### ALTOS

| # | Vulnerabilidad | Archivo | Líneas |
|---|---------------|---------|--------|
| 8 | JWT en localStorage (accesible vía XSS) | `frontend/src/context/AuthContext.jsx` | 25-26, 61-62, 93-94 |
| 9 | Componentes leen token directamente de localStorage | ProfilePage.jsx, ContactPage.jsx, ExperienceForm.jsx, ExperienceCard.jsx | Varias |
| 10 | Axios default global Authorization header | `frontend/src/context/AuthContext.jsx` | 39-45 |
| 11 | Sin refresh token / token revocation | `backend/src/controllers/auth.controller.js` | 64-68 |
| 12 | Contact form sin validación Joi | `backend/src/routes/contact.routes.js` | 21-24 |
| 13 | Experience uploads sin sanitización | `backend/src/routes/experiences.routes.js` | 120 |

### MEDIOS

| # | Vulnerabilidad | Archivo | Líneas |
|---|---------------|---------|--------|
| 14 | CSP permite `unsafe-inline` styles | `backend/server.js` | 66 |
| 15 | SSL DB no validado por defecto | `backend/src/config/database.js` | 52 |
| 16 | 50MB file upload limit (DoS risk) | `backend/src/routes/experiences.routes.js` | 27 |
| 17 | Axios 1.6.2 (CVE-2023-45857) | `backend/package.json`, `frontend/package.json` | - |
| 18 | Error handler expone DB field names | `backend/src/middleware/errorHandler.js` | 28-29 |
| 19 | Sin rate limiting en admin/experiences | `backend/src/routes/admin.routes.js`, `experiences.routes.js` | - |
| 20 | Auto-seed admin/demo en producción | `backend/server.js` | 196-212 |
| 21 | Sin antivirus en uploads | `backend/src/routes/experiences.routes.js` | 25-34 |

### BAJOS

| # | Vulnerabilidad | Archivo | Líneas |
|---|---------------|---------|--------|
| 22 | 404 handler expone request URL | `backend/src/middleware/notFound.js` | 10 |
| 23 | Events controller expone raw error.message | `backend/src/controllers/events.controller.js` | 35 |
| 24 | Secrets parcialmente referenciados en docs | `docs/07_DESPLIEGUE_Y_SEGURIDAD.md` | 161-164 |
| 25 | Sin Permissions-Policy header | `backend/server.js` | 60-71 |
| 26 | Uploads static sin helmet | `backend/server.js` | 168 |

### Acciones Recomendadas

#### Inmediatas (hoy)
1. **Rotar TODAS las API keys** en cada proveedor (Groq, HuggingFace, OpenWeather, NASA)
2. **Regenerar JWT_SECRET** y actualizar en Render dashboard
3. **Actualizar axios** a ^1.7.0 en backend y frontend (`npm install axios@^1.7.0`)
4. **Ocultar field names** en errores Joi/Sequelize del errorHandler

#### Corto plazo
5. Migrar JWT a httpOnly cookies o al menos unificar uso de AuthContext
6. Añadir Joi validation a contact form
7. Reducir upload limit a 10MB
8. Eliminar archivos muertos (ver docs/09_LIMPIEZA_ARCHIVOS.md)

#### Medio plazo
9. Añadir rate limiting en admin endpoints
10. Añadir CSRF protection
11. Añadir DOMPurify para sanitización de HTML en contenido usuario
