import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import HeroTransition from './components/HeroTransition';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ObservatoriesPage = lazy(() => import('./pages/ObservatoriesPage'));
const DataPage = lazy(() => import('./pages/DataPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ExploradorPage = lazy(() => import('./pages/ExploradorPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ExperiencesPage = lazy(() => import('./pages/ExperiencesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Componente protegido de ruta
// Las páginas se cargan bajo demanda: el primer acceso descarga mucho menos JavaScript.
const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-astroDark flex items-center justify-center">
      <div className="text-white text-xl" role="status">{t('common.loading')}</div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-astroDark flex items-center justify-center">
        <div className="text-white text-xl" role="status">{t('common.loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-astroDark flex items-center justify-center">
        <div className="text-white text-xl" role="status">{t('common.loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/explorador" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <HeroTransition />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Ruta pública de home */}
          <Route path="/" element={<HomePage />} />

          {/* Ruta pública de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/explorador"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/observatories"
            element={
              <ProtectedRoute>
                <ObservatoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <ExploradorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute>
                <DataPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/experiencias"
            element={
              <ProtectedRoute>
                <ExperiencesPage />
              </ProtectedRoute>
            }
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

