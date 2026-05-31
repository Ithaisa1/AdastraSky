import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EventTimeline from '../components/astronomy/EventTimeline'
import ConstellationGrid from '../components/astronomy/ConstellationGrid'
import { getSeasonalConstellations, getUpcomingEvents } from '../services/astronomyService'
import { getFeaturedWeather } from '../services/weatherService'
import { getSeasonFromMonth } from '../utils/astronomy'

export default function Astronomy() {
  const now = new Date()
  const season = getSeasonFromMonth(now.getMonth() + 1)
  const constellations = getSeasonalConstellations(now)
  const events = getUpcomingEvents().slice(0, 6)
  const bestIsland = getFeaturedWeather()[0]

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Astronomy guide"
        title="Learn what is visible from Canarias"
        description="A compact educational layer for planets, constellations, seasons and the most interesting sky moments."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Season" value={season} detail="Current sky context" />
        <StatCard label="Visible constellations" value={String(constellations.length)} detail="Season-aware list" accent="emerald" />
        <StatCard label="Upcoming events" value={String(events.length)} detail="Meteor showers and more" accent="amber" />
        <StatCard label="Best island now" value={bestIsland.island.name} detail={`Score ${bestIsland.skyScore.toFixed(1)}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="space-y-4">
            <Badge tone="cyan">Sky basics</Badge>
            <h3 className="text-2xl font-semibold text-slate-50">How to read the night sky</h3>
            <p className="text-sm leading-7 text-slate-300">
              The Milky Way becomes more impressive in darker and drier nights. Constellations rotate through the year, while meteor showers and conjunctions are best planned around their peak windows.
            </p>

            <div className="space-y-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-slate-50">Milky Way</p>
                <p className="mt-2 text-sm text-slate-300">Best from dark locations with low humidity and no strong moonlight.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-slate-50">Planets</p>
                <p className="mt-2 text-sm text-slate-300">Look near the horizon before dawn or just after sunset depending on the season.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-slate-50">Moon phase</p>
                <p className="mt-2 text-sm text-slate-300">A new moon window gives the best contrast for faint objects and star fields.</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <SectionHeader
            eyebrow="Constellations"
            title="Visible now"
            description="The selection below reflects the current season and the islands where each constellation is most comfortable to observe."
          />
          <ConstellationGrid constellations={constellations} />
        </div>
      </div>

      <section className="space-y-5">
        <SectionHeader
          eyebrow="Calendar"
          title="Upcoming astronomical events"
          description="A rolling list of the next relevant dates so the user can plan a night before leaving home."
        />
        <EventTimeline events={events} />
      </section>
    </div>
  )
}

