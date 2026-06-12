# AdAstra Sky

**Plataforma inteligente de astroturismo para las Islas Canarias**  
*Bootcamp capstone — Ironhack · Junio 2026*

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-8B5CF6?style=flat-square)](https://adastra-sky.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-06B6D4?style=flat-square)](https://aadastra-sky-backend.onrender.com)
[![AI Service](https://img.shields.io/badge/AI-Render-10B981?style=flat-square)](https://adastra-sky-ai.onrender.com)
[![Tests](https://img.shields.io/badge/Tests-24%2F24-22C55E?style=flat-square)]()

AdAstra Sky es una aplicación fullstack que integra mapas interactivos de zonas de observación astronómica, un asistente de IA con RAG sobre documentación del Instituto de Astrofísica de Canarias (IAC), un motor de puntuación de calidad del cielo en tiempo real y herramientas para astrónomos aficionados y astrofotógrafos.

---

<details open>
<summary><strong>Tabla de Contenidos</strong></summary>

- [Stack Tecnológico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
  - [Mapa Interactivo](#mapa-interactivo)
  - [Fase Lunar](#fase-lunar)
  - [Sky Score](#sky-score)
  - [Asistente IA con RAG](#asistente-ia-con-rag)
  - [Catálogo Astronómico](#catalogo-astronomico)
  - [Exportación de Datos](#exportacion-de-datos)
- [Seguridad](#seguridad)
- [Inicio Rápido](#inicio-rapido)
- [API Reference](#api-reference)
- [Usuarios Demo](#usuarios-demo)
- [Pruebas](#pruebas)
- [Despliegue](#despliegue)
- [Documentación](#documentacion)
- [Backlogs Futuros](#backlogs-futuros)

</details>

---

## Stack Tecnologico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS 3.4 + Framer Motion |
| **Backend** | Node.js + Express 4 + Sequelize ORM |
| **Base de datos** | PostgreSQL 18 (Render) |
| **AI Service** | FastAPI + LangGraph + scikit-learn TF-IDF RAG |
| **LLM** | Groq LLaMA 3.3 70B (con fallback a OpenAI → RAG-only) |
| **Mapas** | Leaflet + React-Leaflet |
| **Internacionalización** | i18next (es, en, de) |
| **Automatización** | n8n workflows |
| **APIs externas** | OpenWeatherMap, NASA APOD |
| **Despliegue** | Vercel (frontend) + Render (backend + AI + DB) |

---

## Arquitectura

```
                         ┌──────────────────────┐
                         │    Vercel (React)     │
                         │ adastra-sky.vercel.app│
                         └──────────┬───────────┘
                                    │ JWT + REST
                                    ▼
 ┌──────────────────────────────────────────────────────────┐
 │              Render — Backend (Express :5000)             │
 │  • Autenticación JWT con roles (user/admin)              │
 │  • CRUD de zonas, experiencias, eventos                  │
 │  • Proxy de chat y clima hacia AI Service                │
 │  • Rate limiting (admin, contact, experiences)           │
 │  • Multer + Sharp para subida de imágenes                │
 │  • Exportación CSV, GeoJSON y PDF                        │
 └──────┬───────────────────────────────────┬───────────────┘
        │ proxy /api/chat                   │ proxy /weather
        ▼                                   ▼
 ┌──────────────────┐             ┌──────────────────┐
 │  Render — AI     │             │  OpenWeatherMap  │
 │  Service (:10000)│             │     API          │
 │  • LangGraph     │             └──────────────────┘
 │  • RAG TF-IDF    │
 │  • Sky Score Alg │
 │  • Groq LLM 70B  │
 └──────────────────┘
          │
          ▼
 ┌──────────────────┐
 │ Render PostgreSQL│
 │  (compartida)    │
 └──────────────────┘
```

<details>
<summary><strong>Diagrama de flujo de datos</strong></summary>

```
Usuario → Frontend (Vite) → Backend (Express) → AI Service (FastAPI) → Groq API
                               │                       │
                               ▼                       ▼
                         PostgreSQL              Documentos IAC
                                                 (RAG TF-IDF)
```

El flujo de una consulta al chat es:
1. El usuario escribe un mensaje en el frontend
2. El frontend envía el mensaje al backend via REST
3. El backend hace proxy al AI Service
4. El AI Service busca documentos relevantes en el RAG (TF-IDF + cosine similarity)
5. El contexto RAG se inyecta en el system prompt del LLM
6. Groq genera la respuesta (con fallback a OpenAI → respuesta RAG-only)
7. La respuesta viaja de vuelta: AI Service → Backend → Frontend

</details>

---

## Funcionalidades

### Mapa Interactivo

95 zonas de observación geolocalizadas en 8 islas + La Graciosa, con:

- **2 observatorios** (Roque de los Muchachos, Teide)
- **33 miradores astronómicos**
- **60 miradores paisajísticos**
- Filtros por isla, categoría y escala Bortle
- Exportación a CSV, GeoJSON y PDF
- Panel de santuarios estelares (Bortle 1-2)

### Fase Lunar

Algoritmo de cálculo de fase lunar implementado en JavaScript puro basado en el período sinódico (29.53 días) desde la luna nueva de referencia J2000:

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

### Sky Score

Sistema de puntuación de calidad del cielo implementado en **dos capas**:

<details>
<summary><strong>Frontend — 3 factores ponderados (JS)</strong></summary>

```js
const WEIGHTS = {
  ASTRO:   { bortle: 0.35, seeing: 0.20, transparency: 0.15,
             altitude: 0.10, cloudiness: 0.10, humidity: 0.10 },
  PHOTO:   { landscape: 0.25, orientation: 0.20, composition: 0.20,
             accessibility: 0.15, bortle: 0.20 },
  TOURISM: { access: 0.30, safety: 0.25, services: 0.25, parking: 0.20 },
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

</details>

<details>
<summary><strong>AI Service — 6 factores meteorológicos (Python)</strong></summary>

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

</details>

### Asistente IA con RAG

Agente LangGraph que utiliza Groq LLaMA 3.3 70B como proveedor principal de LLM, con un sistema de RAG ligero implementado con **TF-IDF + cosine similarity** en memoria:

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

**Características del agente:**
- RAG sobre 6 documentos del IAC (introducción, observatorios, ley del cielo, astroturismo, eventos)
- Inyección de contexto RAG directamente en el system prompt del LLM
- Cadena de fallos: Groq → OpenAI → respuesta solo con RAG
- Multilingüe (es, en, de)
- Sin dependencias pesadas (no ChromaDB, no PyTorch, no sentence-transformers)
- Optimizado para 512 MB de RAM (plan gratuito de Render)

### Catálogo Astronómico

- 88 constelaciones con áreas exactas (grados cuadrados), magnitudes, objetos Messier y mitología
- 9 planetas con datos físicos y visibilidad desde Canarias
- 12 eventos astronómicos calculados algorítmicamente para 2025-2028 (lluvias de estrellas, eclipses, oposiciones planetarias)

### Exportación de Datos

Tres formatos de exportación disponibles desde el Dashboard:

| Formato | Uso recomendado |
|---------|----------------|
| **CSV** | Abrir en Excel, Google Sheets o cualquier analizador de datos |
| **GeoJSON** | Cargar en QGIS, Google Earth, Mapbox o cualquier SIG |
| **PDF** | Informe imprimible con resumen de zonas organizadas por isla |

---

## Roles del Sistema

Actualmente existen **2 roles** con permisos diferenciados:

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| `user` | Rutas públicas + perfil propio + crear experiencias | Rol por defecto al registrarse |
| `admin` | Todo lo anterior + panel de administración (CRUD zonas, gestión de usuarios) | Asignado solo mediante seed o directamente en base de datos |

El rol se incluye en el payload del JWT en el momento del login (`{ id, email, role, iat, exp }`). El middleware `requireAdmin` verifica `req.user.role !== 'admin'` sin necesidad de consultar la base de datos en cada petición.

No existe un endpoint público para promocionar un usuario a admin — solo puede hacerse mediante el panel de administración (usando una cuenta admin) o directamente en la base de datos.

---

## Seguridad

- Autenticación JWT con `role` en payload; `requireAdmin` verifica el rol sin consultar la base de datos
- Tokens gestionados exclusivamente via AuthContext (sin acceso directo a `localStorage`)
- Rate limiting escalonado:
  - Auth: 10 peticiones cada 15 minutos
  - Contacto: 5 peticiones por hora
  - Admin: 60 peticiones cada 15 minutos
  - Experiences POST: 10 peticiones por hora
- Validación Joi en registro y formulario de contacto
- Subida de imágenes limitada a 10 MB con procesado mediante Sharp
- Sanitización de errores: `errorHandler` elimina nombres de campo y mensajes internos
- Conexión SSL a PostgreSQL con `rejectUnauthorized: false` para certificados autofirmados de Render
- Doble autenticación: JWT para usuarios y API Key para n8n

---

## Inicio Rapido

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

<details>
<summary><strong>Autenticación</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | ✗ | Registro de usuario (8+ chars, mayúscula, minúscula, número) |
| POST | `/auth/login` | ✗ | Inicio de sesión (devuelve JWT) |
| GET | `/auth/profile` | ✓ | Perfil del usuario |
| PATCH | `/auth/profile` | ✓ | Actualizar perfil |

</details>

<details>
<summary><strong>Zonas de observación (Sky Zones)</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/sky/zones` | ✗ | Todas las zonas activas |
| GET | `/sky/zones/geojson` | ✗ | Exportar GeoJSON |
| GET | `/sky/zones/csv` | ✗ | Exportar CSV |
| GET | `/sky/zones/pdf` | ✗ | Exportar PDF |
| GET | `/sky/zones/query` | ✗ | Búsqueda avanzada con filtros |
| GET | `/sky/zones/recommend/tonight` | ✗ | Mejores zonas para esta noche |
| GET | `/sky/zones/recommend/photo` | ✗ | Mejores para astrofotografía |
| GET | `/sky/zones/:id` | ✗ | Detalle de zona |
| GET | `/sky/zones/islands/:island` | ✗ | Zonas por isla |
| GET | `/sky/zones/category/:category` | ✗ | Zonas por categoría |

</details>

<details>
<summary><strong>Sky Score, Chat, Islas, Eventos, Experiencias, Clima</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/sky/score` | API Key | Guardar score (desde n8n) |
| GET | `/sky/score/latest` | ✗ | Último score registrado |
| GET | `/sky/score/history` | ✗ | Historial de scores |
| POST | `/chat/message` | ✓ | Enviar mensaje al agente IA |
| GET | `/chat/history` | ✓ | Historial de conversaciones |
| GET | `/islands` | ✗ | Información de todas las islas |
| GET | `/events` | ✗ | Eventos astronómicos |
| GET | `/experiences` | ✗ | Experiencias de usuarios |
| POST | `/experiences` | ✓ | Crear experiencia (rate limit: 10/hora) |
| POST | `/contact` | ✗ | Formulario de contacto (rate limit: 5/hora) |
| GET | `/weather/current` | ✗ | Clima por coordenadas |

</details>

<details>
<summary><strong>Administración</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/zones` | Admin | Listar zonas |
| POST | `/admin/zones` | Admin | Crear zona |
| PUT | `/admin/zones/:id` | Admin | Actualizar zona |
| DELETE | `/admin/zones/:id` | Admin | Eliminar zona |
| GET | `/admin/users` | Admin | Listar usuarios |
| GET | `/admin/users/:id` | Admin | Detalle de usuario |
| PUT | `/admin/users/:id` | Admin | Actualizar usuario (incluye password) |
| DELETE | `/admin/users/:id` | Admin | Desactivar usuario |

</details>

### AI Service (`/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check del servicio |
| POST | `/api/chat` | Chat con el agente astronómico |
| POST | `/api/sky-score` | Calcular Sky Score en tiempo real (0-10) |
| GET | `/api/what-to-see` | Recomendación de qué observar esta noche |

---

## Usuarios Demo

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `demo@adastra.sky` | `Demo1234` | user |

El rol `user` se asigna automáticamente al registrarse.  
Los usuarios seed se crean al ejecutar `npm run seed`.

---

## Pruebas

```bash
# Backend — 24 tests (Jest + Supertest)
cd backend && npm test

# Frontend — 2 tests (Vitest)
cd frontend && npm test

# AI Service — pendiente de implementar
cd ai-service && python -m pytest
```

---

## Despliegue

| Servicio | Plataforma | URL |
|----------|-----------|-----|
| Frontend | Vercel | [adastra-sky.vercel.app](https://adastra-sky.vercel.app) |
| Backend | Render | [aadastra-sky-backend.onrender.com](https://aadastra-sky-backend.onrender.com) |
| AI Service | Render | [adastra-sky-ai.onrender.com](https://adastra-sky-ai.onrender.com) |
| Base de datos | Render PostgreSQL | Interna |

El blueprint de infraestructura está definido en `render.yaml`.  
Ver `docs/13_MANUAL_INSTALACION.md` para instrucciones detalladas de despliegue.

---

## Documentacion

| Archivo | Contenido |
|---------|-----------|
| `docs/01_INTRODUCCION.md` | Introducción al proyecto |
| `docs/02_ARQUITECTURA.md` | Arquitectura del sistema |
| `docs/03_BACKEND.md` | Documentación del backend |
| `docs/04_FRONTEND.md` | Documentación del frontend |
| `docs/05_AI_SERVICE.md` | Documentación del AI Service |
| `docs/06_BASE_DE_DATOS.md` | Esquema de base de datos |
| `docs/07_DESPLIEGUE_Y_SEGURIDAD.md` | Despliegue y seguridad |
| `docs/08_FUTURAS_Y_ANEXOS.md` | Funcionalidades futuras y anexos |
| `docs/09_LIMPIEZA_ARCHIVOS.md` | Auditoría de archivos no utilizados |
| `docs/10_AUDITORIA_TECNICA.md` | Auditoría técnica con niveles de criticidad |
| `docs/11_PRESENTACION_FINAL.md` | Presentación del proyecto |
| `docs/12_MANUAL_USUARIO.md` | Manual de usuario |
| `docs/13_MANUAL_INSTALACION.md` | Guía de instalación y despliegue |
| `docs/api_specification.md` | Especificación detallada de la API |
| `docs/deployment_guide.md` | Guía de despliegue en producción |
| `docs/postman/AdAstraSky.postman_collection.json` | Colección de Postman actualizada |

---

## Backlogs Futuros

<details>
<summary><strong>Corto plazo</strong></summary>

- [ ] **Lista de favoritos**: Permitir a los usuarios guardar y gestionar sus santuarios estelares favoritos
- [ ] **Modo oscuro completo**: Mejorar la consistencia del tema oscuro en todas las secciones
- [ ] **Notificaciones push**: Alertar sobre eventos astronómicos importantes (eclipses, lluvias de estrellas)
- [ ] **Galería de astrofotografía**: Sección dedicada a fotografías del cielo canario compartidas por la comunidad
- [ ] **Tests del AI Service**: Implementar pruebas unitarias y de integración para el servicio de Python

</details>

<details>
<summary><strong>Medio plazo</strong></summary>

- [ ] **Sistema de reservas**: Integración con calendario para reservar visitas a observatorios y miradores
- [ ] **Autenticación OAuth**: Inicio de sesión con Google, GitHub y Apple
- [ ] **API pública**: Documentación Swagger/OpenACCESO público para desarrolladores externos
- [ ] **App móvil**: Versión nativa para iOS y Android con funcionalidades offline
- [ ] **Recomendaciones personalizadas**: Algoritmo de machine learning que aprenda de las preferencias del usuario
- [ ] **Realidad aumentada**: Superposición de constelaciones y objetos celestes usando la cámara del dispositivo

</details>

<details>
<summary><strong>Largo plazo</strong></summary>

- [ ] **Community Hub**: Red social de astrónomos aficionados con foros, eventos y encuentros
- [ ] **Monetización**: Modelo freemium con funcionalidades premium (pronósticos avanzados, alerts personalizados)
- [ ] **Integración con telescopios**: Conexión con mounts y telescopios controlados por software (ASCOM/INDI)
- [ ] **Gemelos digitales**: Simulación 3D del cielo canario con WebGL para planificación de observaciones
- [ ] **Expansión geográfica**: Incluir otras regiones astronómicas (Chile, Hawái, Namibia)
- [ ] **Dashboard científico**: Herramientas de análisis de datos para investigadores del IAC

</details>

---

## Licencia

MIT
