import { Link } from 'react-router-dom'
import islands from '../data/islands.json'
import { getFeaturedWeather } from '../services/weatherService'
import { getUpcomingEvents, getSeasonalConstellations } from '../services/astronomyService'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import IslandCard from '../components/islands/IslandCard'
import WeatherPanel from '../components/weather/WeatherPanel'
import EventTimeline from '../components/astronomy/EventTimeline'
import ConstellationGrid from '../components/astronomy/ConstellationGrid'
import { formatSkyScore } from '../utils/astronomy'

export default function Home() {
  const featuredWeather = getFeaturedWeather()
  const bestTonight = featuredWeather[0]
  const upcomingEvents = getUpcomingEvents().slice(0, 3)
  const constellations = getSeasonalConstellations().slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-10 md:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge tone="cyan">Canary dark-sky planner</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-50 md:text-6xl">
                Plan nights under the stars across the Canary Islands.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                AdAstraSky combines live-like weather, light pollution, observation points and astronomical events in a single place so you can choose where to look at the sky tonight.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/map" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Open map
              </Link>
              <Link to="/events" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                See events
              </Link>
              <Link to="/excursions" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:text-white">
                Explore excursions
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <StatCard
              label="Best island tonight"
              value={bestTonight.island.name}
              detail={`Sky score ${formatSkyScore(bestTonight.skyScore)}. ${bestTonight.label}`}
              accent="emerald"
            />
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Visible islands" value={String(islands.length)} detail="Full archipelago coverage" />
              <StatCard
                label="Upcoming events"
                value={String(getUpcomingEvents().length)}
                detail="Meteor showers, eclipses and conjunctions"
                accent="amber"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <WeatherPanel overview={bestTonight} />
        <Card>
          <div className="space-y-5">
            <SectionHeader
              eyebrow="Why tonight works"
              title="A quick read of the sky"
              description="The best nights usually combine low clouds, low humidity, calm wind and dark surroundings. This panel gives you a fast read before opening the map."
            />
            <div className="grid gap-3 md:grid-cols-2">
              <StatCard label="Quality" value={bestTonight.label} detail="Combined sky conditions" />
              <StatCard label="Top point" value={bestTonight.island.bestObservationPoints[0]} detail="Featured observation spot" />
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              The MVP keeps data local, so the interface stays fast and testable while leaving room for future API sync, Supabase persistence and automation.
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Featured islands"
          title="Best places to start"
          description="These islands give a very good first approximation of where to plan a night session, a guided excursion or an astronomy trip."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredWeather.slice(0, 6).map((item) => (
            <IslandCard key={item.island.id} island={item.island} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <SectionHeader
            eyebrow="Upcoming events"
            title="What can be seen next"
            description="Meteor showers, eclipses, conjunctions and bright lunar nights with their visibility score."
          />
          <EventTimeline events={upcomingEvents} />
        </div>

        <div className="space-y-5">
          <SectionHeader
            eyebrow="Night sky guide"
            title="Constellations visible now"
            description="A simple educational layer for the archipelago with season-aware constellations."
          />
          <ConstellationGrid constellations={constellations} />
        </div>
      </section>
    </div>
  )
}

