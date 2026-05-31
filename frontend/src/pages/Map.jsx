import { useMemo } from 'react'
import islands from '../data/islands.json'
import { getFeaturedWeather } from '../services/weatherService'
import { getMapHighlights, getIslandById } from '../services/mapService'
import { DEFAULT_MAP_CENTER } from '../config/site'
import Card from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import ChipGroup from '../components/ui/ChipGroup'
import CanaryMap from '../components/map/CanaryMap'
import MapLegend from '../components/map/MapLegend'
import WeatherPanel from '../components/weather/WeatherPanel'
import { useLocalStorage } from '../hooks/useLocalStorage'

const islandOptions = [
  { label: 'All islands', value: 'all' },
  ...islands.map((island) => ({ label: island.name, value: island.id })),
]

const layerOptions = [
  { label: 'Sky score', value: 'score' },
  { label: 'Weather', value: 'weather' },
  { label: 'Light pollution', value: 'pollution' },
]

export default function Map() {
  const [selectedIsland, setSelectedIsland] = useLocalStorage('adastrasky.map.island', 'all')
  const [selectedLayer, setSelectedLayer] = useLocalStorage('adastrasky.map.layer', 'score')

  const activeIslandId = selectedIsland === 'all' ? null : selectedIsland
  const activeIsland = activeIslandId ? getIslandById(activeIslandId) : null
  const featuredWeather = getFeaturedWeather()
  const overview = activeIsland
    ? featuredWeather.find((item) => item.island.id === activeIsland.id) || featuredWeather[0]
    : featuredWeather[0]

  const highlights = useMemo(() => getMapHighlights(activeIslandId), [activeIslandId])

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Interactive map"
        title="Explore the Canary sky by island"
        description="Switch islands, compare sky quality and inspect observation points or pollution layers without leaving the map."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Observation points" value={String(highlights.points.length)} detail="Active in the current view" />
        <StatCard label="Dark zones" value={String(highlights.areas.filter((area) => area.type === 'optimal').length)} detail="Best light-pollution pockets" accent="emerald" />
        <StatCard
          label="Current sky"
          value={overview.label}
          detail={`${overview.island.name} with score ${overview.skyScore.toFixed(1)}`}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-50">Map layers and island filter</h2>
              <p className="text-sm text-slate-300">
                Choose one island or browse the full archipelago. The selected layer changes marker emphasis.
              </p>
            </div>
            <MapLegend layer={selectedLayer} />
          </div>

          <div className="space-y-4">
            <ChipGroup items={islandOptions} active={selectedIsland} onChange={setSelectedIsland} />
            <ChipGroup items={layerOptions} active={selectedLayer} onChange={setSelectedLayer} />
          </div>

          <CanaryMap islandId={activeIslandId} layer={selectedLayer} center={DEFAULT_MAP_CENTER} />
        </Card>

        <div className="space-y-6">
          <WeatherPanel overview={overview} />

          <Card>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-50">
                {activeIsland ? activeIsland.name : 'All islands'}
              </h3>
              <p className="text-sm leading-6 text-slate-300">
                {activeIsland
                  ? activeIsland.description
                  : 'Use the map layer controls to compare all islands and discover the points that give the best night observing conditions.'}
              </p>
              <div className="space-y-3">
                {highlights.points.slice(0, 5).map((point) => (
                  <div key={point.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-50">{point.name}</p>
                        <p className="text-sm text-slate-400">{point.bestFor.join(', ')}</p>
                      </div>
                      <p className="text-sm text-cyan-200">{point.skyScore.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

