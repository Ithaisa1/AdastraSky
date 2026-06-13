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

**Total: 15 archivos — ✅ ELIMINADOS (commit 72c9a64)**

---

### REVISIÓN MANUAL (posible uso oculto o dinámico)

| Archivo | Ruta | Motivo | Riesgo |
|---------|------|--------|--------|
| EventsPage.jsx | `frontend/src/pages/EventsPage.jsx` | Sin ruta asignada, duplica CalendarPage | Medio |
| weather.json | `frontend/src/data/weather.json` | Solo importado por servicio no usado | Bajo |
| islands.json | `frontend/src/data/islands.json` | Solo importado por servicio no usado | Bajo |
| observationPoints.json | `frontend/src/data/observationPoints.json` | Solo importado por servicio no usado | Bajo |
| lightPollution.json | `frontend/src/data/lightPollution.json` | Solo importado por servicio no usado | Bajo |
| events.json | `frontend/src/data/events.json` | Solo importado por servicio no usado | Bajo |
| constellations.json | `frontend/src/data/constellations.json` | Solo importado por servicio no usado | Bajo |

**Total: 7 archivos — ✅ ELIMINADOS**

---

### TOTAL: 22 ARCHIVOS ELIMINADOS

| Categoría | Cantidad | Resultado |
|-----------|----------|-----------|
| Eliminación Segura | 15 | ✅ Eliminados sin impacto |
| Revisión Manual | 7 | ✅ Verificados y eliminados |
| **Total** | **22** | **Ahorro ~70KB + 8 componentes no utilizados** |

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
- **Alternativa:** Sidebar.jsx es el componente de navegación activo. Navbar scroll eliminado, System Online movido a otro componente.
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
| weather.json | ~5KB | weatherService.js (no usado) | ✅ Eliminado |
| islands.json | ~3KB | mapService.js (no usado) | ✅ Eliminado |
| observationPoints.json | ~10KB | mapService.js (no usado) | ✅ Eliminado |
| lightPollution.json | ~8KB | mapService.js (no usado) | ✅ Eliminado |
| events.json | ~15KB | astronomyService.js (no usado) | ✅ Eliminado |
| constellations.json | ~20KB | astronomyService.js (no usado) | ✅ Eliminado |
| excursions.json | ~2KB | Ninguno | ✅ Eliminado |
| islas.json | ~2KB | Ninguno | ✅ Eliminado |

---

### 4. Assets no utilizados

#### `favicon.ico`
- **Ruta:** `frontend/src/assets/favicon.ico`
- **Uso real:** index.html apunta a `/favicon.png` (en public/)
- **Riesgo eliminación:** Bajo — ✅ Eliminado

---

### 5. Página con ruta no asignada

#### `EventsPage.jsx`
- **Ruta:** `frontend/src/pages/EventsPage.jsx`
- **Uso real:** Importado en App.jsx línea 12 pero NUNCA asignado a una ruta
- **Ruta existente:** `/events` usa CalendarPage.jsx
- **¿Código duplicado?** CalendarPage.jsx y EventsPage.jsx tienen funcionalidad similar (eventos)
- **Riesgo eliminación:** Medio — CalendarPage cubre toda la funcionalidad
- **Resultado:** ✅ Eliminado

---

## Conclusión

| Categoría | Cantidad | Acción |
|-----------|----------|--------|
| **Eliminación Segura** | 15 | ✅ Eliminados |
| **Revisión Manual** | 7 | ✅ Eliminados |
| **NO Eliminar** | — | ✅ Mantenidos |
| **Total eliminados** | **22** | **~70KB de código/data muerto liberado** |
