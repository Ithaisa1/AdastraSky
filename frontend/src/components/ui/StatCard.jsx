export default function StatCard({ label, value, detail, accent = 'cyan' }) {
  const accentClass =
    accent === 'emerald'
      ? 'from-emerald-400/20 to-cyan-400/10 text-emerald-100'
      : accent === 'amber'
        ? 'from-amber-400/20 to-orange-400/10 text-amber-100'
        : 'from-cyan-400/20 to-blue-400/10 text-cyan-100'

  return (
    <div className={`rounded-[24px] border border-white/10 bg-gradient-to-br p-5 ${accentClass}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-300">{label}</p>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-200/85">{detail}</p> : null}
    </div>
  )
}

