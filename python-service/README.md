# AdAstraSky - Sky Engine (Microservicio Python)

Microservicio especializado en cálculos astronómicos y análisis de condiciones de cielo.

## Responsabilidades

- **Sky Score**: Cálculo de puntuación astronómica (0-10)
- **Scoring**: Análisis combinado de múltiples factores
- **Analytics**: Procesamiento de datos históricos y predicciones
- **Sky Zones**: Análisis geográfico de zonas de observación

## Estructura

```
sky_engine/
├── __init__.py
├── calculator.py         # Lógica de cálculo principal
├── models.py            # Modelos científicos
└── utils.py             # Funciones auxiliares

scoring/
├── __init__.py
├── sky_score.py         # Algoritmo de Sky Score
├── factors.py           # Factores de puntuación
└── weights.py           # Pesos y configuración

analytics/
├── __init__.py
├── predictor.py         # Predicciones
├── aggregator.py        # Agregación de datos
└── reporter.py          # Generación de reportes
```

## APIs Internas

El microservicio expone endpoints REST que el backend de Node.js consume.

### POST /api/sky-score
```json
{
  "latitude": 28.3301,
  "longitude": -16.4923,
  "cloudiness": 0.12,
  "wind_speed": 5,
  "humidity": 45,
  "light_pollution": 0.15,
  "moon_phase": 0.43
}
```

Devuelve: Sky Score (0-10) con detalles

### GET /api/what-to-see
```json
{
  "latitude": 28.3301,
  "longitude": -16.4923,
  "date": "2024-05-25",
  "time": "23:30"
}
```

## Tecnologías

- **astropy**: Cálculos astronómicos
- **numpy**: Computación numérica
- **pandas**: Análisis de datos
- **flask**: API REST

## Ejecución

```bash
python -m flask run --port=5001
```
