import { LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { useState } from 'react';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { signInWithEmail, signOut, signUpWithEmail } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from './AuthProvider.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: 760px;
  padding: 48px 24px 0;
`;

const Header = styled.header`
  margin-bottom: 22px;

  h1 {
    font-size: clamp(2.2rem, 5vw, 3.8rem);
    margin: 0 0 10px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 0;
  }
`;

const Panel = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 18px;
  padding: 22px;
`;

const ModeTabs = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 4px;
`;

const ModeButton = styled.button`
  background: ${({ $active }) => ($active ? theme.colors.surface : 'transparent')};
  border: 0;
  border-radius: ${theme.radii.small};
  box-shadow: ${({ $active }) => ($active ? '0 1px 6px rgba(38, 40, 36, 0.1)' : 'none')};
  color: ${theme.colors.ink};
  cursor: pointer;
  font-weight: 800;
  min-height: 38px;
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;

  span {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  input {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 44px;
    padding: 10px 11px;
    width: 100%;
  }
`;

const PrimaryButton = styled.button`
  align-items: center;
  background: ${theme.colors.forest};
  border: 0;
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: ${theme.colors.ink};
`;

const Message = styled.p`
  background: ${({ $error }) => ($error ? '#f2e6dc' : theme.colors.background)};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? theme.colors.warning : theme.colors.muted)};
  font-weight: 700;
  line-height: 1.55;
  margin: 0;
  padding: 12px;
`;

const SetupList = styled.ul`
  color: ${theme.colors.muted};
  display: grid;
  gap: 8px;
  line-height: 1.55;
  margin: 0;
  padding-left: 20px;
`;

export function AuthPage() {
  const { isConfigured, isLoading, user } = useAuth();
  const [mode, setMode] = useState('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      if (mode === 'register') {
        await signUpWithEmail({ displayName, email, password });
        setStatus({
          type: 'success',
          message: 'Account created. Check your email if Supabase email confirmation is enabled.',
        });
      } else {
        await signInWithEmail({ email, password });
        setStatus({ type: 'success', message: 'Signed in.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleSignOut() {
    setStatus({ type: 'loading', message: '' });

    try {
      await signOut();
      setStatus({ type: 'success', message: 'Signed out.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <Page>
      <Seo
        title="Account"
        description="Create or access a Lofoten Peaks account for future mountain check-ins, points, comments, and GPX uploads."
      />
      <Header>
        <h1>Account</h1>
        <p>
          Accounts will power mountain check-ins, leaderboard points, comments, hike recommendations,
          and GPS/poster uploads in the next project phases.
        </p>
      </Header>

      {!isConfigured && (
        <Panel>
          <Message>
            Supabase is not connected yet. The frontend is ready, but it needs project credentials before
            login and registration can run.
          </Message>
          <SetupList>
            <li>Create a Supabase project.</li>
            <li>Run `supabase/schema.sql` in the SQL editor.</li>
            <li>Copy `.env.example` to `.env.local`.</li>
            <li>Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` locally and in Netlify.</li>
          </SetupList>
        </Panel>
      )}

      {isConfigured && isLoading && (
        <Panel>
          <Message>Checking account session...</Message>
        </Panel>
      )}

      {isConfigured && !isLoading && user && (
        <Panel>
          <Message>
            <ShieldCheck size={18} aria-hidden="true" /> Signed in as {user.email}
          </Message>
          <SecondaryButton type="button" disabled={status.type === 'loading'} onClick={handleSignOut}>
            <LogOut size={18} aria-hidden="true" /> Sign out
          </SecondaryButton>
          {status.message && <Message $error={status.type === 'error'}>{status.message}</Message>}
        </Panel>
      )}

      {isConfigured && !isLoading && !user && (
        <Panel>
          <ModeTabs aria-label="Account form mode">
            <ModeButton type="button" $active={mode === 'sign-in'} onClick={() => setMode('sign-in')}>
              Sign in
            </ModeButton>
            <ModeButton type="button" $active={mode === 'register'} onClick={() => setMode('register')}>
              Register
            </ModeButton>
          </ModeTabs>
          <Form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <Field>
                <span>Display name</span>
                <input
                  type="text"
                  value={displayName}
                  autoComplete="name"
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </Field>
            )}
            <Field>
              <span>Email</span>
              <input
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field>
              <span>Password</span>
              <input
                type="password"
                value={password}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={6}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <PrimaryButton type="submit" disabled={status.type === 'loading'}>
              <UserCircle size={18} aria-hidden="true" /> {mode === 'register' ? 'Create account' : 'Sign in'}
            </PrimaryButton>
          </Form>
          {status.message && <Message $error={status.type === 'error'}>{status.message}</Message>}
        </Panel>
      )}
    </Page>
  );
}
