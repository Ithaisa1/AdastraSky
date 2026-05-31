# Modelos de Datos - Adastra Sky Backend

## 📋 Visión General

Los modelos de SQLAlchemy definen la estructura de la base de datos PostgreSQL. Están organizados en tres archivos principales:

- **models_user.py** - Gestión de usuarios y autenticación
- **models_sky.py** - Zonas de calidad del cielo (Escala Bortle) y observaciones
- **models_chat.py** - Historial de chat e indexación RAG

---

## 1️⃣ USER (models_user.py)

### Tabla: `users`

Usuario del sistema con información de perfil y preferencias.

**Campos:**
```
id (UUID)                    - Identificador único
email (String)              - Email único para login
username (String)           - Nombre de usuario único
password_hash (String)      - Contraseña hasheada (bcrypt)
first_name (String)         - Nombre
last_name (String)          - Apellido
language_preference (String) - ES, EN, DE (por defecto ES)
is_active (Boolean)         - Cuenta activa
is_admin (Boolean)          - Privilegios administrativos
bio (Text)                  - Biografía/descripción
created_at (DateTime)       - Fecha de creación
updated_at (DateTime)       - Última actualización
last_login (DateTime)       - Último login
```

**Relaciones:**
- `chat_history` → ChatHistory (One-to-Many)
- `saved_sky_zones` → UserSavedSkyZone (One-to-Many)
- `alerts` → UserAlert (One-to-Many)

**Métodos útiles:**
```python
user.to_dict()              # Convierte a diccionario (sin password)
user.language_preference    # Obtiene idioma preferido
```

---

## 2️⃣ SKY QUALITY ZONES (models_sky.py)

### Tabla: `sky_quality_zones`

Representa zonas de calidad del cielo en Canarias con la Escala Bortle (1-9).

**Campos:**
```
id (UUID)                 - Identificador único
zone_name (String)        - Nombre de la zona (p.ej. "Teide National Park")
island (String)           - Isla canaria
bortle_scale (Integer)    - 1 (pristino) a 9 (muy contaminado)
latitude (Float)          - Latitud geográfica
longitude (Float)         - Longitud geográfica
altitude (Integer)        - Altitud en metros
visible_stars (Integer)   - Estrellas visibles a ojo desnudo
best_viewing_season (String) - Mejor estación de observación
description (Text)        - Descripción detallada
accessibility (String)    - Easy, Moderate, Difficult
is_protected (Boolean)    - Área protegida
created_at (DateTime)     - Fecha de creación
updated_at (DateTime)     - Última actualización
```

**Propiedades:**
```python
zone.bortle_color       # Color Tailwind según escala Bortle
zone.pollution_level    # Texto legible: "Excellent (Dark Sky)", "Poor", etc.
zone.to_dict()          # Convierte a diccionario
```

**Relaciones:**
- `user_saved_zones` → UserSavedSkyZone (One-to-Many)
- `observations` → Observation (One-to-Many)

---

### Tabla: `user_saved_sky_zones` (Junction)

Relación Many-to-Many entre usuarios y zonas de cielo guardadas.

**Campos:**
```
id (UUID)        - Identificador único
user_id (UUID)   - FK → users.id
zone_id (UUID)   - FK → sky_quality_zones.id
notes (Text)     - Notas personales del usuario
saved_at (DateTime) - Fecha de guardado
```

---

### Tabla: `observations`

Registro de observaciones realizadas por usuarios en zonas específicas.

**Campos:**
```
id (UUID)                   - Identificador único
zone_id (UUID)              - FK → sky_quality_zones.id
observation_date (DateTime) - Fecha de la observación
weather_conditions (String) - Condiciones climáticas (p.ej. "Despejado")
objects_observed (Text)     - Objetos observados (planetas, constelaciones, etc.)
notes (Text)                - Notas adicionales
created_at (DateTime)       - Fecha de creación
updated_at (DateTime)       - Última actualización
```

---

### Tabla: `user_alerts`

Alertas personalizadas para eventos astronómicos y condiciones meteorológicas.

**Campos:**
```
id (UUID)                   - Identificador único
user_id (UUID)              - FK → users.id
alert_type (String)         - "meteor_shower", "clear_sky", "lunar_event", etc.
zone_id (UUID)              - FK → sky_quality_zones.id (opcional)
is_active (Boolean)         - Alerta activa
notification_method (String) - "email", "dashboard", "both"
event_name (String)         - Nombre del evento
event_date (DateTime)       - Fecha del evento
created_at (DateTime)       - Fecha de creación
updated_at (DateTime)       - Última actualización
triggered_at (DateTime)     - Cuándo se activó la alerta
```

---

## 3️⃣ CHAT HISTORY (models_chat.py)

### Tabla: `chat_history`

Registro completo de conversaciones con el agente IA para auditoría, cumplimiento normativo y análisis.

**Campos:**
```
id (UUID)                   - Identificador único
user_id (UUID)              - FK → users.id
session_id (String)         - ID de sesión de conversación
message_type (String)       - "user", "assistant", "system"
message_content (Text)      - Contenido del mensaje
response_content (Text)     - Respuesta del agente (si aplica)
language (String)           - ES, EN, DE
rag_sources (Text/JSON)     - Fuentes citadas del RAG
tools_used (Text/JSON)      - Herramientas invocadas
input_tokens (Integer)      - Tokens de entrada (cost tracking)
output_tokens (Integer)     - Tokens de salida
total_tokens (Integer)      - Total de tokens
estimated_cost (String)     - Costo estimado (p.ej. "$0.0234")
has_error (Boolean)         - Error durante procesamiento
error_message (Text)        - Detalles del error
user_satisfaction (Integer) - Calificación 1-5 estrellas
user_feedback (Text)        - Feedback del usuario
created_at (DateTime)       - Timestamp del mensaje
updated_at (DateTime)       - Última actualización
```

**Métodos útiles:**
```python
chat.set_rag_sources(['doc1.txt', 'doc2.txt'])  # Guardar fuentes
chat.get_rag_sources()      # Obtener fuentes como lista

chat.set_tools_used(['OpenWeather', 'Astronomy'])
chat.get_tools_used()       # Obtener herramientas como lista

chat.to_dict()              # Convierte a diccionario
chat.conversation_pair      # Tupla (user_msg, assistant_response)
```

**Relaciones:**
- `user` → User (Many-to-One)

---

### Tabla: `rag_document_sources`

Metadatos de documentos indexados en ChromaDB para el sistema RAG.

**Campos:**
```
id (UUID)                   - Identificador único
document_name (String)      - Nombre/título del documento (único)
document_type (String)      - "law", "guide", "manual", "research"
file_path (String)          - Ruta en /database/documents/
description (Text)          - Descripción del documento
content_summary (Text)      - Resumen del contenido
content_hash (String)       - SHA-256 para detección de cambios
file_size_bytes (Integer)   - Tamaño en bytes
is_active (Boolean)         - Documento activo para RAG
indexed_at (DateTime)       - Cuándo se indexó en ChromaDB
last_updated_at (DateTime)  - Última actualización
total_citations (Integer)   - Veces que fue citado
created_at (DateTime)       - Fecha de creación
```

**Propiedades:**
```python
source.to_dict()            # Convierte a diccionario
source.total_citations      # Contador de citaciones
```

---

## 🔧 Inicialización de la Base de Datos

### Crear todas las tablas:

```bash
python init_db.py
```

Esto ejecutará el script de inicialización que:
1. ✅ Crea todas las tablas
2. ✅ Verifica la conexión a PostgreSQL
3. ✅ Muestra logs de éxito/error

---

## 📐 Relaciones ER (Entity Relationship)

```
┌─────────────────────────────────────────────────────────────┐
│                      USERS                                  │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                     │
│ email (UNIQUE)                                              │
│ username (UNIQUE)                                           │
│ password_hash                                               │
│ language_preference                                         │
│ is_active, is_admin                                         │
│ created_at, updated_at, last_login                          │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ (1:N)              │ (1:N)              │ (1:N)
         ├──────────────────┬─┘                    │
         │                  │                     │
         ▼                  ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  CHAT_HISTORY    │  │ USER_ALERTS      │  │ USER_SAVED_SKY   │
├──────────────────┤  ├──────────────────┤  │ _ZONES (M:N)     │
│ id (PK)          │  │ id (PK)          │  ├──────────────────┤
│ user_id (FK)     │  │ user_id (FK)     │  │ user_id (FK)     │
│ session_id       │  │ zone_id (FK)     │  │ zone_id (FK)     │
│ message_type     │  │ alert_type       │  │ notes            │
│ message_content  │  │ notification..   │  │ saved_at         │
│ response_content │  │ is_active        │  └──────────────────┘
│ language         │  │ triggered_at     │           │
│ rag_sources      │  └──────────────────┘           │ (N:1)
│ tools_used       │                                 │
│ tokens..         │                                 │
│ has_error        │                                 ▼
└──────────────────┘              ┌──────────────────────────────┐
         │                        │  SKY_QUALITY_ZONES          │
         │ Cita                   ├──────────────────────────────┤
         └─────────►              │ id (PK)                      │
              RAG_DOCUMENT        │ zone_name, island           │
              _SOURCES            │ bortle_scale (1-9)          │
         ┌──────────┐             │ latitude, longitude, alt.   │
         │ id (PK)  │             │ visible_stars               │
         │ doc_name │             │ accessibility, is_protected │
         │ doc_type │             │ best_viewing_season         │
         │ file_path│             │ created_at, updated_at      │
         │ is_active│             └──────────────────────────────┘
         │ indexed..│                      │
         │ citations│                      │ (1:N)
         └──────────┘                      │
                                          ▼
                              ┌──────────────────────┐
                              │  OBSERVATIONS        │
                              ├──────────────────────┤
                              │ id (PK)              │
                              │ zone_id (FK)         │
                              │ observation_date     │
                              │ weather_conditions   │
                              │ objects_observed     │
                              │ notes                │
                              └──────────────────────┘
```

---

## 🔒 Consideraciones de Seguridad

1. **Contraseñas:** Siempre hasheadas con bcrypt, nunca en texto plano
2. **Tokens JWT:** No se almacenan en DB, se validan en middleware
3. **Cascadas:** `ondelete="CASCADE"` asegura consistencia al borrar usuarios
4. **Auditoría:** ChatHistory completo para auditoría GDPR/cumplimiento
5. **Índices:** Campos frecuentemente consultados tienen índices (id, user_id, zone_id)

---

## 📊 Ejemplo de Uso en Endpoints

```python
# FastAPI router ejemplo
from fastapi import APIRouter, Depends
from database import get_db
from models_user import User
from models_sky import SkyQualityZone

router = APIRouter()

@router.get("/api/sky-zones")
async def get_sky_zones(db = Depends(get_db)):
    zones = db.query(SkyQualityZone).filter(SkyQualityZone.is_protected == True).all()
    return [zone.to_dict() for zone in zones]

@router.get("/api/chat/history/{user_id}")
async def get_chat_history(user_id: str, db = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == user_id
    ).order_by(ChatHistory.created_at.desc()).all()
    
    return [chat.to_dict(include_user=False) for chat in history]
```

---

## 🚀 Próximos Pasos

1. ✅ **Modelos creados** - User, SkyQualityZone, ChatHistory, RAGDocumentSource
2. ⏳ Crear Esquemas Pydantic para validación
3. ⏳ Implementar rutas FastAPI (auth, chat, sky)
4. ⏳ Configurar autenticación JWT
5. ⏳ Integrar LangGraph + RAG
6. ⏳ Escribir tests unitarios
