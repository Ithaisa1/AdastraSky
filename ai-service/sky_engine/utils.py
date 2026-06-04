import math
from datetime import datetime, timedelta


def normalize_value(value, min_val=0, max_val=1):
    return max(min_val, min(max_val, value))


def calculate_moon_illumination(date=None):
    if date is None:
        date = datetime.now()
    known_new_moon = datetime(2000, 1, 6, 18, 14, 0)
    synodic_month = 29.53058867
    diff = (date - known_new_moon).total_seconds() / (24 * 3600)
    age = diff % synodic_month
    illumination = (1 - math.cos(2 * math.pi * age / synodic_month)) / 2
    return round(illumination, 2)


def get_local_time(latitude, longitude, utc_time=None):
    if utc_time is None:
        utc_time = datetime.utcnow()
    offset_hours = round(longitude / 15)
    return utc_time + timedelta(hours=offset_hours)
