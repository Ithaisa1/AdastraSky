import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDayMonth } from '../../utils/format'

const toneMap = {
  meteor_shower: 'cyan',
  eclipse: 'amber',
  conjunction: 'emerald',
  supermoon: 'rose',
}

export default function EventTimeline({ events }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={toneMap[event.type] || 'slate'}>{event.type.replace('_', ' ')}</Badge>
                <span className="text-sm text-slate-400">{formatDayMonth(event.date)}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50">{event.name}</h3>
              <p className="max-w-3xl text-sm leading-6 text-slate-300">{event.description}</p>
              <p className="text-sm text-slate-200">Best time: {event.bestTime}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Visibility</p>
              <p className="mt-2 text-3xl font-semibold text-cyan-100">{event.visibility.toFixed(1)}</p>
              <p className="text-sm text-slate-300">/10</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

