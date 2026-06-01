# AdAstra Sky — Frontend

React 18 + Vite + Tailwind CSS — Aplicación de astroturismo para las Islas Canarias.

## Stack

- **React 18** con Vite 5
- **Tailwind CSS 3.4** con modo oscuro
- **React Router DOM v6** (12 rutas, 9 protegidas)
- **i18next** (es/en/de)
- **Leaflet** para mapas interactivos
- **Chart.js** para visualizaciones
- **Context API** para estado global (Auth, Chat)

## Estructura

```
src/
├── assets/          # Imágenes estáticas
├── components/      # Componentes reutilizables (Sidebar, SanctuaryPanel, ScoreBadge, etc.)
├── context/         # AuthContext, ChatContext
├── data/            # Datos estáticos (santuarios, constelaciones, observatorios)
├── hooks/           # Custom hooks
├── pages/           # 11 páginas (Home, Dashboard, Map, Chat, Data, etc.)
├── utils/           # Utilidades (astronomy.js, scoring.js)
├── i18n/            # Traducciones (es, en, de)
├── App.jsx          # Router principal
└── main.jsx         # Entry point
```

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo (localhost:5173)
npm run build        # Build producción
npm run preview      # Vista previa del build
```

## Variables de entorno

```env
VITE_API_URL=http://localhost:5000
VITE_OPENWEATHER_API_KEY=tu_clave
```

## Despliegue

`vercel.json` incluido. Conectar repo a Vercel y configurar `VITE_API_URL` con la URL del backend desplegado.
