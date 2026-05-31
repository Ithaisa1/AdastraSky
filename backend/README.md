# AdastraSky Backend

Backend principal de AdastraSky - Plataforma de astroturismo premium para las Islas Canarias.

## 🏗️ Arquitectura

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Comunicación con IA**: Proxy HTTP hacia microservicio Python FastAPI

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de PostgreSQL/Sequelize
│   ├── controllers/
│   │   ├── auth.controller.js   # Registro, login, perfiles
│   │   ├── sky.controller.js    # Zonas de calidad del cielo
│   │   ├── chat.controller.js   # Proxy hacia servicio de IA
│   │   └── island.controller.js # Información de islas
│   ├── middleware/
│   │   ├── authMiddleware.js    # Verificación JWT
│   │   ├── errorHandler.js     # Manejo global de errores
│   │   └── notFound.js          # Rutas no encontradas
│   ├── models/
│   │   ├── User.js              # Modelo de usuarios
│   │   ├── SkyQualityZone.js    # Zonas de calidad del cielo
│   │   ├── ChatHistory.js       # Historial de conversaciones
│   │   └── index.js             # Índice de modelos
│   └── routes/
│       ├── auth.routes.js       # Rutas de autenticación
│       ├── sky.routes.js        # Rutas de zonas de cielo
│       ├── chat.routes.js       # Rutas de chat
│       └── island.routes.js     # Rutas de islas
├── .env                         # Variables de entorno (no versionado)
├── .env.example                 # Plantilla de variables de entorno
├── package.json                 # Dependencias y scripts
└── server.js                    # Punto de entrada del servidor
```

## 🚀 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

3. **Configurar base de datos PostgreSQL**:
   - Crear base de datos: `adastrasky`
   - Configurar credenciales en `.env`

## 🎯 Scripts Disponibles

```bash
# Iniciar servidor en producción
npm start

# Iniciar servidor en desarrollo (con nodemon)
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Ejecutar semillas de base de datos
npm run seed

# Ejecutar migraciones
npm run migrate
npm run migrate:undo

# Reset completo de base de datos
npm run db:reset
```

## 🔗 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Zonas de Cielo (`/api/sky`)
- `GET /api/sky/zones` - Obtener todas las zonas
- `GET /api/sky/zones/:id` - Obtener zona por ID
- `GET /api/sky/islands/:island` - Obtener zonas por isla
- `GET /api/sky/category/:category` - Obtener zonas por categoría

### Chat (`/api/chat`)
- `POST /api/chat/message` - Enviar mensaje al agente de IA (requiere token)
- `GET /api/chat/history` - Obtener historial de chat (requiere token)

### Islas (`/api/islands`)
- `GET /api/islands` - Obtener información de todas las islas
- `GET /api/islands/:name` - Obtener información de una isla específica

### Salud del Sistema
- `GET /health` - Health check del servidor
- `GET /api` - Información de la API

## 🔐 Variables de Entorno Requeridas

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adastrasky
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=tu_jwt_secret_super_secreto_aqui
JWT_EXPIRES_IN=7d

# Microservicio de IA
AI_SERVICE_URL=http://localhost:8000

# APIs Externas
OPENWEATHER_API_KEY=tu_clave_openweather_aqui
ASTRONOMY_API_KEY=tu_clave_astronomy_api_aqui
NASA_API_KEY=tu_clave_nasa_api_aqui

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para el frontend
- **Rate Limiting**: 100 peticiones por 15 minutos por IP
- **JWT**: Tokens con expiración configurada
- **Bcrypt**: Hashing de contraseñas con salt rounds de 10
- **Validación Joi**: Validación de datos de entrada

## 📊 Modelos de Base de Datos

### User
- `id` (UUID, PK)
- `email` (String, unique)
- `password` (String, hashed)
- `first_name` (String)
- `last_name` (String)
- `preferred_language` (Enum: es, en, de)
- `is_active` (Boolean)
- `last_login` (DateTime)

### SkyQualityZone
- `id` (UUID, PK)
- `name` (String)
- `island` (Enum: 8 islas canarias)
- `category` (Enum: observatory, astronomical_viewpoint, landscape_viewpoint)
- `bortle_scale` (Integer: 1-9)
- `latitude` (Decimal)
- `longitude` (Decimal)
- `altitude` (Integer)
- `accessibility` (Text)
- `description` (Text)
- `image_url` (String)
- `streaming_url` (String)
- `is_active` (Boolean)

### ChatHistory
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `session_id` (UUID)
- `message` (Text)
- `response` (Text)
- `language` (Enum: es, en, de)
- `sources` (JSONB)
- `metadata` (JSONB)

## 🔄 Comunicación con Microservicio de IA

El backend actúa como proxy hacia el microservicio Python FastAPI:

1. Frontend envía mensaje a `/api/chat/message`
2. Backend verifica token JWT
3. Backend reenvía solicitud a `AI_SERVICE_URL/api/chat`
4. Backend guarda respuesta en `ChatHistory`
5. Backend retorna respuesta al frontend

## 🚢 Despliegue

### Railway/Render
1. Configurar variables de entorno en la plataforma
2. Desplegar desde repositorio Git
3. La plataforma detectará automáticamente Node.js e instalará dependencias

### Variables de Entorno de Producción
- `NODE_ENV=production`
- Configurar `DATABASE_URL` con credenciales de producción
- Usar `JWT_SECRET` fuerte y aleatorio
- Configurar `AI_SERVICE_URL` con URL del servicio desplegado

## 📝 Notas Importantes

- El proyecto usa módulos ES6 (`"type": "module"` en package.json)
- En desarrollo, Sequelize sincroniza modelos automáticamente
- En producción, usar migraciones de Sequelize
- El servicio de IA debe estar accesible en `AI_SERVICE_URL`
- Los tokens JWT expiran por defecto en 7 días

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL está corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos `adastrasky` existe

### Error de módulos ES6
- Asegurarse que Node.js >= 18.0.0
- Verificar que `"type": "module"` está en package.json

### Servicio de IA no disponible
- Verificar que el microservicio Python está corriendo
- Verificar `AI_SERVICE_URL` en `.env`
- Verificar conectividad de red entre servicios
