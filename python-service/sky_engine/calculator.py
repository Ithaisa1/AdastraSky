"""
Sky Engine - Motor científico de cálculos astronómicos
"""

from scoring.sky_score import SkyScoreAlgorithm
from .utils import calculate_moon_illumination


class SkyScoreCalculator:
    def __init__(self):
        pass

    def calculate(self, data):
        algorithm = SkyScoreAlgorithm()
        return algorithm.calculate_sky_score(data)


class WhatToSeeCalculator:
    def __init__(self):
        pass

    def get_visible_objects(self, latitude, longitude, date=None, time=None):
        import math
        moon_illum = calculate_moon_illumination(date) if date else 0.5
        return {
            'planets': ['Jupiter', 'Venus', 'Saturn', 'Mars'],
            'constellations': ['Orion', 'Ursa Major', 'Cassiopeia', 'Scorpius'],
            'messier_objects': ['M31 (Andromeda)', 'M45 (Pleiades)', 'M42 (Orion Nebula)'],
            'moon_phase': moon_illum,
        }


class AstronomicalEvents:
    def __init__(self):
        pass

    def get_upcoming_events(self, days_ahead=30):
        from datetime import datetime, timedelta

        base = datetime.now()
        year = base.year
        events_list = [
            {'name': 'Lluvia de Perseidas', 'date': f'{year}-08-12', 'type': 'meteor_shower', 'visibility_score': 9},
            {'name': 'Lluvia de Gemínidas', 'date': f'{year}-12-13', 'type': 'meteor_shower', 'visibility_score': 8},
            {'name': 'Equinoccio de Primavera', 'date': f'{year}-03-20', 'type': 'seasonal', 'visibility_score': 5},
            {'name': 'Equinoccio de Otoño', 'date': f'{year}-09-22', 'type': 'seasonal', 'visibility_score': 5},
            {'name': 'Solsticio de Verano', 'date': f'{year}-06-21', 'type': 'seasonal', 'visibility_score': 5},
            {'name': 'Solsticio de Invierno', 'date': f'{year}-12-21', 'type': 'seasonal', 'visibility_score': 5},
        ]
        return [ev for ev in events_list if 0 <= (datetime.strptime(ev['date'], '%Y-%m-%d') - base).days <= days_ahead]
