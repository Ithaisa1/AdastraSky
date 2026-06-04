# Convenciones del Proyecto AdAstraSky

---

## Estructura de Archivos

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── config/database.js       # PostgreSQL + Sequelize
│   ├── controllers/              # auth, chat, sky, island
│   ├── middleware/               # authMiddleware, errorHandler, notFound
│   ├── models/                   # User, SkyQualityZone, ChatHistory
│   ├── routes/                   # auth, chat, sky, island, contact
│   ├── seed/seedUsers.js         # Seed de usuarios demo
│   └── swagger.js                # Configuración Swagger/OpenAPI
├── server.js                     # Punto de entrada
├── package.json
├── .env / .env.example
└── README.md
```

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   └── Card.jsx
│   ├── pages/          # Páginas (rutas)
│   │   ├── SkyToday.jsx
│   │   └── MapExplorer.jsx
│   ├── layouts/        # Layouts
│   │   └── MainLayout.jsx
│   ├── services/       # Servicios (API calls)
│   │   ├── api.js
│   │   └── skyService.js
│   ├── hooks/          # Custom hooks
│   │   └── useSkyScore.js
│   ├── context/        # Context API
│   │   └── SkyContext.jsx
│   ├── styles/         # CSS/Tailwind
│   │   ├── index.css
│   │   └── components.css
│   ├── utils/          # Funciones auxiliares
│   │   └── formatters.js
│   ├── assets/         # Imágenes, fuentes
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

### AI Service + Sky Engine (FastAPI)

```
ai-service/
├── agent/
│   ├── agent.py         # LangGraph StateGraph
│   ├── state.py         # Definición de estado
│   └── tools.py         # Tools: RAG, weather, sky score
├── sky_engine/
│   ├── __init__.py
│   ├── sky_score.py     # Sky Score Algorithm (0-10)
│   └── utils.py         # Moon illumination, helpers
├── rag/
│   ├── vector_store.py  # ChromaDB wrapper
│   └── ingest.py        # Poblado de documentos
├── routers/
│   ├── health.py
│   ├── chat.py
│   └── sky.py           # /api/sky-score, what-to-see, events
├── documents/           # Documentos IAC para RAG
├── config.py            # Pydantic settings
├── main.py              # FastAPI entry point
└── requirements.txt
```
python-service/
├── sky_engine/
│   ├── __init__.py
│   ├── calculator.py
│   ├── models.py
│   └── utils.py
├── scoring/
│   ├── __init__.py
│   ├── sky_score.py
│   └── factors.py
├── analytics/
│   ├── __init__.py
│   └── predictor.py
├── config.py
├── main.py
├── requirements.txt
└── README.md
```

---

## 📝 Nombres de Archivos

### JavaScript/React
- Componentes: `PascalCase.jsx` → `SkyScore.jsx`
- Servicios: `camelCase.js` → `skyService.js`
- Hooks: `camelCase.js` → `useSkyScore.js`
- Utils: `camelCase.js` → `formatters.js`
- Constants: `UPPER_SNAKE_CASE.js` → `API_ENDPOINTS.js`

### Python
- Módulos: `snake_case.py` → `sky_score.py`
- Clases: `PascalCase` → `SkyScoreCalculator`
- Funciones: `snake_case` → `calculate_score()`
- Constantes: `UPPER_SNAKE_CASE` → `MAX_SCORE = 10`

### CSS/Styles
- `camelCase.css` → `skyCard.css` o `sky-card.css`
- `component.module.css` → Para scoped styles

---

## 🎨 Nombres de Variables

### Booleanos
```javascript
// ✅ Bueno
const isVisible = true;
const hasError = false;
const canObserve = true;

// ❌ Evitar
const visible = true;
const error = false;
```

### Arrays y Colecciones
```javascript
// ✅ Bueno
const zones = [];
const weatherData = [{ temp: 20 }];
const visiblePlanets = ['Jupiter', 'Venus'];

// ❌ Evitar
const zone = [];
const weather = [{ temp: 20 }];
```

### Funciones
```javascript
// ✅ Bueno
const calculateSkyScore = (factors) => {};
const formatDate = (date) => {};
const isValidEmail = (email) => {};

// ❌ Evitar
const calc = (f) => {};
const fmt = (d) => {};
const valid = (e) => {};
```

---

## 📋 Estructura de Funciones

### JavaScript

```javascript
/**
 * Descripción clara de qué hace la función
 * 
 * @param {Type} paramName - Descripción del parámetro
 * @returns {Type} Descripción del retorno
 * @throws {Error} Cuando falla
 * 
 * @example
 * const result = myFunction({ ...options });
 */
export const myFunction = async (options) => {
  // Validación
  if (!options.required) {
    throw new Error('Required parameter missing');
  }
  
  // Lógica principal
  const result = await someOperation();
  
  // Retorno
  return result;
};
```

### Python

```python
def calculate_sky_score(factors: Dict[str, float]) -> float:
    """
    Calcula el Sky Score basado en factores atmosféricos.
    
    Args:
        factors: Diccionario con factores (cloudiness, wind, etc)
    
    Returns:
        float: Sky Score de 0 a 10
    
    Raises:
        ValueError: Si factores inválidos
    
    Example:
        >>> score = calculate_sky_score({'cloudiness': 0.5})
        >>> print(score)
        7.5
    """
    if not isinstance(factors, dict):
        raise ValueError("factors must be a dictionary")
    
    # Lógica
    score = factors.get('cloudiness', 0) * 0.3
    
    return round(score, 1)
```

---

## 💬 Comentarios

### ❌ Comentarios Innecesarios
```javascript
// Increment counter
counter++;

// Check if array is empty
if (array.length === 0) {}
```

### ✅ Comentarios Útiles
```javascript
// Usar Math.abs porque ephem devuelve valores negativos para longitud oeste
const adjustedLongitude = Math.abs(longitude);

// TODO: Implementar caché de Redis cuando la BD crezca
// FIXME: Esta fórmula falla cuando la Luna está en perigeo
```

---

## 🧪 Nombres de Tests

```javascript
// ✅ Bueno - Describe comportamiento
describe('calculateSkyScore', () => {
  it('should return 10 when all conditions are perfect', () => {});
  it('should return 0 when cloudy and windy', () => {});
  it('should throw error when factors are missing', () => {});
});

// ❌ Evitar - Ambiguo
describe('test', () => {
  it('works', () => {});
  it('test 1', () => {});
});
```

---

## 📐 Indentación y Espacios

```javascript
// 2 espacios (estándar en proyecto)
const obj = {
  prop1: 'value',
  prop2: 'value'
};

// No usar tabs
// ✅ Bueno: 2 espacios
// ❌ Evitar: Tabs o 4 espacios
```

---

## 🔀 Control de Ramas

### Nombrado de Ramas

```
main              # Producción (versión estable)
develop           # Desarrollo (rama integradora)
feature/*         # Nuevas features
fix/*             # Correcciones de bugs
refactor/*        # Reorganizaciones de código
docs/*            # Cambios en documentación
```

### Ejemplos
```
feature/sky-score-algorithm
feature/interactive-map
fix/weather-api-timeout
refactor/database-queries
docs/api-endpoints
```

---

## 📦 Imports y Exports

### JavaScript

```javascript
// ✅ Bueno - Específicos
import { calculateScore } from '../utils/calculator.js';
import { User } from '../models/index.js';

// ❌ Evitar - Import de todo
import * as utils from '../utils.js';

// ✅ Bueno - Exports
export const myFunction = () => {};
export default App;

// ❌ Evitar
module.exports = { ... };
```

### Python

```python
# ✅ Bueno
from scoring.sky_score import SkyScoreAlgorithm
from config import Config

# ❌ Evitar - Imports circulares
from . import circular_reference
```

---

## 🔐 Variables de Entorno

### Nomenclatura

```
ENVIRONMENT_SCOPE_NAME

# Backend
NODE_ENV
PORT
DB_HOST
DB_USER
JWT_SECRET
WEATHER_API_KEY

# Frontend (con prefijo)
VITE_API_URL
VITE_MAP_TOKEN
```

### ✅ Correcto
```env
NODE_ENV=development
DB_HOST=localhost
WEATHER_API_KEY=abc123
```

### ❌ Evitar
```env
env=dev          # Usar NODE_ENV
host=localhost   # Usar DB_HOST
key=abc123       # Usar WEATHER_API_KEY
```

---

## 🎯 Commits

```bash
# Formato
git commit -m "type: brief description"

# Tipos válidos
feat:     # Nueva feature
fix:      # Corrección de bug
refactor: # Reorganización
docs:     # Documentación
test:     # Tests
style:    # Formato (sin lógica)
chore:    # Mantenimiento

# ✅ Ejemplos buenos
git commit -m "feat: add sky score calculation"
git commit -m "fix: correct weather api timeout"
git commit -m "docs: update api documentation"

# ❌ Evitar
git commit -m "Update"
git commit -m "Fix stuff"
git commit -m "asdf"
```

---

## 🔍 Code Review Checklist

- [ ] Código sigue convenciones
- [ ] Nombres descriptivos
- [ ] Sin comentarios innecesarios
- [ ] Tests incluidos
- [ ] Documentación actualizada
- [ ] Sin errores de linting
- [ ] Performance considerado
- [ ] Manejo de errores completo

---

## ⚠️ Anti-patrones

### ❌ Magic Numbers

```javascript
// Evitar
const score = factors * 30 / 100 + bonus * 15 / 100;

// ✅ Bueno
const CLOUDINESS_WEIGHT = 0.30;
const BONUS_WEIGHT = 0.15;
const score = factors * CLOUDINESS_WEIGHT + bonus * BONUS_WEIGHT;
```

### ❌ Callbacks Anidados

```javascript
// Evitar (callback hell)
getUser((user) => {
  getWeather((weather) => {
    calculateScore((score) => {
      console.log(score);
    });
  });
});

// ✅ Bueno (async/await)
const user = await getUser();
const weather = await getWeather();
const score = await calculateScore();
```

### ❌ Datos Directos en Frontend

```javascript
// ❌ Evitar - Hardcoded
const zones = [
  { name: 'Zone 1', score: 8.5 },
  { name: 'Zone 2', score: 7.2 }
];

// ✅ Bueno - De API
const zones = await fetchZones();
```

---

## 📚 Referencia Rápida

| Elemento | Formato | Ejemplo |
|----------|---------|---------|
| Archivo JS | camelCase.js | skyService.js |
| Componente React | PascalCase.jsx | SkyCard.jsx |
| Función | camelCase | calculateScore |
| Variable booleana | isCamelCase | isVisible |
| Constante | UPPER_SNAKE | MAX_SCORE |
| Clase Python | PascalCase | SkyScoreCalculator |
| Función Python | snake_case | calculate_score |
| Rama | type/nombre | feature/sky-zones |
| Commit | type: msg | feat: add scoring |

---

**Última actualización**: 25/05/2024  
**Versión**: 1.0.0
