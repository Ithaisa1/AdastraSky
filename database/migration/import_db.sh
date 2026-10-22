#!/usr/bin/env bash
# Restaura una exportación en la base de datos de destino (Neon, Supabase, Docker local…).
#
# Uso:
#   TARGET_DATABASE_URL=postgresql://... bash database/migration/import_db.sh database/backups/<fecha>
#   # o con un fichero:  bash database/migration/import_db.sh database/backups/<fecha> .secrets/target.env
#
# Por seguridad se niega a escribir en una base de datos que ya tenga tablas,
# salvo que pongas FORCE_IMPORT=1 (en ese caso sustituye los objetos existentes).
source "$(dirname "$0")/_pgtools.sh"

BACKUP="${1:?Indica la carpeta de la exportación (database/backups/<fecha>)}"
[ $# -ge 2 ] && load_env_file "$2"
: "${TARGET_DATABASE_URL:?Define TARGET_DATABASE_URL}"
export PGSSLMODE="${PGSSLMODE:-prefer}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
[ -f "$BACKUP/adastrasky.dump" ] || { echo "✗ No encuentro $BACKUP/adastrasky.dump" >&2; exit 1; }

echo "→ Comprobando sumas de verificación…"
(cd "$BACKUP" && sha256sum --quiet -c SHA256SUMS) || { echo "✗ La copia está dañada o modificada" >&2; exit 1; }

echo "→ Destino: $(redact_url "$TARGET_DATABASE_URL")"
existing="$(pg psql "$TARGET_DATABASE_URL" -qAt -c "select count(*) from information_schema.tables where table_schema='public'")"
CLEAN=()
if [ "$existing" != "0" ]; then
  if [ "${FORCE_IMPORT:-0}" != "1" ]; then
    echo "✗ El destino ya tiene $existing tablas. Usa una base de datos vacía o FORCE_IMPORT=1 para sustituirlas." >&2
    exit 1
  fi
  CLEAN=(--clean --if-exists)
  echo "  FORCE_IMPORT=1: se sustituirán los objetos existentes."
fi

echo "→ Restaurando…"
pg pg_restore --dbname "$TARGET_DATABASE_URL" --no-owner --no-privileges --exit-on-error "${CLEAN[@]}" "$BACKUP/adastrasky.dump"

echo "→ Verificando…"
bash "$(dirname "$0")/verify_db.sh" "$BACKUP"
