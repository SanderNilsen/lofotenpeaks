import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { HomePage } from './features/home/HomePage.jsx';
import { MountainListPage } from './features/mountains/MountainListPage.jsx';
import { TrailDetailPage } from './features/trails/TrailDetailPage.jsx';

const AuthRoute = lazy(() => import('./features/auth/AuthRoute.jsx'));
const AdminRoute = lazy(() => import('./features/admin/AdminRoute.jsx'));

function LegacyTrailRedirect() {
  const { slug } = useParams();

  return <Navigate to={`/mountains/${slug}`} replace />;
}

function RouteFallback() {
  return <div style={{ padding: '48px 24px' }}>Loading...</div>;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/account"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AuthRoute />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<RouteFallback />}>
              <AdminRoute />
            </Suspense>
          }
        />
        <Route path="/mountains" element={<MountainListPage />} />
        <Route path="/mountains/:slug" element={<TrailDetailPage />} />
        <Route path="/trails/:slug" element={<LegacyTrailRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
