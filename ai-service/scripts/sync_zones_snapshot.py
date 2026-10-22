"""Genera ai-service/data/zones_snapshot.json a partir de backend/src/seed/santuarios.json.

El snapshot solo se usa como último recurso cuando ni el backend ni la base de
datos responden (el Space de HF solo contiene la carpeta ai-service).
Ejecutar tras modificar el seed:  python ai-service/scripts/sync_zones_snapshot.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "backend" / "src" / "seed" / "santuarios.json"
DST = ROOT / "ai-service" / "data" / "zones_snapshot.json"
FIELDS = ["name", "island", "municipality", "category", "subcategory", "latitude", "longitude", "altitude",
          "bortle_scale", "sqm_estimate", "access_type", "night_access", "has_high_wind", "safety_risk", "description"]

zones = [{k: z.get(k) for k in FIELDS} for z in json.loads(SRC.read_text(encoding="utf-8")) if z.get("is_active", True)]
DST.write_text(json.dumps({"source": "backend/src/seed/santuarios.json", "zones": zones}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(zones)} zonas -> {DST}")
