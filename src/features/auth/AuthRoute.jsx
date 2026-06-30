import { AuthPage } from './AuthPage.jsx';
import { AuthProvider } from './AuthProvider.jsx';

export default function AuthRoute() {
  return (
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  );
}
