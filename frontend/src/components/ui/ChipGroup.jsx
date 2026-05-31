export default function ChipGroup({ items = [], active = null, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = active === item.value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange?.(item.value)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              isActive
                ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

