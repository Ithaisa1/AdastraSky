import islands from '../data/islands.json'
import observationPoints from '../data/observationPoints.json'
import pollution from '../data/lightPollution.json'

export function getIslandById(islandId) {
  return islands.find((island) => island.id === islandId) || islands[0]
}

export function getObservationPoints(islandId = null) {
  return observationPoints.filter((point) => !islandId || point.islandId === islandId)
}

export function getPollutionAreas(islandId = null) {
  return pollution.filter((area) => !islandId || area.islandId === islandId || area.islandId === 'canarias')
}

export function getMapHighlights(islandId = null) {
  const island = islandId ? getIslandById(islandId) : null
  const points = getObservationPoints(islandId)
  const areas = getPollutionAreas(islandId)

  return {
    island,
    points,
    areas,
  }
}

