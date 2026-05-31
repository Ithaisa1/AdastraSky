import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatNumber, formatPercent } from '../../utils/format'
import { scoreLabel } from '../../utils/astronomy'

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-50">{value}</p>
    </div>
  )
}

export default function WeatherPanel({ overview }) {
  if (!overview) return null

  const { island, weather, skyScore } = overview

  return (
    <Card>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge tone="emerald">Tonight</Badge>
            <h3 className="mt-3 text-xl font-semibold text-slate-50">{island.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{weather.forecast}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sky score</p>
            <p className="text-4xl font-semibold text-cyan-100">{formatNumber(skyScore, 1)}</p>
            <p className="text-sm text-slate-300">{scoreLabel(skyScore)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Cloudiness" value={formatPercent(weather.cloudiness)} />
          <Metric label="Wind" value={`${weather.wind} km/h`} />
          <Metric label="Humidity" value={formatPercent(weather.humidity)} />
          <Metric label="Temp" value={`${weather.temperature} C`} />
        </div>

        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/80">Best observing window</p>
          <p className="mt-2 text-sm text-slate-100">{weather.bestTime}</p>
          <p className="mt-1 text-sm text-slate-300">Moon phase: {weather.moonPhase}</p>
        </div>
      </div>
    </Card>
  )
}

