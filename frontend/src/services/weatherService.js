import weatherData from '../data/weather.json'
import islands from '../data/islands.json'
import { scoreLabel } from '../utils/astronomy'

function calculateWeatherScore({ cloudiness = 0, wind = 0, humidity = 0, lightPollution = 0 }) {
  const cloudScore = (1 - cloudiness / 100) * 10
  const windScore = Math.max(0, 10 - wind * 2)
  const humidityScore = (1 - humidity / 100) * 10
  const lightScore = (1 - lightPollution) * 10
  const score = Math.round(((cloudScore + windScore + humidityScore + lightScore) / 4) * 10) / 10
  let level = 'poor'
  let label = 'Mala'
  if (score >= 8) { level = 'excellent'; label = 'Excelente' }
  else if (score >= 6) { level = 'good'; label = 'Buena' }
  else if (score >= 4) { level = 'fair'; label = 'Regular' }
  return { score, level, label }
}

export function getWeatherByIsland(islandId) {
  return weatherData.find((item) => item.islandId === islandId) || weatherData[0]
}

export function getWeatherOverview(islandId) {
  const island = islands.find((item) => item.id === islandId) || islands[0]
  const weather = getWeatherByIsland(island.id)
  const skyScore = calculateWeatherScore({
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
    .sort((a, b) => b.skyScore.score - a.skyScore.score)
}

