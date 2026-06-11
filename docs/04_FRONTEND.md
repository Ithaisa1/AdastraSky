# Capítulo 4: Frontend (React + Vite + Tailwind CSS)

## 4.1 Estructura General

Aplicación SPA (Single Page Application) con 14 rutas, 13 componentes y 11 archivos de datos estáticos. Tema oscuro con diseño glassmorphism, responsive mobile-first.

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

### ChatPage.jsx
Interfaz conversacional con el agente IA AdAstra:
- Historial de mensajes en burbujas (usuario derecha, IA izquierda)
- Input de texto + botón Send
- Indicador de pensamiento (animación bouncing dots)
- Detección automática de idioma del usuario
- Persistencia de conversación por `session_id`

### ExploradorPage.jsx
Mapa interactivo + panel de detalle:
- **InteractiveMap.jsx**: Mapa Leaflet con 92+ marcadores (miradores)
  - Categorías: mirador (azul), observatorio (rojo), parque (verde), playa (amarillo)
  - Popups con nombre, Bortle, altitud
  - Leyenda de categorías
  - Marcadores reducidos (28×28px) para mobile
- **SanctuaryPanel.jsx**: Panel lateral con detalle de zona seleccionada
  - Scores, clima, experiencias de usuario
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
| Profile | ProfilePage.jsx | Perfil de usuario (datos personales) |
| Observatories | ObservatoriesPage.jsx | Info de Roque de los Muchachos y Teide |
| Data | DataPage.jsx | Datos astronómicos (constelaciones, planetas) |
| Calendar | CalendarPage.jsx | Calendario de eventos astronómicos |
| Contact | ContactPage.jsx | Formulario de contacto |
| FAQ | FAQPage.jsx | Preguntas frecuentes (acordeón) |
| Experiences | ExperiencesPage.jsx | Galería de experiencias de usuarios |
| 404 | NotFoundPage.jsx | Página no encontrada |

## 4.3 Componentes

### Sidebar.jsx
Navegación lateral (`z-50`) con iconos Lucide:
- Home, Dashboard, Explorador, Chat, Admin (solo admin), Perfil, Cerrar sesión
- Colapsable en mobile (menú hamburguesa)

### InteractiveMap.jsx
Componente principal del mapa:
- **Leaflet Map**: Centro `[28.5, -16.5]` (Canarias), zoom 8
- **Tile Layer**: CartoDB dark (tema oscuro)
- **Markers**: 92+ puntos con iconos personalizados según categoría
- **Popups**: Nombre, isla, Bortle, altitud, enlace a detalle
- **Layer Control**: Filtrar por categoría
- **Responsive**: Ajuste automático de tamaño

### SanctuaryPanel.jsx
Panel de detalle de zona seleccionada:
- Pestañas: Info, Scores, Experiencias
- Mostrar: categoría, isla, altitud, Bortle, servicios
- Scores visuales con barras de progreso
- Listado de experiencias de usuarios

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

### santuariosData.js — 92+ Miradores
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
Distribución por islas: Tenerife (18), La Palma (14), Gran Canaria (13), Lanzarote (11), Fuerteventura (10), La Gomera (9), El Hierro (8), La Graciosa (5), Resto (4).

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
user            // { id, email, role } o null
loading         // boolean (carga inicial)
isAuthenticated // boolean
isAdmin         // boolean

// Métodos:
login(email, password)    → POST /api/auth/login → user + token
register(data)            → POST /api/auth/register → user + token
logout()                  → Limpia localStorage + estado
checkAuth()               → GET /api/auth/profile (restaura sesión al recargar)
```

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
