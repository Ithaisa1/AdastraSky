# AdAstra Sky

**Plataforma inteligente de astroturismo para las Islas Canarias**  
Bootcamp capstone — Ironhack (Junio 2026)

AdAstra Sky es una aplicación fullstack que integra mapas interactivos de 95 zonas de observación astronómica, un asistente IA con RAG sobre documentos del Instituto de Astrofísica de Canarias (IAC), un motor de puntuación de calidad del cielo, catálogo astronómico completo y herramientas para astrónomos aficionados y astrofotógrafos.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3.4 + Framer Motion + i18next |
| Backend | Node.js + Express 4 + Sequelize ORM |
| Base de datos | PostgreSQL 18 (Render) |
| AI Service | FastAPI + LangGraph + scikit-learn TF-IDF RAG + Groq LLM |
| Mapas | Leaflet + React-Leaflet |
| Automatización | n8n workflows |
| APIs externas | OpenWeatherMap, NASA APOD |
| Despliegue | Vercel (frontend) + Render (backend + AI + DB) |

---

## Arquitectura

```
                        ┌──────────────────┐
                        │   Vercel (React)  │
                        │  adastra-sky.vercel.app
                        └────────┬─────────┘
                                 │ JWT + REST
                                 ▼
┌──────────────────────────────────────────────────┐
│         Render — Backend (Express :5000)          │
│  • Auth JWT (roles user/admin)                    │
│  • CRUD zonas, experiencias, eventos              │
│  • Proxy clima + chat → AI Service                │
│  • Rate limiting (admin, contact, experiences)    │
│  • Multer + Sharp (upload imágenes)               │
└──────┬────────────────────────────────┬──────────┘
       │ proxy /api/chat                │ proxy /weather
       ▼                                ▼
┌──────────────────┐          ┌──────────────────┐
│ Render — AI      │          │ OpenWeatherMap   │
│ Service (:10000) │          │ API              │
│ • LangGraph      │          └──────────────────┘
│ • RAG TF-IDF     │
│ • Sky Score Alg  │
│ • Groq LLM 70B   │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│ Render PostgreSQL│
│ (compartida)     │
└──────────────────┘
```

---

## Funcionalidades técnicas

### 🗺️ Mapa Interactivo de Zonas
95 zonas geolocalizadas (2 observatorios, 33 miradores astronómicos, 60 paisajísticos) en 8 islas + La Graciosa. Filtros por isla, categoría y escala Bortle. Exportación GeoJSON/CSV.

### 🌙 Cálculo de Fase Lunar
Algoritmo puro JS basado en el período sinódico (29.53 días) desde luna nueva de referencia (J2000):

```js
export function getLunarPhase(date = new Date()) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058867;
  const diff = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const age = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const illumination = Math.round(
    ((1 - Math.cos(2 * Math.PI * age / synodicMonth)) / 2) * 100
  );
  const phaseIndex = Math.round(age / synodicMonth * 8) % 8;
  return { phaseIndex, illumination, age: Math.round(age) };
}
```

### ⭐ Sky Score (Frontend — 3 factores ponderados)
Cada zona obtiene tres puntuaciones con pesos configurables:

```js
const WEIGHTS = {
  ASTRO:  { bortle: 0.35, seeing: 0.20, transparency: 0.15,
            altitude: 0.10, cloudiness: 0.10, humidity: 0.10 },
  PHOTO:  { landscape: 0.25, orientation: 0.20, composition: 0.20,
            accessibility: 0.15, bortle: 0.20 },
  TOURISM:{ access: 0.30, safety: 0.25, services: 0.25, parking: 0.20 },
};

export const calcGlobalScore = (zone) => {
  const astro = calcAstroScore(zone);    // 6 subfactores
  const photo = calcPhotoScore(zone);    // 5 subfactores
  const tourism = calcTourismScore(zone); // 4 subfactores
  return {
    astro, photo, tourism,
    global: Math.round(astro * 0.5 + photo * 0.3 + tourism * 0.2)
  };
};
```

### 🌌 Sky Score (Python — 6 factores meteorológicos)
El AI Service calcula una puntuación en tiempo real con datos actuales de OpenWeatherMap:

```python
class SkyScoreAlgorithm:
    WEIGHTS = {
        "cloudiness": 0.30,
        "light_pollution": 0.30,
        "moon_phase": 0.15,
        "wind": 0.10,
        "humidity": 0.10,
        "transparency": 0.05,
    }

    def calculate_sky_score(self, factors):
        score = (
            self.calculate_cloudiness_factor(factors["cloudiness"]) * 0.30
            + self.calculate_light_pollution_factor(factors["light_pollution"]) * 0.30
            + self.calculate_moon_phase_factor(factors["moon_phase"]) * 0.15
            + self.calculate_wind_factor(factors["wind"]) * 0.10
            + self.calculate_humidity_factor(factors["humidity"]) * 0.10
            + self.calculate_transparency_factor(factors.get("transparency", 0.8)) * 0.05
        )
        return round(score, 1)
```

### 🤖 Asistente IA con RAG Ligero
Agente LangGraph con Groq LLaMA 3.3 70B. El RAG usa **TF-IDF + cosine similarity** en memoria (sin ChromaDB, sin PyTorch — cabe en 512MB RAM de Render Free):

```python
class InMemoryVectorStore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=2000)
        self._tfidf_matrix = None

    def load_documents(self):
        texts = [d.page_content for d in self.chunks]
        self._tfidf_matrix = self.vectorizer.fit_transform(texts)

    def similarity_search(self, query: str, k: int = 3):
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self._tfidf_matrix).flatten()
        top_indices = np.argsort(scores)[::-1][:k]
        return [self.chunks[i] for i in top_indices if scores[i] > 0]
```

Los documentos IAC se inyectan directamente en el system prompt del LLM. Si Groq falla (rate limit), se intenta OpenAI; si todo falla, se responde solo con RAG.

### 🔐 Seguridad
- JWT con `role` en payload; `requireAdmin` verifica rol sin consultar DB
- Tokens gestionados via AuthContext (sin `localStorage` directo)
- Rate limiting escalonado: auth 10/15min, contacto 5/hora, admin 60/15min, experiences 10/hora
- Validación Joi en contacto y registro
- Upload limitado a 10MB con Sharp
- `errorHandler` sanitiza errores (sin leak de field names)
- PostgreSQL SSL con `rejectUnauthorized: false` para Render (self-signed cert)

---

## Inicio Rápido

### Requisitos
- Node.js ≥ 18, npm ≥ 9
- Python ≥ 3.10
- PostgreSQL ≥ 12

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
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py                  # http://localhost:8001
```

### 4. Todo simultáneo
```bash
npm run dev    # Lanza backend + frontend + AI service con concurrently
```

---

## API Reference

### Backend (`/api`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | ✗ | Registro |
| POST | `/auth/login` | ✗ | Login JWT |
| GET | `/auth/profile` | ✓ | Perfil |
| PATCH | `/auth/profile` | ✓ | Actualizar perfil |
| GET | `/sky/zones` | ✗ | Zonas activas |
| GET | `/sky/zones/geojson` | ✗ | GeoJSON |
| GET | `/sky/zones/csv` | ✗ | Exportar CSV |
| GET | `/sky/zones/recommend/tonight` | ✗ | Mejores para esta noche |
| GET | `/sky/zones/recommend/photo` | ✗ | Mejores para astrofotografía |
| GET | `/sky/zones/:id` | ✗ | Detalle zona |
| GET | `/sky/zones/islands/:island` | ✗ | Zonas por isla |
| POST | `/sky/score` | API Key | Guardar score (n8n) |
| GET | `/sky/score/latest` | ✗ | Último score |
| GET | `/sky/score/history` | ✗ | Historial |
| POST | `/chat/message` | ✓ | Chat con IA |
| GET | `/chat/history` | ✓ | Historial chat |
| GET | `/islands` | ✗ | Islas |
| GET | `/events` | ✗ | Eventos astronómicos |
| GET | `/experiences` | ✗ | Experiencias |
| POST | `/experiences` | ✓ | Crear experiencia |
| POST | `/contact` | ✗ | Formulario contacto |
| GET | `/weather/current` | ✗ | Clima por coordenadas |
| GET/POST/PUT/DELETE | `/admin/zones` | Admin | CRUD zonas |
| GET/PUT | `/admin/users` | Admin | Gestión usuarios |

### AI Service (`/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat con agente astronómico |
| POST | `/api/sky-score` | Calcular Sky Score (0-10) |
| GET | `/api/what-to-see` | Qué observar esta noche |

---

## Tests

```bash
cd backend && npm test           # 24 tests (Jest + Supertest) ✓
cd frontend && npm test          # 2 tests (Vitest) ✓
cd ai-service && python -m pytest # Pendiente
```

---

## Despliegue

| Servicio | Plataforma | URL |
|----------|-----------|-----|
| Frontend | Vercel | `https://adastra-sky.vercel.app` |
| Backend | Render | `https://aadastra-sky-backend.onrender.com` |
| AI Service | Render | `https://adastra-sky-ai.onrender.com` |
| Base de datos | Render PostgreSQL | Interna |

Blueprint: `render.yaml` — despliegue automatizado desde `main`.

---

## Usuarios Demo (Seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@adastra.sky` | `Admin123` | admin |

---

## Variables de Entorno

Ver `.env.example` en cada subdirectorio. Variables críticas para producción:

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `JWT_SECRET` | Backend | Firma de tokens |
| `DATABASE_URL` | Backend + AI | Conexión PostgreSQL |
| `GROQ_API_KEY` | AI Service | LLM provider principal |
| `OPENWEATHER_API_KEY` | Backend | Clima |
| `NASA_API_KEY` | Backend | APOD |
| `N8N_API_KEY` | Backend | Webhooks n8n |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/11_PRESENTACION_FINAL.md` | Deck de presentación (11 secciones) |
| `docs/12_MANUAL_USUARIO.md` | Manual de usuario |
| `docs/13_MANUAL_INSTALACION.md` | Guía de instalación y despliegue |
| `docs/10_AUDITORIA_TECNICA.md` | Auditoría técnica con criticidades |
| `docs/09_LIMPIEZA_ARCHIVOS.md` | Auditoría de archivos no usados |
| `docs/postman/AdAstraSky.postman_collection.json` | Colección Postman actualizada |

---

## Licencia

MIT
