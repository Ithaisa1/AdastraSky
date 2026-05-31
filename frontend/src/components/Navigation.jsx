import { NavLink, Link } from 'react-router-dom'
import { NAV_LINKS, SITE_NAME } from '../config/site'

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
              A
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Canary skies</p>
              <h1 className="text-lg font-semibold text-slate-50">{SITE_NAME}</h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 lg:justify-center">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/map"
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open map
          </Link>
        </div>
      </div>
    </nav>
  )
}

