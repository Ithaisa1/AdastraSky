# Sky Engine — Python Microservice

Microservicio de cálculos astronómicos y análisis de condiciones de cielo.

## Estructura

```
sky_engine/
├── __init__.py
├── calculator.py         # SkyScoreCalculator, WhatToSeeCalculator, AstronomicalEvents
└── utils.py              # Funciones auxiliares (fase lunar, hora local, etc.)

scoring/
├── __init__.py
├── sky_score.py          # Algoritmo SkyScoreAlgorithm (0-10)

analytics/
├── __init__.py
└── ... (no implementado)

config.py                 # Configuración Flask
main.py                   # Punto de entrada Flask
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/sky-score` | Calcular Sky Score desde datos atmosféricos |
| GET | `/api/what-to-see` | Obtener objetos visibles en coordenadas |
| GET | `/api/events` | Eventos astronómicos próximos |

### POST /api/sky-score
```json
{
  "cloudiness": 0.12,
  "light_pollution": 0.15,
  "moon_phase": 0.43,
  "wind": 5,
  "humidity": 0.45
}
```
Devuelve: `{ "sky_score": 8.9, "factors": {...}, "recommendation": "..." }`

### GET /api/what-to-see?latitude=28.33&longitude=-16.49
Devuelve planetas, constelaciones y objetos Messier visibles.

## Ejecución

```bash
pip install -r requirements.txt
python main.py            # http://localhost:5001
```
