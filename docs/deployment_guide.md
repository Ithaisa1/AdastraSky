# Deployment Guide — AdAstra Sky

## Stack

| Componente | Tecnología | Plataforma |
|------------|-----------|------------|
| Frontend | React 18 + Vite | Vercel |
| Backend | Node.js + Express | Render |
| AI Service | FastAPI + LangGraph | Render |
| Database | PostgreSQL | Neon (serverless) |
| Vector DB | ChromaDB | Embebido en AI Service |

---

## 1. Base de datos (Neon)

1. Crear instancia PostgreSQL gratuita en [neon.tech](https://neon.tech).
2. Copiar `DATABASE_URL` (conexión con pooling recomendada).
3. Ejecutar migraciones localmente:
   ```bash
   cd backend
   node src/seed/seedUsers.js
   ```

## 2. Backend (Render)

1. Crear nuevo **Web Service** en Render.
2. Conectar repositorio.
3. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Añadir variables de entorno desde `.env.example`.
5. Render asigna automáticamente una URL tipo `https://adastra-sky-backend.onrender.com`.

## 3. Frontend (Vercel)

1. Instalar Vercel CLI o conectar repo desde [vercel.com](https://vercel.com).
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
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
3. Variables de entorno:
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (misma que el backend)
   - `FRONTEND_URL` (URL de Vercel)

---

## Variables de entorno

**Backend (.env):**
```
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
AI_SERVICE_URL=https://adastra-sky-ai.onrender.com
FRONTEND_URL=https://adastra-sky.vercel.app
OPENWEATHER_API_KEY=...
```

**AI Service (.env):**
```
PORT=8000
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
FRONTEND_URL=https://adastra-sky.vercel.app
```

**Frontend (Vercel):**
```
VITE_API_URL=https://adastra-sky-backend.onrender.com
```
