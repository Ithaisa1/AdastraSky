# Capítulo 3: Backend (Node.js + Express + Sequelize)

## 3.1 Server Entry Point — `server.js`

Archivo principal que configura y arranca el servidor Express en el puerto 5000.

### Middleware montado (orden de ejecución):
1. **`cors()`** — Permite orígenes desde `FRONTEND_URL`, localhost:3000 y localhost:5173
2. **`helmet()`** — Seguridad HTTP (cabeceras CSP, X-Frame-Options, etc.)
3. **`morgan()`** — Logging de requests en consola (formato `dev`)
4. **`express.json({ limit: '10mb' })`** — Parseo de JSON
5. **`express.urlencoded({ extended: true })`** — Parseo de formularios
6. **`/api-docs`** — Swagger UI con documentación OpenAPI
7. **`/health`** — Health check interno (devuelve `{ status, database }`)
8. **`/api/auth`** — auth.routes
9. **`/api/sky`** — sky.routes + skyScore.routes
10. **`/api/chat`** — chat.routes
11. **`/api/admin`** — admin.routes
12. **`/api/islands`** — island.routes
13. **`/api/contact`** — contact.routes
14. **`/api/events`** — events.routes
15. **`/api/weather`** — weather.routes
16. **`/api/experiences`** — experiences.routes
17. **`/api`** — Info general de la API
18. **`notFound (404)`** — Catch-all
19. **`errorHandler`** — Manejador global de errores

### Arranque (`startServer`):
1. Valida `JWT_SECRET` en producción
2. Conecta a PostgreSQL con `sequelize.authenticate()`
3. Sincroniza modelos con `sequelize.sync()` (crea tablas si no existen)
4. Inicia el servidor HTTP
5. Warm-up del AI Service (GET /health al AI Service para evitar cold start)

### Health Check (`GET /health`):
```json
{ "status": "healthy", "database": "connected", "timestamp": "2026-06-11T..." }
```

## 3.2 Modelos Sequelize

### 3.2.1 User (`src/models/User.js`)
Gestión de usuarios del sistema.
```javascript
// Campos:
id              // UUID primaryKey
username        // STRING unique, not null
email           // STRING unique, not null
password        // STRING not null (bcrypt hashed)
role            // ENUM('user', 'admin') default 'user'
resetPasswordToken  // STRING nullable
resetPasswordExpires// DATE nullable
// Password hashing automático con bcrypt en beforeCreate/beforeUpdate
// Método: validPassword(password) → boolean
```

### 3.2.2 SkyQualityZone (`src/models/SkyQualityZone.js`)
Zonas de observación astronómica en Canarias (miradores, observatorios, parques).
```javascript
// Campos:
id              // INTEGER PK autoIncrement
name            // STRING
description     // TEXT
category        // ENUM('mirador','observatory','park','beach','other')
subcategory     // STRING nullable
island          // STRING (Tenerife, La Palma, Gran Canaria, etc.)
municipality    // STRING nullable
latitude        // FLOAT
longitude       // FLOAT
altitude        // INTEGER (metros)
bortle_scale    // INTEGER (1-9, escala Bortle)
access_type     // ENUM('free','paid','restricted')
institution     // STRING nullable (IAC, ayuntamiento, etc.)
established     // INTEGER nullable (año)
research_areas  // TEXT nullable
telescopes      // TEXT nullable
// Servicios: has_dark_certification, has_guided_tours, has_parking,
//            has_restrooms, has_wheelchair_access (BOOLEAN)
// Seguridad: has_lighting, has_fencing, safety_rating
// Imágenes: image_url, gallery (JSON)
```

### 3.2.3 SkyScore (`src/models/SkyScore.js`)
Puntuaciones históricas de calidad del cielo para cada zona.
```javascript
// Campos:
id              // INTEGER PK
zoneId          // INTEGER FK → SkyQualityZone.id
astroScore      // FLOAT (0-10)
photoScore      // FLOAT (0-10)
tourismScore    // FLOAT (0-10)
globalScore     // FLOAT (0-10)
bortle          // INTEGER (1-9)
moonPhase       // FLOAT (0-1)
cloudiness      // FLOAT (0-1)
windSpeed       // FLOAT
humidity        // FLOAT
visibility      // FLOAT
temperature     // FLOAT
// Asociación: belongsTo SkyQualityZone
```

### 3.2.4 ChatHistory (`src/models/ChatHistory.js`)
Historial de conversaciones con el agente IA.
```javascript
// Campos:
id              // UUID PK
userId          // UUID FK → User.id
sessionId       // UUID (agrupa mensajes de una conversación)
message         // TEXT (mensaje del usuario)
response        // TEXT (respuesta de la IA)
language        // STRING default 'es'
sources         // JSONB (fuentes RAG citadas)
metadata        // JSONB (info adicional)
// Asociación: belongsTo User
```

### 3.2.5 Event (`src/models/Event.js`)
Eventos astronómicos (lluvias de estrellas, eclipses, equinoccios, etc.).
```javascript
// Campos:
id              // INTEGER PK
name            // STRING
type            // ENUM('meteor_shower','eclipse','planetary','seasonal','other')
date            // DATEONLY
month           // INTEGER (1-12)
day             // INTEGER (1-31)
description     // TEXT
islandIds       // JSON (array de islas donde es visible)
// Scopes: upcoming (fecha >= hoy), byIsland
```

### 3.2.6 Experience (`src/models/Experience.js`)
Experiencias compartidas por los usuarios.
```javascript
// Campos:
id              // UUID PK
userId          // UUID FK → User.id
zoneId          // INTEGER FK → SkyQualityZone.id
title           // STRING
content         // TEXT
rating          // INTEGER (1-5)
category        // ENUM('observation','photography','workshop','other')
imageUrl        // STRING nullable
// Asociaciones: belongsTo User, belongsTo SkyQualityZone
```

### 3.2.7 ContactMessage (`src/models/ContactMessage.js`)
Mensajes del formulario de contacto.
```javascript
// Campos:
id              // UUID PK
name            // STRING
email           // STRING
subject         // STRING
message         // TEXT
isRead          // BOOLEAN default false
```

### 3.2.8 Asociaciones (`src/models/index.js`)
```javascript
User.hasMany(ChatHistory, { foreignKey: 'userId' })
User.hasMany(Experience, { foreignKey: 'userId' })
SkyQualityZone.hasMany(SkyScore, { foreignKey: 'zoneId' })
SkyScore.belongsTo(SkyQualityZone, { foreignKey: 'zoneId' })
Experience.belongsTo(User, { foreignKey: 'userId' })
Experience.belongsTo(SkyQualityZone, { foreignKey: 'zoneId' })
```

## 3.3 Middlewares

### authMiddleware.js
Extrae el token JWT del header `Authorization: Bearer <token>` o de la cookie `token`. Verifica con `jwt.verify()` usando `JWT_SECRET`. Adjunta `req.user = { id, email, role }`.

### requireAdmin.js
Lee `req.user.role` (inyectado por authMiddleware) y verifica que sea `'admin'`. Si no, devuelve 403.

### apiKeyAuth.js
Verifica API key desde header `x-api-key` contra `API_KEY` de entorno. Usado para acceso machine-to-machine.

### errorHandler.js
Manejador global de errores Express (4 parámetros). Clasifica errores:
- **Joi** → 400 (VALIDATION_ERROR)
- **SequelizeValidationError** → 400
- **SequelizeUniqueConstraintError** → 409 (DUPLICATE_ENTRY)
- **SequelizeForeignKeyConstraintError** → 400
- **JsonWebTokenError** → 401
- **TokenExpiredError** → 401
- **Errores con statusCode propio** → ese código
- **Por defecto** → 500 (solo muestra detalle en development)

### notFound.js
Catch-all 404 para rutas no definidas.

## 3.4 Controladores

### auth.controller.js
| Método | Endpoint | Descripción |
|---|---|---|
| `register` | POST /api/auth/register | Crea usuario con bcrypt + JWT |
| `login` | POST /api/auth/login | Valida credenciales + JWT |
| `getProfile` | GET /api/auth/profile | Devuelve perfil del usuario autenticado |
| `forgotPassword` | POST /api/auth/forgot-password | Genera token de reseteo |
| `resetPassword` | POST /api/auth/reset-password | Cambia password con token |

### sky.controller.js
| Método | Endpoint | Descripción |
|---|---|---|
| `getAll` | GET /api/sky/zones | Filtra por isla, categoría, Bortle |
| `getToday` | GET /api/sky/today | Zonas con mejores condiciones hoy |
| `getTodayV2` | GET /api/sky/today/v2 | Versión mejorada con scoring |
| `getById` | GET /api/sky/zones/:id | Detalle de una zona |
| `getScores` | GET /api/sky/scores | Scores históricos de una zona |

### skyScore.controller.js
| Método | Endpoint | Descripción |
|---|---|---|
| `calculateAndSave` | POST /api/sky-score | Calcula y guarda un sky score |
| `getHistory` | GET /api/sky-score/history | Historial de scores de una zona |

### chat.controller.js
| Método | Endpoint | Descripción |
|---|---|---|
| `sendMessage` | POST /api/chat | Proxy al AI Service + guarda historial |
| `getHistory` | GET /api/chat/history/:session_id | Historial de una conversación |

### admin.controller.js
| Método | Endpoint | Descripción |
|---|---|---|
| `getDashboard` | GET /api/admin/dashboard | Stats (usuarios, mensajes, etc.) |
| `getUsers` | GET /api/admin/users | Lista usuarios CRUD |
| `deleteUser` | DELETE /api/admin/users/:id | Elimina usuario |
| `getMessages` | GET /api/admin/messages | Mensajes de contacto |
| `deleteMessage` | DELETE /api/admin/messages/:id | Elimina mensaje |
| `updateZone` | PUT /api/admin/zones/:id | Actualiza zona |
| CRUD scores | Varios | Gestión de scores |

### events.controller.js, island.controller.js, contact.controller.js, experiences.controller.js, weather.controller.js
Controladores CRUD estándar para sus respectivos recursos.

## 3.5 Utilidades

### skyScoring.js
Algoritmo de Sky Score con fórmulas ponderadas:
```javascript
astroScore   = (1 - bortle/9) * 0.3 + (1 - cloudiness) * 0.25 + 
               (1 - moonPhase) * 0.2 + (1 - wind/100) * 0.15 + (1 - humidity) * 0.1
photoScore   = (1 - bortle/9) * 0.35 + (1 - cloudiness) * 0.3 + 
               (1 - moonPhase) * 0.15 + (1 - wind/100) * 0.1 + (1 - humidity) * 0.1
tourismScore = accesibilidad * 0.3 + servicios * 0.2 + astroScore * 0.3 + seguridad * 0.2
globalScore  = astro * 0.5 + photo * 0.3 + tourism * 0.2
```

### astronomyEvents.js
Cálculos astronómicos:
- `getMoonPhase(date)` → iluminación lunar (0-1) + días hasta luna nueva/llena
- `getSeasonalConstellations(month, island)` → constelaciones visibles por temporada e isla
- `getUpcomingEvents(days)` → próximos eventos astronómicos

## 3.6 Tests

| Suite | Archivo | Tests |
|---|---|---|
| Health | health.test.js | GET /health, GET /api |
| Auth | auth.test.js | Register, login, profile |
| Sky | sky.test.js | Zonas por isla |
| Events | events.test.js | CRUD eventos |
| Middleware | middleware.test.js | authMiddleware |

**22 tests pasan, 2 fallos preexistentes** (health y api info no críticos).
