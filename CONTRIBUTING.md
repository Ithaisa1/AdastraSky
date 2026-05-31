# 🤝 Guía de Contribución

## Bienvenida 👋

¡Gracias por tu interés en contribuir a AdAstraSky!

Este documento explica cómo contribuir al proyecto de forma profesional.

---

## 📋 Requisitos

- Node.js >= 18
- Python >= 3.9
- PostgreSQL >= 12
- Git

---

## 🔄 Flujo de Trabajo

### 1. Fork del Repositorio

```bash
git clone https://github.com/tu-usuario/adastrasky.git
cd adastrasky
```

### 2. Crear Feature Branch

```bash
git checkout -b feature/nombre-descriptivo
```

Ejemplos válidos:
- `feature/sky-score-algorithm`
- `fix/weather-api-error`
- `docs/api-documentation`
- `refactor/database-optimization`

### 3. Desarrollo

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Python Service
```bash
cd python-service
pip install -r requirements.txt
python main.py
```

### 4. Crear Tests

```bash
# Backend
npm test

# Frontend
npm run test

# Python
pytest
```

### 5. Commit con Mensajes Descriptivos

```bash
git add .
git commit -m "feat: agregar cálculo de Sky Score"
```

Tipos de commit:
- **feat**: Nueva feature
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de código sin lógica
- **refactor**: Reorganizar código
- **test**: Agregar tests
- **chore**: Tareas de mantenimiento

### 6. Push y Pull Request

```bash
git push origin feature/nombre
```

Luego crear un Pull Request en GitHub con descripción detallada.

---

## 💻 Convenciones de Código

### JavaScript/Node.js

```javascript
// ✅ Bueno
const calculateSkyScore = (factors) => {
  const score = factors.cloudiness * 0.3 + factors.light_pollution * 0.3;
  return Math.round(score, 1);
};

// ❌ Evitar
const calc = (f) => {
  return Math.round(f.c * 0.3 + f.lp * 0.3, 1);
};
```

### Python

```python
# ✅ Bueno
def calculate_sky_score(cloudiness, light_pollution):
    """Calcula Sky Score basado en factores atmosféricos."""
    score = cloudiness * 0.3 + light_pollution * 0.3
    return round(score, 1)

# ❌ Evitar
def calc(c, lp):
    return round(c * 0.3 + lp * 0.3, 1)
```

### React

```javascript
// ✅ Bueno
export function SkyScoreCard({ score, factors }) {
  return (
    <div className="card">
      <h2>Sky Score</h2>
      <div className="score">{score}</div>
      <Details factors={factors} />
    </div>
  );
}

// ❌ Evitar
export default (p) => (
  <div>
    <h2>Sky Score</h2>
    <div>{p.s}</div>
  </div>
);
```

---

## ✅ Checklist Antes de Submit

- [ ] Código sigue las convenciones
- [ ] Tests pasan: `npm test`
- [ ] Linter sin errores: `npm run lint`
- [ ] Documentación actualizada
- [ ] Sin dependencias no usadas
- [ ] Variables nombradas descriptivamente
- [ ] Commits en historia clara

---

## 📚 Estructura de Comentarios

```javascript
/**
 * Calcula el Sky Score de una ubicación
 * 
 * @param {Object} factors - Factores atmosféricos
 * @param {number} factors.cloudiness - 0-1
 * @param {number} factors.wind - km/h
 * @returns {number} Sky Score (0-10)
 * 
 * @example
 * const score = calculateSkyScore({
 *   cloudiness: 0.12,
 *   wind: 5
 * });
 */
```

---

## 🧪 Testing Mínimos

### Backend
- Unit tests para funciones críticas
- Integration tests para APIs
- Coverage >= 70%

### Frontend
- Component tests
- User interaction tests
- Coverage >= 60%

### Python
- Unit tests para algoritmos
- Coverage >= 80%

---

## 📝 Actualizar Documentación

Si tu cambio afecta:
- **APIs**: Actualizar `/docs/API.md`
- **Arquitectura**: Actualizar `/docs/ARCHITECTURE.md`
- **Setup**: Actualizar `/README.md`

---

## 🚨 Reportar Bugs

Usar GitHub Issues con template:

```markdown
## Descripción del Bug

Breve descripción...

## Pasos para Reproducir

1. ...
2. ...
3. ...

## Comportamiento Esperado

...

## Comportamiento Actual

...

## Screenshots

(Si aplica)

## Environment

- OS: Windows/Mac/Linux
- Node: 18.x
- Browser: Chrome 120
```

---

## 💡 Sugerencias de Features

Usar GitHub Discussions con:

```markdown
## Título de la Feature

Descripción clara del problema que resuelve...

## Solución Propuesta

Cómo debería funcionar...

## Contexto

Por qué es importante...
```

---

## 📞 Comunicación

- **Chat**: Discord (enlace en README)
- **Issues**: Para bugs
- **Discussions**: Para features
- **Email**: team@adastrasky.com

---

## 🎓 Recursos Útiles

- [Documentación de Arquitectura](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Database Schema](./DATABASE.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 🙏 Gracias por Contribuir

Tu contribución es valiosa para AdAstraSky. ¡Adelante! 🌌

---

**Última actualización**: 25/05/2024
