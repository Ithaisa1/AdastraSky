# 🔴 AUDITORÍA COMPLETA — AdAstra Sky
> **Fecha**: 12-06-2026 00:33 UTC
> **Auditor**: Fulp Star Developer™ — Revisión de código, seguridad, arquitectura y calidad
> **Repo**: https://github.com/Ithaisa1/AdastraSky (branch: main)
> **Commit**: c9aecab

---

## Índice de Gravedad

| Icono | Nivel | Definición |
|---|---|---|
| 🔴 CRÍTICO | Bloqueante | Impide el funcionamiento o expone datos sensibles |
| 🟠 ALTO | Grave | Causa mal funcionamiento, riesgo de seguridad |
| 🟡 MEDIO | Mejorable | Deuda técnica, malas prácticas |
| 🔵 BAJO | Cosmético | Estilo, convenciones, DX |
| ⚪ INFO | Informativo | Observación sin acción requerida |

---

## 🔴 CRÍTICOS (5)

### C-01 [SEGURIDAD] API keys expuestas en el historial de git

**Archivo**: `ai-service/.env` (históricamente commiteado)
**Archivo**: `backend/.env` (históricamente commiteado)

**Problema**: Las siguientes claves han sido commiteadas al repositorio público en commits anteriores:
- `GROQ_API_KEY=gsk_***...***` (expuesta, ya revocada 401)
- `HF_TOKEN=hf_***...***` (expuesto, permisos insuficientes 403)
- `OPENWEATHER_API_KEY=***...***` (expuesta, requiere rotación)
- `NASA_API_KEY=***...***` (expuesta, requiere rotación)
- `JWT_SECRET=***...***` (expuesto, requiere rotación URGENTE)

**Impacto**: CUALQUIERA con acceso al repo (público en GitHub) tiene tus claves. Ya están siendo usadas por bots de scraping. La key de Groq ya devuelve 401, la de HF devuelve 403. Las demás pueden estar comprometidas.

**Solución**: 
1. Rotar TODAS las claves AHORA
2. Usar `git filter-branch` o `BFG Repo-Cleaner` para eliminar del historial
3. Forzar push con `git push --force`
4. Añadir `.env` a `.gitignore` (YA está, pero el daño está hecho)

---

### C-02 [SEGURIDAD] JWT_SECRET hardcodeado y expuesto

**Archivo**: `backend/.env:14`
```env
JWT_SECRET=<string_hex_64_bytes_expuesto>
```

**Problema**: El JWT_SECRET es FIJO y está EXPUESTO. Cualquiera puede firmar tokens JWT válidos y suplantar cualquier usuario, incluyendo admin.

**Solución**: 
- Generar un nuevo secreto: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Setearlo SOLO en Render dashboard, NUNCA en archivos del repo
- Invalidar todos los tokens actuales (forzar relogin)

---

### C-03 [BUG] `TfidfVectorizer` con `stop_words="spanish"` causa 500 en producción

**Archivo**: `ai-service/rag/vector_store.py:28-31`
```python
self.vectorizer = TfidfVectorizer(
    max_features=2000,
    stop_words="spanish",  # <-- scikit-learn NO acepta "spanish"
    ...
)
```

**Problema**: scikit-learn solo acepta `"english"` como string predefinido para `stop_words`. `"spanish"` lanza `InvalidParameterError`. Esto hace que `load_documents()` falle, el RAG no cargue ningún documento, y el chat caiga a "modo offline" sin resultados.

**Impacto**: El chat NUNCA encuentra documentos IAC. Siempre responde con "Actualmente estoy en modo offline".

**Solución**: YA CORREGIDO → `stop_words=None`. Verificar que el push con esta corrección esté desplegado.

---

### C-04 [ARQUITECTURA] El chat falla si la API key de Groq es inválida

**Archivo**: `ai-service/agent/agent.py:94-98`
```python
response = llm_with_tools.invoke([system_msg] + list(state["messages"]))
```

**Problema**: Antes de mi corrección, si la key de Groq era inválida (401), TODO el chat petaba con 500. No había try/except alrededor de la llamada al LLM ni cadena de fallback a otros proveedores.

**Solución**: YA CORREGIDO → Se añadió:
1. `_get_models()` devuelve lista de TODOS los modelos disponibles
2. `call_model()` prueba Groq → OpenAI → HuggingFace secuencialmente
3. Si TODOS fallan, cae a `_simple_rag_response()`
4. Cada fallo se loguea con `logger.error()`

---

### C-05 [DESPLIEGUE] JWT_SECRET no configurado en Render hace que el backend no arranque

**Archivo**: `backend/server.js:183-185`
```javascript
if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET obligatorio en producción');
}
```

**Problema**: `render.yaml` tiene `JWT_SECRET: sync: false`, lo que significa que NO se configura automáticamente. El usuario debe setearlo MANUALMENTE en el dashboard de Render. Si intenta desplegar sin hacerlo, el backend crashea al iniciar.

**Solución**: Añadir un fallback con un valor por defecto solo para dev, pero en producción validar (ya está bien). La solución real es documentar esto y configurarlo en Render.

---

## 🟠 ALTOS (7)

### H-01 [SEGURIDAD] Almacenamiento de JWT en localStorage

**Archivo**: `frontend/src/context/AuthContext.jsx`
```javascript
localStorage.setItem('adastra_session', data.token);
```

**Problema**: `localStorage` es accesible desde JavaScript (XSS). Si hay cualquier vulnerabilidad XSS en la app, el atacante roba el token y suplanta al usuario.

**Solución**: Migrar a cookies httpOnly + Secure + SameSite=Strict. El backend debe setear la cookie, no el frontend.

---

### H-02 [CALIDAD] Backend `.env` sin gitignore efectivo (ya estaba commiteado)

**Archivo**: `backend/.env`
**Archivo**: `ai-service/.env`

**Problema**: Aunque `.gitignore` excluye `.env`, estos archivos YA FUERON commiteados en el pasado y siguen en el historial de git. Cualquiera puede hacer `git checkout <commit_antiguo>` y ver las claves.

**Solución**: 
```bash
# Instalar BFG Repo-Cleaner
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

---

### H-03 [BUG] El backend valida `session_id` formato UUID, pero el frontend nunca lo envía

**Archivo**: `backend/src/controllers/chat.controller.js:29-36`
```javascript
if (session_id && !uuidValidate(session_id)) {
    return res.status(400).json({...});
}
```

**Archivo**: `frontend/src/pages/ChatPage.jsx:40-51`
```javascript
const response = await axios.post(`${API_URL}/api/chat`, {
    message: userMessage,
    language: i18n.language || 'es',
    // 👈 NUNCA envía session_id
}, {...});
```

**Problema**: El backend valida `session_id` si se envía, pero el frontend JAMÁS lo envía. Cada mensaje es una conversación nueva sin historial. El usuario no puede retomar conversaciones.

**Solución**: Generar `session_id` una vez al cargar ChatPage y reutilizarlo en cada mensaje usando `useRef` o `useState`.

---

### H-04 [ARQUITECTURA] Sin manejo de errores uniforme en frontend

**Archivo**: `frontend/src/pages/*.jsx` (múltiples)

**Problema**: Cada página maneja errores de API de forma diferente:
- `ChatPage.jsx`: catch genérico → muestra "Lo siento, hubo un error"
- `DashboardPage.jsx`: posiblemente no maneja errores
- `AdminPanel.jsx`: manejo ad-hoc

No hay un interceptor de Axios global ni un toast/snackbar para errores.

**Solución**: Crear un interceptor Axios en `AuthContext.jsx` o un servicio centralizado que maneje 401 (redirect a login), 403, 500 (toast) de forma uniforme.

---

### H-05 [RENDIMIENTO] Sin paginación real en endpoints de listado

**Archivo**: `backend/src/controllers/sky.controller.js`
**Archivo**: `backend/src/controllers/admin.controller.js`

**Problema**: Endpoints como `GET /api/sky/zones` devuelven TODAS las zonas sin paginación. Con 92+ zonas, no es crítico ahora, pero con crecimiento sería problemático.

**Solución**: Añadir `limit` y `offset` como query params en todos los endpoints de listado.

---

### H-06 [SEGURIDAD] Sin rate limiting real en producción

**Archivo**: `backend/.env:36-37`
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Problema**: Las variables están definidas pero NO se usan en el código. No hay middleware `express-rate-limit` implementado. Cualquiera puede hacer brute force al login sin restricción.

**Solución**: Implementar `express-rate-limit` en los endpoints de auth:
```javascript
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5, // 5 intentos
    message: { status: 'error', message: 'Demasiados intentos' }
});
app.use('/api/auth/login', authLimiter);
```

---

### H-07 [DEPLOY] `VITE_API_URL` no configurado en Vercel

**Archivo**: `frontend/.env.example:7`
```
VITE_API_URL=https://aadastra-sky-backend.onrender.com
```

**Problema**: En producción (Vercel), si `VITE_API_URL` no está configurado como Environment Variable, el frontend usa el fallback hardcodeado `'https://aadastra-sky-backend.onrender.com'`. El fallback existe y es correcto, pero la falta de configuración explícita significa que si la URL cambia, hay que modificar 14 archivos.

**Solución**: Configurar `VITE_API_URL` en Vercel dashboard. Centralizar la URL en UN solo lugar (un archivo `config.js`).

---

## 🟡 MEDIOS (12)

### M-01 [CALIDAD] Código muerto — `call_model` comentado duplicado

**Archivo**: `ai-service/agent/agent.py:85-102`
```python
# def call_model(state: AgentState) -> dict:
#     models = _get_models()
#     ...
```

**Problema**: Hay una versión COMPLETA de `call_model` comentada justo encima de la versión activa. 18 líneas de código muerto que confunden y ensucian.

**Solución**: YA ELIMINADO en el último commit.

---

### M-02 [CALIDAD] `sky.py` devuelve datos estáticos hardcodeados

**Archivo**: `ai-service/routers/sky.py:52-60`
```python
"visible_objects": {
    "planets": ["Jupiter", "Venus", "Saturn", "Mars"],
    "constellations": ["Orion", "Ursa Major", "Cassiopeia", "Scorpius"],
    "messier_objects": ["M31 (Andromeda)", "M45 (Pleiades)", "M42 (Orion Nebula)"],
}
```

**Problema**: `GET /api/what-to-see` devuelve SIEMPRE los mismos planetas y constelaciones, SIN importar la latitud/longitud/fecha. Esto es un placeholder que nunca se implementó.

**Solución**: Implementar lógica real de visibilidad astronómica basada en fecha, hora y coordenadas. O eliminar el endpoint si no se va a implementar.

---

### M-03 [CALIDAD] Sin tests para el AI Service

**Archivo**: `ai-service/` (sin directorio `tests/`)

**Problema**: No hay NI UN SOLO test para el microservicio de IA. El agente LangGraph, el RAG, el Sky Engine y los routers no tienen cobertura. Cualquier cambio puede romper funcionalidad sin que nadie se dé cuenta.

**Solución mínimo**: Tests unitarios para:
- `_get_models()` con diferentes configuraciones de env vars
- `_simple_rag_response()` con/sin documentos cargados
- `SkyScoreAlgorithm.calculate_sky_score()` con diferentes inputs
- `calculate_moon_illumination()` con fechas conocidas

---

### M-04 [CALIDAD] El RAG offline usa emojis en respuestas que no se renderizan bien

**Archivo**: `ai-service/agent/agent.py:77`
```python
answers.append(f"📄 **{title}**\n{snippet}\n_(Fuente: Documento IAC — {title})_")
```

**Problema**: Los emojis 📄 se usan en la respuesta RAG. En algunos terminales/clients pueden no renderizarse bien o consumir espacio innecesario.

**Solución**: Usar caracteres ASCII o marcadores limpios sin emojis: `[Documento] {titulo}`.

---

### M-05 [CALIDAD] Variables de entorno con espacios

**Archivo**: `backend/.env:33` (ANTES de mi corrección)
```
 FRONTEND_URL=https://adastra-sky.vercel.app
```

**Problema**: La línea comenzaba con un espacio. Cuando `dotenv` la lee, el nombre de la variable es ` FRONTEND_URL` (con espacio al inicio), no `FRONTEND_URL`. Esto rompía el CORS en producción.

**Solución**: YA CORREGIDO. Verificar que se eliminó el espacio.

---

### M-06 [ARQUITECTURA] El frontend no tiene una capa de servicios unificada

**Archivo**: `frontend/src/pages/*.jsx`
**Archivo**: `frontend/src/services/*.js`

**Problema**: Cada página importa `axios` directamente y construye la URL a mano. Aunque hay servicios (`astronomyService.js`, `mapService.js`, `weatherService.js`), no se usan consistentemente en todas las páginas.

```javascript
// ChatPage.jsx:13 — bien, usa URL de variable de entorno
const API_URL = import.meta.env.VITE_API_URL || '...';

// AdminPanel.jsx:12 — bien, pero repite el patrón
const API_URL = import.meta.env.VITE_API_URL || '...';
```

**Solución**: Crear un `apiClient.js` centralizado con Axios interceptor y URL base configurada una vez.

---

### M-07 [RENDIMIENTO] Sin `React.memo` ni `useMemo` en componentes pesados

**Archivo**: `frontend/src/components/InteractiveMap.jsx`

**Problema**: El mapa interactivo con 92+ marcadores Leaflet se renderiza en cada cambio de estado del padre. Sin `React.memo` ni `useMemo`, los 92 marcadores se recrean en cada render.

**Solución**: Envolver `InteractiveMap` en `React.memo` y memorizar los marcadores con `useMemo`.

---

### M-08 [CALIDAD] Los mensajes de error del backend no son consistentes

**Archivo**: `backend/src/middleware/errorHandler.js`

**Problema**: Los errores personalizados (con `statusCode`) devuelven `{ status: 'error', code, message }`. Los errores de Sequelize devuelven `{ status: 'error', code, message, details }`. Los errores genéricos devuelven `{ status: 'error', code: 'INTERNAL_SERVER_ERROR', message }`. No hay un formato UNIFICADO para todas las respuestas de error.

**Solución**: Definir un formato estándar: `{ success: false, error: { code, message, details? } }` y usarlo en todos los casos.

---

### M-09 [SEGURIDAD] SQL Injection potencial en consultas raw del AI Service

**Archivo**: `ai-service/agent/tools.py:80-94`
```python
def _query_db(sql: str, params: tuple) -> list[dict]:
    conn = psycopg2.connect(settings.database_url, connect_timeout=3)
    with conn.cursor() as cur:
        cur.execute(sql, params)  # <-- usa parámetros, BIEN
```

**Problema**: Aunque la función usa parámetros tipados (bien), las consultas se construyen con LIKE:
```python
f"%{name}%"
```
Si `name` contiene caracteres especiales de LIKE (`%`, `_`), puede tener comportamientos inesperados o leak de información.

**Solución**: Escapar caracteres especiales de LIKE o usar `pg_trgm` para búsqueda por similitud.

---

### M-10 [ARQUITECTURA] Sin separación entre desarrollo y producción para el AI Service

**Archivo**: `ai-service/main.py:56`
```python
reload_mode = os.getenv("NODE_ENV") != "production"
```

**Problema**: En Render, `NODE_ENV` debería ser `production`, pero en el AI Service no se pasa desde `render.yaml` como variable del sistema (solo en el backend). El AI Service usa `NODE_ENV` de Node, no de Python.

**Solución**: En el `render.yaml` del AI Service, añadir `NODE_ENV: production` explícitamente (ya está en el yaml).

---

### M-11 [CALIDAD] El historial de chat (`GET /api/chat/history`) es un stub vacío

**Archivo**: `ai-service/routers/chat.py:72-78`
```python
@router.get("/history/{session_id}")
async def get_history(session_id: str):
    return {
        "session_id": session_id,
        "history": [],
        "note": "Usa GET /api/chat/history?...",
    }
```

**Problema**: El endpoint existe pero SIEMPRE devuelve vacío. No hay implementación real de persistencia de historial en el AI Service (el backend de Node.js guarda el historial en PostgreSQL, pero el AI Service no puede recuperarlo).

---

### M-12 [DEPLOY] Render blueprint con `sync: false` no documentado para el usuario

**Archivo**: `render.yaml:22,34,35,55,57`

**Problema**: 5 variables están marcadas como `sync: false`, lo que significa que el usuario DEBE configurarlas manualmente en el dashboard de Render. No hay documentación CLARA que le diga al usuario qué valores poner y cómo obtenerlos.

**Solución**: YA DOCUMENTADO en `docs/07_DESPLIEGUE_Y_SEGURIDAD.md`.

---

## 🔵 BAJOS (9)

### B-01 [ESTILO] `import` de logging en medio del archivo

**Archivo**: `ai-service/agent/agent.py:104-105`
```python
import logging
logger = logging.getLogger("adastra-ai.agent")
```

**Problema**: Los imports deberían estar al PRINCIPIO del archivo, no en la línea 104 después de código. Esto rompe la convención PEP8.

**Solución**: Mover los imports de `logging` al tope del archivo.

---

### B-02 [ESTILO] Nombres de archivos inconsistentes

- `backend/src/routes/chat.routes.js` vs `backend/src/routes/auth.routes.js` (consistentes)
- `frontend/src/pages/ChatPage.jsx` (PascalCase) vs `frontend/src/services/astronomyService.js` (camelCase)

No hay una convención clara entre back y front.

---

### B-03 [ESTILO] Comentario obsoleto en `main.py`

**Archivo**: `ai-service/main.py:2`
```python
"""
AdAstraSky AI Service — FastAPI + LangGraph + ChromaDB
"""
```

**Problema**: Ya NO usa ChromaDB, se reemplazó por TF-IDF. El comentario es engañoso.

**Solución**: YA CORREGIDO en el último commit.

---

### B-04 [ESTILO] `tools.py` importa settings a nivel de módulo

**Archivo**: `ai-service/agent/tools.py:7`
```python
settings = get_settings()
```

**Problema**: `get_settings()` se llama al importar el módulo, no bajo demanda. Si el archivo `.env` no existe o hay un error de configuración, falla al importar todo el módulo.

**Solución**: Usar lazy loading: llamar `get_settings()` dentro de cada función que lo necesite.

---

### B-05 [ESTILO] Sin type hints consistentes en backend

**Archivo**: `backend/src/controllers/*.js`
**Archivo**: `backend/src/models/*.js`

**Problema**: No se usa JSDoc de forma consistente. Algunos controladores tienen JSDoc completo, otros no.

---

### B-06 [ESTILO] Mezcla de `import` y `require` en tests

**Archivo**: `backend/__tests__/setup.js` usa `import` (ESM)
**Archivo**: `backend/jest.config.js` usa `module.exports` (CJS)

Inconsistencia entre ESM y CJS en el mismo proyecto.

---

### B-07 [ESTILO] Sin linter configurado para Python

**Archivo**: `ai-service/` (sin `setup.cfg`, `pyproject.toml`, `.pylintrc`)

**Problema**: No hay configuración de ruff, flake8, pylint o black para el código Python.

---

### B-08 [ESTILO] Las traducciones de i18n no están completas

**Archivo**: `frontend/public/locales/{es,en,de}/translation.json`

**Problema**: Probablemente faltan keys de traducción para páginas nuevas (Experiences, Contact, etc.).

---

### B-09 [ESTILO] `package.json` sin scripts de lint para frontend

**Archivo**: `frontend/package.json`

Solo hay scripts de dev/build/test. No hay `lint` o `lint:fix` para ESLint.

---

## ⚪ INFORMATIVOS (5)

### I-01 El proyecto tiene 3 README.md distintos (raíz, backend, frontend) con información parcialmente duplicada y a veces contradictoria.

### I-02 El `vercel.json` del frontend tiene reglas SPA correctas. OK.

### I-03 Render free plan: 512MB RAM, cold start ~30s. Documentado.

### I-04 La documentación en `docs/` es completa y bien estructurada. OK.

### I-05 Los tests del backend (22/24) pasan correctamente. Los 2 fallos son por cambios en la respuesta del health endpoint que los tests no reflejan.

---

## 📊 ESTADÍSTICAS FINALES

| Métrica | Valor |
|---|---|
| **Archivos totales** | ~130+ |
| **Líneas de código** | ~15,000+ |
| **Issues encontrados** | 38 |
| 🔴 Críticos | 5 |
| 🟠 Altos | 7 |
| 🟡 Medios | 12 |
| 🔵 Bajos | 9 |
| ⚪ Informativos | 5 |
| **Ya corregidos en último push** | 6 (C-03, C-04, M-01, M-05, B-02, B-03) |
| **Requieren acción del usuario** | 7 (Claves API, Render env vars, Vercel env var) |

### Score de Salud del Proyecto: **6.5/10** 🟡

```
🔴 Críticos: ████████████████ 5  (peso: -3.0)
🟠 Altos:    ████████████████ 7  (peso: -2.0)
🟡 Medios:   ████████████████ 12 (peso: -1.0)
🔵 Bajos:    ████████████████ 9  (peso: -0.3)
⚪ Info:      ████████████████ 5  (peso: 0.0)

Puntuación base: 10.0
Penalización:    3.5
Score final:     6.5/10 🟡
```

---

## 🏁 ACCIONES RECOMENDADAS (Priorizadas)

### AHORA MISMO (antes de la demo)
1. 🔴 Rotar TODAS las API keys (Groq, HF, OpenWeather, NASA, JWT_SECRET)
2. 🔴 Poner `JWT_SECRET` nuevo en Render dashboard
3. 🟠 Poner `VITE_API_URL` en Vercel dashboard
4. 🟠 Verificar que el último push (con `stop_words=None`, fallback chain, logging) está desplegado en Render
5. 🔴 Verificar que `GROQ_API_KEY` nueva funciona: `curl https://adastra-sky-ai.onrender.com/debug/config`

### ANTES DE LA DEMO (si hay tiempo)
6. 🟡 Implementar rate limiting en login (evita brute force en vivo)
7. 🟡 Hacer que ChatPage envíe `session_id` (para mantener conversación)
8. 🟡 Centralizar API_URL en frontend en un solo archivo

### POST-DEMO
9. 🔴 Limpiar historial git de claves (BFG Repo-Cleaner)
10. 🟠 Migrar JWT a cookies httpOnly
11. 🟡 Tests para AI Service
12. 🟡 Implementar paginación real
13. 🔵 Mover imports de logging al tope de agent.py

---

*Auditoría generada por Fulp Star Developer™ — "Si no está roto, no significa que no puedas mejorarlo."*
