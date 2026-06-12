# Auditoría Técnica General

> **Fecha:** 12/06/2026
> **Clasificación:** CRÍTICO | ALTO | MEDIO | BAJO

---

## CRÍTICOS — Errores 500, API rota, DB caída, Seguridad rota

| # | Problema | Ubicación | Impacto | Estado |
|---|----------|-----------|---------|--------|
| 1 | **Carga axios 1.6.2 CVE-2023-45857** | `backend/package.json:33`, `frontend/package.json:17` | XSS vía prototype pollution al parsear JSON | PENDIENTE |
| 2 | **Error handler expone schema DB** | `backend/src/middleware/errorHandler.js:28-29` | Filtra nombres de columnas DB al cliente | PENDIENTE |
| 3 | **Secretos en .env local** | `backend/.env`, `ai-service/.env` | API keys expuestas (GROQ, HF, JWT, NASA, OpenWeather) | **URGENTE — Rotar keys** |
| 4 | **404 handler expone URL** | `backend/src/middleware/notFound.js:10` | `Ruta no encontrada: POST /api/foo` — info de routing | PENDIENTE |

---

## ALTOS — Funciones rotas, rendimiento, sync frontend-backend

| # | Problema | Ubicación | Impacto | Estado |
|---|----------|-----------|---------|--------|
| 1 | **Tests desactualizados (5 suites)** | `backend/__tests__/*.test.js` | health.test.js espera shape distinto al actual | PENDIENTE |
| 2 | **Script `npm run seed` roto** | `package.json:seed` -> `database/seed.js` | El directorio `database/` no existe | PENDIENTE |
| 3 | **`npm run lint` falla** | Sin ESLint config | `eslint .` sin config usa defaults | PENDIENTE |
| 4 | **Event model sin uso** | `backend/src/models/Event.js` | Modelo definido pero nunca escrito/leído por endpoints | PENDIENTE |
| 5 | **Dockerfile IA roto** | `ai-service/Dockerfile` | Ejecuta `python -m rag.ingest` que no existe | PENDIENTE |
| 6 | **Carga axios 1.6.2 frontend** | `frontend/package.json:17` | Misma CVE que backend | PENDIENTE |
| 7 | **Vite 5.0.8 CVE-2024-23329** | `frontend/package.json:38` | Directory traversal | PENDIENTE |
| 8 | **localStorage directo en componentes** | ProfilePage.jsx:69, ContactPage.jsx:47, ExperienceForm.jsx:61, ExperienceCard.jsx:23 | Lee token directamente de localStorage en vez de AuthContext | PENDIENTE |
| 9 | **Contact form sin validación Joi** | `backend/src/routes/contact.routes.js:21-24` | Solo checks de presencia, no validación server-side | PENDIENTE |
| 10 | **Experience uploads sin sanitización** | `backend/src/routes/experiences.routes.js:120` | title/description sin validación ni sanitización | PENDIENTE |

---

## MEDIOS — UX, código duplicado, accesibilidad

| # | Problema | Ubicación | Impacto | Estado |
|---|----------|-----------|---------|--------|
| 1 | **EventsPage.jsx sin ruta** | `frontend/src/pages/EventsPage.jsx` | Componente importado pero inaccesible; duplica CalendarPage | PENDIENTE |
| 2 | **15 archivos no utilizados** | `frontend/src/` varios | Código/data muerto (~70KB) | PENDIENTE |
| 3 | **CSP permite unsafe-inline styles** | `backend/server.js:66` | Debilita CSP | PENDIENTE |
| 4 | **SSL DB no validado por defecto** | `backend/src/config/database.js:52` | `rejectUnauthorized: false` por defecto | RESUELTO (workaround Render) |
| 5 | **Rate limit global hardcodeado** | `backend/server.js:92-97` | Valores en .env no se leen (RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS) | PENDIENTE |
| 6 | **50MB file upload limit** | `backend/src/routes/experiences.routes.js:27` | Riesgo DoS, reducir a 10MB | PENDIENTE |
| 7 | **Sin rate limiting en admin endpoints** | `backend/src/routes/admin.routes.js` | Admin sin protección rate-limit | PENDIENTE |
| 8 | **Sin rate limiting en experiences POST** | `backend/src/routes/experiences.routes.js` | File upload sin rate-limit | PENDIENTE |
| 9 | **Error handler expone Joi field names** | `backend/src/middleware/errorHandler.js:15-16` | Filtra nombres de campos validados | PENDIENTE |
| 10 | **Auto-seed admin/demo en producción** | `backend/server.js:196-212` | Crea usuarios por defecto si tabla vacía | PENDIENTE |
| 11 | **Sin antivirus en uploads** | `backend/src/routes/experiences.routes.js:25-34` | Archivos subidos sin escaneo | PENDIENTE |
| 12 | **Swagger UI deshabilitado en prod** | `backend/server.js:150` | ✅ Correcto | BUENO |
| 13 | **Eventos controller expone error.message** | `backend/src/controllers/events.controller.js:35` | `res.status(500).json({ error: error.message })` | PENDIENTE |
| 14 | **Uploads static sin helmet** | `backend/server.js:168` | `/uploads` fuera de protección helmet | PENDIENTE |

---

## BAJOS — Limpieza, nombres, refactor opcional

| # | Problema | Ubicación | Impacto | Estado |
|---|----------|-----------|---------|--------|
| 1 | `ASTRONOMY_API_KEY` en .env.example | `backend/.env.example` | Variable no usada en ningún source | PENDIENTE |
| 2 | `coverage/` debería estar en .gitignore | `backend/coverage/` | Generado por tests, no fuente | PENDIENTE |
| 3 | README backend con endpoints obsoletos | `backend/README.md` | Varias rutas desactualizadas | PENDIENTE |
| 4 | `database/` dir no existe | Raíz | Script seed roto | PENDIENTE |
| 5 | Sin archivo eslintrc | Raíz/backend | ESLint config ausente | PENDIENTE |

---

## Resumen por Severidad

| Severidad | Cantidad | Acción Requerida |
|-----------|----------|-----------------|
| **CRÍTICO** | 4 | Atención inmediata (rotar keys urgentemente) |
| **ALTO** | 10 | Corrección esta semana |
| **MEDIO** | 14 | Planificar para próximas iteraciones |
| **BAJO** | 5 | Limpieza opcional |

---

## Plan de Acción Recomendado

### Fase 1 — Inmediata (hoy)
1. Rotar GROQ_API_KEY, HF_TOKEN, JWT_SECRET, N8N_API_KEY, OPENWEATHER_API_KEY, NASA_API_KEY
2. Actualizar axios a ^1.7.0 en backend y frontend
3. Ocultar `field` de errores Joi/Sequelize en errorHandler
4. Ocultar URL en 404 handler

### Fase 2 — Corto plazo (esta semana)
5. Migrar JWT a httpOnly cookies (o al menos usar AuthContext consistentemente)
6. Añadir Joi validation a contact form
7. Añadir sanitización a experiences
8. Reducir upload limit a 10MB
9. Eliminar archivos muertos (Tarea 2)
10. Asignar/quitar EventsPage.jsx

### Fase 3 — Medio plazo
11. Añadir rate limiting en admin/experiences
12. Añadir CSRF protection
13. Eliminar uso directo de localStorage en componentes
14. Actualizar tests desactualizados
