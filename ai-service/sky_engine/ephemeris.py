"""Efemérides con Astronomy Engine (MIT, https://github.com/cosinekitty/astronomy).

Precisión de Astronomy Engine: ~1 minuto de arco para planetas, más que
suficiente para decidir visibilidad a simple vista o con telescopio amateur.
Para objetos de cielo profundo se usan coordenadas J2000 fijas (error por
precesión < 0,5°, irrelevante para planificar).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

import astronomy as ae

from agent.guards import normalize

CANARY_TZ_NAME = "Atlantic/Canary"


@dataclass(frozen=True)
class Target:
    key: str
    kind: str  # planet | moon | deep_sky
    names: dict[str, str]
    body: ae.Body | None = None
    ra_hours: float | None = None   # J2000
    dec_deg: float | None = None    # J2000
    moon_sensitive: bool = False    # objetos débiles: la Luna molesta mucho


def _dms(d: float, m: float, s: float = 0.0) -> float:
    sign = -1 if d < 0 else 1
    return sign * (abs(d) + m / 60 + s / 3600)


TARGETS: dict[str, Target] = {t.key: t for t in [
    Target("mercury", "planet", {"es": "Mercurio", "en": "Mercury", "de": "Merkur"}, ae.Body.Mercury),
    Target("venus", "planet", {"es": "Venus", "en": "Venus", "de": "Venus"}, ae.Body.Venus),
    Target("mars", "planet", {"es": "Marte", "en": "Mars", "de": "Mars"}, ae.Body.Mars),
    Target("jupiter", "planet", {"es": "Júpiter", "en": "Jupiter", "de": "Jupiter"}, ae.Body.Jupiter),
    Target("saturn", "planet", {"es": "Saturno", "en": "Saturn", "de": "Saturn"}, ae.Body.Saturn),
    Target("uranus", "planet", {"es": "Urano", "en": "Uranus", "de": "Uranus"}, ae.Body.Uranus, moon_sensitive=True),
    Target("neptune", "planet", {"es": "Neptuno", "en": "Neptune", "de": "Neptun"}, ae.Body.Neptune, moon_sensitive=True),
    Target("moon", "moon", {"es": "la Luna", "en": "the Moon", "de": "den Mond"}, ae.Body.Moon),
    Target("m31", "deep_sky", {"es": "la galaxia de Andrómeda (M31)", "en": "the Andromeda Galaxy (M31)", "de": "die Andromedagalaxie (M31)"},
           ra_hours=_dms(0, 42, 44.3), dec_deg=_dms(41, 16, 9), moon_sensitive=True),
    Target("m42", "deep_sky", {"es": "la nebulosa de Orión (M42)", "en": "the Orion Nebula (M42)", "de": "den Orionnebel (M42)"},
           ra_hours=_dms(5, 35, 17.3), dec_deg=_dms(-5, 23, 28), moon_sensitive=True),
    Target("m45", "deep_sky", {"es": "las Pléyades (M45)", "en": "the Pleiades (M45)", "de": "die Plejaden (M45)"},
           ra_hours=_dms(3, 47, 24), dec_deg=_dms(24, 7, 0)),
    Target("m13", "deep_sky", {"es": "el cúmulo de Hércules (M13)", "en": "the Hercules Cluster (M13)", "de": "den Herkuleshaufen (M13)"},
           ra_hours=_dms(16, 41, 41.6), dec_deg=_dms(36, 27, 35), moon_sensitive=True),
    Target("milky_way_core", "deep_sky", {"es": "el núcleo de la Vía Láctea", "en": "the Milky Way core", "de": "das Zentrum der Milchstraße"},
           ra_hours=_dms(17, 45, 40), dec_deg=_dms(-29, 0, 28), moon_sensitive=True),
]}

_ALIASES = {
    "mercury": ["mercurio", "mercury", "merkur"],
    "venus": ["venus"],
    "mars": ["marte", "mars"],
    "jupiter": ["jupiter", "jupiter"],
    "saturn": ["saturno", "saturn"],
    "uranus": ["urano", "uranus"],
    "neptune": ["neptuno", "neptune", "neptun"],
    "moon": ["luna", "moon", "mond"],
    "m31": ["m31", "andromeda", "galaxia de andromeda", "andromeda galaxy", "andromedagalaxie", "andromedanebel"],
    "m42": ["m42", "nebulosa de orion", "orion nebula", "orionnebel"],
    "m45": ["m45", "pleyades", "pleiades", "plejaden", "siete cabritillas"],
    "m13": ["m13", "cumulo de hercules", "hercules cluster", "herkuleshaufen"],
    "milky_way_core": ["via lactea", "milky way", "milchstrasse", "nucleo galactico", "galactic core", "centro galactico"],
}


def resolve_target(text: str) -> Target | None:
    import re
    n = normalize(text)
    best = None
    for key, aliases in _ALIASES.items():
        for a in aliases:
            if re.search(r"(?<![a-z0-9])" + re.escape(a) + r"(?![a-z0-9])", n) and (best is None or len(a) > best[1]):
                best = (key, len(a))
    return TARGETS[best[0]] if best else None


def supported_targets(lang: str = "es") -> list[str]:
    return [t.names.get(lang, t.names["es"]) for t in TARGETS.values()]


def _to_time(dt: datetime) -> ae.Time:
    return ae.Time.Make(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second + dt.microsecond / 1e6)


def _to_dt(t: ae.Time) -> datetime:
    return t.Utc().replace(tzinfo=timezone.utc)


def horizontal(target: Target, when: datetime, lat: float, lon: float, elevation_m: float = 0.0) -> tuple[float, float]:
    """(altitud°, azimut°) del objetivo para un observador."""
    obs = ae.Observer(lat, lon, elevation_m)
    t = _to_time(when)
    if target.body is not None:
        eq = ae.Equator(target.body, t, obs, True, True)
        ra, dec = eq.ra, eq.dec
    else:
        ra, dec = target.ra_hours, target.dec_deg
    hor = ae.Horizon(t, obs, ra, dec, ae.Refraction.Normal)
    return hor.altitude, hor.azimuth


def magnitude(target: Target, when: datetime) -> float | None:
    if target.body is None:
        return None
    try:
        return round(ae.Illumination(target.body, _to_time(when)).mag, 1)
    except Exception:
        return None


def moon_illumination(when: datetime) -> float:
    return round(ae.Illumination(ae.Body.Moon, _to_time(when)).phase_fraction, 2)


@dataclass
class NightWindow:
    night_of: date
    dark_start: datetime  # UTC
    dark_end: datetime    # UTC
    twilight: str         # astronomical | nautical


TWILIGHT_LEVELS = {"astronomical": -18.0, "nautical": -12.0, "civil": -6.0}


def observing_profile(target: Target) -> tuple[tuple[str, ...], float]:
    """(niveles de crepúsculo admitidos, altura mínima) según el tipo de objeto.

    Mercurio y Venus nunca se ven en noche cerrada: se observan en el crepúsculo,
    bajos sobre el horizonte. La Luna y los planetas brillantes toleran cielo
    no del todo oscuro; el cielo profundo exige oscuridad astronómica.
    """
    if target.key in ("mercury", "venus"):
        return ("civil",), 5.0
    if target.key == "moon":
        return ("civil",), 10.0
    if target.kind == "planet" and not target.moon_sensitive:
        return ("nautical", "civil"), 15.0
    return ("astronomical", "nautical"), 15.0


def night_window(night_of: date, lat: float, lon: float, elevation_m: float = 0.0,
                 levels: tuple[str, ...] = ("astronomical", "nautical")) -> NightWindow | None:
    """Ventana de observación de la noche que empieza la tarde de ``night_of`` (UTC).

    Prueba los niveles de crepúsculo en orden (por defecto astronómico, Sol a
    -18°, y si no se alcanza, náutico, -12°).
    """
    obs = ae.Observer(lat, lon, elevation_m)
    # mediodía local aproximado según la longitud, para buscar la puesta de esa tarde
    noon_utc = datetime(night_of.year, night_of.month, night_of.day, 12, tzinfo=timezone.utc) - timedelta(hours=lon / 15)
    start = _to_time(noon_utc)
    for label in levels:
        alt = TWILIGHT_LEVELS[label]
        dusk = ae.SearchAltitude(ae.Body.Sun, obs, ae.Direction.Set, start, 1.0, alt)
        if dusk is None:
            continue
        dawn = ae.SearchAltitude(ae.Body.Sun, obs, ae.Direction.Rise, dusk, 1.0, alt)
        if dawn is None:
            continue
        return NightWindow(night_of, _to_dt(dusk), _to_dt(dawn), label)
    return None


@dataclass
class VisibilitySample:
    time: datetime
    altitude: float
    azimuth: float
    moon_altitude: float


def sample_night(target: Target, window: NightWindow, lat: float, lon: float, elevation_m: float = 0.0,
                 step_minutes: int = 30) -> list[VisibilitySample]:
    moon = TARGETS["moon"]
    out = []
    t = window.dark_start
    while t <= window.dark_end:
        alt, az = horizontal(target, t, lat, lon, elevation_m)
        m_alt, _ = horizontal(moon, t, lat, lon, elevation_m) if target.key != "moon" else (alt, az)
        out.append(VisibilitySample(t, alt, az, m_alt))
        t += timedelta(minutes=step_minutes)
    return out


def cardinal(azimuth: float, lang: str = "es") -> str:
    names = {
        "es": ["N", "NE", "E", "SE", "S", "SO", "O", "NO"],
        "en": ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
        "de": ["N", "NO", "O", "SO", "S", "SW", "W", "NW"],
    }[lang if lang in ("es", "en", "de") else "es"]
    return names[int(((azimuth % 360) + 22.5) // 45) % 8]


def planets_tonight(lat: float, lon: float, night_of: date, elevation_m: float = 0.0, min_alt: float = 10.0) -> dict:
    """Planetas y Luna visibles durante la noche indicada (para /what-to-see)."""
    window = night_window(night_of, lat, lon, elevation_m)
    if window is None:
        return {"window": None, "objects": []}
    objects = []
    for key in ("mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "moon"):
        tgt = TARGETS[key]
        samples = sample_night(tgt, window, lat, lon, elevation_m)
        up = [s for s in samples if s.altitude >= min_alt]
        if not up:
            continue
        best = max(up, key=lambda s: s.altitude)
        objects.append({
            "key": key, "names": tgt.names, "visible_from": up[0].time.isoformat(), "visible_until": up[-1].time.isoformat(),
            "max_altitude": round(best.altitude, 1), "best_time": best.time.isoformat(), "azimuth_at_best": round(best.azimuth),
            "magnitude": magnitude(tgt, best.time),
        })
    return {"window": {"start": window.dark_start.isoformat(), "end": window.dark_end.isoformat(), "twilight": window.twilight},
            "objects": objects, "moon_illumination": moon_illumination(window.dark_start)}
