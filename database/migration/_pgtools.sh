# Funciones comunes. Se incluye con:  source "$(dirname "$0")/_pgtools.sh"
# Usa pg_dump/psql/pg_restore locales si son >= 18; si no, los ejecuta en un
# contenedor postgres:18-alpine (podman o docker) con la red del host.
set -euo pipefail

PG_IMAGE="${PG_IMAGE:-docker.io/library/postgres:18-alpine}"
PG_MIN_MAJOR=18

_runtime() {
  if command -v podman >/dev/null 2>&1; then echo podman
  elif command -v docker >/dev/null 2>&1; then echo docker
  else echo ""; fi
}

_local_ok() {
  command -v "$1" >/dev/null 2>&1 || return 1
  local major
  major="$("$1" --version | grep -oE '[0-9]+' | head -1)"
  [ "${major:-0}" -ge "$PG_MIN_MAJOR" ]
}

# pg <herramienta> [args...]   (el directorio de trabajo actual se monta en /work)
pg() {
  local tool="$1"; shift
  if _local_ok "$tool"; then
    "$tool" "$@"
    return
  fi
  local rt; rt="$(_runtime)"
  if [ -z "$rt" ]; then
    echo "✗ Necesitas PostgreSQL ${PG_MIN_MAJOR}+ instalado o podman/docker." >&2
    exit 1
  fi
  "$rt" run --rm --network host -v "$PWD:/work:Z" -w /work \
    -e PGPASSWORD -e PGSSLMODE "$PG_IMAGE" "$tool" "$@"
}

load_env_file() {
  # Carga VAR=valor de un fichero .env sin ejecutar código.
  local file="$1"
  [ -f "$file" ] || { echo "✗ No existe $file" >&2; exit 1; }
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* ]] && continue
    export "$key=$value"
  done < "$file"
}

redact_url() { echo "$1" | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#'; }
