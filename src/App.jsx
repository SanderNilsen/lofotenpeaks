import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { HomePage } from './features/home/HomePage.jsx';
import { MountainListPage } from './features/mountains/MountainListPage.jsx';
import { TrailDetailPage } from './features/trails/TrailDetailPage.jsx';

function LegacyTrailRedirect() {
  const { slug } = useParams();

  return <Navigate to={`/mountains/${slug}`} replace />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mountains" element={<MountainListPage />} />
        <Route path="/mountains/:slug" element={<TrailDetailPage />} />
        <Route path="/trails/:slug" element={<LegacyTrailRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
