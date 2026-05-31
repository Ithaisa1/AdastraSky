const items = {
  score: [
    { label: 'Excellent sky', color: '#22d3ee' },
    { label: 'Good sky', color: '#60a5fa' },
    { label: 'Moderate sky', color: '#f59e0b' },
  ],
  weather: [
    { label: 'Clear weather', color: '#34d399' },
    { label: 'Mixed weather', color: '#60a5fa' },
    { label: 'Less stable', color: '#f59e0b' },
  ],
  pollution: [
    { label: 'Dark zone', color: '#34d399' },
    { label: 'Intermediate', color: '#f59e0b' },
    { label: 'Urban glow', color: '#fb7185' },
  ],
}

export default function MapLegend({ layer = 'score' }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
      {(items[layer] || items.score).map((item) => (
        <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

