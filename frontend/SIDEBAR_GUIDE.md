# Adastra Sky - Frontend Sidebar Component

## 📋 Descripción

**Sidebar.jsx** es un componente de navegación modular y reutilizable diseñado con estética **NASA Mission Control** (Sci-Fi UI). Proporciona:

- ✨ **Glassmorphic Design**: Efecto de cristal con blur y opacidad controlada
- 🎯 **React Router v6 Integration**: NavLink nativo para routing fluido
- 📱 **Responsive Behavior**: Drawer en móvil, sidebar en desktop
- 🎨 **Animated Active States**: "Orbit pulse" effect con glow dinámico
- 🧭 **Collapsible/Expandable**: Toggle entre modo expandido y compacto
- 🔧 **Tooltips Inteligentes**: Emergen en modo colapsado
- 🟢 **System Status**: Indicador de telemetría "SYSTEM ONLINE"

---

## 🚀 Instalación & Configuración

### 1. **Dependencias Requeridas**

El componente requiere:

```bash
npm install react-router-dom lucide-react
```

### 2. **Integración en Layout Global**

Importa y usa el Sidebar en tu layout principal:

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Observatories from './pages/Observatories';
import SkyMap from './pages/SkyMap';
import Data from './pages/Data';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-950">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/observatories" element={<Observatories />} />
            <Route path="/map" element={<SkyMap />} />
            <Route path="/data" element={<Data />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

### 3. **Configuración de Tailwind CSS**

Asegúrate de que tu `tailwind.config.js` tenga:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        astroCard: '#0B0F19',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
};
```

---

## 🎨 Características Visuales

### **Paleta de Colores**

| Elemento | Color | Hex |
|----------|-------|-----|
| Fondo | astroCard | `#0B0F19` |
| Borde | slate-800 | `#1E293B` |
| Icono Activo | cyan-400 | `#06B6D4` |
| Texto Activo | cyan-300 | `#22D3EE` |
| Hover | slate-200 | `#E2E8F0` |
| Status OK | green-400 | `#4ADE80` |

### **Efectos Cinemáticos**

1. **Orbit Pulse**: Indicador animado en la izquierda del elemento activo
2. **Glow Effect**: Sombra difusa en hover sobre elementos activos
3. **Scan Lines**: Degradado de líneas verticales sutiles en el fondo
4. **Glassmorphism**: backdrop-blur + opacidad para efecto de cristal

### **Iconos Disponibles** (Lucide React)

```javascript
ChevronLeft, ChevronRight, Menu, X, LogOut,
Activity, BarChart3, Map, Users, MessageSquare,
Settings, Radio, Telescope, Satellites
```

---

## 📱 Comportamiento Responsive

### **Desktop (md breakpoint ≥ 768px)**

- Sidebar fijo en la izquierda
- Botón toggle de expansión visible
- Modo colapsado/expandido con animations
- Tooltips en hover (collapsed mode)

### **Mobile (< 768px)**

- Sidebar transformado a **Drawer** oculto
- Botón hamburguesa en la esquina superior izquierda
- Overlay translúcido al abrir
- Cierre automático al navegar

---

## 🔧 Personalización

### **Agregar una Nueva Ruta**

Edita el array `navigationRoutes` en `Sidebar.jsx`:

```javascript
const navigationRoutes = [
  // ... rutas existentes
  {
    id: 'mi-nueva-ruta',
    label: 'Mi Nueva Ruta',
    icon: SomeIconFromLucide,
    path: '/my-new-route',
    category: 'exploration',
    description: 'Descripción de la ruta'
  },
];
```

### **Cambiar Colores**

Modifica las clases Tailwind en el componente:

```jsx
// Cambiar color del borde activo
border-l-cyan-400  → border-l-indigo-500

// Cambiar color del fondo activo
bg-gradient-to-r from-indigo-500/20  → from-cyan-500/20

// Cambiar color del texto
text-cyan-400  → text-purple-400
```

### **Cambiar Ancho del Sidebar**

```javascript
const sidebarWidth = isExpanded ? 'w-72' : 'w-20';
                                   ↑
                                Cambiar aquí
```

---

## 🔐 Seguridad & Autenticación

El componente incluye un botón de **Logout**, pero el manejo de tokens JWT debe implementarse en:

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Luego actualiza el botón de logout en Sidebar:

```javascript
const handleLogout = () => {
  // Usar contexto de autenticación
  const { logout } = useContext(AuthContext);
  logout();
  navigate('/login');
};
```

---

## 🎯 Estados y Comportamientos

### **1. Ruta Activa**

Cuando `location.pathname === route.path`:

- Borde izquierdo grueso en cyan
- Fondo con gradiente sutil
- Icono cambia a cyan
- Pulse animado en el indicador izquierdo

### **2. Modo Colapsado**

Cuando `isExpanded === false`:

- Solo iconos visibles
- Ancho reducido (w-20)
- Tooltips al hacer hover
- Labels de secciones (NAV, DATA, SYS)

### **3. Móvil**

Cuando `window.innerWidth < 768`:

- Sidebar oculto (translate-x-full)
- Drawer slide-in animado
- Overlay translúcido de cierre
- Cierre automático al navegar

---

## 📊 Performance

### **Optimizaciones Implementadas**

- ✅ Memoización de handlers con useCallback (agregar si es necesario)
- ✅ useEffect optimizado para resize events
- ✅ Transiciones CSS en lugar de JS animaciones
- ✅ Lazy loading de iconos (Lucide React)
- ✅ Scroll-snap habilitado en la sección de navegación

---

## 🐛 Troubleshooting

### **Problema**: El Sidebar no responde a cambios de ruta

**Solución**: Asegúrate de que los `path` en `navigationRoutes` coincidan con tus rutas en `<Routes>`:

```jsx
// ✅ Coinciden
<Route path="/observatories" element={<Observatories />} />
{ path: '/observatories', ... }

// ❌ No coinciden
<Route path="/observatories" element={<Observatories />} />
{ path: '/observatorio', ... }  // Error de tipografía
```

### **Problema**: Los estilos Tailwind no se aplican

**Solución**: Verifica que `astroCard` esté en `tailwind.config.js`:

```js
colors: {
  astroCard: '#0B0F19',  // ✅ Debe estar aquí
}
```

### **Problema**: Los iconos de Lucide no aparecen

**Solución**: Instala lucide-react:

```bash
npm install lucide-react
```

---

## 🚀 Próximas Mejoras

- [ ] Persistencia de estado colapsado en localStorage
- [ ] Animaciones más sofisticadas (Framer Motion)
- [ ] Tooltips con Radix UI o Headless UI
- [ ] Integración con Context API para autenticación
- [ ] Indicador de notificaciones en iconos
- [ ] Animaciones de carga en rutas que esperen data

---

## 📚 Referencias

- [React Router v6 Documentation](https://reactrouter.com/)
- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Glassmorphism CSS](https://glassmorphism.com/)
