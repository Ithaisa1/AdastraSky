import events from '../data/events.json'
import constellations from '../data/constellations.json'
import islands from '../data/islands.json'
import { getSeasonFromMonth } from '../utils/astronomy'

function nextOccurrence(month, day, fromDate = new Date()) {
  const candidate = new Date(fromDate.getFullYear(), month - 1, day, 22, 0, 0, 0)
  if (candidate < fromDate) {
    candidate.setFullYear(candidate.getFullYear() + 1)
  }
  return candidate
}

export function getUpcomingEvents(islandId = null, fromDate = new Date()) {
  return events
    .map((event) => ({
      ...event,
      date: nextOccurrence(event.month, event.day, fromDate),
    }))
    .filter((event) => !islandId || event.islandIds.includes(islandId))
    .sort((a, b) => a.date - b.date)
}

export function getSeasonalConstellations(date = new Date()) {
  const month = date.getMonth() + 1
  const season = getSeasonFromMonth(month)

  return constellations.filter((item) => {
    if (item.season === 'all year') return true
    return item.season === season || item.visibleMonths.includes(month)
  })
}

export function getVisibleConstellationsByIsland(islandId) {
  return constellations.filter((item) => item.bestFrom.includes(islandId))
}

export function getIslandAstronomySummary(islandId) {
  const island = islands.find((item) => item.id === islandId) || islands[0]
  const islandEvents = getUpcomingEvents(islandId).slice(0, 4)
  const visibleConstellations = getVisibleConstellationsByIsland(islandId)

  return {
    island,
    events: islandEvents,
    constellations: visibleConstellations,
  }
}
