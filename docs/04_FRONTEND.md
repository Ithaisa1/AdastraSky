# Capítulo 4: Frontend (React + Vite + Tailwind CSS)

## 4.1 Estructura General

Aplicación SPA (Single Page Application) con 14 rutas, componentes activos y archivos de datos estáticos reducidos (22 archivos no utilizados eliminados). Tema oscuro con diseño glassmorphism, responsive mobile-first.

### Configuración de Tailwind (`tailwind.config.js`)
Colores personalizados del tema:
```javascript
astroDark: '#0a0b1e'       // Fondo principal
astroCard: '#1a1b3a'       // Fondo de tarjetas
astroAccent: '#6366f1'     // Acento principal (índigo)
solarFlare: '#f59e0b'      // Destellos solares (ámbar)
nebulaPink: '#ec4899'      // Nebulosas (rosa)
deepSpace: '#0f172a'       // Espacio profundo
cosmicDust: '#e2e8f0'      // Polvo cósmico (texto claro)
```

## 4.2 Páginas

### HomePage.jsx
Landing page con:
- **HeroTransition**: Animación Lottie + gradiente espacial
- Secciones: "Explora los cielos", "Sky Score", "Chat IA", destinos destacados
- CTA: "Comenzar" → Login

### LoginPage.jsx
Formularios de Login/Register con:
- Validación de email y password (mín 6 caracteres)
- Alternancia entre login y registro
- Redirect a Dashboard tras autenticación exitosa
- Manejo de errores (credenciales inválidas, email duplicado)

### DashboardPage.jsx
Panel principal del usuario autenticado con:
- **Sky Score** del día: puntuación global + desglose (astro, foto, turismo)
- **Clima actual**: temperatura, nubosidad, viento, humedad
- **Eventos próximos**: cards con fecha, nombre y tipo
- **Recomendación**: "Excelente noche para observar" según score
- **Senderos Canarios**: tarjeta de colaboración con enlace a `senderoscanarios.vercel.app`
- **Botones de exportación**: CSV, GeoJSON, PDF con descripciones

### ChatPage.jsx
Interfaz conversacional con el agente IA AdAstra:
- Historial de mensajes en burbujas (usuario derecha, IA izquierda)
- Input de texto + botón Send
- **Indicador de estado de IA**: "Iniciando servicio de IA..." mientras se realiza warm-up
- Indicador de pensamiento (animación bouncing dots)
- **Mensajes de error amigables**: diferencia entre rate-limit (429: "El servicio está saturado, consulta la documentación disponible") y timeout ("El servicio no está disponible ahora, inténtalo más tarde")
- Detección automática de idioma del usuario
- Persistencia de conversación por `session_id`

### ExploradorPage.jsx
Mapa interactivo + panel de detalle:
- **InteractiveMap.jsx**: Mapa Leaflet con 95 marcadores (miradores y zonas)
  - Categorías: mirador (azul), observatorio (rojo), parque (verde), playa (amarillo)
  - Popups con nombre, Bortle, altitud
  - Leyenda de categorías
  - Marcadores reducidos (28×28px) para mobile
  - **Prop `selectedZone`**: cuando se proporciona, vuela a las coordenadas con `flyTo(lat, lng, zoom=12, 1.2s)`
- **SanctuaryPanel.jsx**: Panel lateral con detalle de zona seleccionada
  - Pestañas: Info, Scores, Experiencias
  - **Carrusel de fotos**: imágenes de experiencias en pantalla completa con botones anterior/siguiente
  - **"Ver ubicación"**: navega al mapa haciendo flyTo a la zona
  - Mostrar: categoría, isla, altitud, Bortle, servicios
  - Scores visuales con barras de progreso
- **StreetViewPanel.jsx**: Integración con street view (placeholder)

### AdminPanel.jsx
Panel de administración con:
- Stats dashboard: total usuarios, zonas, mensajes, experiencias
- Gestión de usuarios: listar, eliminar
- Gestión de zonas: CRUD
- Gestión de mensajes de contacto

### Otras Páginas
| Página | Archivo | Descripción |
|---|---|---|
| Profile | ProfilePage.jsx | Perfil de usuario (avatar con iniciales dinámicas) |
| Observatories | ObservatoriesPage.jsx | Info de Roque de los Muchachos y Teide |
| Data | DataPage.jsx | Datos astronómicos (constelaciones, planetas) |
| Calendar | CalendarPage.jsx | Calendario de eventos astronómicos |
| Contact | ContactPage.jsx | Formulario de contacto |
| FAQ | FAQPage.jsx | Preguntas frecuentes (acordeón, incluye Messier) |
| Experiences | ExperiencesPage.jsx | Galería de experiencias de usuarios |
| 404 | NotFoundPage.jsx | Página no encontrada |

## 4.3 Componentes

### Sidebar.jsx
Navegación lateral (`z-50`) con iconos Lucide:
- Home, Dashboard, Explorador, Chat, Admin (solo admin), Perfil, Cerrar sesión
- Colapsable en mobile (menú hamburguesa)
- Sin `overflow-y-auto` (scroll eliminado)
- **Indicador "System Online"**: icono de radio junto al nombre de usuario (sidebar expandida) o punto verde sobre el avatar (sidebar colapsada)

### InteractiveMap.jsx
Componente principal del mapa:
- **Leaflet Map**: Centro `[28.5, -16.5]` (Canarias), zoom 8
- **Tile Layer**: CartoDB dark (tema oscuro)
- **Markers**: 95 puntos con iconos personalizados según categoría
- **Popups**: Nombre, isla, Bortle, altitud, enlace a detalle
- **Layer Control**: Filtrar por categoría
- **Responsive**: Ajuste automático de tamaño
- **Prop `selectedZone`**: acepta objeto `{ latitude, longitude }` y ejecuta `flyTo(lat, lng, 12, 1.2)` para animar el mapa a la ubicación

### SanctuaryPanel.jsx
Panel de detalle de zona seleccionada:
- Pestañas: Info, Scores, Experiencias
- Mostrar: categoría, isla, altitud, Bortle, servicios
- Scores visuales con barras de progreso
- **Carrusel de experiencias**: fotos de experiencias en pantalla completa con navegación prev/next
- **"Ver ubicación"**: botón que navega al mapa y ejecuta flyTo a la zona
- Listado de experiencias de usuarios

### Avatar (Dinámico)
Las iniciales del avatar se generan a partir de `first_name` y `last_name` del usuario. Si no están disponibles, se muestra "AS" como fallback.

### UI Primitives
Componentes base reutilizables:
| Componente | Props | Descripción |
|---|---|---|
| Badge | text, tone(cyan/emerald/amber/rose) | Etiqueta de estado |
| Card | children, className | Tarjeta glassmorphism |
| ChipGroup | options, selected, onChange | Filtros tipo chip |
| EmptyState | title, description, action | Estado vacío con CTA |
| StatCard | label, value, icon, accent | Tarjeta de estadística |

## 4.4 Servicios (API Calls)

### astronomyService.js
```javascript
getUpcomingEvents(days)         // GET /api/events/upcoming?days=N
getSeasonalConstellations(month) // Datos locales + API
getVisibleConstellationsByIsland(island, month)  // Filtro por isla
getIslandAstronomySummary(island) // Resumen astronómico por isla
```

### mapService.js
```javascript
getObservationPoints(island)     // Puntos de observación
getPollutionAreas()              // Zonas de contaminación lumínica
getIslandById(id)               // Datos de una isla
getMapHighlights()              // Destacados del mapa
```

### weatherService.js
```javascript
getWeatherByIsland(island)       // Clima de una isla
getWeatherOverview()             // Resumen de todas las islas
getFeaturedWeather()             // Clima destacado del día
```

## 4.5 Datos Estáticos (Frontend Data)

### santuariosData.js — 95 Zonas
Array con coordenadas exactas de todos los puntos de observación:
```javascript
{
  name: "Mirador del Llano del Jable",
  island: "La Palma",
  latitude: 28.6833, longitude: -17.8833,
  altitude: 1500, category: "mirador",
  bortle_scale: 1, image: "llanoJable"
}
```

**Coordenadas corregidas:**
- Mirador Sicasumbre: `28.288, -14.160, 430m`
- Mirador Garañona: `28.4822, -16.4345, 250m`

### astronomicalData.js
- **88 constelaciones**: nombre, área (deg²), estación, mejor isla para observar
- **9 planetas**: distancia al Sol, período orbital, visibilidad 2026
- **12 eventos anuales**: Perseidas, Gemínidas, equinoccios, solsticios
- **5 categorías de eventos**: meteor_shower, eclipse, planetary, seasonal, other

### constellations.json — Datos secundarios
```javascript
{
  "name": "Orion",
  "bestFrom": "Tenerife",       // Mejor isla
  "visibleMonths": [11,12,1,2,3], // Meses visibles
  "difficulty": "easy"           // Dificultad de localización
}
```

### islands.json / islas.json
Metadatos de las 8 islas: nombre, capital, área, población, altitud máxima, coordenadas.

### events.json
Lista completa de eventos astronómicos con fechas y descripciones.

## 4.7 Contexto Global

### AuthContext.jsx
```javascript
// Estado:
user            // { id, email, role, first_name, last_name } o null
loading         // boolean (carga inicial)
isAuthenticated // boolean
isAdmin         // boolean

// Métodos:
login(email, password)    → POST /api/auth/login → user + token
register(data)            → POST /api/auth/register → user + token
logout()                  → Limpia estado global (sin localStorage directo)
checkAuth()               → GET /api/auth/profile (restaura sesión al recargar)
// Token se inyecta via Axios interceptor desde el contexto
```

> **Nota**: El token JWT se gestiona exclusivamente desde AuthContext. No hay acceso directo a `localStorage`. El interceptor de Axios toma el token del contexto para cada petición.

## 4.8 Temas y Estilos

### Tema Oscuro (`src/styles/index.css`)
- Fondo: `#0a0b1e` con gradiente radial y animación de estrellas (`star-field` 50s)
- Tarjetas: efecto glassmorphism (`backdrop-filter: blur`)
- Scrollbar personalizada
- Safe area insets para dispositivos notch
- Hover desactivado en dispositivos táctiles

### Animaciones
- **Framer Motion**: Transiciones de página, hover en cards, reveal de elementos
- **Lottie**: Animación hero en Landing (archivo `astronaut.json`)

## 4.9 Internacionalización (i18n)

```javascript
// Config: src/config/i18n.js
i18next
  .use(initReactI18next)
  .use(LanguageDetector)    // Detecta idioma del navegador
  .init({
    resources: { es, en, de },
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  })
```
Archivos de traducción en `public/locales/{es,en,de}/translation.json`.

## 4.10 Formulario de Experiencias

### ExperienceForm.jsx
- **Campo "Ubicación"**: dropdown personalizado con búsqueda (no usa `<select>` nativo)
- Validación de campos
- Subida de imágenes (máx 10MB)

## 4.11 Indicadores de Estado

### System Online
- Sidebar expandida: icono de radio (📡) junto al nombre de usuario
- Sidebar colapsada: punto verde sobre el avatar
- Indica que el sistema de IA está activo y respondiendo

### Estado del Chat
| Estado | Mensaje |
|---|---|
| Warm-up | "Iniciando servicio de IA..." |
| Rate-limited (429) | "El servicio de IA está saturado. Consulta la documentación disponible mientras se restablece." + RAG docs |
| Timeout | "El servicio de IA no está disponible ahora. Inténtalo de nuevo más tarde." |
| Error genérico | "Ha ocurrido un error. Por favor, inténtalo de nuevo." |
