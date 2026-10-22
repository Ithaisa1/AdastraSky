#!/usr/bin/env bash
# Exporta TODA la base de datos de origen (por ejemplo, la de Render).
#
# Uso:
#   bash database/migration/export_db.sh .secrets/render_<bd>.env
#   # o bien:  SOURCE_DATABASE_URL=postgresql://... bash database/migration/export_db.sh
#
# Resultado en database/backups/<fecha>/  (fuera de Git: contiene datos personales)
#   adastrasky.dump   copia completa restaurable (pg_dump formato custom)
#   schema.sql        esquema en SQL legible
#   full.sql          copia completa en SQL plano (restaurable con psql)
#   data/<tabla>.csv  cada tabla en CSV con cabecera
#   inventory.txt     versión, tamaño, extensiones y nº de filas por tabla
#   row_counts.tsv    nº de filas por tabla (lo usa verify_db.sh)
#   SHA256SUMS        sumas de verificación
# Solo lectura sobre el origen.
source "$(dirname "$0")/_pgtools.sh"

[ $# -ge 1 ] && load_env_file "$1"
: "${SOURCE_DATABASE_URL:?Define SOURCE_DATABASE_URL o pasa el fichero .env generado por render_inventory.py}"
export PGSSLMODE="${PGSSLMODE:-prefer}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_REL="database/backups/${STAMP}"
mkdir -p "$ROOT/$OUT_REL/data"
chmod 700 "$ROOT/database/backups" "$ROOT/$OUT_REL"
cd "$ROOT"

echo "→ Origen: $(redact_url "$SOURCE_DATABASE_URL")"
echo "→ Destino: $OUT_REL"

pg psql "$SOURCE_DATABASE_URL" -v ON_ERROR_STOP=1 -qAt -c "select 1" >/dev/null \
  || { echo "✗ No se puede conectar con el origen" >&2; exit 1; }

echo "→ Copia completa (formato custom)…"
pg pg_dump "$SOURCE_DATABASE_URL" --format=custom --no-owner --no-privileges --file "$OUT_REL/adastrasky.dump"
echo "→ Esquema y SQL plano…"
pg pg_dump "$SOURCE_DATABASE_URL" --schema-only --no-owner --no-privileges --file "$OUT_REL/schema.sql"
pg pg_dump "$SOURCE_DATABASE_URL" --no-owner --no-privileges --file "$OUT_REL/full.sql"

echo "→ Tablas en CSV y recuento de filas…"
TABLES="$(pg psql "$SOURCE_DATABASE_URL" -qAt -c "select table_schema||'.'||table_name from information_schema.tables where table_type='BASE TABLE' and table_schema not in ('pg_catalog','information_schema') order by 1")"
: > "$OUT_REL/row_counts.tsv"
for t in $TABLES; do
  name="${t#public.}"
  pg psql "$SOURCE_DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "\\copy (select * from ${t}) to '${OUT_REL}/data/${name}.csv' with (format csv, header true)"
  n="$(pg psql "$SOURCE_DATABASE_URL" -qAt -c "select count(*) from ${t}")"
  printf '%s\t%s\n' "$t" "$n" >> "$OUT_REL/row_counts.tsv"
done

{
  echo "Exportación AdAstra Sky — $(date -Iseconds)"
  echo "Origen: $(redact_url "$SOURCE_DATABASE_URL")"
  echo
  pg psql "$SOURCE_DATABASE_URL" -qAt -c "select 'Servidor: '||version()"
  pg psql "$SOURCE_DATABASE_URL" -qAt -c "select 'Tamaño: '||pg_size_pretty(pg_database_size(current_database()))"
  pg psql "$SOURCE_DATABASE_URL" -qAt -c "select 'Extensión: '||extname||' '||extversion from pg_extension order by 1"
  echo
  echo "Filas por tabla:"
  column -t -s $'\t' "$OUT_REL/row_counts.tsv" 2>/dev/null || cat "$OUT_REL/row_counts.tsv"
} > "$OUT_REL/inventory.txt"

(cd "$OUT_REL" && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS)
chmod -R go-rwx "$OUT_REL"

cat "$OUT_REL/inventory.txt"
echo
echo "✓ Exportación completa en $OUT_REL"
echo "  Siguiente paso: TARGET_DATABASE_URL=... bash database/migration/import_db.sh $OUT_REL"
