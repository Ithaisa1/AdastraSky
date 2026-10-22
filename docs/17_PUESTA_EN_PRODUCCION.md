# 17 · Puesta en producción sin Render

> Estado a 22/10/2026. La web de Vercel (`https://adastrasky.vercel.app`) carga, pero apunta a un backend de Render que no responde (`aadastra-sky-backend.onrender.com`). Por eso fallan el inicio de sesión, el chat y el planificador.

## Arquitectura gratuita propuesta

| Pieza | Dónde | Coste | ¿Caduca? |
|---|---|---|---|
| Web (frontend) | Vercel, proyecto actual | 0 € | No |
| Backend (Express) | Vercel, **segundo proyecto** con carpeta raíz `backend` | 0 € | No. Arranca en frío tras un rato sin uso (~1-2 s). |
| Servicio de IA | Hugging Face Space (Docker) | 0 € | No. Se duerme tras 48 h sin uso y tarda en despertar. |
| Base de datos | Neon | 0 € | No. Si se superan los límites, se pausa sin borrar datos. |

Sobre Render, según su documentación: lo que **caduca a los 30 días es la base de datos gratuita**, no el servicio web. Aun así, con esta arquitectura Render ya no hace falta. `render.yaml` se conserva por si algún día lo quieres usar.

El backend ya está adaptado a Vercel:

- No necesita escribir en disco: las fotos se guardan en PostgreSQL.
- Arranca aunque falten las contraseñas de los usuarios de prueba.
- `backend/vercel.json` sitúa las funciones en Fráncfort (`fra1`), cerca de Neon en Europa.

Comprobado en local simulando Vercel: disco de solo lectura, base de datos vacía y sin carpeta `uploads`.

## Lo que tienes que hacer tú

### 1. Rescatar los datos de Render (si siguen ahí)

```bash
export RENDER_API_KEY=rnd_...   # Render > Account Settings > API Keys
python3 database/migration/render_inventory.py
bash database/migration/export_db.sh .secrets/render_<bd>.env
```

Si el inventario dice que la base de datos ya no existe, sáltate este paso. El backend crea las tablas y las 95 zonas solo al arrancar.

### 2. Neon (base de datos)

1. Crea una cuenta en <https://neon.com> y un proyecto en la región **Europe (Frankfurt)**.
2. Copia la cadena de conexión **con pooling** (la que lleva `-pooler` en el host). Es la recomendada para Vercel.
3. Si exportaste datos en el paso 1:

   ```bash
   TARGET_DATABASE_URL='postgresql://...' bash database/migration/import_db.sh database/backups/<fecha>
   ```

### 3. Generar las claves

```bash
openssl rand -hex 32   # JWT_SECRET (si no conservas el antiguo)
openssl rand -hex 32   # AI_SERVICE_API_KEY
```

### 4. Vercel: crear el backend

1. Vercel > **Add New… > Project** > importa el mismo repositorio `AdastraSky`.
2. **Root Directory**: `backend`. Vercel lo detecta como Express.
3. Antes de desplegar, en **Environment Variables**:

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | La cadena de Neon (paso 2) |
| `DB_SSL` | `true` |
| `JWT_SECRET` | Paso 3, o el antiguo de Render si lo tienes, para no cerrar las sesiones de nadie |
| `AI_SERVICE_URL` | `https://ithaisa-adastrasky-ai-service.hf.space` |
| `AI_SERVICE_API_KEY` | Paso 3 |
| `FRONTEND_URL` | `https://adastrasky.vercel.app,https://adastra-sky.vercel.app` |
| `SEED_ADMIN_PASSWORD`, `SEED_DEMO_PASSWORD` | Solo si la base de datos está vacía: crean los usuarios admin y demo |
| `NASA_API_KEY`, `OPENWEATHER_API_KEY` | Opcionales |

4. Despliega y apunta la dirección que te da, por ejemplo `https://adastrasky-backend.vercel.app`. Comprueba que `…/health` responde `"healthy"`.

### 5. Hugging Face (servicio de IA)

1. Crea un token con permiso de **escritura** en <https://huggingface.co/settings/tokens>.
2. Guárdalo en GitHub como secreto `HF_TOKEN`: repositorio > Settings > Secrets and variables > Actions.
3. En el Space `Ithaisa/adastrasky-ai-service`, en Settings > Variables and secrets:
   - `GROQ_API_KEY`: tu clave de Groq.
   - `AI_SERVICE_API_KEY`: la del paso 3.
   - `BACKEND_URL`: la dirección del backend del paso 4.
   - `FRONTEND_URL`: `https://adastrasky.vercel.app`.

### 6. Vercel: conectar la web con el backend

En el proyecto **actual** de la web, en Settings > Environment Variables:

- `VITE_API_URL` = la dirección del backend del paso 4, sin barra al final.

Las variables de Vite se incorporan al compilar: hay que **volver a desplegar** después de cambiarlas.

### 7. Avisos si algo se cae (opcional, gratis)

En <https://uptimerobot.com>, crea monitores HTTP para:

- `https://<backend>/health`
- `https://ithaisa-adastrasky-ai-service.hf.space/health`

Un aviso cada pocas horas basta para que el Space no se duerma.

### 8. Dime «sube la rama»

Yo subo `mejoras/evolucion-tfm` a GitHub. Al hacerlo:

- **Vercel** crea **direcciones de prueba** de la web y del backend sin tocar lo publicado.
- **GitHub** ejecuta todos los tests.

Si todo va bien, la unimos a `main`. Ese paso sí publica: Vercel se actualiza y el servicio de IA se copia a Hugging Face. Después puedes suspender o borrar los servicios de Render desde su panel.

## Lo que ya está preparado en el código

- **`backend/vercel.json`** y arranque compatible con Vercel. Además, se ha corregido un fallo que dejaba el servidor sin escuchar con una base de datos vacía.
- **Sincronización con Hugging Face:** el workflow no podía subir el código al Space desde junio. Ahora crea la rama `main` de forma explícita y avisa si falta `HF_TOKEN`. La causa original no se puede confirmar, porque los registros de GitHub ya han caducado.
- **Tests en GitHub:** cada push ejecuta los tests del servicio de IA, del backend (con PostgreSQL) y del frontend, además del linter y la compilación.
- **`render.yaml`:** solo por si vuelves a Render. Ya no crea la base de datos que caduca.

## Límites a tener en cuenta

- **Vercel Hobby:**
  - Cada petición al backend puede durar como máximo 300 s, suficiente para el chat y el planificador.
  - Es solo para uso no comercial, igual que la cartografía de GRAFCAN.
- **Límite de peticiones por IP:** el backend lo cuenta en memoria. En Vercel puede haber varias instancias a la vez, así que el límite es aproximado.
- **Neon gratuito:** 0,5 GB. Las fotos de experiencias ocupan espacio en la base de datos (se guardan en WebP reducido).
