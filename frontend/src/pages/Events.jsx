import { useMemo, useState } from 'react'
import islands from '../data/islands.json'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EventTimeline from '../components/astronomy/EventTimeline'
import { getUpcomingEvents } from '../services/astronomyService'
import { useLocalStorage } from '../hooks/useLocalStorage'

const typeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Meteor showers', value: 'meteor_shower' },
  { label: 'Eclipses', value: 'eclipse' },
  { label: 'Conjunctions', value: 'conjunction' },
  { label: 'Supermoons', value: 'supermoon' },
]

const islandOptions = [
  { label: 'All islands', value: 'all' },
  ...islands.map((island) => ({ label: island.name, value: island.id })),
]

export default function Events() {
  const [selectedType, setSelectedType] = useLocalStorage('adastrasky.events.type', 'all')
  const [selectedIsland, setSelectedIsland] = useLocalStorage('adastrasky.events.island', 'all')
  const [minVisibility, setMinVisibility] = useState(0)
  const [dateFrom, setDateFrom] = useState('')

  const allEvents = getUpcomingEvents()

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesType = selectedType === 'all' || event.type === selectedType
      const matchesIsland = selectedIsland === 'all' || event.islandIds.includes(selectedIsland)
      const matchesVisibility = event.visibility >= minVisibility
      const matchesDate = !dateFrom || event.date >= new Date(dateFrom)
      return matchesType && matchesIsland && matchesVisibility && matchesDate
    })
  }, [allEvents, selectedType, selectedIsland, minVisibility, dateFrom])

  const bestEvent = filteredEvents[0] || allEvents[0]
  const bestIsland = islands.find((item) => item.id === selectedIsland) || islands[0]

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Astronomical calendar"
        title="Filter events by island, date and visibility"
        description="Meteor showers, eclipses, supermoons and conjunctions in a single local-first events board."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Events" value={String(filteredEvents.length)} detail="After current filters" />
        <StatCard label="Visibility threshold" value={`${minVisibility.toFixed(1)}`} detail="Minimum score selected" accent="emerald" />
        <StatCard label="Island focus" value={selectedIsland === 'all' ? 'All' : bestIsland.name} detail="Current destination" accent="amber" />
        <StatCard label="Next event" value={bestEvent ? bestEvent.name : 'None'} detail="Soonest visible option" />
      </div>

      <Card>
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge tone="cyan">Filters</Badge>
              <h3 className="mt-3 text-xl font-semibold text-slate-50">Refine the calendar</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.25em] text-slate-500">Start date</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/40"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs uppercase tracking-[0.25em] text-slate-500">Minimum visibility</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={minVisibility}
                  onChange={(event) => setMinVisibility(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
                <p className="text-xs text-slate-400">{minVisibility.toFixed(1)} / 10</p>
              </label>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">Event type</p>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedType(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedType === option.value
                        ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">Island</p>
              <div className="flex flex-wrap gap-2">
                {islandOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedIsland(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedIsland === option.value
                        ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {filteredEvents.length > 0 ? (
        <EventTimeline events={filteredEvents} />
      ) : (
        <Card>
          <p className="text-center text-sm text-slate-300">No events match the selected filters.</p>
        </Card>
      )}
    </div>
  )
}

