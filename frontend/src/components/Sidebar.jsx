/**
 * Adastra Sky - Sidebar Navigation Component
 *
 * Enterprise-level navigation sidebar with NASA Mission Control aesthetics
 * Features:
 * - Glassmorphic design with sci-fi effects
 * - React Router v6 integration
 * - Expandable/collapsible modes
 * - Mobile responsive drawer
 * - Animated route indicators
 * - System status telemetry
 */

import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/Adastrasky-removebg-preview.png";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  BarChart3,
  Map,
  Star,
  Settings,
  Radio,
  Search,
  Satellite,
  Calendar,
  Mail,
  Shield,
  HelpCircle,
  Camera,
} from "lucide-react";

// ============================================================================
// NAVIGATION ROUTES CONFIGURATION
// ============================================================================

const navigationRoutes = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    path: "/explorador",
    category: "main",
    description: "System overview",
  },
  {
    id: "observatories",
    label: "Observatorios",
    icon: Search,
    path: "/observatories",
    category: "exploration",
    description: "Official observatories",
  },
  {
    id: "sky-map",
    label: "Sky Map",
    icon: Map,
    path: "/map",
    category: "exploration",
    description: "Interactive archipelago map",
  },
  {
    id: "experiences",
    label: "Experiencias",
    icon: Camera,
    path: "/experiencias",
    category: "exploration",
    description: "Community experiences",
  },
  {
    id: "data",
    label: "Data",
    icon: Satellite,
    path: "/data",
    category: "science",
    description: "Astronomical ephemeris",
  },
  {
    id: "chat",
    label: "Adastra",
    icon: Star,
    path: "/chat",
    category: "ai",
    description: "AI Astronomic Assistant",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    category: "system",
    description: "User preferences",
  },
  {
    id: "events",
    label: "Calendario",
    icon: Calendar,
    path: "/events",
    category: "science",
    description: "Calendar & observatory bookings",
  },
  {
    id: "contact",
    label: "Contacto",
    icon: Mail,
    path: "/contact",
    category: "system",
    description: "Contact us",
  },
  {
    id: "admin",
    label: "Admin Panel",
    icon: Shield,
    path: "/admin",
    category: "system",
    description: "Administration",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    path: "/faq",
    category: "system",
    description: "Frequently asked questions",
  },
];

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  // Close mobile drawer on route change
  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sidebar width classes
  const sidebarWidth = isExpanded ? "w-72" : "w-20";
  const transitionClass = "transition-all duration-300 ease-in-out";

  // ============================================================================
  // RENDER: Mobile Menu Button (Hidden on Desktop)
  // ============================================================================

  const MobileMenuButton = () => (
    <div
      className={`md:hidden fixed top-4 left-4 z-50 ${isMobileOpen ? "hidden" : ""}`}
    >
      <button
        onClick={() => setIsMobileOpen(true)}
        className="p-2 rounded-lg bg-astroCard/80 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:bg-astroCard/90 transition-all duration-200"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>
    </div>
  );

  // ============================================================================
  // RENDER: Mobile Drawer Overlay
  // ============================================================================

  const MobileOverlay = () =>
    isMobileOpen && (
      <div
        className="fixed inset-0 md:hidden z-30 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsMobileOpen(false)}
      />
    );

  // ============================================================================
  // RENDER: Sidebar Header (Mission Control Badge)
  // ============================================================================

  const SidebarHeader = () => (
    <div
      className={`pb-6 border-b border-slate-800/50 ${!isExpanded && "flex justify-center"}`}
    >
      {/* Logo / Badge */}
      <div
        className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-lg overflow-hidden`}
      >
        <img src={logoImg} alt="AdAstraSky" className="w-full h-full object-contain" />
      </div>

      {/* Title and Subtitle */}
      {isExpanded && (
        <div className="text-center px-2">
          <h1 className="text-sm font-bold text-slate-100 tracking-widest uppercase font-mono">
            ADASTRA CONTROL
          </h1>
          <h2 className="text-xs font-mono text-cyan-400 tracking-wider uppercase mt-1">
            Canary Islands Observatory Network
          </h2>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER: Navigation Menu Items
  // ============================================================================

  const NavMenuItem = ({ route }) => {
    const IconComponent = route.icon;
    const isActive = location.pathname === route.path;

    return (
      <li key={route.id} className="group">
        <NavLink
          to={route.path}
          onClick={handleNavClick}
          onMouseEnter={() => setHoveredRoute(route.id)}
          onMouseLeave={() => setHoveredRoute(null)}
          className={({ isActive: routeIsActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-lg
            ${transitionClass}
            relative
            ${
              routeIsActive
                ? "bg-gradient-to-r from-indigo-500/20 to-transparent border-l-2 border-l-cyan-400 text-cyan-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }
          `}
          title={!isExpanded ? route.label : undefined}
          aria-label={route.label}
        >
          {/* Active indicator pulse */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-r-full animate-pulse" />
          )}

          {/* Icon */}
          <IconComponent
            size={20}
            className={`flex-shrink-0 ${transitionClass} ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400"}`}
          />

          {/* Label (visible when expanded) */}
          {isExpanded && (
            <span className={`text-sm font-medium ${transitionClass}`}>
              {route.label}
            </span>
          )}

          {/* Glow effect on hover */}
          {isActive && isExpanded && (
            <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-r from-indigo-500/10 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          )}
        </NavLink>

        {/* Tooltip (visible in collapsed mode) */}
        {!isExpanded && hoveredRoute === route.id && (
          <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm shadow-lg z-50 font-mono pointer-events-none animate-fadeIn">
            {route.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900/95 border-t border-l border-slate-700 rotate-45 -mr-1" />
          </div>
        )}
      </li>
    );
  };

  const visibleRoutes = navigationRoutes.filter(
    r => r.id !== 'admin' || role === 'admin'
  );

  const NavigationMenu = () => (
    <nav className={`flex-1 py-6 px-2 overflow-y-auto scrollbar-hide`}>
      {/* Main Navigation */}
      <div className="mb-8">
        {!isExpanded && (
          <div className="text-xs text-slate-600 uppercase tracking-widest px-2 mb-3 font-mono">
            NAV
          </div>
        )}
        <ul className="space-y-2">
          {visibleRoutes.slice(0, 3).map((route) => (
            <NavMenuItem key={route.id} route={route} />
          ))}
        </ul>
      </div>

      {/* Science & Data */}
      <div className="mb-8">
        {!isExpanded && (
          <div className="text-xs text-slate-600 uppercase tracking-widest px-2 mb-3 font-mono">
            DATA
          </div>
        )}
        <ul className="space-y-2">
          {visibleRoutes.slice(3, 5).map((route) => (
            <NavMenuItem key={route.id} route={route} />
          ))}
        </ul>
      </div>

      {/* System */}
      <div className="mb-8">
        {!isExpanded && (
          <div className="text-xs text-slate-600 uppercase tracking-widest px-2 mb-3 font-mono">
            SYS
          </div>
        )}
        <ul className="space-y-2">
          {visibleRoutes.slice(5).map((route) => (
            <NavMenuItem key={route.id} route={route} />
          ))}
        </ul>
      </div>
    </nav>
  );

  // ============================================================================
  // RENDER: User Profile Section
  // ============================================================================

  const UserProfileSection = () => (
    <div className={`mt-auto pt-6 border-t border-slate-800/50`}>
      {/* System Status */}
      <div
        className={`px-4 py-3 mb-4 rounded-lg bg-slate-900/30 border border-green-900/30 ${!isExpanded && "flex justify-center"}`}
      >
        {isExpanded ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Radio size={12} className="text-green-400 animate-pulse" />
              <span className="text-xs font-mono text-green-400 uppercase tracking-widest">
                System Online
              </span>
            </div>
          </div>
        ) : (
          <div
            className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
            title="System Online"
          />
        )}
      </div>

      {/* User Avatar & Logout */}
      <div
        className={`flex items-center gap-3 px-4 py-2 ${!isExpanded && "justify-center"}`}
      >
        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 border border-cyan-500/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-cyan-500/10" />
          <span className="text-sm font-bold text-cyan-300 z-10">AS</span>
        </div>

        {/* User Info */}
        {isExpanded && (
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate('/settings')}>
            <p className="text-sm font-medium text-slate-200 truncate hover:text-cyan-400 transition-colors">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {role === 'admin' ? 'Comandante de Misión' : 'Especialista de Misión'}
            </p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 border border-slate-700/50 hover:border-red-500/50"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: Expand/Collapse Toggle Button
  // ============================================================================

  const ToggleButton = () =>
    isExpanded && (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-20 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all duration-200 shadow-lg hidden md:flex items-center justify-center"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        title={isExpanded ? "Collapse" : "Expand"}
      >
        <ChevronLeft size={16} />
      </button>
    );

  const ExpandButton = () =>
    !isExpanded && (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-20 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all duration-200 shadow-lg hidden md:flex items-center justify-center"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        title={isExpanded ? "Collapse" : "Expand"}
      >
        <ChevronRight size={16} />
      </button>
    );

  // ============================================================================
  // RENDER: Main Sidebar
  // ============================================================================

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />

      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* Sidebar Container */}
      <aside
        className={`
          ${sidebarWidth}
          ${transitionClass}
          fixed md:relative
          h-screen
          flex flex-col
          flex-shrink-0
          bg-astroCard/90 backdrop-blur-md
          border-r border-slate-800
          shadow-[0_0_25px_rgba(79,70,229,0.2)]
          z-40
          ${isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
        style={{
          background: `linear-gradient(135deg, rgba(11, 15, 25, 0.95) 0%, rgba(21, 29, 48, 0.9) 100%), 
                       repeating-linear-gradient(0deg, rgba(6, 182, 212, 0.05) 0px, transparent 1px, transparent 2px, rgba(6, 182, 212, 0.05) 3px)`,
        }}
      >
        {/* Close Button (Mobile) */}
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white transition-colors z-50"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}

        {/* Header */}
        <SidebarHeader />

        {/* Navigation Menu */}
        <NavigationMenu />

        {/* User Profile & Status */}
        <UserProfileSection />

        {/* Toggle Buttons */}
        <ToggleButton />
        <ExpandButton />
      </aside>

      {/* Spacer for collapsed mobile */}
      {isMobile && !isMobileOpen && <div className="hidden" />}
    </>
  );
}

// ============================================================================
// STYLING NOTES
// ============================================================================

/*
  Color Scheme:
  - Primary Background: #0B0F19 (astroCard)
  - Secondary Background: #151D30
  - Border: #334155 (slate-700)
  - Accent: #06B6D4 (cyan-500)
  - Accent Secondary: #4F46E5 (indigo-500)
  
  Effects:
  - Glassmorphic: backdrop-blur-md
  - Glow: shadow-[0_0_15px_rgba(79,70,229,0.1)]
  - Scan lines: repeating-linear-gradient
  - Smooth transitions: transition-all duration-300
  
  Icons from lucide-react ensure consistent 20px sizing and scalability
*/
