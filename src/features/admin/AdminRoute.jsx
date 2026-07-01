import { AuthProvider } from '../auth/AuthProvider.jsx';
import { AdminPage } from './AdminPage.jsx';

export default function AdminRoute() {
  return (
    <AuthProvider>
      <AdminPage />
    </AuthProvider>
  );
}
