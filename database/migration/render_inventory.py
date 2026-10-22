#!/usr/bin/env python3
"""Inventario completo de tu cuenta de Render (solo lectura).

Qué hace:
  - Lista tus bases de datos PostgreSQL con versión, plan, estado, región,
    fecha de creación y, en el plan gratuito, la fecha de CADUCIDAD.
  - Obtiene la cadena de conexión externa de cada base de datos.
  - Lista tus servicios web (repo, rama, URL, estado) y los NOMBRES de sus
    variables de entorno.

Dónde guarda los datos:
  - database/migration/output/<fecha>/render_inventory.json  -> SIN secretos.
  - .secrets/render_<servicio>.env                             -> CON secretos
    (cadena de conexión y valores de variables), permisos 600 y fuera de Git.

Uso:
  export RENDER_API_KEY=rnd_xxx        # Dashboard de Render > Account Settings > API Keys
  python3 database/migration/render_inventory.py

No modifica nada en Render: solo hace peticiones GET.
"""

from __future__ import annotations

import json
import os
import stat
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = os.environ.get("RENDER_API_BASE", "https://api.render.com/v1")  # sobrescribible solo para pruebas
ROOT = Path(__file__).resolve().parents[2]
SECRETS_DIR = ROOT / ".secrets"


def get(path: str, params: dict | None = None):
    url = f"{API}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {os.environ['RENDER_API_KEY']}",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def paginate(path: str, key: str) -> list[dict]:
    items, cursor = [], None
    while True:
        params = {"limit": 100, **({"cursor": cursor} if cursor else {})}
        page = get(path, params)
        if not page:
            return items
        items.extend(p[key] for p in page if key in p)
        cursor = page[-1].get("cursor")
        if len(page) < 100 or not cursor:
            return items


def redact(url: str) -> str:
    p = urllib.parse.urlsplit(url)
    netloc = p.netloc
    if "@" in netloc:
        creds, host = netloc.rsplit("@", 1)
        user = creds.split(":", 1)[0]
        netloc = f"{user}:***@{host}"
    return urllib.parse.urlunsplit((p.scheme, netloc, p.path, p.query, ""))


def write_secret(name: str, lines: list[str]) -> Path:
    SECRETS_DIR.mkdir(exist_ok=True)
    os.chmod(SECRETS_DIR, stat.S_IRWXU)
    path = SECRETS_DIR / f"render_{name}.env"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    os.chmod(path, stat.S_IRUSR | stat.S_IWUSR)
    return path


def main() -> int:
    if not os.environ.get("RENDER_API_KEY"):
        print("Falta RENDER_API_KEY. Créala en Render > Account Settings > API Keys y ejecuta:\n"
              "  export RENDER_API_KEY=rnd_...\n  python3 database/migration/render_inventory.py", file=sys.stderr)
        return 2

    now = datetime.now(timezone.utc)
    out_dir = ROOT / "database" / "migration" / "output" / now.strftime("%Y%m%d-%H%M%S")
    out_dir.mkdir(parents=True, exist_ok=True)
    inventory: dict = {"generated_at": now.isoformat(), "postgres": [], "services": []}

    try:
        databases = paginate("/postgres", "postgres")
    except urllib.error.HTTPError as e:
        print(f"Error de la API de Render ({e.code}): revisa la API key.", file=sys.stderr)
        return 1

    for db in databases:
        entry = {k: db.get(k) for k in ("id", "name", "databaseName", "databaseUser", "version", "plan", "status",
                                         "region", "createdAt", "updatedAt", "expiresAt", "diskSizeGB",
                                         "suspended", "suspenders", "dashboardUrl", "ipAllowList")}
        if db.get("expiresAt"):
            exp = datetime.fromisoformat(db["expiresAt"].replace("Z", "+00:00"))
            days = (exp - now).total_seconds() / 86400
            entry["days_until_expiry"] = round(days, 1)
        try:
            info = get(f"/postgres/{db['id']}/connection-info")
            entry["external_connection"] = redact(info["externalConnectionString"])
            secret = write_secret(db["name"], [
                f"# Base de datos Render «{db['name']}» — generado {now.isoformat()}",
                f"SOURCE_DATABASE_URL={info['externalConnectionString']}",
            ])
            entry["secrets_file"] = str(secret.relative_to(ROOT))
        except urllib.error.HTTPError as e:
            entry["connection_error"] = f"HTTP {e.code} (¿base de datos caducada o suspendida?)"
        inventory["postgres"].append(entry)

    for svc in paginate("/services", "service"):
        details = svc.get("serviceDetails") or {}
        entry = {k: svc.get(k) for k in ("id", "name", "type", "repo", "branch", "rootDir", "suspended",
                                          "suspenders", "createdAt", "updatedAt", "dashboardUrl")}
        entry["url"] = details.get("url")
        entry["plan"] = details.get("plan")
        entry["region"] = details.get("region")
        try:
            env = paginate(f"/services/{svc['id']}/env-vars", "envVar")
            entry["env_var_names"] = sorted(v["key"] for v in env)
            write_secret(svc["name"], [f"# Variables de entorno de «{svc['name']}» — generado {now.isoformat()}"]
                         + [f"{v['key']}={v.get('value', '')}" for v in env])
        except urllib.error.HTTPError as e:
            entry["env_error"] = f"HTTP {e.code}"
        inventory["services"].append(entry)

    report = out_dir / "render_inventory.json"
    report.write_text(json.dumps(inventory, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Inventario (sin secretos): {report.relative_to(ROOT)}")
    print(f"Secretos (permisos 600, fuera de Git): {SECRETS_DIR.relative_to(ROOT)}/\n")
    for db in inventory["postgres"]:
        print(f"PostgreSQL «{db['name']}»  v{db['version']}  plan={db['plan']}  estado={db['status']}  región={db['region']}")
        print(f"   creada: {db['createdAt']}")
        if "days_until_expiry" in db:
            d = db["days_until_expiry"]
            if d < 0:
                print(f"   ⚠️  CADUCADA hace {abs(d):.0f} días. Render la borra 14 días después de caducar:"
                      " exporta YA si aún es accesible.")
            else:
                print(f"   ⚠️  caduca en {d:.0f} días ({db['expiresAt']}). Exporta antes de esa fecha.")
        if db.get("connection_error"):
            print(f"   ✗ {db['connection_error']}")
        else:
            print(f"   conexión: {db['external_connection']}")
    for s in inventory["services"]:
        print(f"Servicio «{s['name']}» ({s['type']})  {s.get('url') or ''}  suspendido={s['suspended']}")
    print("\nSiguiente paso: bash database/migration/export_db.sh .secrets/render_<nombre-bd>.env")
    return 0


if __name__ == "__main__":
    sys.exit(main())
