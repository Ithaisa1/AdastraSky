# Auditoría de Limpieza Segura de Archivos

> **Fecha:** 12/06/2026
> **Regla:** NO eliminar nada sin aprobación explícita. Informe previo obligatorio.

---

## Resumen de Archivos No Utilizados

### ELIMINACIÓN SEGURA (100% confirmado sin uso)

| Archivo | Ruta | Tipo | Riesgo |
|---------|------|------|--------|
| Navigation.jsx | `frontend/src/components/Navigation.jsx` | Componente | Bajo |
| Footer.jsx | `frontend/src/components/Footer.jsx` | Componente | Bajo |
| StatCard.jsx | `frontend/src/components/ui/StatCard.jsx` | UI Primitiva | Bajo |
| EmptyState.jsx | `frontend/src/components/ui/EmptyState.jsx` | UI Primitiva | Bajo |
| ChipGroup.jsx | `frontend/src/components/ui/ChipGroup.jsx` | UI Primitiva | Bajo |
| Card.jsx | `frontend/src/components/ui/Card.jsx` | UI Primitiva | Bajo |
| Badge.jsx | `frontend/src/components/ui/Badge.jsx` | UI Primitiva | Bajo |
| MapLegend.jsx | `frontend/src/components/map/MapLegend.jsx` | Componente Mapa | Bajo |
| useLocalStorage.js | `frontend/src/hooks/useLocalStorage.js` | Hook | Bajo |
| weatherService.js | `frontend/src/services/weatherService.js` | Servicio | Bajo |
| mapService.js | `frontend/src/services/mapService.js` | Servicio | Bajo |
| astronomyService.js | `frontend/src/services/astronomyService.js` | Servicio | Bajo |
| favicon.ico | `frontend/src/assets/favicon.ico` | Asset | Bajo |
| excursions.json | `frontend/src/data/excursions.json` | Dato | Bajo |
| islas.json | `frontend/src/data/islas.json` | Dato | Bajo |

**Total: 15 archivos, riesgo bajo confirmado. ✅ ELIMINADOS (commit 72c9a64)**

---

### REVISIÓN MANUAL (posible uso oculto o dinámico)

| Archivo | Ruta | Motivo | Riesgo |
|---------|------|--------|--------|
~~EventsPage.jsx~~ | ~~`frontend/src/pages/EventsPage.jsx`~~ | ✅ ELIMINADO | — |
~~weather.json~~ | ~~`frontend/src/data/weather.json`~~ | ✅ ELIMINADO | — |
~~islands.json~~ | ~~`frontend/src/data/islands.json`~~ | ✅ ELIMINADO | — |
~~observationPoints.json~~ | ~~`frontend/src/data/observationPoints.json`~~ | ✅ ELIMINADO | — |
~~lightPollution.json~~ | ~~`frontend/src/data/lightPollution.json`~~ | ✅ ELIMINADO | — |
~~events.json~~ | ~~`frontend/src/data/events.json`~~ | ✅ ELIMINADO | — |
~~constellations.json~~ | ~~`frontend/src/data/constellations.json`~~ | ✅ ELIMINADO | — |

**Total: 7 archivos, todos eliminados.**

---

### NO ELIMINAR (críticos para el sistema)

| Archivo | Ruta | Motivo |
|---------|------|--------|
| Todos los controllers | `backend/src/controllers/*` | API activa |
| Todos los modelos | `backend/src/models/*` | DB activa |
| Todas las rutas | `backend/src/routes/*` | Enrutamiento activo |
| AuthContext.jsx | `frontend/src/context/AuthContext.jsx` | Auth activo |
| server.js | `backend/server.js` | Entry point |
| main.py | `ai-service/main.py` | Entry point IA |
| render.yaml | `render.yaml` | Config deploy |
| vercel.json | `frontend/vercel.json` | Config deploy |
| Archivos RAG | `ai-service/documents/*.md` | Fuente de conocimiento IA |
| Scripts seed | `backend/src/seed/*` | Población DB |
| Datos activos | `frontend/src/data/santuariosData.js` | 95+ zonas activas |
| Datos activos | `frontend/src/data/astronomicalData.js` | Constelaciones/planetas |
| Datos activos | `frontend/src/data/observatoriesData.js` | Observatorios |

---

## Análisis Detallado de Archivos Candidatos a Eliminación

### 1. Components no utilizados

#### `Navigation.jsx`
- **Ruta:** `frontend/src/components/Navigation.jsx`
- **Propósito:** Barra de navegación superior simple
- **Uso real:** 0 imports en todo el código fuente
- **Alternativa:** Sidebar.jsx es el componente de navegación activo
- **Riesgo eliminación:** Bajo — sin imports ni referencias dinámicas
- **Dependencias indirectas:** Ninguna

#### `Footer.jsx`
- **Ruta:** `frontend/src/components/Footer.jsx`
- **Propósito:** Pie de página con enlaces
- **Uso real:** 0 imports
- **Riesgo eliminación:** Bajo
- **Dependencias indirectas:** Ninguna

#### UI primitives (StatCard, EmptyState, ChipGroup, Card, Badge)
- **Ruta:** `frontend/src/components/ui/*`
- **Uso real:** Ninguno tiene imports
- **Riesgo eliminación:** Bajo — parecen ser primitivas de un diseño system no implementado
- **Dependencias indirectas:** Ninguna

#### `MapLegend.jsx`
- **Ruta:** `frontend/src/components/map/MapLegend.jsx`
- **Propósito:** Leyenda del mapa interactivo
- **Uso real:** 0 imports — la leyenda está directamente en InteractiveMap.jsx
- **Riesgo eliminación:** Bajo

---

### 2. Servicios no utilizados

#### `weatherService.js`
- **Ruta:** `frontend/src/services/weatherService.js`
- **Propósito:** Obtener datos del tiempo desde JSON local
- **Uso real:** 0 imports
- **Alternativa:** SanctuaryPanel.jsx llama a `GET /api/weather/current` directamente
- **Datos asociados:** weather.json (solo importado por este servicio)

#### `mapService.js`
- **Ruta:** `frontend/src/services/mapService.js`
- **Propósito:** Obtener puntos del mapa desde JSON
- **Uso real:** 0 imports
- **Alternativa:** InteractiveMap.jsx importa santuariosData.js directamente
- **Datos asociados:** islands.json, observationPoints.json, lightPollution.json

#### `astronomyService.js`
- **Ruta:** `frontend/src/services/astronomyService.js`
- **Propósito:** Obtener datos astronómicos desde JSON
- **Uso real:** 0 imports
- **Alternativa:** astronomicalData.js se importa directamente
- **Datos asociados:** events.json, constellations.json

---

### 3. Datos JSON huérfanos

| Archivo | Tamaño aprox | Importado por | Estado |
|---------|-------------|---------------|--------|
| weather.json | ~5KB | weatherService.js (no usado) | Cadena |
| islands.json | ~3KB | mapService.js (no usado) | Cadena |
| observationPoints.json | ~10KB | mapService.js (no usado) | Cadena |
| lightPollution.json | ~8KB | mapService.js (no usado) | Cadena |
| events.json | ~15KB | astronomyService.js (no usado) | Cadena |
| constellations.json | ~20KB | astronomyService.js (no usado) | Cadena |
| excursions.json | ~2KB | Ninguno | Huérfano total |
| islas.json | ~2KB | Ninguno | Huérfano total |

---

### 4. Assets no utilizados

#### `favicon.ico`
- **Ruta:** `frontend/src/assets/favicon.ico`
- **Uso real:** index.html apunta a `/favicon.png` (en public/)
- **Riesgo eliminación:** Bajo

---

### 5. Página con ruta no asignada

#### `EventsPage.jsx`
- **Ruta:** `frontend/src/pages/EventsPage.jsx`
- **Uso real:** Importado en App.jsx línea 12 pero NUNCA asignado a una ruta
- **Ruta existente:** `/events` usa CalendarPage.jsx
- **¿Código duplicado?** CalendarPage.jsx y EventsPage.jsx tienen funcionalidad similar (eventos)
- **Riesgo eliminación:** Medio — revisar si la funcionalidad es necesaria o si CalendarPage ya la cubre

---

## Conclusión

| Categoría | Cantidad | Acción Recomendada |
|-----------|----------|-------------------|
| **Eliminación Segura** | 15 | Eliminar sin impacto |
| **Revisión Manual** | 7 | Verificar antes de eliminar |
| **NO Eliminar** | — | Mantener |

**Ahorro estimado:** ~70KB de código/data muerto + 8 componentes no utilizados.
