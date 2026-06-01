# API Specification — AdAstra Sky

## Base URLs

| Entorno | URL |
|---------|-----|
| Backend (Node) | `https://adastra-sky-backend.onrender.com` |
| AI Service | `https://adastra-sky-ai.onrender.com` |

---

## Authentication

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

## Sky Zones

### GET /api/sky/zones
Lista todas las zonas astronómicas.

### GET /api/sky/zones/:id
Detalle de una zona por UUID.

### GET /api/sky/zones/query
Búsqueda inteligente con filtros.

**Query params:** `island`, `category`, `min_altitude`, `max_bortle`, `accessibility`

### GET /api/sky/zones/recommend/tonight
Recomendaciones para esta noche.

### GET /api/sky/zones/recommend/photo
Mejores lugares para astrofotografía.

### GET /api/sky/zones/geojson
Exportación GeoJSON de todas las zonas.

### GET /api/sky/zones/csv
Exportación CSV.

---

## Chat

### POST /api/chat/message
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

### GET /api/chat/history
Historial de conversaciones. **Requiere JWT.**

**Query params:** `session_id`, `limit`

---

## AI Service (FastAPI)

### GET /health
Health check del servicio de IA.

### POST /api/chat
Endpoint directo del agente LangGraph. (Usado internamente por el backend Node)

---

## Islands

### GET /api/islands
Lista de todas las islas con datos astronómicos.
