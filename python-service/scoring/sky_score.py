"""
Algoritmo de Sky Score
Puntuación integrada de calidad del cielo (0-10)
"""

class SkyScoreAlgorithm:
    """
    Implementa el algoritmo profesional de Sky Score
    
    Factores considerados:
    - Nubosidad (30%)
    - Contaminación lumínica (30%)
    - Fase lunar (15%)
    - Viento (10%)
    - Humedad (10%)
    - Transparencia atmosférica (5%)
    """
    
    WEIGHTS = {
        'cloudiness': 0.30,
        'light_pollution': 0.30,
        'moon_phase': 0.15,
        'wind': 0.10,
        'humidity': 0.10,
        'transparency': 0.05
    }
    
    @staticmethod
    def calculate_cloudiness_factor(cloudiness):
        """Nubosidad: 0% = 10, 100% = 0"""
        return (1 - cloudiness) * 10
    
    @staticmethod
    def calculate_light_pollution_factor(light_pollution):
        """Contaminación lumínica: 0 = 10, 1 = 0"""
        return (1 - light_pollution) * 10
    
    @staticmethod
    def calculate_moon_phase_factor(moon_phase):
        """Fase lunar: luna nueva = 10, luna llena = 3"""
        # Convertir fase (0-1) a factor (0-10)
        return 10 - (moon_phase * 7)
    
    @staticmethod
    def calculate_wind_factor(wind_speed):
        """Viento: 0 km/h = 10, >25 km/h = 0"""
        if wind_speed >= 25:
            return 0
        return 10 - (wind_speed / 25 * 10)
    
    @staticmethod
    def calculate_humidity_factor(humidity):
        """Humedad: 0% = 10, 100% = 0"""
        return (1 - humidity) * 10
    
    @staticmethod
    def calculate_transparency_factor(transparency):
        """Transparencia: 0 = 0, 1 = 10"""
        return transparency * 10
    
    def calculate_sky_score(self, factors):
        """
        Calcula el Sky Score final
        
        Args:
            factors: dict con valores normalizados
        
        Returns:
            float: Sky Score de 0 a 10
        """
        score = 0
        
        cloudiness_factor = self.calculate_cloudiness_factor(factors['cloudiness'])
        lp_factor = self.calculate_light_pollution_factor(factors['light_pollution'])
        moon_factor = self.calculate_moon_phase_factor(factors['moon_phase'])
        wind_factor = self.calculate_wind_factor(factors['wind'])
        humidity_factor = self.calculate_humidity_factor(factors['humidity'])
        transparency_factor = self.calculate_transparency_factor(factors.get('transparency', 0.8))
        
        score = (
            cloudiness_factor * self.WEIGHTS['cloudiness'] +
            lp_factor * self.WEIGHTS['light_pollution'] +
            moon_factor * self.WEIGHTS['moon_phase'] +
            wind_factor * self.WEIGHTS['wind'] +
            humidity_factor * self.WEIGHTS['humidity'] +
            transparency_factor * self.WEIGHTS['transparency']
        )
        
        return round(score, 1)
