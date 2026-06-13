# Especificación de la API — AdAstra Sky

## URLs base

| Entorno | URL |
|---------|-----|
| Frontend (dev) | `http://localhost:5173` |
| Backend (Node) | `https://aadastra-sky-backend.onrender.com` |
| AI Service | `https://adastra-sky-ai.onrender.com` |

---

## Visión General

- **95 zonas astronómicas** en base de datos de producción.
- Motor de IA: **Groq (LLaMA)** → **OpenAI (fallback)** → **RAG TF-IDF** (sin HuggingFace, sin ChromaDB, sin PyTorch, sin sentence-transformers).
- Backend PostgreSQL con `rejectUnauthorized: false` para SSL.
- **Límite de subida:** 10 MB.
- **Auditoría de seguridad** aplicada.
- **24/24 tests del backend** pasando.
- Colaboración con **Senderos Canarios** para datos de senderos.
- **13 archivos de documentación** (01–13).
- **22 archivos no usados** eliminados del repositorio.
- Postman collection: `docs/postman/AdAstraSky.postman_collection.json`.

---

## Autenticación

### POST /api/auth/register
Registro de nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure123",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "preferred_language": "es"
}
```

**Response:** `201`
```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "user" },
    "token": "jwt..."
  }
}
```

### POST /api/auth/login
Inicio de sesión.

**Body:**
```json
{ "email": "user@example.com", "password": "secure123" }
```

**Response:** `200` — idéntico a register.

### GET /api/auth/profile
Perfil del usuario autenticado. **Requiere JWT.**

---

## Rate Limiting

| Ruta | Límite |
|------|--------|
| `/api/auth/*` | 10 peticiones / 15 minutos |
| `/api/contact/*` | 5 peticiones / hora |
| `/api/experiences/*` | 10 peticiones / hora |
| `/api/admin/*` | 60 peticiones / 15 minutos |

---

## Usuarios por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Demo | `demo@adastra.sky` | `Demo1234` |
| Admin | — | `Admin123` |

---

## Zonas de Observación (Sky Zones)

### GET /api/sky/zones
Lista todas las zonas astronómicas activas (95 en producción).

### GET /api/sky/zones/:id
Detalle de una zona por UUID.

### GET /api/sky/zones/query
Búsqueda inteligente con filtros.

**Query params:** `island`, `category`, `min_altitude`, `max_bortle`, `accessibility`

### GET /api/sky/zones/recommend/tonight
Recomendaciones para observar esta noche.

### GET /api/sky/zones/recommend/photo
Mejores lugares para astrofotografía.

### GET /api/sky/zones/geojson
Exportación GeoJSON de todas las zonas (con metadatos).

### GET /api/sky/zones/csv
Exportación CSV (con cabecera informativa).

### GET /api/sky/zones/pdf
Exportación PDF (informe imprimible con resumen por isla, generado con **pdfkit**).

### Miradores Destacados

| Nombre | Latitud | Longitud | Altitud |
|--------|---------|----------|---------|
| Mirador Sicasumbre | 28.288 | -14.160 | 430 m |
| Mirador Garañona | 28.4822 | -16.4345 | 250 m |

---

## Chat con IA

### GET /api/chat/warmup
Activa el servicio de IA (sin autenticación). Útil para evitar el cold start en Render.

### POST /api/chat
Envía un mensaje al agente de IA. **Requiere JWT.**

**Body:**
```json
{
  "message": "¿Qué constelaciones son visibles ahora?",
  "language": "es",
  "session_id": "uuid-opcional"
}
```

**Response:** `200`
```json
{
  "status": "success",
  "data": {
    "response": "Actualmente son visibles...",
    "session_id": "uuid",
    "sources": []
  }
}
```

**Comportamiento:** El agente usa Groq (LLaMA) como LLM principal, con fallback a OpenAI. Si ambas fallan, responde solo con RAG TF-IDF. Ante un error **429 (rate limit)**, responde con un mensaje amigable y recurre exclusivamente a RAG.

### GET /api/chat/history
Historial de conversaciones. **Requiere JWT.**

**Query params:** `session_id`, `limit`

### ChatPage (Frontend)

- **Indicador de estado de IA** visible durante la conversación.
- El agente maneja errores 429 con mensaje amigable + RAG.

---

## Experiencias

### DELETE /experiences/:id
Elimina una experiencia del usuario autenticado. **Requiere JWT.**

**Response:** `200`
```json
{
  "status": "success",
  "message": "Experiencia eliminada correctamente"
}
```

---

## Administración

### PUT /admin/zones/:id
Actualiza una zona astronómica. **Requiere JWT + rol admin.**

**Body:**
```json
{
  "latitude": 28.288,
  "longitude": -14.160,
  "altitude": 430
}
```

---

## AI Service (FastAPI — interno)

### GET /health
Health check del servicio de IA.

### POST /api/chat
Endpoint directo del agente LangGraph. (Usado internamente por el backend Node.)

### Variables de Entorno del AI Service

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `GROQ_API_KEY` | Sí | LLM principal (Groq / LLaMA) |
| `OPENAI_API_KEY` | No | Fallback si Groq falla |
| `FRONTEND_URL` | Sí | CORS |

**No usa:** `HF_TOKEN`, `HF_MODEL`, ChromaDB, PyTorch ni sentence-transformers.

---

## Islas

### GET /api/islands
Lista de todas las islas con datos astronómicos.

---

## Características del Frontend

| Funcionalidad | Detalle |
|---------------|---------|
| Mapa | Animación **flyTo** al seleccionar zona |
| SanctuaryPanel | **Carrusel** de imágenes |
| Ubicación | **Dropdown personalizado** en formularios |
| Avatar | **Iniciales dinámicas** del usuario |
| Navbar | Scroll eliminado; indicador **System Online** movido |
| FAQ | Actualizado con objetos **Messier** |
| README | Totalmente reescrito |
