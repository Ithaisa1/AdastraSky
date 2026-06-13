# Capítulo 5: AI Service (Python + FastAPI + LangGraph)

## 5.1 Visión General

Microservicio Python encargado de la inteligencia artificial de AdAstra Sky. Expone una API REST en el puerto 10000 (producción) / 8001 (local). Contiene:

- **Agente conversacional** con LangGraph (StateGraph)
- **RAG ligero** TF-IDF sobre documentos del IAC (6 documentos cargados en `get_vector_store()` durante lifespan)
- **Sky Engine** para calcular calidad del cielo
- **Cadena de fallback** entre proveedores LLM: Groq → OpenAI → RAG-only

## 5.2 Entry Point — `main.py`

Configura la aplicación FastAPI:

```python
app = FastAPI(
    title="AdAstraSky AI Service",
    version="1.0.0",
    lifespan=lifespan  # Inicializa RAG al arrancar
)
```

### Lifespan (arranque)
```python
async def lifespan(app):
    get_vector_store()  # Carga 6 documentos IAC en memoria
    # Si falla: el chat funcionará en modo offline (RAG no disponible)
```

### Middleware CORS
Permite orígenes: `FRONTEND_URL`, `http://localhost:5173`, `http://localhost:3000`

### Routers montados
| Prefijo | Router | Endpoints |
|---|---|---|
| `/health` | health.py | GET /health, GET /debug/config |
| `/api/chat` | chat.py | POST /api/chat, GET /api/chat/history, GET /api/chat/warmup |
| `/api` | sky.py | POST /api/sky-score, GET /api/what-to-see, GET /api/events |

## 5.3 Configuración — `config.py`

Usa `pydantic-settings` con `@lru_cache()` para leer configuración:

```python
class Settings(BaseSettings):
    port: int = 7860
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    database_url: str = ""
    openweather_api_key: str = ""
    frontend_url: str = "https://adastra-sky.vercel.app"
```

Las claves API se leen desde variables de entorno (Render dashboard) con fallback al archivo `.env`.  
Ya no se necesita `HF_TOKEN` ni `HF_MODEL` — HuggingFace fue eliminado de la cadena LLM.

## 5.4 Agente LangGraph — `agent/`

### 5.4.1 Estado del Agente (`state.py`)
```python
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    session_id: str
    language: str
    user_id: Optional[str]
```

### 5.4.2 Constructor del Agente (`agent.py`)

#### `_get_models()` — Proveedores LLM
Devuelve lista de modelos disponibles en orden de prioridad:
1. **Groq** (`ChatGroq` con LLaMA 3.3 70B)
2. **OpenAI** (`ChatOpenAI` con GPT-4o-mini)

HuggingFace fue eliminado. La cadena ahora es solo Groq → OpenAI → RAG-only.

Leo claves de `os.environ` (Render) con fallback a `pydantic-settings` (`.env` local).

#### `call_model(state)` — Nodo principal
```
1. Obtener modelos disponibles
2. Si no hay modelos → responder con RAG offline
3. Para cada modelo (en orden de prioridad):
   a. Bind tools al modelo
   b. Invocar con system prompt + mensajes
   c. Si éxito → devolver respuesta
   d. Si falla con 429 (rate limit) → responder con mensaje amigable + RAG docs
   e. Si falla por otro motivo → continuar con siguiente modelo
4. Si todos fallan → responder con RAG offline
```

#### Manejo de 429 (Rate Limit)
Cuando un proveedor LLM responde con HTTP 429, el agente no retorna error. En su lugar devuelve un mensaje amigable informando al usuario que el servicio está saturado y adjunta los documentos RAG relevantes como alternativa.

#### System Prompt
```
Eres AdAstra, un guía astronómico experto en los cielos de las Islas Canarias.
Reglas:
- Responde SIEMPRE en el idioma que te preguntan
- Cuando uses RAG, CITA la fuente: «(Fuente: [título del documento])»
- Máximo 3-4 párrafos
```

#### `_simple_rag_response(messages)` — Fallback sin LLM
Cuando todos los LLMs fallan o no hay claves API configuradas:
1. Toma el último mensaje del usuario como query
2. Busca en el vector store TF-IDF (top 3 resultados)
3. Si encuentra resultados → devuelve fragmentos limpios (sin markdown)
4. Si no encuentra → devuelve mensaje "modo offline" con temas sugeridos

#### Flujo del Grafo (`build_agent`)
```
[Agent] → call_model(state)
    │
    ├── Si LLM responde sin tool_calls → END
    │
    └── Si LLM responde con tool_calls → [Tools] → call_tool(state)
                                           │
                                           └── → [Agent] (vuelve al LLM con resultado)
```

### 5.4.3 Herramientas (`tools.py`)

| Tool | Descripción | Parámetros |
|---|---|---|
| `search_rag_documents` | Búsqueda semántica en documentos IAC | query, top_k (3) |
| `get_observatory_info` | Info de observatorio (consulta BD) | name |
| `get_weather_conditions` | Clima actual por coordenadas | latitude, longitude |
| `get_constellation_info` | Info de constelación (consulta BD) | name |
| `calculate_sky_score` | Calcula Sky Score (0-10) | cloudiness, light_pollution, moon_phase, wind, humidity, transparency |

**Nota**: Las herramientas de BD (`get_observatory_info`, `get_constellation_info`) requieren `psycopg2-binary` y `DATABASE_URL`. Sin ellas, devuelven `{"info": "Base de datos no disponible"}`.

## 5.5 RAG Ligero — `rag/vector_store.py`

Implementación TF-IDF + cosine similarity en memoria, sin ChromaDB, sin sentence-transformers, sin PyTorch. Usa exclusivamente scikit-learn (512MB RAM compatible).

### Clase `InMemoryVectorStore`

```python
class InMemoryVectorStore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=2000, stop_words=None)
        self.chunks = []        # Fragmentos de documentos
        self._tfidf_matrix = None
        self._loaded = False

    def load_documents(self):
        # Lee *.md de documents/
        # Divide en párrafos por doble salto de línea
        # Vectoriza con TF-IDF

    def similarity_search(self, query, k=3):
        # Calcula cosine similarity
        # Devuelve top-k fragmentos con score > 0
```

### Documentos Indexados (6 archivos .md)
| Archivo | Tema | Tamaño |
|---|---|---|
| 01_introduccion_iac.md | Instituto de Astrofísica de Canarias | ~1.2KB |
| 02_observatorio_roque_muchachos.md | ORM La Palma | ~1.5KB |
| 03_observatorio_teide.md | OT Tenerife | ~1.3KB |
| 04_ley_cielo_canarias.md | Ley del Cielo (Ley 31/1988) | ~1.0KB |
| 05_astroturismo_canarias.md | Guía de astroturismo | ~1.4KB |
| 06_eventos_astronomicos.md | Eventos astronómicos anuales | ~1.4KB |

**Total**: ~7.8KB, 61 fragmentos indexados.

### Función `get_vector_store()` (cacheada)
```python
@lru_cache()
def get_vector_store() -> InMemoryVectorStore:
    store = InMemoryVectorStore()
    store.load_documents()
    return store
```

## 5.6 Routers

### chat.py — POST /api/chat
Endpoint principal del agente conversacional:
```python
@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    agent = get_agent()
    result = await agent.ainvoke(inputs, config)
    last_msg = result["messages"][-1]
    # Extrae fuentes de ToolMessage
    return ChatResponse(response=text, session_id, sources)
```

### chat.py — GET /api/chat/warmup (Warm-up)
Endpoint que el backend llama para evitar cold start del AI Service:
```python
@router.get("/warmup")
async def warmup():
    # Ping al health endpoint interno para pre-calentar
    return {"status": "warmed"}
```

El frontend también puede llamar a este endpoint. Mientras se calienta, la `ChatPage` muestra "Iniciando servicio de IA...".

### health.py — GET /health, GET /debug/config
```python
@router.get("/health")
async def health():
    return {"status": "healthy", "service": "AdAstraSky AI Service", "version": "1.0.0"}
```

**Nota**: En cold start (servicio dormido en Render Free Tier), el endpoint `/health` puede tardar hasta 30 segundos en responder.

```python
@router.get("/debug/config")
async def debug_config():
    # Muestra qué variables de entorno están configuradas
    # (valores enmascarados por seguridad)
    return {"env": {"GROQ_API_KEY": "gsk_****", ...}}
```

### sky.py — Score y eventos
```python
POST /api/sky-score       # Calcula Sky Score con SkyScoreAlgorithm
GET /api/what-to-see      # Qué observar en una fecha+ubicación
GET /api/events           # Próximos eventos astronómicos
```

## 5.7 Sky Engine — `sky_engine/`

### sky_score.py — `SkyScoreAlgorithm`
```python
class SkyScoreAlgorithm:
    def calculate_sky_score(self, factors: dict) -> float:
        # cloudiness: 0-1 (0=despejado)
        # light_pollution: 0-1 (0=oscuro)
        # moon_phase: 0-1 (0=luna nueva)
        # wind: km/h (0=calma)
        # humidity: 0-1 (0=seco)
        # transparency: 0-1 (1=máxima)
        
        score = (
            (1 - cloudiness) * 0.25 +
            (1 - light_pollution) * 0.25 +
            (1 - moon_phase) * 0.20 +
            (1 - min(wind / 50, 1)) * 0.15 +
            (1 - humidity) * 0.10 +
            transparency * 0.05
        ) * 10
        return min(max(score, 0), 10)
```

### utils.py — `calculate_moon_illumination`
```python
def calculate_moon_illumination(date: datetime) -> float:
    # Algoritmo basado en edad lunar
    # 0.0 = luna nueva, 1.0 = luna llena
    return min(max(illumination, 0), 1)
```

## 5.8 Dependencias (`requirements.txt`)

```txt
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
pydantic>=2.0,<3.0
pydantic-settings>=2.0,<3.0
langchain>=0.3.21
langchain-community>=0.3.20
langchain-openai>=0.3.7
langchain-groq>=1.0.0
langgraph>=0.3.22
psycopg2-binary>=2.9,<3.0
httpx>=0.28,<1.0
python-dotenv>=1.0,<2.0
scikit-learn>=1.3.0
numpy>=1.24.0
```

**Nota**: Se eliminaron `langchain-huggingface`, `huggingface-hub`. El servicio ya no usa ChromaDB, sentence-transformers ni PyTorch — todo es TF-IDF puro con scikit-learn.

## 5.9 Logging

Configurado en `main.py` con `logging.basicConfig`:
- Formato: `YYYY-MM-DD HH:MM:SS [module] LEVEL: message`
- Nivel: `INFO`
- Loggers: `adastra-ai` (main), `adastra-ai.agent` (agent)

Los errores del LLM se registran en `agent.py` con nivel `ERROR` para facilitar debugging en Render.

## 5.10 Cadena de Fallback (Resumen)

```
GET /api/chat request
    │
    ├── ¿GROQ_API_KEY configurada?
    │   ├── Sí → ChatGroq(model=llama-3.3-70b) → ¿Funciona?
    │   │           ├── Sí → ✅ Respuesta LLM
    │   │           ├── 429 → Mensaje amigable + RAG docs
    │   │           └── No → Siguiente modelo
    │   └── No → Siguiente modelo
    │
    ├── ¿OPENAI_API_KEY configurada?
    │   ├── Sí → ChatOpenAI(model=gpt-4o-mini) → ¿Funciona?
    │   │           ├── Sí → ✅ Respuesta LLM
    │   │           ├── 429 → Mensaje amigable + RAG docs
    │   │           └── No → Fallback RAG
    │   └── No → Fallback RAG
    │
    └── RAG offline: TF-IDF similarity → fragmentos documentos IAC
        ├── ¿Resultados? → ✅ Fragmentos formateados
        └── No → "Modo offline: consulta sobre observatorios, astroturismo..."
```
