#!/usr/bin/env bash
# Compara el nº de filas de cada tabla del destino con el de la exportación.
# Uso: TARGET_DATABASE_URL=... bash database/migration/verify_db.sh database/backups/<fecha>
source "$(dirname "$0")/_pgtools.sh"

BACKUP="${1:?Indica la carpeta de la exportación}"
: "${TARGET_DATABASE_URL:?Define TARGET_DATABASE_URL}"
export PGSSLMODE="${PGSSLMODE:-prefer}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

fail=0
# Se lee por el descriptor 3 para que los comandos del bucle no consuman la lista
while IFS=$'\t' read -r -u 3 table expected; do
  actual="$(pg psql "$TARGET_DATABASE_URL" -qAt -c "select count(*) from ${table}" 2>/dev/null || echo "FALTA")"
  if [ "$actual" = "$expected" ]; then
    printf '  ✓ %-35s %s\n' "$table" "$actual"
  else
    printf '  ✗ %-35s esperado=%s destino=%s\n' "$table" "$expected" "$actual"
    fail=1
  fi
done 3< "$BACKUP/row_counts.tsv"

if [ "$fail" = "0" ]; then
  echo "✓ El destino coincide con la exportación."
else
  echo "✗ Hay diferencias: revisa la salida." >&2
  exit 1
fi
