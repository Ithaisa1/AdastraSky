export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-semibold text-slate-50 md:text-3xl">{title}</h2>
        {description ? <p className="text-sm leading-6 text-slate-300">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

