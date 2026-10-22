# 17 · Puesta en producción: lista de pasos

> Estado a 22/10/2026. La web de Vercel (`https://adastrasky.vercel.app`) carga, pero apunta a un backend de Render que no responde (`aadastra-sky-backend.onrender.com`). Por eso fallan el inicio de sesión, el chat y el planificador.

Hay cosas que solo puedes hacer tú, porque necesitan tus cuentas. Marca cada paso al terminarlo.

## Lo que tienes que hacer tú

### 1. Rescatar los datos de Render (si siguen ahí)

```bash
export RENDER_API_KEY=rnd_...   # Render > Account Settings > API Keys
python3 database/migration/render_inventory.py
bash database/migration/export_db.sh .secrets/render_<bd>.env
```

Si el inventario dice que la base de datos ya no existe, sáltate este paso. El backend crea las tablas y las 95 zonas solo al arrancar.

### 2. Crear la base de datos en Neon (gratis)

1. Crea una cuenta en <https://neon.com> y un proyecto. La región Europa (Fráncfort) es la más cercana.
2. Copia la cadena de conexión (`postgresql://...`).
3. Si exportaste datos en el paso 1:

   ```bash
   TARGET_DATABASE_URL='postgresql://...' bash database/migration/import_db.sh database/backups/<fecha>
   ```

### 3. Generar la clave compartida entre el backend y el servicio de IA

```bash
openssl rand -hex 32
```

Guárdala: la usarás en los pasos 4 y 5 con el nombre `AI_SERVICE_API_KEY`.

### 4. Hugging Face (servicio de IA)

1. Crea un token con permiso de **escritura** en <https://huggingface.co/settings/tokens>.
2. Ponlo en GitHub como secreto `HF_TOKEN`: repositorio > Settings > Secrets and variables > Actions.
3. En el Space `Ithaisa/adastrasky-ai-service`, en Settings > Variables and secrets, añade:
   - `GROQ_API_KEY`: tu clave de Groq.
   - `AI_SERVICE_API_KEY`: la del paso 3.
   - `BACKEND_URL`: la dirección del backend del paso 5.
   - `FRONTEND_URL`: `https://adastrasky.vercel.app`.

### 5. Render (backend)

En el servicio del backend, en Environment:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La cadena de Neon (paso 2) |
| `DB_SSL` | `true` |
| `JWT_SECRET` | Mantén el que hay. Si lo cambias, todos tendrán que volver a iniciar sesión. |
| `AI_SERVICE_URL` | `https://ithaisa-adastrasky-ai-service.hf.space` |
| `AI_SERVICE_API_KEY` | La del paso 3 |
| `FRONTEND_URL` | `https://adastrasky.vercel.app,https://adastra-sky.vercel.app` |
| `SEED_ADMIN_PASSWORD`, `SEED_DEMO_PASSWORD` | Solo si la base de datos está vacía: crea los usuarios admin y demo |

Si el servicio aparece como **Suspended**, pulsa **Resume**.

### 6. Vercel (web)

En Settings > Environment Variables:

- `VITE_API_URL` = la dirección del backend de Render, sin barra al final. Por ejemplo, `https://adastra-sky-backend.onrender.com`.

Las variables de Vite se incorporan al compilar la web: hay que **volver a desplegar** después de cambiarlas.

### 7. Avisos si algo se cae (opcional, gratis)

En <https://uptimerobot.com>, crea dos monitores HTTP cada 5 minutos:

- `https://<backend>/health`
- `https://ithaisa-adastrasky-ai-service.hf.space/health`

Además, el aviso del backend evita que Render lo apague por inactividad. El plan gratuito de Render da 750 horas al mes: suficiente para **un** servicio encendido todo el mes.

### 8. Dime «sube la rama»

Yo subo `mejoras/evolucion-tfm` a GitHub. Al hacerlo:

- **Vercel** suele crear una **dirección de prueba** sin tocar la web publicada.
- **GitHub** ejecuta todos los tests (`.github/workflows/tests.yml`).

Si todo va bien, la unimos a `main`. Ese paso sí publica: Render y Vercel se actualizan, y el servicio de IA se copia a Hugging Face.

## Lo que ya está preparado en el código

- **`render.yaml`:** ya no crea la base de datos gratuita de Render, que caduca, sino que pide `DATABASE_URL`. Acepta los dos dominios de Vercel y la clave compartida.
- **Sincronización con Hugging Face:** el workflow no podía subir el código al Space desde junio. Ahora crea la rama `main` de forma explícita y avisa claramente si falta `HF_TOKEN`. La causa original no se puede confirmar, porque los registros de GitHub ya han caducado.
- **Tests en GitHub:** cada push ejecuta los tests del servicio de IA, del backend (con PostgreSQL) y del frontend, además del linter y la compilación.
