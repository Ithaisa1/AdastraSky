# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📚 ARQUITECTURA ADASTRASKY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Visión General

AdAstraSky es una arquitectura **moderna, escalable y profesional** diseñada para soportar una plataforma completa de astroturismo.

### Principios

✅ **Clean Architecture**: Separación clara de responsabilidades  
✅ **Microservicios**: Backend independiente + Python Service  
✅ **API First**: Comunicación mediante APIs REST  
✅ **Escalabilidad**: Preparado para crecer  
✅ **Documentación**: Código autodocumentado  
✅ **Testing**: Arquitectura lista para pruebas  

---

## 🏗️ Componentes Principales

### 1. Frontend (React + Vite + Tailwind)

**Ubicación**: `/frontend`

Responsabilidades:
- Interfaz de usuario inmersiva
- Consumo de APIs del backend
- Manejo de estado (Context API)
- Mapas interactivos (Leaflet/Mapbox)
- Gráficos y visualizaciones

Características:
- Modo oscuro real (tema nocturno)
- Responsive design (mobile first)
- Rutas modulares
- Servicios centralizados

**Stack**:
- React 18
- Vite (empaquetador rápido)
- Tailwind CSS
- React Router
- Axios

---

### 2. Backend API (Node.js + Express)

**Ubicación**: `/backend`

Responsabilidades:
- Gestión de datos
- Autenticación/Autorización
- Comunicación con externa APIs
- Coordinación con Sky Engine
- Caching y optimización

Características:
- Estructura MVC modular
- Manejo centralizado de errores
- Middlewares profesionales
- Logging completo
- CORS habilitado

**Stack**:
- Node.js (>=18)
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT
- Helmet

**Estructura**:
```
backend/
├── config/              # Configuraciones
├── controllers/         # Lógica de negocio
├── routes/             # Definición de rutas
├── middlewares/        # Middleware personalizado
├── services/           # Servicios de negocio
├── utils/              # Funciones auxiliares
├── database/
│   ├── models/        # Modelos Sequelize
│   ├── migrations/    # Migraciones DB
│   └── seeds/         # Seeds de datos
└── index.js           # Punto de entrada
```

---

### 3. Python Service (Sky Engine)

**Ubicación**: `/python-service`

Responsabilidades:
- Cálculos astronómicos complejos
- Algoritmo de Sky Score
- Predicciones astronómicas
- Análisis de visibilidad
- Procesamiento científico

Características:
- API REST independiente
- Lógica científica pura
- Escalable horizontalmente
- Testing incluido

**Stack**:
- Python 3.9+
- Flask
- NumPy/Pandas
- Astropy
- Ephem

**Estructura**:
```
python-service/
├── sky_engine/        # Motor de cálculos
├── scoring/           # Algoritmos de puntuación
├── analytics/         # Análisis avanzados
├── config.py          # Configuración
├── requirements.txt   # Dependencias
└── main.py           # Punto de entrada
```

---

### 4. Automatización (n8n)

**Ubicación**: `/automation`

Responsabilidades:
- Actualizaciones automáticas de clima
- Recálculo periódico de Sky Score
- Sincronización de APIs externas
- Notificaciones y alertas
- Tareas programadas

**Flujos principales**:
- Actualización horaria de clima
- Recálculo de Sky Zones cada 6 horas
- Sincronización de eventos astronómicos
- Limpieza y mantenimiento de datos

---

### 5. Base de Datos (PostgreSQL)

**Ubicación**: `/database`

Modelos principales:
- `Users`: Usuarios de la plataforma
- `Locations`: Zonas de observación
- `Weather`: Datos meteorológicos
- `AstronomicalEvents`: Eventos
- `SkyScoreHistory`: Historial de puntuaciones
- `Observations`: Registros de observaciones

---

### 6. Infraestructura

Actualmente no hay configuración de infraestructura desplegada.

---

## 🔄 Flujo de Datos

```
Frontend (React)
    ↓
Backend API (Express)
    ├── Consulta DB
    ├── Llama Sky Engine (Python)
    └── Integra APIs externas
        ├── OpenWeatherMap
        ├── AstronomyAPI
        └── NASA API
    ↓
Frontend (actualiza UI)
```

---

## 📡 APIs Internas

### Backend → Python Service

```
POST /api/sky-score
GET /api/what-to-see
GET /api/events
POST /api/zone-analysis
```

### Frontend → Backend

```
GET /api/sky/today
GET /api/zones
GET /api/map
GET /api/events
POST /api/auth/login
GET /api/what-to-see
```

---

## 🔐 Seguridad

✅ **CORS**: Restringido a dominio frontend  
✅ **JWT**: Autenticación token-based  
✅ **Helmet**: Headers de seguridad HTTP  
✅ **Validación**: Joi para validar datos  
✅ **Rate Limiting**: Próximamente  
✅ **HTTPS**: En producción obligatorio  

---

## 🚀 Escalabilidad

### Horizontal
- Múltiples instancias de backend
- Load balancing
- Redis para caching

### Vertical
- Optimización de DB queries
- Índices en PostgreSQL
- Caching estratégico

### Microservicios
- Python Service independiente
- Fácil agregar nuevos servicios
- Comunicación async-ready

---

## 📊 Modelos de Datos Principales

### Sky Zones
```javascript
{
  id: UUID,
  name: String,
  latitude: Float,
  longitude: Float,
  altitude: Int,
  island: Enum,
  light_pollution: Float,
  sky_score: Float,
  last_updated: DateTime
}
```

### Weather Data
```javascript
{
  id: UUID,
  location_id: UUID,
  cloudiness: Float,
  wind_speed: Float,
  humidity: Float,
  temperature: Float,
  timestamp: DateTime
}
```

### Astronomical Events
```javascript
{
  id: UUID,
  name: String,
  type: Enum,
  start_date: DateTime,
  end_date: DateTime,
  description: Text,
  visibility_score: Float
}
```

---

## 🔄 Ciclo de Vida de una Solicitud

1. **Frontend**: Usuario solicita "Sky Today"
2. **API**: GET /api/sky/today?lat=28.33&lng=-16.49
3. **Backend**: 
   - Valida parámetros
   - Busca datos en caché
   - Si no existe, consulta DB
   - Llama Sky Engine
4. **Python Service**:
   - Obtiene datos meteorológicos
   - Calcula Sky Score
   - Devuelve resultado
5. **Backend**:
   - Cachea resultado
   - Retorna JSON
6. **Frontend**: 
   - Recibe datos
   - Renderiza UI

---

## 📚 Tecnologías Externas

**Clima**: OpenWeatherMap API  
**Astronomía**: AstronomyAPI + NASA API  
**Mapas**: Leaflet / Mapbox  
**Automatización**: n8n  
**Base de datos**: PostgreSQL  

---

## 🧪 Testing

### Backend
- Jest para unit tests
- Supertest para API tests
- Coverage mínimo 70%

### Frontend
- Vitest para unit tests
- React Testing Library para componentes
- Coverage mínimo 60%

### Python Service
- Pytest para tests
- Coverage mínimo 80%

---

## 📈 Monitoreo

- Logs centralizados
- Errores capturados
- Métricas de performance
- Health checks

---

## 🎯 Próximos Pasos

1. **MVP Fase 1**: Sky Today + Map Explorer
2. **MVP Fase 2**: Sky Zones + Ranking
3. **Fase 3**: AI + Predicciones avanzadas
4. **Fase 4**: Monetización + Premium

---

## 📝 Convenciones

### Nombres
- Archivos: `camelCase.js`
- Componentes React: `PascalCase.jsx`
- Variables: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos CSS: `name.module.css` o `name.css`

### Commits
```
feat: agregar feature X
fix: corregir bug Y
refactor: reorganizar código
docs: actualizar documentación
test: agregar tests
chore: tareas de mantenimiento
```

### Ramas
- `main`: Producción
- `develop`: Desarrollo
- `feature/nombre`: Nuevas features
- `fix/nombre`: Correcciones

---

## 🤝 Integración Externa: Caminos Reales

AdAstraSky integra el proyecto "Caminos Reales" (senderismo) como complemento:

- Botón/tarjeta en footer o sección "Proyectos Relacionados"
- Link externo a dominio de Caminos Reales
- SIN integración de backend compartido
- Ambos proyectos independientes

---

## 📞 Soporte

- Docs en `/docs`
- README en cada carpeta
- Comments en código complejo
- Ejemplo de API en `/docs/api-examples`

---

**Creado**: 25 de mayo de 2024  
**Versión**: 1.0.0  
**Estado**: En desarrollo (MVP)
