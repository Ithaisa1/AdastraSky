import { Link } from 'react-router-dom'
import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { DEFAULT_MAP_CENTER } from '../../config/site'
import { getIslandById, getObservationPoints, getPollutionAreas } from '../../services/mapService'
import islands from '../../data/islands.json'
import weatherData from '../../data/weather.json'

function layerColor(layer, value) {
  if (layer === 'pollution') {
    if (value >= 0.3) return '#fb7185'
    if (value >= 0.15) return '#f59e0b'
    return '#34d399'
  }

  if (value >= 9) return '#22d3ee'
  if (value >= 8) return '#60a5fa'
  if (value >= 7) return '#a78bfa'
  return '#f59e0b'
}

export default function CanaryMap({ islandId = null, layer = 'score', center: fallbackCenter = DEFAULT_MAP_CENTER }) {
  const visibleIslands = islandId ? islands.filter((island) => island.id === islandId) : islands
  const visiblePoints = getObservationPoints(islandId)
  const visiblePollution = getPollutionAreas(islandId)

  const activeIsland = islandId ? getIslandById(islandId) : null
  const center = activeIsland ? activeIsland.coordinates : fallbackCenter

  return (
    <MapContainer center={center} zoom={8} scrollWheelZoom={false} className="h-[32rem] w-full rounded-[28px]">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {visiblePollution.map((area) => (
        <Circle
          key={area.id}
          center={area.coordinates}
          radius={area.radius}
          pathOptions={{
            color: layerColor('pollution', area.level),
            fillColor: layerColor('pollution', area.level),
            fillOpacity: 0.18,
            weight: 1,
          }}
        >
          <Popup>
            <div className="space-y-2">
              <strong>{area.name}</strong>
              <p>{area.note}</p>
              <p>Light pollution: {(area.level * 100).toFixed(0)}%</p>
            </div>
          </Popup>
        </Circle>
      ))}

      {visibleIslands.map((island) => {
        const weather = weatherData.find((item) => item.islandId === island.id)
        const value = layer === 'weather' ? (weather ? 10 - weather.cloudiness / 12 : island.skyScore) : island.skyScore

        return (
          <CircleMarker
            key={island.id}
            center={island.coordinates}
            radius={12}
            pathOptions={{
              color: layerColor(layer, value),
              fillColor: layerColor(layer, value),
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div className="space-y-2">
                <strong>{island.name}</strong>
                <p>{island.description}</p>
                <p>Sky score: {island.skyScore.toFixed(1)}</p>
                <Link to={`/island/${island.id}`} className="text-cyan-600 underline">
                  Open island view
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}

      {visiblePoints.map((point) => (
        <CircleMarker
          key={point.id}
          center={point.coordinates}
          radius={6}
          pathOptions={{
            color: '#f8fafc',
            fillColor: '#f8fafc',
            fillOpacity: 0.95,
            weight: 1,
          }}
        >
          <Popup>
            <div className="space-y-2">
              <strong>{point.name}</strong>
              <p>{point.description}</p>
              <p>Altitude: {point.altitude} m</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
