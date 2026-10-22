"""Planificador y efemérides. Fechas fijas y clima simulado -> resultados reproducibles."""

from datetime import date, datetime, timezone

import pytest

import services.weather as weather
from sky_engine import ephemeris as eph
from sky_engine.events import compute_events
from sky_engine.planner import _effective_cloud, plan_observation, resolve_dates

TODAY = date(2026, 10, 22)  # jueves


def fake_forecast(cloud_by_zone_lat):
    """Previsión fija: nubosidad según la latitud de la zona (para distinguir zonas)."""
    def _f(lat, lon, start, end, elevation=None):
        cloud = cloud_by_zone_lat.get(round(lat, 2), 50)
        hours = {}
        d = start
        while d <= end:
            for h in range(24):
                hours[f"{d.isoformat()}T{h:02d}:00"] = {"cloud_cover": cloud, "cloud_cover_low": cloud, "cloud_cover_mid": cloud,
                                                        "cloud_cover_high": cloud, "relative_humidity_2m": 40,
                                                        "wind_speed_10m": 10, "visibility": 30000, "precipitation_probability": 0}
            d = date.fromordinal(d.toordinal() + 1)
        return {"available": True, "source": "Open-Meteo (test)", "hours": hours}
    return _f


# ── Efemérides de referencia ───────────────────────────────────────────────

def test_known_events_2026():
    ev = {(e["type"], e["date"]) for e in compute_events(date(2026, 1, 1), date(2026, 12, 31), "es")}
    assert ("planetary", "2026-10-04") in ev   # oposición de Saturno
    assert ("planetary", "2026-01-10") in ev   # oposición de Júpiter
    assert ("eclipse", "2026-03-03") in ev     # eclipse lunar total
    assert ("eclipse", "2026-08-12") in ev     # eclipse solar (parcial desde Canarias)
    assert ("eclipse", "2026-09-18") not in ev and ("eclipse", "2026-10-02") not in ev  # no existen


def test_saturn_is_high_at_midnight_late_october():
    alt, az = eph.horizontal(eph.TARGETS["saturn"], datetime(2026, 10, 24, 23, 30, tzinfo=timezone.utc), 28.3, -16.5, 2390)
    assert alt > 50 and 150 < az < 220


def test_night_window_is_dark():
    w = eph.night_window(date(2026, 10, 24), 28.3, -16.5, 2390)
    assert w.twilight == "astronomical"
    assert 19 <= w.dark_start.hour <= 21 and 5 <= w.dark_end.hour <= 7


@pytest.mark.parametrize("text,key", [("Quiero ver Saturno", "saturn"), ("the Andromeda galaxy", "m31"),
                                      ("die Plejaden", "m45"), ("Marshall", None), ("la Vía Láctea", "milky_way_core")])
def test_resolve_target(text, key):
    t = eph.resolve_target(text)
    assert (t.key if t else None) == key


# ── Fechas ─────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("today,expected", [
    (date(2026, 10, 22), [date(2026, 10, 23), date(2026, 10, 24)]),  # jueves -> vie, sáb
    (date(2026, 10, 23), [date(2026, 10, 23), date(2026, 10, 24)]),  # viernes
    (date(2026, 10, 24), [date(2026, 10, 24)]),                      # sábado
    (date(2026, 10, 25), [date(2026, 10, 30), date(2026, 10, 31)]),  # domingo -> siguiente
])
def test_weekend_resolution(today, expected):
    assert resolve_dates("weekend", None, None, today) == expected


def test_explicit_dates_are_capped():
    assert len(resolve_dates(None, "2026-10-24", 30, TODAY)) == 7


# ── Recomendaciones ────────────────────────────────────────────────────────

def test_saturn_weekend_prefers_clear_dark_site(monkeypatch):
    monkeypatch.setattr(weather, "get_hourly_forecast", fake_forecast({28.27: 5, 28.05: 90, 28.31: 60}))
    r = plan_observation("Saturno", "es", when="weekend", latitude=28.47, longitude=-16.25, today=TODAY)
    assert r["ok"] and r["visible"]
    best = r["recommendations"][0]
    assert best["zone"]["name"] == "Mirador Oscuro"
    assert best["cloud_cover"] is not None and best["cloud_cover"] <= 10
    assert best["confidence"] == "high"
    assert any("Saturno estará sobre el horizonte" in x for x in best["reasons"])
    assert any("Bortle 1" in x for x in best["reasons"])
    assert r["sources"] and any("Open-Meteo" in s["title"] for s in r["sources"])
    assert any("no garantiza" in l for l in r["limitations"])
    scores = [x["score"] for x in r["recommendations"]]
    assert scores == sorted(scores, reverse=True)


def test_no_forecast_lowers_confidence_and_says_so():
    r = plan_observation("Júpiter", "en", start_date="2026-10-24", days=1, island="Tenerife", today=TODAY)
    assert r["visible"]
    assert all(x["confidence"] == "low" and x["cloud_cover"] is None for x in r["recommendations"])
    assert any("No weather forecast is available" in l for l in r["limitations"])


def test_object_near_sun_is_not_recommended():
    # Venus está en conjunción inferior a finales de octubre de 2026
    r = plan_observation("Venus", "de", start_date="2026-10-24", days=1, today=TODAY)
    assert r["ok"] and r["visible"] is False and r["recommendations"] == []
    assert "Kein guter Zeitpunkt" in r["summary"]


def test_unknown_target():
    r = plan_observation("Plutón", "es", today=TODAY)
    assert r["ok"] is False and r["error"] == "unknown_target" and "Saturno" in r["message"]


def test_observatory_is_flagged_as_restricted(monkeypatch):
    monkeypatch.setattr(weather, "get_hourly_forecast", fake_forecast({28.31: 0}))
    r = plan_observation("Saturno", "es", start_date="2026-10-24", days=1, latitude=28.30, longitude=-16.51,
                         max_distance_km=3, today=TODAY)
    obs = [x for x in r["recommendations"] if x["zone"]["name"] == "Observatorio del Teide"]
    assert obs and any("Acceso nocturno restringido" in x for x in obs[0]["reasons"])


def test_zones_unavailable_falls_back_to_location(monkeypatch):
    import services.zones as zones
    monkeypatch.setattr(zones, "get_zones", lambda force_refresh=False: ([], "none"))
    r = plan_observation("Saturno", "es", start_date="2026-10-24", days=1, latitude=28.1, longitude=-15.4, today=TODAY)
    assert r["visible"] and r["recommendations"][0]["zone"] is None
    assert any("No se pudieron cargar las zonas" in l for l in r["limitations"])


def test_high_site_discounts_low_clouds():
    hour = {"cloud_cover": 80, "cloud_cover_low": 80, "cloud_cover_mid": 5, "cloud_cover_high": 0}
    assert _effective_cloud(hour, 2400) == 24
    assert _effective_cloud(hour, 300) == 80


@pytest.mark.parametrize("lang,word", [("es", "Mejor opción"), ("en", "Best option"), ("de", "Beste Option")])
def test_planner_is_localized(monkeypatch, lang, word):
    monkeypatch.setattr(weather, "get_hourly_forecast", fake_forecast({}))
    r = plan_observation("Saturn", lang, start_date="2026-10-24", days=1, today=TODAY)
    assert r["summary"].startswith(word)
