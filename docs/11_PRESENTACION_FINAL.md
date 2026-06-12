# AdAstra Sky — Presentación Final

> **Proyecto Capstone Bootcamp** | Junio 2026
> Plataforma de Astroturismo Premium para las Islas Canarias

---

## 1. ¿Qué es AdAstra Sky?

Plataforma web que promueve el astroturismo en Canarias integrando:
- **Mapa interactivo** con 95+ zonas de observación astronómica
- **Asistente IA** conversacional experto en astronomía canaria
- **Datos en tiempo real**: calidad del cielo, clima, eventos astronómicos
- **Comunidad**: experiencias de observación compartidas por usuarios
- **Calendario** de lluvias de estrellas, eclipses, conjunciones

---

## 2. Problema que Resuelve

| Problema | Solución AdAstra |
|----------|-----------------|
| Información dispersa sobre miradores astronómicos | Mapa interactivo con 95+ zonas geolocalizadas, filtros por isla/categoría/puntuación |
| ¿Dónde ver las estrellas esta noche? | Recomendaciones inteligentes por condiciones actuales (tiempo, fase lunar, Bortle) |
| ¿Qué hay en el cielo ahora? | Datos astronómicos en vivo + asistente IA |
| Falta de guía experta | Agente LangChain con RAG sobre documentos IAC |
| Dificultad para planificar | Calendario de eventos + predicciones de calidad del cielo |

---

## 3. Arquitectura

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   VERCEL     │────▶│    RENDER        │────▶│   RENDER DB      │
│  Frontend    │     │   Backend        │     │   PostgreSQL     │
│  React + Vite│     │ Node + Express   │     │   (Neon)         │
│  Tailwind    │     │ Sequelize ORM    │     │                  │
│  Leaflet Map │     │ JWT Auth         │     └──────────────────┘
└──────────────┘     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   RENDER AI      │
                     │   FastAPI        │
                     │   LangGraph      │
                     │   RAG (TF-IDF)   │
                     │   Groq/OpenAI    │
                     └──────────────────┘
```

- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3
- **Backend:** Node.js 22 + Express 4 + Sequelize 6
- **IA:** Python 3.11 + FastAPI + LangGraph + LangChain
- **DB:** PostgreSQL (Render Free Tier)
- **Despliegue:** Vercel (frontend) + Render (backend + AI + DB)
- **Coste:** $0 (todo en free tier)

---

## 4. Tecnologías

### Frontend
| Tecnología | Propósito |
|-----------|-----------|
| React 18 + Vite 5 | SPA moderna con HMR ultrarrápido |
| Tailwind CSS 3 | Estilos utility-first responsive |
| React Router 6 | Enrutamiento SPA con guards de auth |
| Leaflet + react-leaflet | Mapas interactivos con 95+ marcadores |
| Framer Motion | Animaciones fluidas |
| i18next | Internacionalización ES/EN/DE |
| Lucide React | Iconos SVG modernos |

### Backend
| Tecnología | Propósito |
|-----------|-----------|
| Express 4 | Framework REST |
| Sequelize 6 | ORM PostgreSQL con migraciones |
| JWT (jsonwebtoken) | Autenticación stateless |
| Joi | Validación de schemas |
| Helmet | Seguridad HTTP headers |
| express-rate-limit | Rate limiting por IP |
| Multer + Sharp | Upload + procesamiento de imágenes a WebP |
| Swagger | Documentación OpenAPI 3.0 |

### IA
| Tecnología | Propósito |
|-----------|-----------|
| FastAPI | Microservicio Python asíncrono |
| LangGraph | StateGraph para flujo de agente |
| LangChain | Tool calling + LLM orchestration |
| Groq (LLaMA 3.3 70B) | LLM principal (gratuito, 30 req/min) |
| OpenAI (GPT-4o Mini) | Fallback si Groq no disponible |
| scikit-learn TF-IDF | RAG ligero en memoria (sin ChromaDB) |
| 6 documentos IAC | Fuente de conocimiento astronómico |

---

## 5. Funcionalidades Principales

### 🌍 Mapa Interactivo
- 95+ zonas de observación en 8 islas
- Filtros por isla, categoría, puntuación
- Marcadores con código de color por tipo
- Panel lateral con información detallada
- Street View integrado
- Cálculo de puntuación astro/foto/turismo

### 🤖 Asistente IA (AdAstra)
- Conversación contextual con RAG sobre documentos IAC
- 5 herramientas: RAG, observatorios, clima, constelaciones, sky score
- Cadena de fallback: Groq → OpenAI → RAG offline
- Respuestas bilingües (ES/EN)
- Historial por sesión

### 📊 Sky Score
- Puntuación 0-10 basada en 6 factores
- Factor astronómico, fotográfico y turístico
- Datos en tiempo real (clima, luna, contaminación lumínica)

### 📅 Calendario Astronómico
- Eventos generados dinámicamente (NASA/JPL data)
- Lluvias de estrellas, eclipses, conjunciones, superlunas
- Galería APOD (Astronomy Picture of the Day)

### 👥 Comunidad
- Experiencias de observación con fotos
- Perfiles de usuario con historial
- Panel de administración

---

## 6. IA / RAG / Groq

### Flujo del Agente

```
Usuario
  │
  ▼
┌─────────────┐   Inyecta RAG en system prompt
│  Agent Node │──▶ Busca en 6 documentos IAC (TF-IDF)
│  (LLM)      │   Añade contexto: "INFORMACIÓN DE DOCUMENTOS IAC:"
└──────┬──────┘
       │
       ├── ¿Tool Call? ──▶ Tools Node ──▶ Agent Node
       │    • search_rag_documents: consulta RAG adicional
       │    • get_observatory_info: datos de observatorios
       │    • get_weather_conditions: clima actual
       │    • get_constellation_info: datos de constelaciones
       │    • calculate_sky_score: calidad del cielo
       │
       └── Respuesta final ──▶ Usuario
```

### Decisión Clave: RAG Ligero
- **NO** ChromaDB / sentence-transformers (no caben en 512MB RAM)
- **NO** embeddings vectoriales
- **SÍ** TF-IDF + cosine similarity con scikit-learn
- 6 documentos IAC → ~200 chunks → matching en milisegundos

### Cadena de Fallback
1. **Groq** (LLaMA 3.3 70B) — 30 req/min, gratuito
2. **OpenAI** (GPT-4o Mini) — si falla Groq
3. **RAG offline** — si no hay LLM disponible, responde solo con documentos

---

## 7. Retos Técnicos

### Reto 1: AI Service en Render Free Tier (512MB RAM)
- **Problema:** ChromaDB + sentence-transformers requieren ~2GB RAM
- **Solución:** TF-IDF in-memory con scikit-learn (todo en <100MB RAM)
- **Resultado:** RAG funcional en 512MB sin swap

### Reto 2: Cold Start en Render Free Tier (~30s)
- **Problema:** Render duerme el servicio tras 15min de inactividad
- **Solución:** Timeout de 120s en proxy backend; warm-up con ping automático
- **Resultado:** El usuario espera ~30s en el primer mensaje, luego responde rápido

### Reto 3: Rate Limiting de Groq (30 req/min)
- **Problema:** Modelo gratuito LLaMA 3.3 70B limitado a ~30 requests/minuto
- **Solución:** Cadena de fallback a OpenAI + caché de respuestas frecuentes
- **Resultado:** Usuarios gratuitos nunca ven error de rate limit

### Reto 4: HuggingFace Inestable
- **Problema:** Token HF expirado, modelos inestables, retornos 403
- **Solución:** Eliminado del flujo principal; mantenido solo como fallback teórico
- **Resultado:** Sistema más estable sin dependencia de HF

### Reto 5: SSL Self-Signed en Render PostgreSQL
- **Problema:** Render usa certificados auto-firmados → `DEPTH_ZERO_SELF_SIGNED_CERT`
- **Solución:** `rejectUnauthorized: false` configurable vía env var
- **Resultado:** Conexión DB exitosa en producción

### Reto 6: Datos Geoespaciales para 95+ Zonas
- **Problema:** Coordenadas, alturas, categorías, puntuaciones para cada zona
- **Solución:** Seed masivo desde JSON con 20+ campos por zona
- **Resultado:** API devuelve GeoJSON y CSV exportable

---

## 8. Decisiones Clave

| Decisión | Alternativa | Elegida | Motivo |
|----------|------------|---------|--------|
| RAG en memoria | ChromaDB + vectores | TF-IDF scikit-learn | Cabe en 512MB RAM |
| JWT en localStorage | httpOnly cookies | localStorage | Simplicidad MVP (consciente del riesgo) |
| Monorepo | Repos separados | Monorepo | Un solo repo, deploy coordinado |
| render.yaml | Deploy manual | Blueprint Render | Infraestructura como código |
| Sin test coverage total | Más tests | Tests mínimos (5 suites) | Prioridad: features funcionales |
| Seed desde JSON | Migraciones SQL | sync() + seed JSON | Rápido para MVP, schema vía Sequelize |
| Sin Redis | Caché en RAM | Sin caché | Free tier no tiene Redis |

---

## 9. Escalabilidad

### Vertical (misma máquina, más recursos)
- Backend: Node.js maneja bien conexiones concurrentes con event loop
- DB: Índices en todos los campos de búsqueda (isla, categoría, Bortle, scores)
- AI: TF-IDF escala a ~1000 documentos antes de necesitar optimización

### Horizontal (más máquinas)
- Backend: Stateless (JWT) → múltiples instancias sin sesión compartida
- DB: Read replicas para zonas (muchas lecturas, pocas escrituras)
- AI: Cola de mensajes para rate limiting de Groq
- Frontend: CDN (Vercel Edge) para assets estáticos

### Limitaciones actuales
- Sesiones en localStorage (no escalan a múltiples dispositivos)
- Sin caché Redis (cada request consulta DB)
- AI service singe-instancia (limitado a 30 req/min Groq)

---

## 10. Mejoras Futuras

### Corto Plazo
- [ ] Migrar JWT a httpOnly cookies
- [ ] Añadir DOMPurify para sanitización HTML
- [ ] Tests de integración completos
- [ ] CI/CD con GitHub Actions

### Medio Plazo
- [ ] Modo offline PWA
- [ ] Notificaciones push para eventos astronómicos
- [ ] Sistema de reservas para visitas guiadas
- [ ] Foro de comunidad

### Largo Plazo
- [ ] App móvil (React Native)
- [ ] Realidad aumentada para identificar constelaciones con la cámara
- [ ] Panel de control para gestores de turismo
- [ ] API pública para terceros (con API keys)
- [ ] Integración con telescopios remotos

---

## 11. Valor Diferencial

| Característica | Competencia | AdAstra Sky |
|---------------|-------------|-------------|
| Mapa zonas | Genérico (Google Maps) | 95+ zonas curadas con datos científicos |
| Asistente IA | ChatGPT genérico | Experto en astronomía canaria con RAG IAC |
| Sky Score | No disponible | Algoritmo propio con 6 factores |
| Coste | Apps de pago | Gratuito (free tiers) |
| Datos | Parciales | 6 documentos IAC + NASA/JPL + OpenWeather |
| Idioma | Solo español | ES/EN/DE |
| Comunidad | No | Experiencias de usuario + galería |

---

## Demo Flow

1. **Landing** → Hero con animación espacial
2. **Registro/Login** → Formulario inmersivo con selector de idioma
3. **Dashboard** → Resumen con score del día, próximos eventos, clima
4. **Explorar Mapa** → 95+ zonas con filtros y panel de detalle
5. **Observatorios** → Teide + Roque de los Muchachos con galería
6. **Chat IA** → Pregunta sobre cualquier tema astronómico de Canarias
7. **Calendario** → Eventos astronómicos + APOD gallery
8. **Perfil** → Configuración, experiencias, galería personal
