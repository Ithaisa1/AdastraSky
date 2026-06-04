class SkyScoreAlgorithm:
    WEIGHTS = {
        "cloudiness": 0.30,
        "light_pollution": 0.30,
        "moon_phase": 0.15,
        "wind": 0.10,
        "humidity": 0.10,
        "transparency": 0.05,
    }

    @staticmethod
    def calculate_cloudiness_factor(cloudiness):
        return (1 - cloudiness) * 10

    @staticmethod
    def calculate_light_pollution_factor(light_pollution):
        return (1 - light_pollution) * 10

    @staticmethod
    def calculate_moon_phase_factor(moon_phase):
        return 10 - (moon_phase * 7)

    @staticmethod
    def calculate_wind_factor(wind_speed):
        if wind_speed >= 25:
            return 0
        return 10 - (wind_speed / 25 * 10)

    @staticmethod
    def calculate_humidity_factor(humidity):
        return (1 - humidity) * 10

    @staticmethod
    def calculate_transparency_factor(transparency):
        return transparency * 10

    def calculate_sky_score(self, factors):
        score = (
            self.calculate_cloudiness_factor(factors["cloudiness"]) * self.WEIGHTS["cloudiness"]
            + self.calculate_light_pollution_factor(factors["light_pollution"]) * self.WEIGHTS["light_pollution"]
            + self.calculate_moon_phase_factor(factors["moon_phase"]) * self.WEIGHTS["moon_phase"]
            + self.calculate_wind_factor(factors["wind"]) * self.WEIGHTS["wind"]
            + self.calculate_humidity_factor(factors["humidity"]) * self.WEIGHTS["humidity"]
            + self.calculate_transparency_factor(factors.get("transparency", 0.8)) * self.WEIGHTS["transparency"]
        )
        return round(score, 1)
