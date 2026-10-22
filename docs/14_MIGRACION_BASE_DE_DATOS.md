# 14 · Migración de la base de datos fuera de Render

> Estado a 22/10/2026. Las condiciones de los planes gratuitos cambian: compruébalas antes de decidir.

## Por qué hay que migrar

Según la documentación oficial de Render (<https://render.com/docs/free>):

- Una base de datos PostgreSQL gratuita **caduca 30 días después de crearse**.
- Tras caducar hay **14 días** para pasar a un plan de pago; después, **Render borra la base de datos y todos sus datos**.
- El plan gratuito **no tiene copias de seguridad** y está limitado a 1 GB.

Comprobación del 22/10/2026:

- `https://adastra-sky-backend.onrender.com` responde «Service Suspended».
- `https://aadastra-sky-backend.onrender.com` (la URL que usa el frontend) no responde.
- El Space de Hugging Face del ai-service está en estado `NO_APP_FILE`: solo contiene `README.md` y `.gitattributes`. El workflow `sync-ai-service.yml` ha fallado en todas sus ejecuciones desde junio.

**Primer paso urgente:** ejecuta el inventario (abajo). Te dirá si la base de datos sigue accesible y cuántos días le quedan.

## Herramientas incluidas (`database/migration/`)

| Script | Qué hace | ¿Modifica algo? |
|---|---|---|
| `render_inventory.py` | Lista tus BD y servicios de Render: versión, plan, estado, **fecha de caducidad**, URL de conexión y variables de entorno. | No (solo `GET`) |
| `export_db.sh` | Copia completa: `pg_dump` restaurable, `schema.sql`, `full.sql`, cada tabla en CSV, recuento de filas y `SHA256SUMS`. | No (solo lectura) |
| `import_db.sh` | Restaura la copia en el destino. Comprueba las sumas y **se niega a escribir en una BD con tablas** salvo `FORCE_IMPORT=1`. | Solo el destino |
| `verify_db.sh` | Compara el número de filas de cada tabla entre la copia y el destino. | No |

Los scripts usan `pg_dump`/`psql` de PostgreSQL 18 si están instalados. Si no, los ejecutan en un contenedor `postgres:18-alpine` con Podman o Docker.

Dónde se guarda cada cosa:

- Las copias van a `database/backups/` y los secretos a `.secrets/`. Las dos carpetas están en `.gitignore` y tienen permisos de solo propietario, porque contienen emails y hashes de contraseñas.
- **Nunca** las subas a GitHub ni las adjuntes a artefactos de GitHub Actions: en un repositorio público serían descargables.

Ensayo realizado en local:

- Se simuló la BD de Render con el esquema real, las 95 zonas, usuarios, conversaciones con acentos, comillas y saltos de línea, e imágenes binarias.
- Se exportó, se importó en una BD vacía y la verificación coincidió en las 8 tablas.
- El script detecta una diferencia provocada y rechaza sobrescribir un destino con datos.

## Paso a paso

```bash
# 1. Inventario (crea la API key en Render > Account Settings > API Keys)
export RENDER_API_KEY=rnd_...
python3 database/migration/render_inventory.py
#    -> genera .secrets/render_<bd>.env con SOURCE_DATABASE_URL

# 2. Exportar TODO
bash database/migration/export_db.sh .secrets/render_<bd>.env
#    -> database/backups/<fecha>/

# 3. Crear la BD de destino (ver opciones) y restaurar
TARGET_DATABASE_URL='postgresql://...' bash database/migration/import_db.sh database/backups/<fecha>

# 4. Apuntar el backend al destino: variable DATABASE_URL en el hosting del backend
#    (en Neon/Supabase deja DB_SSL=true; en PostgreSQL local DB_SSL=false)
```

Si la BD de Render ya no es accesible (borrada), no hay datos que recuperar. En ese caso el backend crea las tablas al arrancar y siembra automáticamente las 95 zonas si la tabla está vacía (`AUTO_SEED_ZONES`). También crea los usuarios iniciales si defines `SEED_ADMIN_PASSWORD` y `SEED_DEMO_PASSWORD`.

## Opciones de destino sin coste

| Opción | Límites gratuitos | Ventajas | Inconvenientes |
|---|---|---|---|
| **Neon** (recomendada para producción) | 0,5 GB por proyecto. 100 CU-hora/mes según su página de precios; otra página de su documentación indica 50, así que conviene comprobarlo. Se suspende tras 5 min de inactividad. | No caduca. Al superar límites suspende el cómputo, **no borra datos**. Ramas para pruebas. PostgreSQL estándar. | Primer acceso tras la suspensión: ~1 s más lento. |
| **Supabase** | 500 MB. | PostgreSQL estándar, panel cómodo. | Pausa los proyectos gratuitos inactivos (hay que reactivarlos). |
| **Autoalojado** (`docker-compose.yml`) | Lo que dé tu máquina. | **Control absoluto**: datos en tu volumen, sin terceros. | Necesitas una máquina encendida y accesible para producción, y hacer tus copias. |

Fuentes:

- <https://render.com/docs/free>
- <https://neon.com/pricing>
- <https://neon.com/docs/introduction/plans>

Sobre Neon:

- El backend usa un pool pequeño (`DB_POOL_MAX=5`) y sin conexiones mínimas (`DB_POOL_MIN=0`). Así Neon puede suspender la BD cuando no hay tráfico y no se gastan horas de cómputo.
- La cadena de Neon incluye `sslmode=require&channel_binding=require`. El backend la limpia y gestiona el SSL con `DB_SSL`; está cubierto por tests.

Recomendación para tener el control:

1. Usar **Neon** como base de datos de producción.
2. Usar el **`docker-compose.yml`** como entorno propio completo, en local o en tu propio servidor.
3. Programar `export_db.sh` en **tu** máquina (`cron` o `systemd timer`) para tener copias periódicas que solo tú controlas.

## Pila completa autoalojada

```bash
cp .env.compose.example .env   # rellena contraseñas y claves (openssl rand -hex 32)
docker compose up -d --build   # o: podman-compose up -d --build
# Frontend http://localhost:8080 · Backend http://localhost:5000 · ai-service http://localhost:8001/docs
```

Verificado con `podman-compose` el 22/10/2026:

- La BD está sana y se siembran 95 zonas.
- El frontend responde.
- El ai-service rechaza peticiones sin clave (401).
- El login funciona.
- El chat mantiene el contexto entre turnos.
- El planificador lee las zonas del backend.
