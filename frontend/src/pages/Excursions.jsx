import { Link } from 'react-router-dom'
import excursions from '../data/excursions.json'
import islands from '../data/islands.json'
import SectionHeader from '../components/ui/SectionHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import ChipGroup from '../components/ui/ChipGroup'
import { EXTERNAL_LINKS } from '../config/site'
import { useLocalStorage } from '../hooks/useLocalStorage'

const islandOptions = [
  { label: 'All islands', value: 'all' },
  ...islands.map((island) => ({ label: island.name, value: island.id })),
]

export default function Excursions() {
  const [selectedIsland, setSelectedIsland] = useLocalStorage('adastrasky.excursions.island', 'all')
  const visibleExcursions =
    selectedIsland === 'all'
      ? excursions
      : excursions.filter((excursion) => excursion.islandId === selectedIsland)

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Astrotourism"
        title="Night routes and guided excursions"
        description="A lightweight planning layer for nocturnal routes, viewpoint visits and future Caminos Reales integration."
      />

      <ChipGroup items={islandOptions} active={selectedIsland} onChange={setSelectedIsland} />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleExcursions.map((excursion) => {
          const island = islands.find((item) => item.id === excursion.islandId)

          return (
            <Card key={excursion.id} className="h-full">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone="cyan">{excursion.type}</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-50">{excursion.name}</h3>
                  </div>
                  <span className="text-sm text-slate-400">{excursion.duration}</span>
                </div>

                <p className="text-sm leading-6 text-slate-300">{excursion.description}</p>

                <div className="space-y-2 text-sm">
                  <p className="text-slate-200">Island: {island?.name}</p>
                  <p className="text-slate-200">Best time: {excursion.bestTime}</p>
                  <p className="text-slate-200">Difficulty: {excursion.difficulty}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {excursion.includes.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <Link to={`/island/${excursion.islandId}`} className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
                    View island
                  </Link>
                  <Link to="/map" className="text-sm text-slate-400 hover:text-slate-200">
                    Open map
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Badge tone="emerald">Future integration</Badge>
            <h3 className="text-2xl font-semibold text-slate-50">Caminos Reales connection ready for later</h3>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              The frontend keeps this as a separate experience so the hiking project can be plugged in later without breaking the astronomy flow.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={EXTERNAL_LINKS.caminosReales}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open Caminos Reales
            </a>
            <p className="text-center text-xs uppercase tracking-[0.25em] text-slate-500">
              External link prepared for phase 2
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

