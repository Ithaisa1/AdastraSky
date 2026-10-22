"""Eventos astronómicos calculados con Astronomy Engine (nada fijo por año)."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import astronomy as ae

CANARIAS = ae.Observer(28.29, -16.63, 0)  # Tenerife centro, para eclipses locales

_N = {
    "new_moon": {"es": "Luna nueva", "en": "New Moon", "de": "Neumond"},
    "first_quarter": {"es": "Cuarto creciente", "en": "First Quarter", "de": "Erstes Viertel"},
    "full_moon": {"es": "Luna llena", "en": "Full Moon", "de": "Vollmond"},
    "last_quarter": {"es": "Cuarto menguante", "en": "Last Quarter", "de": "Letztes Viertel"},
    "lunar_eclipse": {"es": "Eclipse lunar {kind}", "en": "{kind} lunar eclipse", "de": "{kind} Mondfinsternis"},
    "solar_eclipse": {"es": "Eclipse solar {kind} visible desde Canarias", "en": "{kind} solar eclipse visible from the Canaries", "de": "{kind} Sonnenfinsternis, sichtbar von den Kanaren"},
    "opposition": {"es": "Oposición de {planet}", "en": "{planet} at opposition", "de": "{planet} in Opposition"},
    "march_equinox": {"es": "Equinoccio de marzo", "en": "March equinox", "de": "März-Tagundnachtgleiche"},
    "june_solstice": {"es": "Solsticio de junio", "en": "June solstice", "de": "Juni-Sonnenwende"},
    "september_equinox": {"es": "Equinoccio de septiembre", "en": "September equinox", "de": "September-Tagundnachtgleiche"},
    "december_solstice": {"es": "Solsticio de diciembre", "en": "December solstice", "de": "Dezember-Sonnenwende"},
    "meteor": {"es": "Lluvia de meteoros: {name}", "en": "Meteor shower: {name}", "de": "Meteorstrom: {name}"},
}
_KIND = {
    "total": {"es": "total", "en": "Total", "de": "Totale"},
    "partial": {"es": "parcial", "en": "Partial", "de": "Partielle"},
    "penumbral": {"es": "penumbral", "en": "Penumbral", "de": "Halbschatten-"},
    "annular": {"es": "anular", "en": "Annular", "de": "Ringförmige"},
}
_PLANETS = {
    ae.Body.Mars: {"es": "Marte", "en": "Mars", "de": "Mars"},
    ae.Body.Jupiter: {"es": "Júpiter", "en": "Jupiter", "de": "Jupiter"},
    ae.Body.Saturn: {"es": "Saturno", "en": "Saturn", "de": "Saturn"},
    ae.Body.Uranus: {"es": "Urano", "en": "Uranus", "de": "Uranus"},
    ae.Body.Neptune: {"es": "Neptuno", "en": "Neptune", "de": "Neptun"},
}
# Máximos medios según la International Meteor Organization (pueden variar ±1 día).
METEOR_SHOWERS = [
    ("Cuadrántidas / Quadrantids / Quadrantiden", 1, 3, 120),
    ("Líridas / Lyrids / Lyriden", 4, 22, 18),
    ("Eta Acuáridas / Eta Aquariids / Eta-Aquariiden", 5, 6, 50),
    ("Perseidas / Perseids / Perseiden", 8, 12, 100),
    ("Oriónidas / Orionids / Orioniden", 10, 21, 20),
    ("Leónidas / Leonids / Leoniden", 11, 17, 15),
    ("Gemínidas / Geminids / Geminiden", 12, 14, 150),
    ("Úrsidas / Ursids / Ursiden", 12, 22, 10),
]


def _dt(t: ae.Time) -> datetime:
    return t.Utc().replace(tzinfo=timezone.utc)


def _kind(k, lang):
    return _KIND.get(k.name.lower(), {}).get(lang, k.name.lower())


def _name(key: str, lang: str, **kw) -> str:
    return _N[key].get(lang, _N[key]["es"]).format(**kw).strip()


def compute_events(start: date, end: date, lang: str = "es") -> list[dict]:
    lang = lang if lang in ("es", "en", "de") else "es"
    t0 = ae.Time.Make(start.year, start.month, start.day, 0, 0, 0)
    end_dt = datetime(end.year, end.month, end.day, 23, 59, tzinfo=timezone.utc)
    events: list[dict] = []

    def add(key, when: datetime, etype, score, **kw):
        if when <= end_dt and when.date() >= start:
            events.append({"name": _name(key, lang, **kw), "date": when.date().isoformat(), "datetime_utc": when.isoformat(),
                           "type": etype, "visibility_score": score, "source": "Astronomy Engine"})

    mq = ae.SearchMoonQuarter(t0)
    while _dt(mq.time) <= end_dt:
        key = ["new_moon", "first_quarter", "full_moon", "last_quarter"][mq.quarter]
        add(key, _dt(mq.time), "moon_phase", 9 if key == "new_moon" else 5)
        mq = ae.NextMoonQuarter(mq)

    le = ae.SearchLunarEclipse(t0)
    while _dt(le.peak) <= end_dt:
        add("lunar_eclipse", _dt(le.peak), "eclipse", 8 if le.kind.name == "Total" else 6, kind=_kind(le.kind, lang))
        le = ae.NextLunarEclipse(le.peak)

    se = ae.SearchLocalSolarEclipse(t0, CANARIAS)
    while _dt(se.peak.time) <= end_dt:
        if se.peak.altitude > 0:
            add("solar_eclipse", _dt(se.peak.time), "eclipse", 9, kind=_kind(se.kind, lang))
        se = ae.NextLocalSolarEclipse(se.peak.time, CANARIAS)

    for body, names in _PLANETS.items():
        t = ae.SearchRelativeLongitude(body, 0.0, t0)
        while _dt(t) <= end_dt:
            add("opposition", _dt(t), "planetary", 8, planet=names[lang])
            t = ae.SearchRelativeLongitude(body, 0.0, t.AddDays(30))

    for year in range(start.year, end.year + 1):
        s = ae.Seasons(year)
        for key, t in (("march_equinox", s.mar_equinox), ("june_solstice", s.jun_solstice),
                       ("september_equinox", s.sep_equinox), ("december_solstice", s.dec_solstice)):
            add(key, _dt(t), "seasonal", 4)
        for label, month, day, zhr in METEOR_SHOWERS:
            name = label.split(" / ")[{"es": 0, "en": 1, "de": 2}[lang]]
            add("meteor", datetime(year, month, day, 0, tzinfo=timezone.utc), "meteor_shower",
                min(9, 4 + zhr // 30), name=name)

    events.sort(key=lambda e: e["datetime_utc"])
    return events
