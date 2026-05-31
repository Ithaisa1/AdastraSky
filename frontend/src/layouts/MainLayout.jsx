import { Outlet } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function MainLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#060b16] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.65),_rgba(6,11,22,1))]" />
      <Navigation />
      <main className="relative flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

