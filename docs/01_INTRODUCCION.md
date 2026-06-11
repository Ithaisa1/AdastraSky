# Capítulo 1: Introducción

## 1.1 Visión del Proyecto

**AdAstra Sky** es una plataforma web de astroturismo premium diseñada para promover y facilitar la observación astronómica en las Islas Canarias, uno de los mejores destinos del mundo para la observación del cielo nocturno gracias a la Ley del Cielo (Ley 31/1988) que protege la calidad astronómica del archipiélago.

La plataforma integra:
- **Información geoespacial** de más de 70 miradores y zonas de observación
- **Datos astronómicos** en tiempo real y predicciones
- **Agente de IA conversacional** especializado en astronomía canaria
- **Sistema de puntuación de calidad del cielo** (Sky Score)
- **Comunidad de usuarios** con experiencias y valoraciones
- **Calendario de eventos astronómicos**

## 1.2 Objetivos

### Objetivos Funcionales
1. Proporcionar un mapa interactivo con todos los puntos de observación de Canarias
2. Calcular la calidad del cielo en tiempo real basado en múltiples factores
3. Ofrecer un asistente IA experto en astronomía canaria
4. Gestionar usuarios con roles (user/admin)
5. Mostrar eventos astronómicos y condiciones meteorológicas
6. Permitir a los usuarios compartir experiencias de observación

### Objetivos Técnicos
1. Arquitectura de microservicios (backend Node.js + AI Service Python)
2. Despliegue en infraestructura cloud gratuita (Render + Vercel)
3. Base de datos PostgreSQL con Sequelize ORM
4. Frontend responsive mobile-first con React + Tailwind
5. RAG ligero sin dependencias pesadas (TF-IDF en memoria)
6. Múltiples proveedores de IA con cadena de fallback

## 1.3 Stack Tecnológico

### Backend (API REST)
| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | 22+ | Runtime |
| Express | 4.18 | Framework web |
| Sequelize | 6.35 | ORM PostgreSQL |
| PostgreSQL | 18 | Base de datos |
| JWT (jsonwebtoken) | 9.0 | Autenticación |
| Joi | 17.12 | Validación |
| Swagger (OpenAPI) | 3.0 | Documentación API |
| Helmet | 7.1 | Seguridad HTTP |
| Morgan | 1.10 | Logging |

### Frontend (SPA)
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.4 | Build tool |
| Tailwind CSS | 3.4 | Estilos |
| React Router | 6.26 | Routing |
| Leaflet | 1.9 | Mapas |
| i18next | 23.12 | Internacionalización |
| Framer Motion | 11.5 | Animaciones |
| Recharts | 2.12 | Gráficos |
| Axios | 1.7 | HTTP client |
| React Hook Form | 7.53 | Formularios |

### AI Service (Microservicio Python)
| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.115 | Framework web |
| LangGraph | 0.3 | Framework de agentes |
| LangChain | 0.3 | Framework LLM |
| scikit-learn | 1.3 | TF-IDF Vectorizer |
| Uvicorn | 0.34 | ASGI server |

### Proveedores de IA (por orden de prioridad)
1. **Groq** (LLaMA 3.3 70B) — principal
2. **OpenAI** (GPT-4o-mini) — primer fallback
3. **Hugging Face** (Mistral 7B) — segundo fallback
4. **RAG offline** (TF-IDF + documentos IAC) — fallback final

### Infraestructura Cloud
| Servicio | Propósito | Plan |
|---|---|---|
| Render | Backend + AI Service + PostgreSQL | Free |
| Vercel | Frontend SPA | Free |
| GitHub | Repositorio + CI/CD | Free |

## 1.4 Puertos y URLs

| Servicio | Local | Producción |
|---|---|---|
| Frontend | `http://localhost:3000` | `https://adastra-sky.vercel.app` |
| Backend API | `http://localhost:5000` | `https://aadastra-sky-backend.onrender.com` |
| AI Service | `http://localhost:8001` | `https://adastra-sky-ai.onrender.com` |
| PostgreSQL | `localhost:5432` | Neon (Render) |

## 1.5 Flujo de Datos (Alto Nivel)

```
[Usuario] → Frontend (Vercel) → Backend (Render) → AI Service (Render)
                                      │                    │
                                      ▼                    ▼
                                PostgreSQL         IAC Documents
                                (Neon)             (RAG TF-IDF)
```

**Flujo del Chat (detallado):**
```
Usuario escribe → ChatPage.jsx → POST /api/chat (Backend)
  → Backend valida JWT + mensaje
  → POST ${AI_SERVICE_URL}/api/chat (proxy)
    → AI Service: FastAPI → LangGraph Agent
      → _get_models() → Groq/OpenAI/HF (fallback chain)
      → Si todos fallan → _simple_rag_response()
        → TF-IDF similarity search en 6 documentos IAC
      → Respuesta estructurada
    ← AI Service responde
  ← Backend guarda en ChatHistory
  ← Frontend muestra respuesta
```

## 1.6 Decisiones Técnicas Clave

### ¿Por qué microservicios?
Separar el agente de IA (Python/LangChain) del backend Node.js permite:
- Escalar cada servicio independientemente
- Usar el mejor lenguaje para cada tarea (Python para IA, Node para API)
- Aislar la complejidad del agente del resto de la aplicación
- Posible sustitución del agente sin afectar al backend

### ¿Por qué RAG ligero (TF-IDF) en vez de ChromaDB/embeddings?
Los 6 documentos IAC pesan solo ~7.8KB total. ChromaDB con sentence-transformers requería ~1GB de RAM adicional, incompatible con el plan gratuito de Render (512MB). TF-IDF en memoria con scikit-learn cumple sobradamente.

### ¿Por qué fallback chain de LLMs?
Un solo proveedor de IA introduce un punto único de fallo. La cadena Groq → OpenAI → HuggingFace → RAG offline garantiza que el chat siempre responda aunque fallen todos los LLMs.

### ¿Por qué localStorage para el token JWT?
Simplicidad para un proyecto educativo. En producción se recomendarían cookies httpOnly. El token se almacena como `adastra_session` y se envía en header `Authorization: Bearer <token>`.
