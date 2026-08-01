import { CheckCircle2, LogIn, MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { createMountainCheckIn, getTodayCheckInForMountain } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from '../../features/auth/AuthProvider.jsx';

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 14px;
  padding: 18px;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.2rem;
    gap: 8px;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
    margin: 0;
  }
`;

const NoteField = styled.label`
  display: grid;
  gap: 6px;

  span {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    font: inherit;
    min-height: 84px;
    padding: 10px 11px;
    resize: vertical;
    width: 100%;

    &:focus-visible {
      border-color: ${theme.colors.fjord};
      outline: 3px solid rgba(36, 95, 130, 0.2);
      outline-offset: 1px;
    }
  }
`;

const Action = styled.button`
  align-items: center;
  background: ${theme.colors.forest};
  border: 0;
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const SecondaryAction = styled(Action)`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  color: ${theme.colors.ink};
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const AccountLink = styled(Link)`
  align-items: center;
  background: ${theme.colors.forest};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const Message = styled.p`
  align-items: center;
  background: ${({ $error }) => ($error ? '#f2e6dc' : theme.colors.background)};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? theme.colors.warning : theme.colors.muted)};
  display: flex;
  font-weight: 800;
  gap: 8px;
  padding: 11px;
`;

function getFriendlyError(error) {
  if (error?.code === '23505') {
    return 'You already checked in to this mountain today.';
  }

  if (error?.message?.includes('Location is required')) {
    return 'Use your location before checking in. Summit check-ins are only saved near the mountain top.';
  }

  if (error?.message?.includes('within') && error?.message?.includes('summit')) {
    return 'You need to be near the summit to check in.';
  }

  if (error?.message?.includes('Accept the current Terms')) {
    return 'Review and accept the current Terms in Account settings before checking in.';
  }

  return 'Could not save your check-in. Please try again.';
}

function formatAccuracy(value) {
  const accuracy = Number(value);

  if (!Number.isFinite(accuracy)) {
    return '';
  }

  return accuracy >= 1000 ? `±${(accuracy / 1000).toFixed(1)} km` : `±${Math.round(accuracy)} m`;
}

function formatPoints(value) {
  const points = Number(value);
  const safePoints = Number.isFinite(points) ? points : 10;

  return `${safePoints} ${safePoints === 1 ? 'point' : 'points'}`;
}

function getLocationErrorMessage(error) {
  if (error?.message?.toLowerCase().includes('secure origins')) {
    return 'Location only works on HTTPS or localhost. Use lofotenpeaks.no, or open local dev at http://localhost:5173 instead of a network/IP address.';
  }

  return error?.message || 'Could not read your location.';
}

function CheckInPanelContent({ trail }) {
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState({ type: 'idle', message: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const checkInPoints = trail?.checkInPoints ?? 10;

  useEffect(() => {
    if (!isConfigured || !user || !trail?.mountainId) {
      setTodayCheckIn(null);
      return undefined;
    }

    let isMounted = true;
    setStatus({ type: 'loading', message: '' });

    getTodayCheckInForMountain({ userId: user.id, mountainId: trail.mountainId })
      .then((checkIn) => {
        if (isMounted) {
          setTodayCheckIn(checkIn);
          setStatus({ type: 'idle', message: '' });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus({ type: 'error', message: 'We could not load today\'s check-in. Please try again.' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isConfigured, trail?.mountainId, user?.id]);

  async function handleCheckIn() {
    if (!location) {
      setStatus({
        type: 'error',
        message: 'Use your location before checking in. Summit check-ins are only saved near the mountain top.',
      });
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      const checkIn = await createMountainCheckIn({
        userId: user.id,
        mountainId: trail.mountainId,
        trailId: trail.id,
        note,
        location,
      });
      setTodayCheckIn(checkIn);
      setNote('');
      setStatus({ type: 'success', message: `Check-in saved. ${formatPoints(checkIn.points)} added.` });
    } catch (error) {
      setStatus({ type: 'error', message: getFriendlyError(error) });
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Location is not available in this browser.' });
      return;
    }

    setLocationStatus({ type: 'loading', message: 'Finding your location...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(nextLocation);
        setLocationStatus({
          type: 'success',
          message: `Location ready ${formatAccuracy(nextLocation.accuracy)}.`,
        });
      },
      (error) => {
        setLocation(null);
        setLocationStatus({ type: 'error', message: getLocationErrorMessage(error) });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 10000,
      },
    );
  }

  return (
    <Panel>
      <h2>
        <MapPin size={18} aria-hidden="true" /> Summit Check-In
      </h2>
      {!isConfigured && <p>Account features are not connected yet.</p>}
      {isConfigured && authIsLoading && <p>Checking account...</p>}
      {isConfigured && !authIsLoading && !user && (
        <>
          <p>Sign in to save this mountain to your profile and collect summit points.</p>
          <AccountLink to="/account">
            <LogIn size={18} aria-hidden="true" /> Sign in
          </AccountLink>
        </>
      )}
      {isConfigured && !authIsLoading && user && todayCheckIn && (
        <Message>
          <CheckCircle2 size={17} aria-hidden="true" /> Checked in today for {formatPoints(todayCheckIn.points)}.
        </Message>
      )}
      {isConfigured && !authIsLoading && user && !todayCheckIn && (
        <>
          <p>
            Use your location at the summit to save today&apos;s visit and add {formatPoints(checkInPoints)} to your
            profile.
          </p>
          <NoteField>
            <span>Optional note</span>
            <textarea
              value={note}
              maxLength={240}
              placeholder="Weather, route condition, or short memory"
              onChange={(event) => setNote(event.target.value)}
            />
          </NoteField>
          <ActionRow>
            <SecondaryAction
              type="button"
              disabled={locationStatus.type === 'loading' || status.type === 'loading'}
              onClick={handleUseLocation}
            >
              <Navigation size={18} aria-hidden="true" /> Use my location
            </SecondaryAction>
            <Action type="button" disabled={!location || status.type === 'loading'} onClick={handleCheckIn}>
              <CheckCircle2 size={18} aria-hidden="true" /> Check in
            </Action>
          </ActionRow>
        </>
      )}
      {locationStatus.message && (
        <Message role="status" aria-live="polite" $error={locationStatus.type === 'error'}>
          {locationStatus.message}
        </Message>
      )}
      {status.message && (
        <Message role="status" aria-live="polite" $error={status.type === 'error'}>
          {status.message}
        </Message>
      )}
    </Panel>
  );
}

export function CheckInPanel({ trail }) {
  return <CheckInPanelContent trail={trail} />;
}

export default CheckInPanel;
