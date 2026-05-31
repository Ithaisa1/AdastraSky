import { clamp, formatNumber } from './format'

export function scoreLabel(score) {
  if (score >= 9) return 'Excelente'
  if (score >= 7.5) return 'Muy buena'
  if (score >= 6) return 'Buena'
  if (score >= 4) return 'Regular'
  return 'Limitada'
}

export function skyTone(score) {
  if (score >= 9) return 'emerald'
  if (score >= 7.5) return 'cyan'
  if (score >= 6) return 'sky'
  if (score >= 4) return 'amber'
  return 'rose'
}

export function calculateSkyScore({ cloudiness, wind, humidity, temperature, lightPollution }) {
  const cloudPenalty = clamp(cloudiness / 100, 0, 1) * 4
  const windPenalty = clamp(wind / 60, 0, 1) * 1.2
  const humidityPenalty = clamp(humidity / 100, 0, 1) * 1.4
  const temperaturePenalty = clamp(Math.abs(temperature - 14) / 28, 0, 1) * 0.8
  const lightPenalty = clamp(lightPollution, 0, 1) * 2.2

  const value = 10 - (cloudPenalty + windPenalty + humidityPenalty + temperaturePenalty + lightPenalty)
  return Number(clamp(value, 0, 10).toFixed(1))
}

export function getSeasonFromMonth(month) {
  if ([12, 1, 2].includes(month)) return 'winter'
  if ([3, 4, 5].includes(month)) return 'spring'
  if ([6, 7, 8].includes(month)) return 'summer'
  return 'autumn'
}

export function getVisibleMonthsLabel(months) {
  return months
    .map((month) => {
      const label = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(
        new Date(2026, month - 1, 1),
      )
      return label.replace('.', '')
    })
    .join(', ')
}

export function formatSkyScore(score) {
  return `${formatNumber(score, 1)}/10`
}

