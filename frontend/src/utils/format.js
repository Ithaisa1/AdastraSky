export function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatPercent(value, digits = 0) {
  return `${formatNumber(value, digits)}%`
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDayMonth(date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

