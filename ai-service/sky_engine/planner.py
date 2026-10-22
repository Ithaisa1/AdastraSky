"""Planificador de observación astronómica.

Ejemplo: «Quiero observar Saturno este fin de semana cerca de mi ubicación».

Combina:
- Visibilidad real del objeto (Astronomy Engine) durante la noche oscura.
- Zonas de AdAstra Sky (Bortle, altitud, acceso) — ``services.zones``.
- Previsión horaria de nubes, humedad y viento (Open-Meteo) — ``services.weather``.
- Fase y altura de la Luna.

Principios:
- Nunca afirma que un objeto será visible si las efemérides no lo confirman.
- La puntuación es una ayuda, no una garantía. Se indica el nivel de confianza.
- Si falta la previsión o las zonas, lo dice y rebaja la confianza.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from statistics import mean
from zoneinfo import ZoneInfo

from services import weather as weather_service
from services import zones as zones_service
from sky_engine import ephemeris as eph

LOCAL_TZ = ZoneInfo(eph.CANARY_TZ_NAME)
MIN_ALTITUDE = 15.0        # por debajo, la turbulencia y el horizonte estropean la observación
MAX_CANDIDATE_ZONES = 5    # limita llamadas a la API de previsión
FORECAST_HORIZON_DAYS = 15
HIGH_SITE_ALTITUDE = 1800  # por encima, las nubes bajas (mar de nubes) suelen quedar debajo

_T = {
    "es": {
        "not_found": "No reconozco el objeto «{target}». Puedo planificar: {supported}.",
        "never_visible": "{name} no se eleva por encima de {min_alt}° con el cielo suficientemente oscuro en las fechas indicadas (probablemente está demasiado cerca del Sol). No es buen momento para observarlo.",
        "visible_window": "{name} estará sobre el horizonte de {start} a {end} (hora canaria), con altura máxima de {alt}° hacia el {dir} a las {best}.",
        "visible_brief": "{name} solo asomará brevemente, muy bajo ({alt}° hacia el {dir}) hacia las {best} (hora canaria). Necesitarás un horizonte {dir} totalmente despejado.",
        "magnitude": "Brillo aproximado: magnitud {mag}.",
        "clouds": "Nubosidad prevista en esa franja: {clouds}%.",
        "clouds_high_site": "Nubosidad efectiva prevista: {clouds}% (a {alt} m, las nubes bajas del mar de nubes suelen quedar por debajo).",
        "no_forecast": "No hay previsión meteorológica disponible para esa fecha: la recomendación se basa solo en la oscuridad del cielo y la visibilidad.",
        "bortle": "Cielo Bortle {bortle} ({quality}).",
        "moon": "Luna iluminada al {illum}%{up}.",
        "moon_up": " y sobre el horizonte durante parte de la observación",
        "distance": "A unos {km} km en línea recta de tu ubicación.",
        "restricted": "Acceso nocturno restringido: consulta antes las condiciones de visita.",
        "wind": "Viento previsto de hasta {wind} km/h: lleva abrigo y asegura el trípode.",
        "q": {1: "excepcional", 2: "excelente", 3: "rural", 4: "transición rural-suburbana", 5: "suburbano", 6: "suburbano brillante", 7: "transición urbana", 8: "urbano", 9: "centro urbano"},
        "lim_score": "La puntuación combina datos de previsión y efemérides; no garantiza que el cielo esté despejado.",
        "lim_forecast": "La previsión meteorológica pierde fiabilidad a partir de 3 días; vuelve a consultarla el mismo día.",
        "lim_terrain": "No se tiene en cuenta el relieve local (montañas o árboles pueden tapar el horizonte bajo).",
        "lim_zones": "No se pudieron cargar las zonas de observación; se usa solo tu ubicación.",
        "lim_snapshot": "Las zonas proceden de una copia local de referencia y podrían no estar actualizadas.",
        "lim_straight": "Las distancias son en línea recta, no por carretera.",
        "summary_best": "Mejor opción: {zone} la noche del {night}, de {start} a {end}.",
        "summary_none": "No he encontrado ninguna franja recomendable con los datos disponibles.",
    },
    "en": {
        "not_found": "I don't recognise the object “{target}”. I can plan for: {supported}.",
        "never_visible": "{name} does not rise above {min_alt}° while the sky is dark enough on those dates (it is probably too close to the Sun). It is not a good time to observe it.",
        "visible_window": "{name} will be above the horizon from {start} to {end} (Canary time), peaking at {alt}° towards the {dir} at {best}.",
        "visible_brief": "{name} will only appear briefly and very low ({alt}° towards the {dir}) around {best} (Canary time). You will need a completely clear {dir} horizon.",
        "magnitude": "Approximate brightness: magnitude {mag}.",
        "clouds": "Forecast cloud cover during that window: {clouds}%.",
        "clouds_high_site": "Effective forecast cloud cover: {clouds}% (at {alt} m, low clouds from the sea of clouds usually stay below).",
        "no_forecast": "No weather forecast is available for that date: the recommendation relies only on sky darkness and visibility.",
        "bortle": "Bortle {bortle} sky ({quality}).",
        "moon": "Moon {illum}% illuminated{up}.",
        "moon_up": " and above the horizon during part of the session",
        "distance": "About {km} km in a straight line from your location.",
        "restricted": "Restricted night access: check visiting conditions in advance.",
        "wind": "Wind up to {wind} km/h forecast: bring warm clothes and secure your tripod.",
        "q": {1: "exceptional", 2: "excellent", 3: "rural", 4: "rural/suburban transition", 5: "suburban", 6: "bright suburban", 7: "suburban/urban transition", 8: "city", 9: "inner city"},
        "lim_score": "The score combines forecast and ephemeris data; it does not guarantee clear skies.",
        "lim_forecast": "Weather forecasts become less reliable beyond 3 days; check again on the day.",
        "lim_terrain": "Local terrain is not considered (mountains or trees may block the low horizon).",
        "lim_zones": "Observation zones could not be loaded; only your location is used.",
        "lim_snapshot": "Zones come from a local reference copy and may be out of date.",
        "lim_straight": "Distances are straight-line, not by road.",
        "summary_best": "Best option: {zone} on the night of {night}, from {start} to {end}.",
        "summary_none": "I couldn't find any recommended window with the available data.",
    },
    "de": {
        "not_found": "Ich kenne das Objekt „{target}“ nicht. Ich kann planen für: {supported}.",
        "never_visible": "{name} steigt an diesen Tagen bei ausreichend dunklem Himmel nicht über {min_alt}° (vermutlich zu nah an der Sonne). Kein guter Zeitpunkt für eine Beobachtung.",
        "visible_window": "{name} steht von {start} bis {end} (kanarische Zeit) über dem Horizont, maximal {alt}° Richtung {dir} um {best}.",
        "visible_brief": "{name} ist nur kurz und sehr tief ({alt}° Richtung {dir}) gegen {best} (kanarische Zeit) zu sehen. Sie brauchen einen völlig freien Horizont im {dir}.",
        "magnitude": "Ungefähre Helligkeit: Magnitude {mag}.",
        "clouds": "Vorhergesagte Bewölkung in diesem Zeitraum: {clouds} %.",
        "clouds_high_site": "Effektive vorhergesagte Bewölkung: {clouds} % (auf {alt} m liegen tiefe Wolken des Wolkenmeers meist darunter).",
        "no_forecast": "Für dieses Datum ist keine Wettervorhersage verfügbar: Die Empfehlung beruht nur auf Himmelsdunkelheit und Sichtbarkeit.",
        "bortle": "Bortle-{bortle}-Himmel ({quality}).",
        "moon": "Mond zu {illum} % beleuchtet{up}.",
        "moon_up": " und zeitweise über dem Horizont",
        "distance": "Etwa {km} km Luftlinie von Ihrem Standort.",
        "restricted": "Nächtlicher Zugang eingeschränkt: Besuchsbedingungen vorher prüfen.",
        "wind": "Wind bis {wind} km/h vorhergesagt: warme Kleidung mitnehmen und Stativ sichern.",
        "q": {1: "außergewöhnlich", 2: "ausgezeichnet", 3: "ländlich", 4: "Übergang ländlich/vorstädtisch", 5: "vorstädtisch", 6: "heller Vorort", 7: "Übergang Vorort/Stadt", 8: "Stadt", 9: "Innenstadt"},
        "lim_score": "Die Bewertung kombiniert Vorhersage- und Ephemeridendaten; sie garantiert keinen klaren Himmel.",
        "lim_forecast": "Wettervorhersagen werden nach 3 Tagen ungenauer; prüfen Sie sie am Beobachtungstag erneut.",
        "lim_terrain": "Das lokale Gelände wird nicht berücksichtigt (Berge oder Bäume können den tiefen Horizont verdecken).",
        "lim_zones": "Beobachtungsorte konnten nicht geladen werden; nur Ihr Standort wird verwendet.",
        "lim_snapshot": "Die Orte stammen aus einer lokalen Referenzkopie und sind möglicherweise nicht aktuell.",
        "lim_straight": "Entfernungen sind Luftlinie, nicht Straßenkilometer.",
        "summary_best": "Beste Option: {zone} in der Nacht vom {night}, von {start} bis {end}.",
        "summary_none": "Mit den verfügbaren Daten habe ich kein empfehlenswertes Zeitfenster gefunden.",
    },
}

SOURCES = [
    {"title": "Astronomy Engine — efemérides (MIT)", "source": "https://github.com/cosinekitty/astronomy"},
    {"title": "Open-Meteo — previsión meteorológica (CC BY 4.0)", "source": "https://open-meteo.com"},
    {"title": "AdAstra Sky — zonas de observación", "source": "AdAstra Sky"},
]


def _t(lang: str) -> dict:
    return _T.get(lang, _T["es"])


def resolve_dates(when: str | None, start_date: str | None, days: int | None, today: date | None = None) -> list[date]:
    """Convierte la petición en una lista de noches (fecha de la tarde)."""
    today = today or datetime.now(LOCAL_TZ).date()
    if start_date:
        start = date.fromisoformat(start_date)
        n = days or 1
    else:
        w = (when or "tonight").lower()
        if w in ("weekend", "fin de semana", "wochenende"):
            # viernes y sábado próximos (si hoy es sábado: hoy; si es domingo: el siguiente fin de semana)
            wd = today.weekday()
            if wd == 5:
                start, n = today, 1
            elif wd == 4:
                start, n = today, 2
            else:
                start, n = today + timedelta(days=(4 - wd) % 7), 2
        elif w in ("tomorrow", "manana", "mañana", "morgen"):
            start, n = today + timedelta(days=1), days or 1
        elif w in ("week", "semana", "woche"):
            start, n = today, 7
        else:
            start, n = today, days or 1
    n = max(1, min(int(n), 7))
    return [start + timedelta(days=i) for i in range(n)]


def _effective_cloud(hour: dict, site_alt: int) -> float | None:
    low, mid, high = hour.get("cloud_cover_low"), hour.get("cloud_cover_mid"), hour.get("cloud_cover_high")
    if low is None and hour.get("cloud_cover") is None:
        return None
    if low is None or mid is None or high is None:
        return float(hour.get("cloud_cover"))
    low_w = 0.3 if site_alt >= HIGH_SITE_ALTITUDE else 1.0
    return max(low * low_w, mid, high * 0.8)


@dataclass
class Option:
    zone: dict | None
    night: date
    window_start: datetime
    window_end: datetime
    best_time: datetime
    max_alt: float
    azimuth: float
    magnitude: float | None
    clouds: float | None
    wind_max: float | None
    moon_illum: float
    moon_up_fraction: float
    distance_km: float | None
    forecast_days_ahead: int
    score: float = 0.0
    confidence: str = "low"
    reasons: list[str] = field(default_factory=list)


def _score(opt: Option, target: eph.Target) -> float:
    _, min_alt = eph.observing_profile(target)
    hours = (opt.window_end - opt.window_start).total_seconds() / 3600
    # Mercurio/Venus solo se ven 1-2 h en el crepúsculo: no se les exige una ventana larga
    needed_hours = 1.0 if target.key in ("mercury", "venus") else 3.0
    vis = min(1.0, hours / needed_hours) * 0.5 + min(1.0, max(0.0, opt.max_alt - min_alt) / 45) * 0.5
    clouds = 0.5 if opt.clouds is None else max(0.0, 1 - opt.clouds / 100)
    bortle = (opt.zone or {}).get("bortle_scale") or 5
    dark = max(0.0, (9 - bortle) / 8)
    moon_pen = opt.moon_illum * opt.moon_up_fraction
    moon_w = 0.15 if target.moon_sensitive or target.kind == "deep_sky" else 0.05
    if target.kind == "moon":
        moon_pen, moon_w = 0.0, 0.0
    weights = {"vis": 0.30, "clouds": 0.35, "dark": 0.35 - moon_w}
    s = weights["vis"] * vis + weights["clouds"] * clouds + weights["dark"] * dark + moon_w * (1 - moon_pen)
    if opt.wind_max is not None and opt.wind_max > 40:
        s -= 0.05
    return round(max(0.0, min(1.0, s)) * 100)


def _confidence(opt: Option) -> str:
    if opt.clouds is None:
        return "low"
    if opt.forecast_days_ahead <= 2:
        return "high"
    if opt.forecast_days_ahead <= 6:
        return "medium"
    return "low"


def _fmt_local(dt: datetime) -> str:
    return dt.astimezone(LOCAL_TZ).strftime("%H:%M")


def plan_observation(target_text: str, lang: str = "es", when: str | None = None, start_date: str | None = None,
                     days: int | None = None, latitude: float | None = None, longitude: float | None = None,
                     island: str | None = None, max_distance_km: float | None = None, today: date | None = None) -> dict:
    lang = lang if lang in _T else "es"
    T = _t(lang)
    target = eph.resolve_target(target_text or "")
    if target is None:
        return {"ok": False, "error": "unknown_target",
                "message": T["not_found"].format(target=target_text, supported=", ".join(eph.supported_targets(lang)))}
    name = target.names.get(lang, target.names["es"])
    nights = resolve_dates(when, start_date, days, today)
    levels, min_alt = eph.observing_profile(target)
    today = today or datetime.now(LOCAL_TZ).date()
    limitations = [T["lim_score"], T["lim_terrain"]]

    # 1. Zonas candidatas
    zones, origin = zones_service.get_zones()
    if origin == "snapshot":
        limitations.append(T["lim_snapshot"])
    candidates: list[tuple[dict | None, float | None]] = []
    if zones:
        pool = [z for z in zones if z.get("night_access", True) is not False or z.get("category") == "observatory"]
        if island:
            from agent.guards import normalize
            pool = [z for z in pool if normalize(z.get("island") or "") == normalize(island)] or pool
        if latitude is not None and longitude is not None:
            radius = max_distance_km or 60
            with_d = [(z, zones_service.haversine_km(latitude, longitude, z["latitude"], z["longitude"])) for z in pool]
            near = [x for x in with_d if x[1] <= radius] or sorted(with_d, key=lambda x: x[1])[:10]
            near.sort(key=lambda x: ((x[0].get("bortle_scale") or 9), x[1]))
            candidates = near[:MAX_CANDIDATE_ZONES]
            limitations.append(T["lim_straight"])
        else:
            pool.sort(key=lambda z: ((z.get("bortle_scale") or 9), -(z.get("altitude") or 0)))
            candidates = [(z, None) for z in pool[:MAX_CANDIDATE_ZONES]]
    if not candidates:
        if latitude is None or longitude is None:
            latitude, longitude = 28.2916, -16.6291  # centro de Tenerife como referencia
        candidates = [(None, None)]
        limitations.append(T["lim_zones"])

    # 2. Evaluación por zona y noche
    options: list[Option] = []
    any_visible = False
    any_forecast_missing = False
    for zone, dist in candidates:
        lat = zone["latitude"] if zone else latitude
        lon = zone["longitude"] if zone else longitude
        elev = float(zone.get("altitude") or 0) if zone else 0.0
        forecast = {"available": False, "hours": {}}
        last_night = nights[-1] + timedelta(days=1)
        if (nights[0] - today).days <= FORECAST_HORIZON_DAYS:
            forecast = weather_service.get_hourly_forecast(lat, lon, nights[0], min(last_night, today + timedelta(days=FORECAST_HORIZON_DAYS)), elev or None)
        for night in nights:
            window = eph.night_window(night, lat, lon, elev, levels)
            if window is None:
                continue
            step = 15 if levels == ("civil",) else 30
            samples = eph.sample_night(target, window, lat, lon, elev, step_minutes=step)
            up = [s for s in samples if s.altitude >= min_alt]
            if not up:
                continue
            any_visible = True
            best = max(up, key=lambda s: s.altitude)
            hours = [forecast["hours"].get(s.time.strftime("%Y-%m-%dT%H:00")) for s in up] if forecast.get("available") else []
            hours = [h for h in hours if h]
            clouds = round(mean(c for c in (_effective_cloud(h, int(elev)) for h in hours) if c is not None)) if hours and any(_effective_cloud(h, int(elev)) is not None for h in hours) else None
            winds = [h.get("wind_speed_10m") for h in hours if h.get("wind_speed_10m") is not None]
            if clouds is None:
                any_forecast_missing = True
            opt = Option(
                zone=zone, night=night, window_start=up[0].time, window_end=up[-1].time, best_time=best.time,
                max_alt=round(best.altitude, 1), azimuth=best.azimuth, magnitude=eph.magnitude(target, best.time),
                clouds=clouds, wind_max=round(max(winds)) if winds else None,
                moon_illum=eph.moon_illumination(best.time),
                moon_up_fraction=round(sum(1 for s in up if s.moon_altitude > 0) / len(up), 2),
                distance_km=round(dist) if dist is not None else None,
                forecast_days_ahead=(night - today).days,
            )
            opt.score = _score(opt, target)
            opt.confidence = _confidence(opt)
            options.append(opt)

    if not any_visible:
        return {"ok": True, "target": {"key": target.key, "name": name}, "visible": False,
                "nights": [n.isoformat() for n in nights], "recommendations": [],
                "summary": T["never_visible"].format(name=name[0].upper() + name[1:], min_alt=int(min_alt)),
                "limitations": limitations, "sources": SOURCES[:1]}

    if any_forecast_missing:
        limitations.append(T["no_forecast"])
    if any(o.forecast_days_ahead > 2 for o in options):
        limitations.append(T["lim_forecast"])

    options.sort(key=lambda o: o.score, reverse=True)
    recs = []
    seen_zones = set()
    for o in options:
        zkey = (o.zone or {}).get("name")
        if zkey in seen_zones:
            continue
        seen_zones.add(zkey)
        brief = (o.window_end - o.window_start).total_seconds() < 45 * 60
        reasons = [T["visible_brief" if brief else "visible_window"].format(
            name=name[0].upper() + name[1:], start=_fmt_local(o.window_start), end=_fmt_local(o.window_end),
            alt=int(o.max_alt), dir=eph.cardinal(o.azimuth, lang), best=_fmt_local(o.best_time))]
        if o.magnitude is not None:
            reasons.append(T["magnitude"].format(mag=o.magnitude))
        if o.clouds is not None:
            elev = int((o.zone or {}).get("altitude") or 0)
            reasons.append((T["clouds_high_site"] if elev >= HIGH_SITE_ALTITUDE else T["clouds"]).format(clouds=o.clouds, alt=elev))
        if o.zone and o.zone.get("bortle_scale"):
            b = int(o.zone["bortle_scale"])
            reasons.append(T["bortle"].format(bortle=b, quality=T["q"].get(b, "")))
        if target.kind != "moon":
            reasons.append(T["moon"].format(illum=int(o.moon_illum * 100), up=T["moon_up"] if o.moon_up_fraction > 0 else ""))
        if o.distance_km is not None:
            reasons.append(T["distance"].format(km=o.distance_km))
        if o.wind_max is not None and o.wind_max >= 30:
            reasons.append(T["wind"].format(wind=o.wind_max))
        if o.zone and (o.zone.get("category") == "observatory" or o.zone.get("access_type") == "restricted"):
            reasons.append(T["restricted"])
        recs.append({
            "zone": None if not o.zone else {k: o.zone.get(k) for k in ("name", "island", "municipality", "latitude", "longitude", "altitude", "bortle_scale", "access_type", "category")},
            "night": o.night.isoformat(),
            "window_start": o.window_start.isoformat(), "window_end": o.window_end.isoformat(),
            "window_local": f"{_fmt_local(o.window_start)}–{_fmt_local(o.window_end)}",
            "best_time": o.best_time.isoformat(), "max_altitude": o.max_alt,
            "direction": eph.cardinal(o.azimuth, lang), "magnitude": o.magnitude,
            "cloud_cover": o.clouds, "wind_max_kmh": o.wind_max,
            "moon_illumination": o.moon_illum, "moon_up_fraction": o.moon_up_fraction,
            "distance_km": o.distance_km, "score": o.score, "confidence": o.confidence, "reasons": reasons,
        })
        if len(recs) == 3:
            break

    best = recs[0]
    summary = T["summary_best"].format(zone=(best["zone"] or {}).get("name") or "—", night=best["night"],
                                       start=best["window_local"].split("–")[0], end=best["window_local"].split("–")[1])
    return {"ok": True, "target": {"key": target.key, "name": name, "kind": target.kind}, "visible": True,
            "nights": [n.isoformat() for n in nights], "zones_origin": origin, "recommendations": recs,
            "summary": summary, "limitations": list(dict.fromkeys(limitations)), "sources": SOURCES}
