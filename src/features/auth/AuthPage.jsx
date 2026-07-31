import { CheckCircle2, Eye, EyeOff, Map, Medal, UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { isEmailLike } from '../../lib/profile.js';
import { signInWithEmail, signUpWithEmail } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from './AuthProvider.jsx';
import { ProfileDashboard } from './ProfileDashboard.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 52px 24px 80px;

  @media (max-width: 640px) {
    padding: 36px 16px 56px;
  }
`;

const PageIntro = styled.header`
  margin-bottom: 26px;

  h1 {
    font-size: 3rem;
    line-height: 1.08;
    margin: 0 0 12px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.65;
    margin: 0;
    max-width: 680px;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 2.25rem;
    }
  }
`;

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 18px;
  padding: 24px;

  @media (max-width: 480px) {
    padding: 20px 16px;
  }
`;

const AuthLayout = styled.div`
  align-items: stretch;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1fr);

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitsPanel = styled(Panel)`
  align-content: center;
  background: ${theme.colors.forest};
  border-color: ${theme.colors.forest};
  color: ${theme.colors.surface};

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 2rem;
    line-height: 1.15;
  }

  p {
    color: #fff;
    line-height: 1.6;
  }
`;

const BenefitList = styled.ul`
  display: grid;
  gap: 16px;
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
`;

const Benefit = styled.li`
  align-items: start;
  display: grid;
  gap: 11px;
  grid-template-columns: auto minmax(0, 1fr);

  svg {
    margin-top: 2px;
  }

  strong {
    display: block;
    margin-bottom: 3px;
  }

  span {
    color: rgba(255, 255, 255, 0.78);
    font-size: 0.9rem;
    line-height: 1.45;
  }
`;

const FormHeading = styled.div`
  display: grid;
  gap: 6px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.55rem;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.92rem;
    line-height: 1.55;
  }
`;

const BenefitsHeading = styled(FormHeading)`
  p {
    color: #fff;
  }
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
  box-shadow: ${({ $active }) => ($active ? '0 1px 5px rgba(38, 40, 36, 0.12)' : 'none')};
  color: ${theme.colors.ink};
  cursor: pointer;
  font-weight: 800;
  min-height: 42px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 15px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;

  > span {
    color: ${theme.colors.ink};
    font-size: 0.86rem;
    font-weight: 800;
  }

  input {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 46px;
    padding: 10px 12px;
    width: 100%;
  }

  input:focus-visible {
    border-color: ${theme.colors.forest};
    outline: 3px solid rgba(36, 95, 130, 0.2);
    outline-offset: 1px;
  }

  small {
    color: ${theme.colors.muted};
    font-size: 0.8rem;
    line-height: 1.45;
  }
`;

const PasswordControl = styled.div`
  position: relative;

  input {
    padding-right: 48px;
  }
`;

const PasswordToggle = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${theme.colors.muted};
  cursor: pointer;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  position: absolute;
  right: 3px;
  top: 3px;
  width: 42px;

  &:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 1px;
  }
`;

const TermsAgreement = styled.label`
  align-items: start;
  color: ${theme.colors.muted};
  cursor: pointer;
  display: grid;
  font-size: 0.84rem;
  gap: 9px;
  grid-template-columns: auto minmax(0, 1fr);
  line-height: 1.55;

  input {
    accent-color: ${theme.colors.forest};
    height: 19px;
    margin: 1px 0 0;
    width: 19px;
  }

  a {
    color: ${theme.colors.fjord};
    font-weight: 800;
    text-underline-offset: 3px;
  }

  a:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const PrimaryButton = styled.button`
  align-items: center;
  background: ${theme.colors.forest};
  border: 1px solid ${theme.colors.forest};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  justify-content: center;
  min-height: 46px;
  padding: 10px 15px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

const Message = styled.p`
  align-items: center;
  background: ${({ $error }) => ($error ? '#f2e6dc' : theme.colors.background)};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? theme.colors.warning : theme.colors.muted)};
  display: flex;
  gap: 8px;
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

function getFriendlyAuthError(error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'The email or password is incorrect. Please try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Confirm your email address before signing in.';
  }

  if (message.includes('already registered')) {
    return 'An account already exists for this email address. Try signing in instead.';
  }

  if (message.includes('password')) {
    return 'The password does not meet the account requirements. Use at least 6 characters.';
  }

  return 'We could not complete that account request. Please try again.';
}
export function AuthPage() {
  const { isConfigured, isLoading, user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedMode = searchParams.get('mode') === 'register' ? 'register' : 'sign-in';
  const [mode, setMode] = useState(requestedMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (!user) {
      setMode(requestedMode);
    }
  }, [requestedMode, user]);

  function switchMode(nextMode) {
    if (status.type === 'loading') {
      return;
    }

    setMode(nextMode);
    setPassword('');
    setPasswordVisible(false);
    setAcceptedTerms(false);
    setStatus({ type: 'idle', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      if (mode === 'register') {
        const cleanDisplayName = displayName.trim();

        if (!acceptedTerms) {
          throw new Error('terms required');
        }

        if (cleanDisplayName.length < 2 || cleanDisplayName.length > 60) {
          setStatus({ type: 'error', message: 'Display name must be between 2 and 60 characters.' });
          return;
        }

        if (isEmailLike(cleanDisplayName)) {
          setStatus({ type: 'error', message: 'Display name cannot be an email address.' });
          return;
        }

        await signUpWithEmail({ displayName: cleanDisplayName, email: email.trim(), password });
        setPassword('');
        setPasswordVisible(false);
        setAcceptedTerms(false);
        setStatus({
          type: 'success',
          message: 'Account created. Check your email if confirmation is required.',
        });
      } else {
        await signInWithEmail({ email: email.trim(), password });
        setPassword('');
        setPasswordVisible(false);
        setStatus({ type: 'success', message: 'Signed in.' });
      }
    } catch (error) {
      if (error?.message === 'terms required') {
        setStatus({ type: 'error', message: 'Agree to the Terms of Service before creating an account.' });
      } else {
        setStatus({ type: 'error', message: getFriendlyAuthError(error) });
      }
    }
  }

  if (isConfigured && !isLoading && user) {
    return <ProfileDashboard />;
  }

  return (
    <Page>
      <Seo
        title="Account"
        description="Sign in to your private Lofoten Peaks hiking account."
        canonicalPath="/account"
        noIndex
      />
      <PageIntro>
        <h1>Account</h1>
        <p>Sign in to keep a record of summit check-ins and share useful hike recommendations.</p>
      </PageIntro>

      {!isConfigured && (
        <Panel>
          <Message>Account features are not connected yet.</Message>
          <SetupList>
            <li>Create a Supabase project.</li>
            <li>Run the project SQL setup files in the Supabase SQL editor.</li>
            <li>Add the Supabase URL and publishable key to the deployment environment.</li>
          </SetupList>
        </Panel>
      )}

      {isConfigured && isLoading && (
        <Panel aria-live="polite">
          <Message>Checking your account session...</Message>
        </Panel>
      )}

      {isConfigured && !isLoading && !user && (
        <AuthLayout>
          <BenefitsPanel>
            <BenefitsHeading>
              <h2>Your Lofoten logbook</h2>
              <p>Keep your summit memories and community contributions together in one place.</p>
            </BenefitsHeading>
            <BenefitList>
              <Benefit>
                <CheckCircle2 size={21} aria-hidden="true" />
                <div>
                  <strong>Save summit visits</strong>
                  <span>Check in near a summit and keep a dated hiking history.</span>
                </div>
              </Benefit>
              <Benefit>
                <Medal size={21} aria-hidden="true" />
                <div>
                  <strong>Track your progress</strong>
                  <span>See completed mountains, check-ins, and the points earned from them.</span>
                </div>
              </Benefit>
              <Benefit>
                <Map size={21} aria-hidden="true" />
                <div>
                  <strong>Share local knowledge</strong>
                  <span>Recommend useful hikes and contribute practical trail information.</span>
                </div>
              </Benefit>
            </BenefitList>
          </BenefitsPanel>

          <Panel>
            <FormHeading>
              <h2>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
              <p>
                {mode === 'register'
                  ? 'Choose a public display name and create your private sign-in.'
                  : 'Sign in to continue your hiking logbook.'}
              </p>
            </FormHeading>
            <ModeTabs role="group" aria-label="Account form mode">
              <ModeButton
                type="button"
                $active={mode === 'sign-in'}
                aria-pressed={mode === 'sign-in'}
                disabled={status.type === 'loading'}
                onClick={() => switchMode('sign-in')}
              >
                Sign in
              </ModeButton>
              <ModeButton
                type="button"
                $active={mode === 'register'}
                aria-pressed={mode === 'register'}
                disabled={status.type === 'loading'}
                onClick={() => switchMode('register')}
              >
                Register
              </ModeButton>
            </ModeTabs>
            <Form onSubmit={handleSubmit} noValidate={false}>
              {mode === 'register' && (
                <Field>
                  <span>Public display name</span>
                  <input
                    required
                    type="text"
                    minLength={2}
                    maxLength={60}
                    value={displayName}
                    autoComplete="name"
                    disabled={status.type === 'loading'}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                  <small>This may appear on the leaderboard and comments. Do not use your email address.</small>
                </Field>
              )}
              <Field>
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  autoComplete="email"
                  disabled={status.type === 'loading'}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <span>Password</span>
                <PasswordControl>
                  <input
                    required
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    minLength={6}
                    disabled={status.type === 'loading'}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <PasswordToggle
                    type="button"
                    disabled={status.type === 'loading'}
                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={passwordVisible}
                    onClick={() => setPasswordVisible((visible) => !visible)}
                  >
                    {passwordVisible ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </PasswordToggle>
                </PasswordControl>
                {mode === 'register' && <small>Use at least 6 characters.</small>}
              </Field>
              {mode === 'register' && (
                <TermsAgreement>
                  <input
                    required
                    type="checkbox"
                    checked={acceptedTerms}
                    disabled={status.type === 'loading'}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                  />
                  <span>
                    I agree to the <Link to="/terms">Terms of Service</Link> and acknowledge that I have read the{' '}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </span>
                </TermsAgreement>
              )}
              <PrimaryButton type="submit" disabled={status.type === 'loading'}>
                <UserCircle size={18} aria-hidden="true" />
                {status.type === 'loading'
                  ? mode === 'register'
                    ? 'Creating account...'
                    : 'Signing in...'
                  : mode === 'register'
                    ? 'Create account'
                    : 'Sign in'}
              </PrimaryButton>
            </Form>
            {status.message && (
              <Message
                $error={status.type === 'error'}
                role={status.type === 'error' ? 'alert' : 'status'}
                aria-live="polite"
              >
                {status.message}
              </Message>
            )}
          </Panel>
        </AuthLayout>
      )}
    </Page>
  );
}
