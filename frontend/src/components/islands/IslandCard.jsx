import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { scoreLabel } from '../../utils/astronomy'
import { formatNumber } from '../../utils/format'

export default function IslandCard({ island }) {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="cyan">Island</Badge>
            <h3 className="mt-3 text-xl font-semibold text-slate-50">{island.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sky score</p>
            <p className="text-3xl font-semibold text-cyan-200">{formatNumber(island.skyScore, 1)}</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-300">{island.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Light pollution</p>
            <p className="mt-1 font-medium">{Math.round(island.lightPollution * 100)}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quality</p>
            <p className="mt-1 font-medium">{scoreLabel(island.skyScore)}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          {island.bestObservationPoints.slice(0, 3).map((point) => (
            <span key={point} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
              {point}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{island.tagline}</p>
          <Link to={`/island/${island.id}`} className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
            View
          </Link>
        </div>
      </div>
    </Card>
  )
}

