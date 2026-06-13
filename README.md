# AdAstra Sky

**Plataforma inteligente de astroturismo para las Islas Canarias**  
*Bootcamp capstone — Ironhack · Junio 2026*

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-8B5CF6?style=flat-square)](https://adastra-sky.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-06B6D4?style=flat-square)](https://aadastra-sky-backend.onrender.com)
[![AI Service](https://img.shields.io/badge/AI-Render-10B981?style=flat-square)](https://adastra-sky-ai.onrender.com)
[![Tests](https://img.shields.io/badge/Tests-24%2F24-22C55E?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=flat-square)]()

AdAstra Sky es una aplicación fullstack que integra mapas interactivos de 95 zonas de observación astronómica en Canarias, un asistente de IA con RAG sobre documentación del Instituto de Astrofísica de Canarias (IAC), un motor de puntuación de calidad del cielo en tiempo real, y herramientas para astrónomos aficionados y astrofotógrafos.

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Funcionalidades](#funcionalidades)
  - [Mapa Interactivo](#mapa-interactivo)
  - [Panel de Santuario](#panel-de-santuario)
  - [Asistente IA con RAG](#asistente-ia-con-rag)
  - [Sky Score](#sky-score)
  - [Fase Lunar](#fase-lunar)
  - [Catálogo Astronómico](#catálogo-astronómico)
  - [Experiencias de Usuario](#experiencias-de-usuario)
  - [Exportación de Datos](#exportación-de-datos)
  - [Clima en Tiempo Real](#clima-en-tiempo-real)
- [Roles del Sistema](#roles-del-sistema)
- [Seguridad](#seguridad)
- [API Reference](#api-reference)
- [Inicio Rápido](#inicio-rápido)
- [Usuarios Demo](#usuarios-demo)
- [Pruebas](#pruebas)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Colaboraciones](#colaboraciones)
- [Herramientas de IA Utilizadas](#herramientas-de-ia-utilizadas)
- [Backlogs Futuros](#backlogs-futuros)

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React + Vite + Tailwind CSS | 18 / 5 / 3.4 |
| **Backend** | Node.js + Express + Sequelize | 22 / 4 / 6 |
| **Base de datos** | PostgreSQL (Render) | 18 |
| **AI Service** | FastAPI + LangGraph + scikit-learn | Python 3.11 |
| **LLM** | Groq LLaMA 3.3 70B (fallback: OpenAI → RAG-only) | — |
| **Mapas** | Leaflet + React-Leaflet | 1.9 / 4 |
| **Internacionalización** | i18next | es, en, de |
| **Automatización** | n8n | — |
| **APIs externas** | OpenWeatherMap, NASA APOD | — |
| **Despliegue** | Vercel (frontend) + Render (backend + AI + DB) | — |

---

## Arquitectura

```
                          ┌──────────────────────┐
                          │    Vercel (React)     │
                          │ adastra-sky.vercel.app│
                          │  • ChatPage (IA)      │
                          │  • Dashboard          │
                          │  • Mapa interactivo   │
                          │  • Experiencias       │
                          │  • FAQ, Contacto      │
                          └──────────┬───────────┘
                                     │ JWT REST
                                     ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                Render — Backend (Express :5000)                  │
 │                                                                  │
 │  • Autenticación JWT (user/admin)     • CRUD experiencias       │
 │  • Proxy IA (120s timeout)            • Export CSV / GeoJSON    │
 │  • Proxy clima (OpenWeatherMap)       • Export PDF (pdfkit)     │
 │  • Rate limiting (4 niveles)          • Multer + Sharp imágenes │
 │  • Joi validation (register,contact)  • n8n webhook (API Key)   │
 │  • Eventos astronómicos               • CORS + Helmet seguridad │
 └──────┬───────────────────────────────────┬──────────────────────┘
        │ proxy /api/chat                    │ proxy /weather
        ▼                                    ▼
 ┌─────────────────────┐           ┌────────────────────┐
 │  Render — AI         │           │  OpenWeatherMap    │
 │  Service (FastAPI)   │           │     API            │
 │  • LangGraph agent   │           └────────────────────┘
 │  • RAG TF-IDF in-mem │
 │  • Groq LLaMA 70B    │
 │  • Sky Score (6 fac) │
 │  • ~512MB RAM        │
 └──────────┬───────────┘
            │
            ▼
 ┌─────────────────────┐
 │  Documentos IAC     │
 │  (6 docs markdown   │
 │   → TF-IDF chunks)  │
 └─────────────────────┘
```

### Flujo de una consulta al chat

```
Usuario → Frontend → Backend (proxy) → AI Service (FastAPI)
                                           │
                                     ┌─────┴──────┐
                                     │  1. RAG    │
                                     │  TF-IDF    │
                                     │  search    │
                                     └─────┬──────┘
                                           │ contexto
                                           ▼
                                     ┌─────────────┐
                                     │  2. Groq    │
                                     │  LLaMA 70B  │
                                     │  + RAG ctx  │
                                     └─────┬───────┘
                                           │
                             429/error? ───┤──→ OpenAI fallback
                                           │         │
                                           │    429/error?
                                           │         │
                                           │    ┌────┴────┐
                                           │    │ RAG-only│
                                           │    │ response│
                                           │    └─────────┘
                                           ▼
                                   Respuesta → Frontend
```

### Esquema de base de datos

```
users (id UUID PK, email, password_hash, role, first_name, last_name, ...)
  │
  ├── experiences (id UUID PK, user_id FK, zone_id, title, description, images JSONB)
  │
  ├── chat_history (id UUID PK, user_id FK, session_id, message, response, sources JSONB)
  │
  └── sky_quality_zones (id UUID PK, name, island, category, lat, lng, altitude, ...)
```

---

## Funcionalidades

### Mapa Interactivo

95 zonas de observación geolocalizadas en 8 islas + La Graciosa, implementadas con **Leaflet + React-Leaflet** sobre tiles CartoDB dark:

| Tipo | Cantidad |
|------|----------|
| Observatorios | 2 (Teide, Roque de los Muchachos) |
| Miradores astronómicos | 33 |
| Miradores paisajísticos | 60 |

**Características:**
- Filtros por isla y categoría con leyenda interactiva
- Marcadores personalizados con DivIcon por categoría
- Vuelo automático (`flyTo`, zoom 12, 1.2s) al seleccionar un mirador desde cualquier parte de la app
- Click en cualquier punto del mapa para abrir StreetView
- Panel lateral/bottom sheet con info detallada del santuario
- Optimizado para móvil con bottom sheet y overlay semitransparente

### Panel de Santuario

Al hacer clic en un marcador del mapa se abre un panel con:

- **Información general**: nombre, isla, altitud, descripción
- **Puntuaciones**: astro score, photo score, tourism score, global score
- **Clima en tiempo real**: temperatura, nubosidad, humedad, viento, visibilidad, presión (vía OpenWeatherMap)
- **StreetView**: integración con Google StreetView
- **Experiencias**: fotos y reseñas de otros usuarios, con carrusel de imágenes
- **Compartir experiencia**: formulario para subir fotos y descripciones

### Asistente IA con RAG

Agente **LangGraph** que utiliza **Groq LLaMA 3.3 70B** como LLM principal, con sistema de RAG ligero implementado con **TF-IDF + cosine similarity** en memoria (sin ChromaDB, sin PyTorch, sin sentence-transformers — optimizado para 512MB RAM).

**Fuentes documentales (IAC):**
1. Introducción a la astronomía en Canarias
2. Observatorio del Teide
3. Observatorio del Roque de los Muchachos
4. Ley 31/1988 del Cielo de Canarias
5. Astroturismo en Canarias
6. Eventos astronómicos

**Cadena de fallos:**
```
Groq LLaMA 70B → (429/error) → OpenAI GPT-4o-mini → (429/error) → RAG-only response
```

**Características:**
- RAG query en cada mensaje (top-5 documentos por similitud coseno)
- Inyección de contexto RAG directamente en el system prompt del LLM
- Multilingüe (es, en, de)
- Rate limiting manejado con mensajes amigables y fallback a documentos IAC
- Warm-up automático al cargar la página (ping `/api/chat/warmup` cada 45s)

### Sky Score

Sistema de puntuación de calidad del cielo implementado en dos capas independientes:

**Frontend** (`src/utils/scoring.js`): 3 scores compuestos por subfactores ponderados

| Score | Factores | Pesos |
|-------|----------|-------|
| **Astro** | Bortle, seeing, transparencia, altitud, nubosidad, humedad | 0.35 / 0.20 / 0.15 / 0.10 / 0.10 / 0.10 |
| **Photo** | Paisaje, orientación, composición, accesibilidad, Bortle | 0.25 / 0.20 / 0.20 / 0.15 / 0.20 |
| **Tourism** | Acceso, seguridad, servicios, parking | 0.30 / 0.25 / 0.25 / 0.20 |
| **Global** | Astro×0.5 + Photo×0.3 + Tourism×0.2 | — |

**AI Service** (`sky_engine/sky_score.py`): 6 factores meteorológicos con pesos

```
cloudiness (0.30) + light_pollution (0.30) + moon_phase (0.15)
+ wind (0.10) + humidity (0.10) + transparency (0.05)
```

### Fase Lunar

Algoritmo de cálculo en JavaScript puro basado en el período sinódico (29.53 días) desde la luna nueva de referencia J2000:

```js
getLunarPhase()  →  { phaseIndex: 0-7, illumination: 0-100%, age: días }
```

8 fases con nombres y emojis en 3 idiomas, iluminación calculada mediante coseno, animación de fase actual en el dashboard.

### Catálogo Astronómico

Datos completos en `src/data/astronomicalData.js`:

- **88 constelaciones**: área exacta (grados cuadrados), número de estrellas, magnitud aparente, objetos Messier, mitología
- **9 planetas**: masa, diámetro, distancia al Sol, período orbital, visibilidad estacional desde Canarias
- **12 eventos astronómicos** (2025-2028): lluvias de estrellas (Cuadrántidas, Perseidas, Gemínidas...), eclipses solares y lunares, oposiciones planetarias

### Experiencias de Usuario

Los usuarios pueden compartir sus experiencias astronómicas:

- Subida de múltiples imágenes (hasta 10MB, procesadas con Sharp)
- Carrusel de imágenes en las tarjetas y en el panel del mapa
- Botón "Ver ubicación" que navega al mapa y vuela al mirador exacto
- Eliminación de experiencias propias
- Vista de grid responsive (1-3 columnas según pantalla)
- Rate limiting: 10 publicaciones por hora

### Exportación de Datos

| Formato | Librería | Uso |
|---------|----------|-----|
| **CSV** | — | Abrir en Excel, Google Sheets |
| **GeoJSON** | — | Cargar en QGIS, Google Earth, Mapbox |
| **PDF** | pdfkit (server-side) | Informe imprimible con header brandeado, resumen estadístico y zonas organizadas por isla |

### Clima en Tiempo Real

Integración con **OpenWeatherMap** para mostrar condiciones actuales en cada mirador:
temperatura, sensación térmica, nubosidad, humedad, viento, visibilidad y presión atmosférica.

---

## Roles del Sistema

| Rol | Permisos | Backend |
|-----|----------|---------|
| `user` | Dashboard, mapa, chat IA, experiencias propias, perfil | — |
| `admin` | Todo lo anterior + CRUD zonas, gestión usuarios, panel admin | `requireAdmin` middleware (JWT role check sin DB query) |

El rol se asigna en el registro (`user` por defecto) o mediante seed. No existe endpoint público de promoción a admin.

---

## Seguridad

- **JWT** con payload `{ id, email, role, iat, exp }`; middleware `requireAdmin` sin consulta DB
- **Tokens** gestionados exclusivamente via React Context (sin `localStorage` directo)
- **Rate limiting** escalonado (express-rate-limit):
  - Auth: 10 req / 15 min
  - Contacto: 5 req / hora
  - Admin: 60 req / 15 min
  - Experiences POST: 10 req / hora
- **Validación** Joi en registro (password: 8+ chars, mayúscula, minúscula, número) y contacto
- **Sanitización** de errores: `errorHandler` elimina nombres de campo y mensajes internos en `NODE_ENV=production`
- **Imágenes**: Multer (10MB max) + Sharp para procesado
- **SSL** PostgreSQL: `rejectUnauthorized: false` para certificados autofirmados de Render
- **Doble autenticación**: JWT para usuarios, API Key para n8n
- **Helmet** + CORS configurado por origen

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
npm run dev          # http://localhost:5173
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py                    # http://localhost:8001
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
| POST | `/auth/register` | ✗ | Registro (8+ chars, mayúscula, minúscula, número) |
| POST | `/auth/login` | ✗ | Login (devuelve JWT) |
| GET | `/auth/profile` | ✓ | Perfil del usuario |
| PATCH | `/auth/profile` | ✓ | Actualizar perfil |

</details>

<details>
<summary><strong>Zonas de observación</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/sky/zones` | ✗ | Todas las zonas activas |
| GET | `/sky/zones/geojson` | ✗ | Exportar GeoJSON |
| GET | `/sky/zones/csv` | ✗ | Exportar CSV |
| GET | `/sky/zones/pdf` | ✗ | Exportar PDF (pdfkit) |
| GET | `/sky/zones/query` | ✗ | Búsqueda avanzada con filtros |
| GET | `/sky/zones/recommend/tonight` | ✗ | Mejores zonas para esta noche |
| GET | `/sky/zones/recommend/photo` | ✗ | Mejores para astrofotografía |
| GET | `/sky/zones/:id` | ✗ | Detalle de zona |
| GET | `/sky/zones/islands/:island` | ✗ | Zonas por isla |
| GET | `/sky/zones/category/:category` | ✗ | Zonas por categoría |

</details>

<details>
<summary><strong>Chat, Score, Experiencias, Clima</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/chat` | ✓ | Enviar mensaje al agente IA (120s timeout) |
| GET | `/api/chat/history/:session_id` | ✓ | Historial de conversaciones |
| GET | `/api/chat/warmup` | ✗ | Despertar el AI Service |
| POST | `/sky/score` | API Key | Guardar score (desde n8n) |
| GET | `/sky/score/latest` | ✗ | Último score registrado |
| GET | `/sky/score/history` | ✗ | Historial de scores |
| GET | `/experiences` | ✗ | Experiencias de usuarios |
| POST | `/experiences` | ✓ | Crear experiencia (10/hora) |
| DELETE | `/experiences/:id` | ✓ | Eliminar experiencia propia |
| GET | `/weather/current` | ✗ | Clima por coordenadas |
| GET | `/events` | ✗ | Eventos astronómicos |
| GET | `/islands` | ✗ | Información de todas las islas |
| POST | `/contact` | ✗ | Formulario de contacto (5/hora) |

</details>

<details>
<summary><strong>Administración</strong></summary>

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/zones` | Admin | Listar zonas (95) |
| POST | `/admin/zones` | Admin | Crear zona |
| PUT | `/admin/zones/:id` | Admin | Actualizar zona (lat, lng, alt...) |
| DELETE | `/admin/zones/:id` | Admin | Eliminar zona |
| GET | `/admin/users` | Admin | Listar usuarios |
| GET | `/admin/users/:id` | Admin | Detalle de usuario |
| PUT | `/admin/users/:id` | Admin | Actualizar usuario |
| DELETE | `/admin/users/:id` | Admin | Desactivar usuario |

</details>

### AI Service (`/`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat con agente LangGraph + RAG |
| POST | `/api/sky-score` | Calcular Sky Score (0-10) |
| GET | `/api/what-to-see` | Recomendación astronómica nocturna |

---

## Usuarios Demo

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `demo@adastra.sky` | `Demo1234` | user |

> El rol `user` se asigna automáticamente al registrarse. Para crear un admin, ejecutar `npm run seed` o asignar directamente en la base de datos.

---

## Pruebas

```bash
# Backend — 24 tests (Jest + Supertest)
cd backend && npm test

# Frontend — 2 tests (Vitest)
cd frontend && npm test

# AI Service
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

Infraestructura declarativa en `render.yaml`.  
Ver `docs/13_MANUAL_INSTALACION.md` para instrucciones detalladas.

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/01_INTRODUCCION.md` | Introducción al proyecto |
| `docs/02_ARQUITECTURA.md` | Arquitectura del sistema |
| `docs/03_BACKEND.md` | Documentación del backend |
| `docs/04_FRONTEND.md` | Documentación del frontend |
| `docs/05_AI_SERVICE.md` | Documentación del AI Service |
| `docs/06_BASE_DE_DATOS.md` | Esquema de base de datos |
| `docs/07_DESPLIEGUE_Y_SEGURIDAD.md` | Despliegue y seguridad |
| `docs/08_FUTURAS_Y_ANEXOS.md` | Funcionalidades futuras |
| `docs/09_LIMPIEZA_ARCHIVOS.md` | Auditoría de archivos no utilizados |
| `docs/10_AUDITORIA_TECNICA.md` | Auditoría técnica |
| `docs/11_PRESENTACION_FINAL.md` | Presentación del proyecto |
| `docs/12_MANUAL_USUARIO.md` | Manual de usuario |
| `docs/13_MANUAL_INSTALACION.md` | Guía de instalación y despliegue |
| `docs/api_specification.md` | Especificación detallada de la API |
| `docs/deployment_guide.md` | Guía de despliegue en producción |
| `docs/postman/AdAstraSky.postman_collection.json` | Colección de Postman |

---

## Colaboraciones

### Senderos Canarios

AdAstra Sky colabora con **Senderos Canarios**, un proyecto que descubre rutas de senderismo en las Islas Canarias. Muchos de los miradores paisajísticos y astronómicos de nuestra plataforma están conectados por senderos que puedes explorar.

[Descubre rutas que pasan por estos miradores](https://senderoscanarios.vercel.app)

---

## Herramientas de IA Utilizadas

Este proyecto se desarrolló con asistencia de inteligencia artificial como parte del flujo de trabajo:

| Herramienta | Uso |
|-------------|-----|
| **OpenCode** | Asistente principal de codificación, refactorización, depuración y gestión del proyecto |
| **Claude (Anthropic)** | Generación de documentación técnica, revisión de arquitectura y diseño de componentes |
| **ChatGPT (OpenAI)** | Soporte en algoritmos astronómicos (fase lunar, sky score), generación de datos de prueba |
| **Gemini (Google)** | Validación de documentación técnica y apoyo en estructura de presentación |

Todas las decisiones de implementación, revisión de seguridad y despliegue fueron supervisadas y validadas por el desarrollador.

---

## Backlogs Futuros

<details>
<summary><strong>Corto plazo</strong></summary>

- [ ] **Lista de favoritos**: Guardar y gestionar santuarios estelares favoritos
- [ ] **Modo oscuro completo**: Consistencia del tema oscuro en todas las secciones
- [ ] **Notificaciones push**: Alertas sobre eventos astronómicos (eclipses, lluvias de estrellas)
- [ ] **Galería de astrofotografía**: Sección dedicada a fotografías del cielo canario
- [ ] **Tests del AI Service**: Pruebas unitarias y de integración para el servicio Python

</details>

<details>
<summary><strong>Medio plazo</strong></summary>

- [ ] **Sistema de reservas**: Integración con calendario para visitas a observatorios
- [ ] **Autenticación OAuth**: Login con Google, GitHub y Apple
- [ ] **API pública**: Documentación Swagger/OpenAPI para desarrolladores externos
- [ ] **App móvil**: Versión nativa iOS y Android con funcionalidades offline
- [ ] **Recomendaciones personalizadas**: ML que aprenda de preferencias del usuario
- [ ] **Realidad aumentada**: Superposición de constelaciones vía cámara

</details>

<details>
<summary><strong>Largo plazo</strong></summary>

- [ ] **Community Hub**: Red social de astrónomos aficionados con foros y eventos
- [ ] **Monetización**: Freemium con pronósticos avanzados y alertas personalizados
- [ ] **Integración con telescopios**: Conexión ASCOM/INDI para control remoto
- [ ] **Gemelos digitales**: Simulación 3D del cielo canario con WebGL
- [ ] **Expansión geográfica**: Chile, Hawái, Namibia
- [ ] **Dashboard científico**: Herramientas de análisis para investigadores del IAC

</details>

---

## Licencia

MIT
