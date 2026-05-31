# 🌌 AdAstraSky - README

**Plataforma inteligente de astroturismo y exploración nocturna**

Enfocada en las Islas Canarias con arquitectura moderna, escalable y profesional.

---

## 🎯 Visión del Proyecto

AdAstraSky responde 3 preguntas fundamentales:

1. **¿Vale la pena observar el cielo hoy?** → Sky Score
2. **¿Dónde es el mejor lugar en Canarias?** → Sky Zones
3. **¿Qué se puede ver exactamente?** → What to See

Combinando astronomía, meteorología, geolocalización y visualización inteligente.

---

## 🧱 Stack Tecnológico

| Componente | Stack |
|-----------|-------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express + PostgreSQL |
| Motor Científico | Python + Astropy + Ephem |
| Automatización | n8n |
| Mapas | Leaflet / Mapbox |
| APIs Externas | OpenWeatherMap, AstronomyAPI, NASA |

---

## 📁 Estructura del Proyecto

```
adastrasky/
├── frontend/           # Interfaz React
├── backend/            # API Express
├── python-service/     # Sky Engine (cálculos astronómicos)
├── automation/         # Workflows n8n
├── database/           # Modelos y migraciones
├── docs/               # Documentación
├── infrastructure/     # Docker, deployment
└── README.md           # Este archivo
```

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js >= 18
- Python >= 3.9
- PostgreSQL >= 12
- npm o yarn

### Backend

```bash
cd backend
cp .env.example .env          # Configurar variables
npm install
npm run dev                    # Desarrollar
npm run migrate               # Migraciones DB
```

**Health Check**: http://localhost:5000/health

### Frontend

```bash
cd frontend
npm install
npm run dev                    # Desarrollar en http://localhost:3000
npm run build                  # Buildear para producción
```

### Python Service

```bash
cd python-service
pip install -r requirements.txt
python -m flask run --port=5001
```

---

## 🌟 Características Principales

### ✨ Sky Today
- Sky Score (puntuación 0-10)
- Condiciones meteorológicas en tiempo real
- Fase lunar y visibilidad
- Mejor hora para observar

### 🗺️ Map Explorer
- Mapa interactivo de Canarias
- Sky Zones con puntuaciones
- Filtros por isla
- Coordenadas GPS

### 🪐 What to See Tonight
- Planetas visibles
- Constelaciones detectables
- Vía Láctea
- Eventos activos

### 📅 Eventos Astronómicos
- Calendario dinámico
- Eclipses, superlunas, lluvias de meteoros
- Notificaciones de eventos próximos

### 🧠 Sky Score System™
Algoritmo patentable que combina:
- Nubosidad (30%)
- Contaminación lumínica (30%)
- Fase lunar (15%)
- Viento (10%)
- Humedad (10%)
- Transparencia (5%)

---

## 📚 APIs Principales

### Sky Today
```bash
GET /api/sky/today?lat=28.3301&lng=-16.4923
```

### Sky Score
```bash
POST /api/sky/score
{
  "latitude": 28.3301,
  "longitude": -16.4923,
  "cloudiness": 0.12
}
```

### Sky Zones
```bash
GET /api/zones?island=tenerife
```

### What to See
```bash
GET /api/what-to-see?lat=28.33&lng=-16.49
```

---

## 🔑 Configuración de Ambiente

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=adastrasky

WEATHER_API_KEY=your_key
ASTRONOMY_API_KEY=your_key
NASA_API_KEY=your_key

PYTHON_SERVICE_URL=http://localhost:5001
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎨 Diseño Visual

- **Tema**: Modo oscuro real (tema nocturno)
- **Paleta**: Azules, negros profundos, acentos cyan
- **Componentes**: Tarjetas con glassmorphism
- **Efectos**: Suaves transiciones, animaciones espaciales

---

## 🧪 Testing

### Backend
```bash
npm test                # Ejecutar tests
npm run test:coverage   # Coverage
```

### Frontend
```bash
npm run test           # Vitest
npm run test:coverage  # Coverage
```

### Python Service
```bash
pytest
pytest --cov
```

---

## 📖 Documentación

- [Arquitectura](./docs/ARCHITECTURE.md) - Diseño del sistema
- [API Documentation](./docs/API.md) - Endpoints detallados
- [Database Schema](./docs/DATABASE.md) - Modelos de datos
- [Contributing](./CONTRIBUTING.md) - Cómo contribuir

---

## 🔄 Flujo de Desarrollo

1. **Feature branch**: `git checkout -b feature/mi-feature`
2. **Desarrollo**: Hacer cambios
3. **Tests**: `npm test`
4. **Commit**: `git commit -m "feat: descripción"`
5. **Push**: `git push origin feature/mi-feature`
6. **PR**: Crear pull request

---

## 🤝 Integración: Caminos Reales

AdAstraSky integra el proyecto "Caminos Reales" (senderismo) como complemento externo:

- Botón en footer: "🥾 Explorar Caminos Reales"
- Link externo (sin integración backend)
- Sección "Proyectos Relacionados"

---

## 📈 Roadmap

### FASE 1 (MVP - Actual)
- [x] Estructura base
- [x] Sky Today core
- [x] Frontend inicial
- [ ] Integración APIs externas
- [ ] Sky Score funcional

### FASE 2 (Diferenciación)
- [ ] Sky Zones System
- [ ] Ranking por islas
- [ ] Mapas avanzados

### FASE 3 (Inteligencia)
- [ ] AI Assistant
- [ ] Predicciones por horas
- [ ] Sky Heatmap

### FASE 4 (Monetización)
- [ ] Modo empresas
- [ ] Versión premium
- [ ] Paneles profesionales

---

## 💼 Profesionalismo

Este proyecto está diseñado como:
✅ **Producto real** - No académico  
✅ **Portfolio profesional** - De calidad startup  
✅ **Escalable** - Preparado para crecer  
✅ **Mantenible** - Código limpio y documentado  
✅ **Testeable** - Con cobertura de tests  

---

## 🛠️ Troubleshooting

### Puerto en uso
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Base de datos no conecta
```bash
# Verificar PostgreSQL está corriendo
psql -U postgres

# Crear DB
createdb adastrasky
```

### Python dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 📞 Contacto & Soporte

- 📧 Email: support@adastrasky.com
- 🌐 Web: www.adastrasky.com
- 📱 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 📄 Licencia

MIT License - Libre para usar, modificar y distribuir.

---

## 🙏 Agradecimientos

- Comunidad astronómica de Canarias
- Proyecto "Caminos Reales" por integración
- Todas las APIs externas por datos

---

**Última actualización**: 25 de mayo de 2024  
**Versión**: 1.0.0 (MVP)  
**Estado**: 🚀 En desarrollo activo
