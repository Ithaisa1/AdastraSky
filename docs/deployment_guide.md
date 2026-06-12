# Guia de Despliegue — AdAstra Sky

## Stack

| Componente | Tecnología | Plataforma |
|------------|-----------|------------|
| Frontend | React 18 + Vite | Vercel |
| Backend | Node.js + Express | Render |
| AI Service | FastAPI + LangGraph + RAG TF-IDF | Render |
| Base de datos | PostgreSQL | Render |
| Automatización | n8n | Render |

---

## 1. Base de datos (Render PostgreSQL)

1. Crear instancia PostgreSQL desde el dashboard de Render.
2. Copiar la `DATABASE_URL` (conexión interna).
3. Ejecutar migraciones localmente apuntando a la base remota:
   ```bash
   cd backend
   node src/seed/seedUsers.js
   ```

## 2. Backend (Render)

1. Crear un nuevo **Web Service** en Render conectado al repositorio.
2. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
3. Añadir variables de entorno desde `.env.example` (incluyendo `JWT_SECRET`, `DATABASE_URL`, `AI_SERVICE_URL`, `OPENWEATHER_API_KEY`, `NASA_API_KEY`).
4. Render asigna automáticamente una URL tipo `https://aadastra-sky-backend.onrender.com`.

## 3. Frontend (Vercel)

1. Conectar repositorio desde [vercel.com](https://vercel.com).
2. Configurar:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Añadir variable de entorno:
   - `VITE_API_URL`: URL del backend en Render
4. Vercel asigna URL tipo `https://adastra-sky.vercel.app`.

El `vercel.json` en `frontend/` ya incluye rewrites para SPA.

## 4. AI Service (Render)

1. Crear otro **Web Service** en Render.
2. Configurar:
   - **Root Directory:** `ai-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Variables de entorno:
   - `GROQ_API_KEY` (obligatorio — LLM principal)
   - `OPENAI_API_KEY` (opcional — fallback)
   - `FRONTEND_URL` (URL de Vercel)

## 5. Blueprint (Render)

El archivo `render.yaml` en la raíz del proyecto define todos los servicios de forma declarativa. Render lo detecta automáticamente al conectar el repositorio.

---

## Variables de Entorno

### Backend
```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=generar_clave_segura
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=https://adastra-sky-ai.onrender.com
FRONTEND_URL=https://adastra-sky.vercel.app
OPENWEATHER_API_KEY=clave_openweather
NASA_API_KEY=clave_nasa
```

### AI Service
```
PORT=10000
GROQ_API_KEY=gsk_clave_groq
OPENAI_API_KEY=sk_clave_openai
FRONTEND_URL=https://adastra-sky.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://aadastra-sky-backend.onrender.com
```

---

## Enlaces en Produccion

| Servicio | URL |
|----------|-----|
| Frontend | https://adastra-sky.vercel.app |
| Backend | https://aadastra-sky-backend.onrender.com |
| AI Service | https://adastra-sky-ai.onrender.com |
