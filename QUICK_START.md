# 🚀 Setup Rápido - Modelos SQLAlchemy

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias Python

```bash
cd backend
pip install -r requirements.txt
```

**Dependencias necesarias en requirements.txt:**
```
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar .env con tus valores
# DATABASE_URL=postgresql://user:password@localhost:5432/adastra_sky_db
```

### 3. Crear Base de Datos PostgreSQL

```sql
-- En PostgreSQL
CREATE DATABASE adastra_sky_db;
CREATE USER adastra_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE adastra_sky_db TO adastra_user;
```

O si usas un servicio cloud (Neon, Supabase, Railway), obtén la URL de conexión.

### 4. Inicializar Tablas

```bash
python init_db.py
```

**Salida esperada:**
```
🔧 Initializing Adastra Sky database...
📊 Database URL: postgresql://user:password@localhost:5432/adastra_sky_db
✅ All tables created successfully!
✅ Database connection successful!
```

### 5. Verificar Tablas Creadas

```bash
# En PostgreSQL
\dt

# Resultado:
# chat_history
# observations
# rag_document_sources
# sky_quality_zones
# user_alerts
# user_saved_sky_zones
# users
```

---

## 📂 Estructura de Archivos Generados

```
backend/
├── database.py                    # ← Config SQLAlchemy (NO MODIFICAR)
├── models_user.py                 # ← User model
├── models_sky.py                  # ← SkyQualityZone + relacionadas
├── models_chat.py                 # ← ChatHistory + RAGDocumentSource
├── models_init.py                 # ← Package aggregator
├── init_db.py                     # ← Script inicialización (ejecutar una sola vez)
├── .env                           # ← Variables de entorno (NO COMMITEAR)
├── .env.example                   # ← Template (SÍ COMMITEAR)
└── requirements.txt               # ← Dependencias Python
```

---

## 🔗 Importar en main.py (FastAPI)

```python
from fastapi import FastAPI
from database import Base, engine, get_db
from models_user import User
from models_sky import SkyQualityZone
from models_chat import ChatHistory

app = FastAPI(title="Adastra Sky API")

# Crear tablas al iniciar (si no existen)
Base.metadata.create_all(bind=engine)

# Resto del código...
```

---

## 🧪 Prueba Rápida

### Test 1: Crear Usuario

```python
from database import SessionLocal
from models_user import User
from passlib.context import CryptContext
import uuid

# Setup
db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear usuario
new_user = User(
    id=str(uuid.uuid4()),
    email="test@example.com",
    username="testuser",
    password_hash=pwd_context.hash("password123"),
    language_preference="ES"
)
db.add(new_user)
db.commit()
db.refresh(new_user)

print(f"✅ Usuario creado: {new_user.username}")
print(f"   Email: {new_user.email}")
print(f"   ID: {new_user.id}")
```

### Test 2: Consultar Usuarios

```python
users = db.query(User).filter(User.is_active == True).all()
for user in users:
    print(f"- {user.username} ({user.email})")
```

### Test 3: Crear Zona de Cielo

```python
from models_sky import SkyQualityZone

new_zone = SkyQualityZone(
    id=str(uuid.uuid4()),
    zone_name="Teide National Park",
    island="Tenerife",
    bortle_scale=1,
    latitude=28.2722,
    longitude=-16.6291,
    altitude=3718,
    visible_stars=9110,
    accessibility="Difficult",
    is_protected=True
)
db.add(new_zone)
db.commit()

print(f"✅ Zona creada: {new_zone.zone_name}")
print(f"   Escala Bortle: {new_zone.bortle_scale}")
print(f"   Nivel de contaminación: {new_zone.pollution_level}")
```

---

## ⚠️ Troubleshooting

### Error: "psycopg2 not installed"
```bash
pip install psycopg2-binary
```

### Error: "connection refused"
- Verifica que PostgreSQL esté corriendo
- Comprueba DATABASE_URL en .env
- Verifica credenciales de usuario

### Error: "database does not exist"
```bash
# En PostgreSQL
CREATE DATABASE adastra_sky_db;
```

### Error: "permission denied"
```bash
# En PostgreSQL
GRANT ALL PRIVILEGES ON DATABASE adastra_sky_db TO adastra_user;
```

---

## 📊 Contenido de los Modelos

### models_user.py
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    language_preference = Column(String(5), default="ES")
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    # ... más campos
```

### models_sky.py
```python
class SkyQualityZone(Base):
    __tablename__ = "sky_quality_zones"
    
    id = Column(String(36), primary_key=True)
    zone_name = Column(String(200), nullable=False)
    island = Column(String(100), nullable=False)
    bortle_scale = Column(Integer, nullable=False)  # 1-9
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # ... más campos
```

### models_chat.py
```python
class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    session_id = Column(String(100), nullable=False)
    message_type = Column(String(20), nullable=False)  # "user", "assistant"
    message_content = Column(Text, nullable=False)
    response_content = Column(Text)
    language = Column(String(5), default="ES")
    rag_sources = Column(Text)  # JSON
    tools_used = Column(Text)  # JSON
    # ... más campos para auditoría y costes
```

---

## 🔄 Flujo Típico en Endpoints FastAPI

```python
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models_user import User
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api", tags=["users"])

@router.get("/users/{user_id}")
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.to_dict()

@router.post("/users")
async def create_user(email: str, username: str, password: str, db: Session = Depends(get_db)):
    # Verificar si existe
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Crear
    new_user = User(
        email=email,
        username=username,
        password_hash=bcrypt.hash(password),
        language_preference="ES"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user.to_dict()
```

---

## 📋 Checklist Post-Instalación

- [ ] ✅ Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] ✅ .env configurado con DATABASE_URL correcto
- [ ] ✅ PostgreSQL corriendo y DB creada
- [ ] ✅ `python init_db.py` ejecutado exitosamente
- [ ] ✅ Tablas verificadas en PostgreSQL (`\dt`)
- [ ] ✅ Importes funcionan en main.py
- [ ] ✅ Tests básicos pasan (crear/consultar usuarios)
- [ ] ✅ main.py listo para integración

---

## 📚 Documentación Disponible

- **MODELS_DOCUMENTATION.md** - Referencia técnica completa (12KB)
- **MODELS_README.md** - Guía de uso con ejemplos (10KB)
- **MODELS_SUMMARY.md** - Resumen ejecutivo (9KB)
- **DATABASE_SCHEMA.sql** - SQL DDL completo (11KB)
- Docstrings en cada archivo Python

---

## 🎯 Próximo Paso

Una vez que los modelos están listos y la BD está inicializada, el siguiente paso es:

**→ Crear Esquemas Pydantic v2 para validación**

```bash
# Próximo archivo a crear:
# /backend/schemas/user_schema.py
# /backend/schemas/chat_schema.py
# /backend/schemas/sky_schema.py
```

---

## 💡 Tips Profesionales

1. **Nunca correr init_db.py en producción** - Las migraciones se manejan con Alembic
2. **Usar transacciones** - `db.begin()` para operaciones complejas
3. **Validar datos en Pydantic** - No en el modelo SQLAlchemy
4. **Índices en campos consultados** - Ya incluidos en DATABASE_SCHEMA.sql
5. **Usar to_dict()** para respuestas API - Evita exponer campos sensibles

---

**Estado:** ✅ LISTO PARA USAR
**Última actualización:** 2026-05-29
