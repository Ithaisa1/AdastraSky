export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/15 bg-white/5 p-10 text-center">
      <h3 className="text-xl font-semibold text-slate-50">{title}</h3>
      {description ? <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}

