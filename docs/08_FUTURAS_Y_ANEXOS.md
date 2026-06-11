# Capítulo 8: Futuras Implementaciones

## 8.1 Corto Plazo (Post-Bootcamp)

### 8.1.1 Rotación de API Keys
Generar nuevas keys en Groq, HuggingFace, OpenWeather y NASA, actualizar en Render dashboard.

### 8.1.2 Freshdesk (OpenAPI) — Documentación Interactiva
Corregir los 2 tests fallidos de health/api para que reflejen la respuesta actual del servidor.

### 8.1.3 Pruebas de Integración
- Tests que verifiquen el proxy al AI Service (mockeando la respuesta)
- Tests de carga para medir tiempos de respuesta
- Tests E2E con Playwright/Cypress

### 8.1.4 Mejora del RAG Offline
- Añadir más documentos IAC (normativa, guías de observación)
- Implementar ranking por relevancia mejorado
- Mostrar fragmentos más relevantes según las palabras clave exactas

## 8.2 Medio Plazo (3-6 meses)

### 8.2.1 Autenticación Robusta
- **Refresh tokens** con rotación
- **Cookies httpOnly** en lugar de localStorage (protección XSS)
- **OAuth social** (Google, GitHub)
- **2FA** opcional para cuentas admin

### 8.2.2 WebSockets para Chat
Reemplazar REST polling por WebSocket (Socket.io) para:
- Respuestas en tiempo real (streaming de tokens del LLM)
- Indicador de "escribiendo..." preciso
- Menor latencia percibida

### 8.2.3 Sistema de Caché
- **Redis** para:
  - Cachear respuestas del AI Service (reducir costes de API)
  - Cachear consultas frecuentes (zonas, eventos)
  - Sesiones de usuario (logout en tiempo real)
  - Rate limiting distribuido

### 8.2.4 Notificaciones en Tiempo Real
- **Notificaciones push** para:
  - Mejores condiciones de observación (sky score alto)
  - Próximos eventos astronómicos
  - Respuesta a mensajes de contacto
  - Nuevas experiencias en zonas seguidas

### 8.2.5 Perfiles de Usuario Avanzados
- Biografía, foto de perfil, preferencias astronómicas
- Zonas favoritas y seguimiento
- Historial de observaciones (log personal)
- Logros y gamificación (noches observadas, constelaciones vistas)

## 8.3 Largo Plazo (6-12 meses)

### 8.3.1 App Móvil Nativa
- **React Native** o **Flutter** para iOS/Android
- Cámara AR para identificar constelaciones en tiempo real
- Notificaciones push nativas
- Modo offline con datos cacheados

### 8.3.2 Suscripciones Premium
- **Stripe** integración para:
  - Plan Gratuito: funcionalidades básicas, 10 consultas al chat/día
  - Plan Premium: consultas ilimitadas, datos históricos, alerts personalizados
  - Plan Pro: API access, datos en bruto, integración con observatorios

### 8.3.3 Marketplace de Experiencias
- **Guías locales** que ofrecen tours de observación
- **Sistema de reservas** con pagos integrados
- **Valoraciones verificadas** de experiencias
- **Itinerarios** personalizados según condiciones del cielo

### 8.3.4 API Pública
- **API Key management** para desarrolladores externos
- **Documentación interactiva** (Swagger/OpenAPI)
- **Rate limiting** por tiers (gratuito / pro)
- **Webhooks** para eventos astronómicos

### 8.3.5 Gemelos Digitales (Digital Twins)
- Réplica virtual de los cielos canarios en 3D
- Simulación de condiciones de observación en tiempo real
- Predicciones a 7 días con machine learning
- Visualización de contaminación lumínica histórica

### 8.3.6 Integración con Telescopios
- API para control remoto de telescopios en observatorios asociados
- Programación de sesiones de observación automatizada
- Captura y análisis de imágenes astronómicas

## 8.4 Mejoras Técnicas Continuas

| Área | Mejora | Prioridad |
|---|---|---|
| Rendimiento | Implementar caché Redis | Alta |
| Seguridad | Migrar a cookies httpOnly | Alta |
| Testing | Tests E2E + integración | Alta |
| DevOps | CI/CD con GitHub Actions | Media |
| Monitorización | Sentry/LogRocket para errores | Media |
| SEO | SSR con Next.js o similar | Media |
| Accesibilidad | Auditoría WCAG 2.1 | Media |
| Performance | Lazy loading + code splitting | Baja |
| PWA | Service worker + offline mode | Baja |

---

# Anexos

## Anexo A: Glosario

| Término | Definición |
|---|---|
| **Astroturismo** | Turismo especializado en la observación del cielo nocturno y fenómenos astronómicos |
| **Bortle Scale** | Escala de 9 niveles que mide la contaminación lumínica (1=cielo perfecto, 9=cielo urbano) |
| **IAC** | Instituto de Astrofísica de Canarias, organismo que gestiona los observatorios del archipiélago |
| **Ley del Cielo** | Ley 31/1988 de protección de la calidad astronómica de los observatorios canarios |
| **ORM** | Observatorio del Roque de los Muchachos (La Palma) |
| **OT** | Observatorio del Teide (Tenerife) |
| **RAG** | Retrieval Augmented Generation — recuperación de información relevante antes de generar respuesta |
| **TF-IDF** | Term Frequency-Inverse Document Frequency — algoritmo de ponderación de términos para búsqueda textual |
| **Sky Score** | Puntuación compuesta (0-10) de la calidad del cielo basada en múltiples factores |
| **LangGraph** | Framework para construir aplicaciones con estados y grafos sobre LangChain |
| **StateGraph** | Grafo de estados que define el flujo de un agente LangGraph |
| **Cold Start** | Retardo inicial cuando un servicio serverless se activa tras estar dormido |
| **Glassmorphism** | Efecto visual con transparencia, desenfoque y bordes semitransparentes |

## Anexo B: Comandos Útiles

### Desarrollo Local
```bash
# Instalar dependencias
cd backend && npm install
cd frontend && npm install
cd ai-service && pip install -r requirements.txt

# Iniciar servicios (modo dev)
npm run dev                    # Todos los servicios (raíz)
cd backend && npm run dev      # Solo backend :5000
cd frontend && npm run dev     # Solo frontend :3000
uvicorn main:app --reload --port 8001  # Solo AI Service

# Tests
cd backend && npm test         # Backend tests (22/24 pasan)
cd frontend && npm test        # Frontend tests

# Lint
cd backend && npm run lint
cd frontend && npm run lint

# Seeds
cd backend && npm run seed     # Crea zonas iniciales
cd backend && npm run seed:users  # Crea usuarios demo
```

### Git
```bash
# Push con deploy automático
git add -A
git commit -m "descripción"
git push

# Ver estado
git status
git log --oneline -10
```

### Producción (Render + Vercel)
```bash
# Verificar estado del AI Service
curl https://adastra-sky-ai.onrender.com/health

# Verificar configuración
curl https://adastra-sky-ai.onrender.com/debug/config

# Verificar backend
curl https://aadastra-sky-backend.onrender.com/health

# Probar chat
curl -X POST https://aadastra-sky-backend.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message":"¿Qué es el Observatorio del Teide?"}'
```

## Anexo C: Referencia Rápida de API

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/register | No | Registro de usuario |
| POST | /api/auth/login | No | Inicio de sesión |
| GET | /api/auth/profile | JWT | Perfil del usuario |
| GET | /api/sky/zones | No | Zonas de observación |
| GET | /api/sky/today | No | Mejores zonas hoy |
| GET | /api/sky/scores | No | Scores de una zona |
| POST | /api/chat | JWT | Enviar mensaje al chat IA |
| GET | /api/chat/history/:sid | JWT | Historial de chat |
| GET | /api/events | No | Eventos astronómicos |
| GET | /api/weather/:island | No | Clima por isla |
| GET | /api/islands | No | Lista de islas |
| POST | /api/contact | No | Formulario de contacto |
| GET | /api/experiences | No | Experiencias de usuarios |
| POST | /api/sky-score | No | Calcular sky score |
| GET | /health | No | Health check backend |
| GET | /api | No | Info de la API |

**Headers comunes:**
- `Content-Type: application/json` (siempre)
- `Authorization: Bearer <token>` (cuando requiere auth)

## Anexo D: Archivos de Datos del Frontend

| Archivo | Contenido | Tamaño |
|---|---|---|
| `santuariosData.js` | 92+ miradores con coordenadas exactas | ~15KB |
| `astronomicalData.js` | 88 constelaciones, planetas, eventos | ~12KB |
| `constellations.json` | 88 constelaciones con visibilidad por isla | ~8KB |
| `islands.json` | Metadatos de 8 islas | ~3KB |
| `islas.json` | Nombres en español | ~2KB |
| `events.json` | Eventos astronómicos anuales | ~5KB |
| `excursions.json` | Excursiones recomendadas | ~4KB |
| `lightPollution.json` | Áreas de contaminación lumínica | ~6KB |
| `observationPoints.json` | Puntos de observación adicionales | ~4KB |
| `weather.json` | Datos climáticos por isla | ~3KB |

## Anexo E: Licencias y Atribuciones

- **Mapas**: OpenStreetMap contributors, CartoDB dark tiles
- **Iconos**: Lucide React (MIT license)
- **Imágenes**: Observatorio del Roque de los Muchachos, Observatorio del Teide — IAC
- **Documentos IAC**: Contenido educativo del Instituto de Astrofísica de Canarias
- **API Meteorológica**: OpenWeatherMap (CC BY-SA 4.0)
- **API Astronómica**: NASA API (free tier)
- **LLMs**: Groq (LLaMA 3.3), HuggingFace (Mistral 7B) — uso educativo
