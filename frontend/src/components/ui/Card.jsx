export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  )
}
