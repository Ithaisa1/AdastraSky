# AdAstra Sky — Documentación Técnica

> **Plataforma de Astroturismo Premium para las Islas Canarias**
> Bootcamp Capstone Project — Junio 2026

---

## Índice

| Doc | Descripción |
|-----|-------------|
| [01_INTRODUCCION.md](./01_INTRODUCCION.md) | Visión del proyecto, objetivos, stack tecnológico, equipo |
| [02_ARQUITECTURA.md](./02_ARQUITECTURA.md) | Arquitectura general, diagrama de flujo, decisiones técnicas, futuras implementaciones |
| [03_BACKEND.md](./03_BACKEND.md) | Backend Node.js/Express: models, controllers, routes, middleware, tests |
| [04_FRONTEND.md](./04_FRONTEND.md) | Frontend React/Vite: pages, components, services, data, hooks |
| [05_AI_SERVICE.md](./05_AI_SERVICE.md) | AI Service FastAPI/Python: agente LangGraph, RAG, sky engine, routers |
| [06_BASE_DE_DATOS.md](./06_BASE_DE_DATOS.md) | Base de datos PostgreSQL: esquema, modelos, asociaciones, seeds |
| [07_DESPLIEGUE_Y_SEGURIDAD.md](./07_DESPLIEGUE_Y_SEGURIDAD.md) | Despliegue (Render + Vercel), variables de entorno, seguridad, JWT, CORS |
| [08_ANEXOS.md](./08_ANEXOS.md) | Glosario, comandos útiles, referencia de variables de entorno |

---

## Estructura del Proyecto (Monorepo)

```
AdastraSky/
├── backend/                  # Node.js + Express (API REST)
│   ├── server.js             # Entry point
│   ├── src/
│   │   ├── config/           # Sequelize config
│   │   ├── controllers/      # 8 controladores
│   │   ├── middleware/        # 5 middlewares
│   │   ├── models/           # 7 modelos Sequelize
│   │   ├── routes/           # 9 archivos de rutas
│   │   ├── swagger.js        # OpenAPI 3.0 spec
│   │   ├── seed/             # Seeds de usuarios
│   │   └── utils/            # Utilidades (scoring, astronomy)
│   └── __tests__/            # 5 suites de test
│
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/            # 14 páginas
│   │   ├── components/       # 13 componentes + 5 UI primitives
│   │   ├── context/          # AuthContext
│   │   ├── services/         # 3 servicios (astronomy, map, weather)
│   │   ├── data/             # 11 archivos de datos
│   │   └── hooks/            # Custom hooks
│   └── __tests__/            # 3 suites de test
│
├── ai-service/               # Python + FastAPI + LangGraph
│   ├── main.py               # FastAPI entry point
│   ├── agent/                # Agente LangGraph
│   ├── rag/                  # RAG ligero (TF-IDF)
│   ├── routers/              # 3 routers (health, chat, sky)
│   ├── sky_engine/           # Algoritmo de sky scoring
│   └── documents/            # 6 documentos IAC
│
├── database/                 # Scripts de seed
├── automations/              # Workflows n8n
├── docs/                     # Esta documentación
├── render.yaml               # Render Blueprint
└── README.md                 # README principal
```
