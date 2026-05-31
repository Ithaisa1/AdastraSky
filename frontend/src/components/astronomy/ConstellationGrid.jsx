import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { getVisibleMonthsLabel } from '../../utils/astronomy'

export default function ConstellationGrid({ constellations }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {constellations.map((item) => (
        <Card key={item.id} className="h-full">
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge tone="cyan">{item.difficulty}</Badge>
                <h3 className="mt-3 text-xl font-semibold text-slate-50">{item.name}</h3>
              </div>
              <span className="text-3xl text-cyan-200">*</span>
            </div>

            <p className="text-sm leading-6 text-slate-300">{item.story}</p>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Visible months</p>
              <p className="mt-2">{getVisibleMonthsLabel(item.visibleMonths)}</p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2">
              {item.bestFrom.slice(0, 3).map((island) => (
                <span key={island} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                  {island}
                </span>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

