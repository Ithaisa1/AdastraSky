# Capítulo 6: Base de Datos (PostgreSQL + Sequelize)

## 6.1 Esquema Entidad-Relación

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│    User     │1──N│  ChatHistory     │     │ SkyScore      │
├─────────────┤     ├──────────────────┤     ├───────────────┤
│ id (UUID)   │     │ id (UUID)       │     │ id (INT)      │
│ username    │     │ userId (FK)     │N──1│ zoneId (FK)   │
│ email       │     │ sessionId (UUID) │     │ astroScore    │
│ password    │     │ message (TEXT)   │     │ photoScore    │
│ role        │     │ response (TEXT)  │     │ tourismScore  │
│ resetToken  │     │ language         │     │ globalScore   │
│ resetExp    │     │ sources (JSONB)  │     │ bortle        │
└─────────────┘     │ metadata (JSONB) │     │ moonPhase     │
      │             └──────────────────┘     │ cloudiness    │
      │1                                     │ ...           │
      │                                      └───────┬───────┘
      │                                              │N
      ▼                                              │
┌─────────────┐     ┌──────────────────┐              │
│ Experience  │     │ SkyQualityZone   │1─────────────┘
├─────────────┤     ├──────────────────┤
│ id (UUID)   │N──1│ id (INT)         │
│ userId (FK) │     │ name             │
│ zoneId (FK) │     │ island           │
│ title       │     │ category (ENUM)  │
│ content     │     │ latitude         │
│ rating      │     │ longitude        │
│ category    │     │ altitude         │
│ imageUrl    │     │ bortle_scale     │
└─────────────┘     │ access_type      │
                    │ description      │
┌─────────────┐     │ servicios...     │
│ ContactMsg  │     └──────────────────┘
├─────────────┤
│ id (UUID)   │     ┌─────────────┐
│ name        │     │ Event       │
│ email       │     ├─────────────┤
│ subject     │     │ id (INT)    │
│ message     │     │ name        │
│ isRead      │     │ type (ENUM) │
└─────────────┘     │ date        │
                    │ month       │
                    │ day         │
                    │ description │
                    │ islandIds   │
                    └─────────────┘
```

## 6.2 Modelos Detallados

### 6.2.1 Users
```sql
CREATE TABLE "Users" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "username"      VARCHAR(255) NOT NULL UNIQUE,
  "email"         VARCHAR(255) NOT NULL UNIQUE,
  "password"      VARCHAR(255) NOT NULL,
  "role"          ENUM('user','admin') DEFAULT 'user',
  "resetPasswordToken" VARCHAR(255),
  "resetPasswordExpires" TIMESTAMP,
  "createdAt"     TIMESTAMP DEFAULT NOW(),
  "updatedAt"     TIMESTAMP DEFAULT NOW()
);
```
- **Password**: Hasheada con bcrypt (salt rounds: 10) mediante hook `beforeCreate`/`beforeUpdate`
- **Validación**: email con `isEmail`, username con `len: [3, 50]`

### 6.2.2 SkyQualityZones
```sql
CREATE TABLE "SkyQualityZones" (
  "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
  "name"        VARCHAR(255) NOT NULL,
  "island"      VARCHAR(100) NOT NULL,
  "municipality" VARCHAR(255),
  "category"    ENUM('mirador','observatory','park','beach','other'),
  "subcategory" VARCHAR(100),
  "latitude"    FLOAT NOT NULL,
  "longitude"   FLOAT NOT NULL,
  "altitude"    INTEGER,
  "bortle_scale" INTEGER CHECK(1-9),
  "access_type" ENUM('free','paid','restricted'),
  "description" TEXT,
  "institution" VARCHAR(255),
  "established" INTEGER,
  "research_areas" TEXT,
  "telescopes"  TEXT,
  "has_dark_certification" BOOLEAN DEFAULT false,
  "has_guided_tours" BOOLEAN DEFAULT false,
  "has_parking" BOOLEAN DEFAULT false,
  "has_restrooms" BOOLEAN DEFAULT false,
  "has_wheelchair_access" BOOLEAN DEFAULT false,
  "has_lighting" BOOLEAN DEFAULT false,
  "has_fencing" BOOLEAN DEFAULT false,
  "safety_rating" INTEGER DEFAULT 3 CHECK(1-5),
  "image_url"   VARCHAR(500),
  "gallery"     JSONB DEFAULT '[]',
  "createdAt"   TIMESTAMP,
  "updatedAt"   TIMESTAMP
);
```

### 6.2.3 SkyScores
```sql
CREATE TABLE "SkyScores" (
  "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
  "zoneId"      INTEGER NOT NULL REFERENCES "SkyQualityZones"("id") ON DELETE CASCADE,
  "astroScore"  FLOAT CHECK(0-10),
  "photoScore"  FLOAT CHECK(0-10),
  "tourismScore" FLOAT CHECK(0-10),
  "globalScore" FLOAT CHECK(0-10),
  "bortle"      INTEGER,
  "moonPhase"   FLOAT CHECK(0-1),
  "cloudiness"  FLOAT CHECK(0-100),
  "windSpeed"   FLOAT,
  "humidity"    FLOAT CHECK(0-100),
  "visibility"  FLOAT,
  "temperature" FLOAT,
  "createdAt"   TIMESTAMP
);
```

### 6.2.4 ChatHistory
```sql
CREATE TABLE "ChatHistory" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "sessionId"   UUID NOT NULL,
  "message"     TEXT NOT NULL,
  "response"    TEXT NOT NULL,
  "language"    VARCHAR(10) DEFAULT 'es',
  "sources"     JSONB DEFAULT '[]',
  "metadata"    JSONB DEFAULT '{}',
  "createdAt"   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_chat_user_session ON "ChatHistory"("userId", "sessionId");
```

### 6.2.5 Events
```sql
CREATE TABLE "Events" (
  "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
  "name"        VARCHAR(255) NOT NULL,
  "type"        ENUM('meteor_shower','eclipse','planetary','seasonal','other'),
  "date"        DATE,
  "month"       INTEGER CHECK(1-12),
  "day"         INTEGER CHECK(1-31),
  "description" TEXT,
  "islandIds"   JSON DEFAULT '[]',
  "createdAt"   TIMESTAMP,
  "updatedAt"   TIMESTAMP
);
```
- Scope `upcoming`: `WHERE date >= CURRENT_DATE`
- Scope `byIsland`: filtra por `islandIds` (JSON contiene)

### 6.2.6 Experiences
```sql
CREATE TABLE "Experiences" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"      UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "zoneId"      INTEGER NOT NULL REFERENCES "SkyQualityZones"("id") ON DELETE CASCADE,
  "title"       VARCHAR(255) NOT NULL,
  "content"     TEXT NOT NULL,
  "rating"      INTEGER CHECK(1-5),
  "category"    ENUM('observation','photography','workshop','other'),
  "imageUrl"    VARCHAR(500),
  "createdAt"   TIMESTAMP,
  "updatedAt"   TIMESTAMP
);
```

### 6.2.7 ContactMessages
```sql
CREATE TABLE "ContactMessages" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name"        VARCHAR(255) NOT NULL,
  "email"       VARCHAR(255) NOT NULL,
  "subject"     VARCHAR(255) NOT NULL,
  "message"     TEXT NOT NULL,
  "isRead"      BOOLEAN DEFAULT false,
  "createdAt"   TIMESTAMP,
  "updatedAt"   TIMESTAMP
);
```

## 6.3 Seeds

### seedUsers.js
Crea usuarios iniciales:
| Email | Username | Password | Rol |
|---|---|---|---|
| admin@adastra.sky | admin | admin123 | admin |
| demo@adastra.sky | demo | demo123 | user |

Los passwords se hashean con bcrypt automáticamente por el hook del modelo.

### database/seed.js
Puebla la tabla `SkyQualityZones` con 10 zonas iniciales representativas de todas las islas.

### database/seed_bortle.py
Script Python para poblar zonas con datos de la escala Bortle desde archivo externo.

## 6.4 Configuración Sequelize

### `src/config/database.js`
```javascript
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    dialect: 'postgres',
    dialectOptions: process.env.NODE_ENV === 'production' 
      ? { ssl: { require: true, rejectUnauthorized: false } } 
      : {},
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);
```
- En producción (Render): SSL obligatorio, logging desactivado
- En desarrollo: logging activado, sin SSL
- Pool: máximo 5 conexiones concurrentes
