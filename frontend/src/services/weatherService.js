import weatherData from '../data/weather.json'
import islands from '../data/islands.json'
import { calculateSkyScore, scoreLabel } from '../utils/astronomy'

export function getWeatherByIsland(islandId) {
  return weatherData.find((item) => item.islandId === islandId) || weatherData[0]
}

export function getWeatherOverview(islandId) {
  const island = islands.find((item) => item.id === islandId) || islands[0]
  const weather = getWeatherByIsland(island.id)
  const skyScore = calculateSkyScore({
    cloudiness: weather.cloudiness,
    wind: weather.wind,
    humidity: weather.humidity,
    temperature: weather.temperature,
    lightPollution: island.lightPollution,
  })

  return {
    island,
    weather,
    skyScore,
    label: scoreLabel(skyScore),
  }
}

export function getFeaturedWeather() {
  return islands
    .map((island) => getWeatherOverview(island.id))
    .sort((a, b) => b.skyScore - a.skyScore)
}

