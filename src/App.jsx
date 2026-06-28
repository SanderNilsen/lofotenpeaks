import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { HomePage } from './features/home/HomePage.jsx';
import { MountainDetailPage } from './features/mountains/MountainDetailPage.jsx';
import { MountainListPage } from './features/mountains/MountainListPage.jsx';
import { TrailDetailPage } from './features/trails/TrailDetailPage.jsx';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mountains" element={<MountainListPage />} />
        <Route path="/mountains/:slug" element={<MountainDetailPage />} />
        <Route path="/trails/:slug" element={<TrailDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
