import { useNavigate, useParams } from 'react-router-dom'
import islands from '../data/islands.json'
import observationPoints from '../data/observationPoints.json'
import SectionHeader from '../components/ui/SectionHeader'
import Card from '../components/ui/Card'
import ChipGroup from '../components/ui/ChipGroup'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import WeatherPanel from '../components/weather/WeatherPanel'
import EventTimeline from '../components/astronomy/EventTimeline'
import ConstellationGrid from '../components/astronomy/ConstellationGrid'
import { getIslandAstronomySummary } from '../services/astronomyService'
import { getWeatherOverview } from '../services/weatherService'
import { formatNumber } from '../utils/format'

export default function Island() {
  const navigate = useNavigate()
  const { islandId } = useParams()
  const activeIsland = islands.find((item) => item.id === islandId) || islands[0]
  const selectedIsland = islandId || 'all'
  const summary = getIslandAstronomySummary(activeIsland.id)
  const weather = getWeatherOverview(activeIsland.id)
  const points = observationPoints.filter((point) => point.islandId === activeIsland.id)

  const islandOptions = islands.map((item) => ({ label: item.name, value: item.id }))

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Island view"
        title={`Observation plan for ${activeIsland.name}`}
        description="Switch between islands to study their sky quality, observation points and astronomy-friendly routes."
      />

      <ChipGroup
        items={[{ label: 'Overview', value: 'all' }, ...islandOptions]}
        active={selectedIsland}
        onChange={(value) => navigate(value === 'all' ? '/island' : `/island/${value}`)}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Sky score" value={formatNumber(activeIsland.skyScore, 1)} detail={activeIsland.description} />
        <StatCard label="Altitude" value={`${activeIsland.altitude} m`} detail="Reference height for sky quality" accent="emerald" />
        <StatCard label="Light pollution" value={`${Math.round(activeIsland.lightPollution * 100)}%`} detail="Lower is better" accent="amber" />
        <StatCard label="Points" value={String(points.length)} detail="Observation spots in this island" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <WeatherPanel overview={weather} />

        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="cyan">Top places</Badge>
                <h3 className="mt-3 text-xl font-semibold text-slate-50">Observation points</h3>
              </div>
              <p className="text-sm text-slate-400">{summary.constellations.length} visible constellations</p>
            </div>

            <div className="space-y-3">
              {points.map((point) => (
                <div key={point.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-medium text-slate-50">{point.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{point.description}</p>
                    </div>
                    <p className="text-cyan-200">{point.skyScore.toFixed(1)}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Best for: {point.bestFor.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Astronomy"
          title="Events visible from this island"
          description="The island view combines nearby events and constellations that make sense for the selected location."
        />
        <EventTimeline events={summary.events} />
      </section>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Seasonal guide"
          title="Constellations linked to this island"
          description="These are the constellations most naturally suited to the island and current season."
        />
        <ConstellationGrid constellations={summary.constellations} />
      </section>
    </div>
  )
}
