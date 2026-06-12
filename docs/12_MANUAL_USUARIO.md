# Manual de Usuario — AdAstra Sky

> Plataforma de Astroturismo para las Islas Canarias

---

## 1. Primeros Pasos

### 1.1 Registro
1. Ve a `https://adastra-sky.vercel.app/login`
2. Selecciona idioma (ES/EN/DE) en la parte superior
3. Haz clic en "¿No tienes cuenta? Regístrate"
4. Completa: nombre, apellido, email y contraseña
   - **Contraseña:** mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
5. Haz clic en "Registrarse"
6. Serás redirigido al formulario de inicio de sesión

### 1.2 Inicio de Sesión
1. Introduce email y contraseña
2. Haz clic en "Iniciar Sesión"
3. Serás redirigido al Dashboard

### 1.3 Recuperación de Contraseña
Actualmente no disponible. Contacta con el administrador.

---

## 2. Navegación Principal

La barra lateral izquierda (sidebar) te da acceso a todas las secciones:

| Sección | Descripción |
|---------|-------------|
| **Dashboard** | Resumen general: sky score, clima, próximos eventos |
| **Explorar** | Mapa interactivo con 95+ zonas de observación |
| **Observatorios** | Información del Teide y Roque de los Muchachos |
| **Calendario** | Eventos astronómicos y galería APOD |
| **Datos** | Catálogo de constelaciones, planetas y eventos |
| **Experiencias** | Galería comunitaria de experiencias |
| **Chat IA** | Asistente astronómico con IA |
| **Perfil** | Configuración de cuenta y experiencias propias |
| **Contacto** | Formulario de contacto |
| **FAQ** | Preguntas frecuentes |

*(Usuarios admin ven además **Panel Admin**)*

---

## 3. Dashboard

Tras iniciar sesión, el Dashboard muestra:

- **Sky Score del día** — Calidad del cielo (0-10)
- **Clima actual** — Temperatura, nubosidad, viento
- **Próximos eventos** — Lluvias de estrellas, eclipses, etc.
- **Fase lunar** — Estado actual de la luna
- **Recomendaciones** — Mejores zonas para observar esta noche

---

## 4. Mapa Interactivo (Explorar)

### Cómo usar el mapa
1. **Navegar** — Arrastra el mapa para moverte, scroll para zoom
2. **Ver zonas** — Cada marcador representa una zona de observación
3. **Filtrar** — Usa los botones superiores para filtrar por:
   - Isla (Tenerife, Gran Canaria, La Palma, etc.)
   - Categoría (Observatorio, Mirador Astronómico, Mirador Paisajístico)
4. **Seleccionar** — Haz clic en un marcador para ver detalles
5. **Street View** — Haz clic en una zona no marcada para ver Street View

### Panel de Zona
Al seleccionar un marcador, se abre un panel con:
- Nombre, isla, altitud
- Puntuaciones (Astro, Foto, Turismo, Global)
- Escala Bortle (contaminación lumínica)
- Tipo de acceso
- Descripción detallada
- Coordenadas

---

## 5. Asistente IA (Chat)

### Cómo usar
1. Ve a la sección **Chat** en el sidebar
2. Escribe tu pregunta en el campo de texto
3. Presiona Enter o el botón de enviar
4. El asistente responderá basado en documentos IAC

### Ejemplos de preguntas
- "¿Qué es el Observatorio del Teide?"
- "¿Dónde ver las estrellas en La Palma?"
- "¿Cuál es la mejor época para observar en Canarias?"
- "¿Qué constelaciones son visibles en junio?"
- "¿Qué es la Ley del Cielo de Canarias?"

### Consejos
- Pregunta en español para mejores resultados
- Sé específico para respuestas más precisas
- El historial se guarda por sesión

### Límites
- Mensajes de hasta 4000 caracteres
- Primer mensaje puede tardar ~30s (cold start del servicio)
- ~30 consultas/minuto (limitación de Groq)

---

## 6. Calendario y Eventos

### Calendario Astronómico
- Vista mensual de eventos astronómicos
- Tipos: lluvias de estrellas, eclipses, conjunciones, superlunas, cometas
- Filtro por tipo de evento
- Cada evento muestra fecha, descripción, hemisferio

### APOD Gallery
- Astronomy Picture of the Day
- 5 imágenes aleatorias de la NASA
- Haz clic para ver descripción completa

---

## 7. Datos Astronómicos

### Catálogo de Constelaciones
- 88 constelaciones con nombre en español e inglés
- Mes de mejor visibilidad
- Hemisferio (Norte/Sur)

### Planetas
- 9 planetas del sistema solar
- Distancia al sol, tipo, número de lunas
- Período orbital

### Eventos Astronómicos
- Lista completa filtrable
- Búsqueda por tipo, mes, año

---

## 8. Experiencias de Usuario

### Ver Experiencias
- Galería comunitaria con fotos reales
- Cada experiencia incluye: título, descripción, fotos, autor
- Filtro por zona de observación

### Crear Experiencia
1. Ve a la sección **Experiencias**
2. Haz clic en "Compartir Experiencia"
3. Completa: título, descripción, zona
4. Añade hasta 5 fotos (desde cámara o archivo)
5. Las fotos se procesan a WebP automáticamente

---

## 9. Perfil y Configuración

### Tu Perfil
- Editar: nombre, apellido, email, biografía
- Cambiar contraseña
- Configurar idioma preferido

### Tus Experiencias
- Lista de experiencias que has creado
- Editar o eliminar

### Galería Personal
- Tus fotos subidas
- Vista en cuadrícula

---

## 10. Rol Administrador

### Acceso al Panel Admin
Solo usuarios con rol `admin` ven la opción **Panel Admin** en el sidebar.

### Gestión de Zonas
- Ver todas las zonas (activas e inactivas)
- Añadir nuevas zonas
- Editar zonas existentes
- Eliminar (soft delete) / Hard delete

### Gestión de Usuarios
- Ver todos los usuarios registrados
- Editar datos de usuario
- Desactivar cuentas

---

## 11. Solución de Problemas

| Problema | Solución |
|----------|----------|
| No carga el mapa | Refresca la página (Ctrl+F5) |
| El chat no responde | Espera ~30s (cold start), luego reintenta |
| Error 502 en chat | El servicio IA está iniciándose, espera 30s |
| No puedo registrarme | Contraseña: 8+ chars, mayúscula, minúscula, número |
| No veo el Panel Admin | Tu cuenta no tiene rol admin |
| Las fotos no suben | Máximo 5 imágenes, 50MB total |
| Error de red | Verifica tu conexión a internet |
| Sesión expirada | Vuelve a iniciar sesión |

---

## 12. Contacto y Soporte

- **Formulario de contacto:** Sección Contacto en la app
- **Email:** admin@adastra.sky
- **FAQ:** Sección FAQ con preguntas frecuentes
- **Reportar bug:** Abre issue en GitHub
