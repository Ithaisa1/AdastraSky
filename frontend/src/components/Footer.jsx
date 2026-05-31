import { Link } from 'react-router-dom'
import { EXTERNAL_LINKS, SITE_NAME } from '../config/site'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-slate-950/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{SITE_NAME}</p>
            <p className="text-sm leading-7 text-slate-300">
              A modular dark-sky platform for the Canary Islands, built as a local-first MVP with room to grow into data services and automation.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Explore</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="/map" className="hover:text-white">Map</Link></li>
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/astronomy" className="hover:text-white">Astronomy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Projects</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="/excursions" className="hover:text-white">Astrotourism routes</Link></li>
              <li><a href={EXTERNAL_LINKS.caminosReales} target="_blank" rel="noreferrer" className="hover:text-white">Caminos Reales</a></li>
              <li><Link to="/island/la-palma" className="hover:text-white">Featured island</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Roadmap</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>MVP: local JSON + frontend flow</li>
              <li>Phase 2: Supabase favorites</li>
              <li>Phase 3: n8n alerts and automation</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 AdAstraSky. All rights reserved.</p>
          <p>Built for astrotourism, education and night planning across Canarias.</p>
        </div>
      </div>
    </footer>
  )
}

