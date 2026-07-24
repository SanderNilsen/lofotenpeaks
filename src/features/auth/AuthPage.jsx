import {
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  FileText,
  LogOut,
  Map,
  Medal,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { LeaderboardPanel } from '../../components/community/LeaderboardPanel.jsx';
import { Seo } from '../../components/common/Seo.jsx';
import { getSafePublicDisplayName, isEmailLike } from '../../lib/profile.js';
import {
  createUserHike,
  getLeaderboard,
  getProfile,
  getUserCheckIns,
  getUserHikes,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updateProfile,
} from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from './AuthProvider.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: 1080px;
  padding: 48px 24px 72px;
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
    max-width: 760px;
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
  overflow: hidden;
  position: relative;

  &::after {
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 50%;
    content: '';
    height: 260px;
    position: absolute;
    right: -100px;
    top: -110px;
    width: 260px;
  }

  h2,
  p {
    margin: 0;
    position: relative;
    z-index: 1;
  }

  h2 {
    font-size: clamp(1.65rem, 4vw, 2.4rem);
  }

  p {
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.6;
  }
`;

const BenefitList = styled.ul`
  display: grid;
  gap: 14px;
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  position: relative;
  z-index: 1;
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
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.9rem;
    line-height: 1.45;
  }
`;

const FormHeading = styled.div`
  display: grid;
  gap: 5px;

  h2,
  p {
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.92rem;
    line-height: 1.5;
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
  box-shadow: ${({ $active }) => ($active ? '0 1px 6px rgba(38, 40, 36, 0.1)' : 'none')};
  color: ${theme.colors.ink};
  cursor: pointer;
  font-weight: 800;
  min-height: 38px;

  &:focus-visible {
    outline: 3px solid rgba(47, 111, 94, 0.2);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
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

  input,
  select,
  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 44px;
    padding: 10px 11px;
    width: 100%;
  }

  textarea {
    min-height: 116px;
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: ${theme.colors.forest};
    outline: 2px solid rgba(47, 111, 94, 0.16);
  }

  small {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
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
  top: 2px;
  width: 42px;

  &:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 2px solid rgba(47, 111, 94, 0.2);
  }
`;

const SmallTextarea = styled.textarea`
  min-height: 92px !important;
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
  text-decoration: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:focus-visible {
    outline: 3px solid rgba(47, 111, 94, 0.22);
    outline-offset: 2px;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: ${theme.colors.ink};
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

const Dashboard = styled.div`
  display: grid;
  gap: 18px;
`;

const AccountHero = styled.section`
  align-items: center;
  background: linear-gradient(135deg, ${theme.colors.forest}, #214e43);
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.surface};
  display: flex;
  gap: 18px;
  justify-content: space-between;
  overflow: hidden;
  padding: 24px;
  position: relative;

  &::after {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    content: '';
    height: 220px;
    position: absolute;
    right: -80px;
    top: -110px;
    width: 220px;
  }

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const Identity = styled.div`
  align-items: center;
  display: flex;
  gap: 15px;
  min-width: 0;
  position: relative;
  z-index: 1;
`;

const Avatar = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  display: flex;
  flex: 0 0 auto;
  font-size: 1.25rem;
  font-weight: 900;
  height: 58px;
  justify-content: center;
  text-transform: uppercase;
  width: 58px;
`;

const IdentityCopy = styled.div`
  min-width: 0;

  small {
    color: rgba(255, 255, 255, 0.7);
    display: block;
    font-size: 0.76rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  h2 {
    font-size: clamp(1.35rem, 4vw, 2rem);
    margin: 0;
    overflow-wrap: anywhere;
  }

  p {
    color: rgba(255, 255, 255, 0.72);
    margin: 4px 0 0;
    overflow-wrap: anywhere;
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  position: relative;
  z-index: 1;

  @media (max-width: 520px) {
    > * {
      flex: 1 1 auto;
    }
  }
`;

const HeroButton = styled(PrimaryButton)`
  background: ${theme.colors.surface};
  color: ${theme.colors.forest};
`;

const HeroSecondaryButton = styled(HeroButton)`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: ${theme.colors.surface};
`;

const AccountNav = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 5px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const AccountNavButton = styled(ModeButton)`
  min-height: 44px;
`;

const TabPanel = styled.div`
  display: grid;
  gap: 18px;
`;

const DashboardGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.7fr);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
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
`;

const CardHeader = styled.div`
  align-items: start;
  display: flex;
  gap: 12px;
  justify-content: space-between;

  div {
    display: grid;
    gap: 4px;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.88rem;
    line-height: 1.5;
    margin: 0;
  }
`;

const AccountDetailList = styled.dl`
  display: grid;
  gap: 12px;
  margin: 0;

  div {
    border-bottom: 1px solid ${theme.colors.line};
    display: grid;
    gap: 4px;
    padding-bottom: 12px;
  }

  div:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  dd {
    font-weight: 800;
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

const ProfileForm = styled.form`
  display: grid;
  gap: 12px;
`;

const ProfileFields = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const FullField = styled(Field)`
  grid-column: 1 / -1;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const StatGrid = styled.dl`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }

  div {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    padding: 12px;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  dd {
    font-size: 1.25rem;
    font-weight: 900;
    margin: 4px 0 0;
  }
`;

const CheckInList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    display: grid;
    gap: 4px;
    padding: 12px;
  }

  strong,
  a {
    display: block;
  }

  > li > span {
    color: ${theme.colors.muted};
    font-size: 0.9rem;
    font-weight: 700;
  }
`;

const CheckInHeading = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;

  a,
  strong {
    color: ${theme.colors.ink};
    font-weight: 900;
    text-decoration: none;
  }

  a:hover {
    color: ${theme.colors.forest};
    text-decoration: underline;
  }
`;

const PointsBadge = styled.span`
  background: #e4eee6;
  border-radius: 999px;
  color: ${theme.colors.forest} !important;
  flex: 0 0 auto;
  font-size: 0.76rem !important;
  font-weight: 900 !important;
  padding: 5px 8px;
`;

const StatusBadge = styled.span`
  background: ${({ $status }) =>
    $status === 'approved' ? '#e4eee6' : $status === 'rejected' ? '#f2e6dc' : '#f2ead8'};
  border-radius: 999px;
  color: ${({ $status }) =>
    $status === 'approved' ? theme.colors.forest : $status === 'rejected' ? theme.colors.warning : '#80611c'};
  font-size: 0.72rem;
  font-weight: 900;
  padding: 5px 8px;
  text-transform: uppercase;
`;

const Note = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 3px 0 0;
`;

const SubmissionList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    display: grid;
    gap: 7px;
    padding: 12px;
  }
`;

const SubmissionMeta = styled.div`
  align-items: center;
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.82rem;
  font-weight: 700;
  gap: 8px;
  justify-content: space-between;
`;

const EmptyState = styled.div`
  background: ${theme.colors.background};
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radii.small};
  display: grid;
  gap: 11px;
  justify-items: start;
  padding: 16px;

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
    margin: 0;
  }
`;

const EmptyText = styled.p`
  color: ${theme.colors.muted};
  font-weight: 700;
  line-height: 1.55;
  margin: 0;
`;

function formatCheckInDate(value) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatPoints(value) {
  const points = Number(value) || 0;
  return `${points} ${points === 1 ? 'point' : 'points'}`;
}

function getInitials(value) {
  const parts = String(value || 'Hiker')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

function formatStatus(value) {
  if (!value) {
    return 'Pending';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDistanceFromSummit(value) {
  const distance = Number(value);

  if (!Number.isFinite(distance)) {
    return null;
  }

  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km from summit`;
  }

  return `${Math.round(distance)} m from summit`;
}

const initialHikeForm = {
  title: '',
  body: '',
  difficulty: 'moderate',
};

const initialProfileForm = {
  displayName: '',
  username: '',
  bio: '',
};

const initialAccountData = {
  profile: null,
  profileLoaded: false,
  checkIns: [],
  leaderboard: [],
  hikes: [],
  isLoading: false,
  error: '',
};

function profileFormFromProfile(profile) {
  return {
    displayName: profile?.display_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
  };
}

export function AuthPage() {
  const { isConfigured, isLoading, user } = useAuth();
  const [mode, setMode] = useState('sign-in');
  const [accountSection, setAccountSection] = useState('overview');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [profileStatus, setProfileStatus] = useState({ type: 'idle', message: '' });
  const [accountReloadKey, setAccountReloadKey] = useState(0);
  const [accountData, setAccountData] = useState(initialAccountData);
  const [hikeForm, setHikeForm] = useState(initialHikeForm);
  const [hikeStatus, setHikeStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    setAccountData(initialAccountData);
    setProfileForm(initialProfileForm);
    setHikeForm(initialHikeForm);
    setHikeStatus({ type: 'idle', message: '' });
    setProfileStatus({ type: 'idle', message: '' });
    setAccountSection('overview');
  }, [user?.id]);

  useEffect(() => {
    if (!isConfigured || !user) {
      setAccountData(initialAccountData);
      setProfileForm(initialProfileForm);
      return undefined;
    }

    let isMounted = true;
    setAccountData((current) => ({ ...current, isLoading: true, error: '' }));

    Promise.allSettled([
      getProfile(user.id),
      getUserCheckIns(user.id),
      getLeaderboard({ limit: 6 }),
      getUserHikes(user.id),
    ]).then(([profileResult, checkInsResult, leaderboardResult, hikesResult]) => {
      if (!isMounted) {
        return;
      }

      const errors = [profileResult, checkInsResult, leaderboardResult, hikesResult]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message)
        .filter(Boolean);

      if (profileResult.status === 'fulfilled') {
        setProfileForm(profileFormFromProfile(profileResult.value));
      }

      setAccountData((current) => ({
        profile: profileResult.status === 'fulfilled' ? profileResult.value : current.profile,
        profileLoaded: profileResult.status === 'fulfilled' || current.profileLoaded,
        checkIns: checkInsResult.status === 'fulfilled' ? checkInsResult.value : current.checkIns,
        leaderboard:
          leaderboardResult.status === 'fulfilled' ? leaderboardResult.value : current.leaderboard,
        hikes: hikesResult.status === 'fulfilled' ? hikesResult.value : current.hikes,
        isLoading: false,
        error: errors.length > 0 ? 'Some account information could not be loaded. Refresh to try again.' : '',
      }));
    });

    return () => {
      isMounted = false;
    };
  }, [accountReloadKey, isConfigured, user?.id]);

  const accountStats = useMemo(() => {
    const approvedCheckIns = accountData.checkIns.filter((checkIn) => checkIn.status === 'approved');

    return {
      checkInCount: approvedCheckIns.length,
      completedMountains: new Set(approvedCheckIns.map((checkIn) => checkIn.mountain_id).filter(Boolean)).size,
      points: approvedCheckIns.reduce((total, checkIn) => total + (checkIn.points ?? 0), 0),
    };
  }, [accountData.checkIns]);

  const profileHasChanges = useMemo(
    () => JSON.stringify(profileForm) !== JSON.stringify(profileFormFromProfile(accountData.profile)),
    [accountData.profile, profileForm],
  );
  const profileDisplayName = profileForm.displayName.trim();
  const metadataDisplayName = String(user?.user_metadata?.display_name ?? '').trim();
  const publicDisplayName = getSafePublicDisplayName(
    profileDisplayName,
    accountData.profile?.username,
    metadataDisplayName,
  );

  function updateHikeForm(field, value) {
    setHikeForm((current) => ({
      ...current,
      [field]: value,
    }));
    setHikeStatus({ type: 'idle', message: '' });
  }

  function updateProfileForm(field, value) {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
    setProfileStatus({ type: 'idle', message: '' });
  }

  function switchMode(nextMode) {
    if (status.type === 'loading') {
      return;
    }

    setMode(nextMode);
    setPassword('');
    setPasswordVisible(false);
    setStatus({ type: 'idle', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      if (mode === 'register') {
        const cleanDisplayName = displayName.trim();

        if (cleanDisplayName.length < 2 || cleanDisplayName.length > 60) {
          throw new Error('Display name must be between 2 and 60 characters.');
        }

        if (isEmailLike(cleanDisplayName)) {
          throw new Error('Display name cannot be an email address.');
        }

        await signUpWithEmail({ displayName: cleanDisplayName, email: email.trim(), password });
        setPassword('');
        setPasswordVisible(false);
        setStatus({
          type: 'success',
          message: 'Account created. Check your email if Supabase email confirmation is enabled.',
        });
      } else {
        await signInWithEmail({ email: email.trim(), password });
        setPassword('');
        setPasswordVisible(false);
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
      setEmail('');
      setPassword('');
      setPasswordVisible(false);
      setStatus({ type: 'success', message: 'Signed out.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();
    setProfileStatus({ type: 'loading', message: '' });

    try {
      const cleanDisplayName = profileForm.displayName.trim();
      const cleanUsername = profileForm.username.trim().replace(/^@/, '');
      const cleanBio = profileForm.bio.trim();

      if (cleanDisplayName.length < 2 || cleanDisplayName.length > 60) {
        throw new Error('Display name must be between 2 and 60 characters.');
      }

      if (isEmailLike(cleanDisplayName)) {
        throw new Error('Display name cannot be an email address.');
      }

      if (cleanUsername && !/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
        throw new Error('Username must be 3–24 letters, numbers, or underscores.');
      }

      const updatedProfile = await updateProfile(user.id, {
        display_name: cleanDisplayName,
        username: cleanUsername || null,
        bio: cleanBio || null,
      });
      setProfileForm(profileFormFromProfile(updatedProfile));
      setAccountData((current) => ({
        ...current,
        profile: updatedProfile,
        leaderboard: current.leaderboard.map((entry) =>
          entry.user_id === user.id ? { ...entry, display_name: updatedProfile.display_name } : entry,
        ),
      }));
      setProfileStatus({ type: 'success', message: 'Profile updated.' });
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message });
    }
  }

  async function handleHikeSubmit(event) {
    event.preventDefault();
    setHikeStatus({ type: 'loading', message: '' });

    try {
      const title = hikeForm.title.trim();

      if (title.length < 4) {
        throw new Error('Add a clearer hike title.');
      }

      const createdHike = await createUserHike({
        user_id: user.id,
        title,
        body: hikeForm.body.trim() || null,
        difficulty: hikeForm.difficulty,
        status: 'pending',
      });

      setAccountData((current) => ({ ...current, hikes: [createdHike, ...current.hikes] }));
      setHikeForm(initialHikeForm);
      setHikeStatus({ type: 'success', message: 'Hike recommendation saved for review.' });
    } catch (error) {
      setHikeStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <Page>
      <Seo
        title="Account"
        description="Create or access a Lofoten Peaks account for future mountain check-ins, points, comments, and GPX uploads."
      />
      <Header>
        <h1>{user ? 'Your account' : 'Account'}</h1>
        <p>
          {user
            ? 'Your personal Lofoten logbook for summit check-ins, points, and hike recommendations.'
            : 'Sign in to save summit check-ins, collect points, and share useful hike ideas.'}
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
        <Dashboard>
          <AccountHero>
            <Identity>
              <Avatar aria-hidden="true">{getInitials(publicDisplayName)}</Avatar>
              <IdentityCopy>
                <small>My Lofoten logbook</small>
                <h2>{publicDisplayName}</h2>
                <p>{user.email}</p>
              </IdentityCopy>
            </Identity>
            <HeroActions>
              <HeroButton as={Link} to="/mountains">
                <Compass size={17} aria-hidden="true" /> Browse mountains
              </HeroButton>
              <HeroSecondaryButton
                type="button"
                disabled={accountData.isLoading || profileHasChanges || hikeStatus.type === 'loading'}
                title={
                  profileHasChanges
                    ? 'Save or discard your profile changes before refreshing.'
                    : hikeStatus.type === 'loading'
                      ? 'Wait for your hike recommendation to finish sending.'
                      : undefined
                }
                onClick={() => setAccountReloadKey((current) => current + 1)}
              >
                <RefreshCw size={17} aria-hidden="true" /> Refresh
              </HeroSecondaryButton>
              <HeroSecondaryButton type="button" disabled={status.type === 'loading'} onClick={handleSignOut}>
                <LogOut size={17} aria-hidden="true" />
                {status.type === 'loading' ? 'Signing out…' : 'Sign out'}
              </HeroSecondaryButton>
            </HeroActions>
          </AccountHero>

          {accountData.error && (
            <Message $error role="alert">
              {accountData.error}
            </Message>
          )}
          {status.message && (
            <Message
              $error={status.type === 'error'}
              role={status.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {status.message}
            </Message>
          )}

          <StatGrid aria-label="Summit statistics">
            <div>
              <dt>Points</dt>
              <dd>{accountData.isLoading ? '—' : accountStats.points}</dd>
            </div>
            <div>
              <dt>Check-ins</dt>
              <dd>{accountData.isLoading ? '—' : accountStats.checkInCount}</dd>
            </div>
            <div>
              <dt>Mountains</dt>
              <dd>{accountData.isLoading ? '—' : accountStats.completedMountains}</dd>
            </div>
          </StatGrid>

          <AccountNav role="group" aria-label="Account sections">
            <AccountNavButton
              type="button"
              $active={accountSection === 'overview'}
              aria-pressed={accountSection === 'overview'}
              onClick={() => setAccountSection('overview')}
            >
              Overview
            </AccountNavButton>
            <AccountNavButton
              type="button"
              $active={accountSection === 'profile'}
              aria-pressed={accountSection === 'profile'}
              onClick={() => setAccountSection('profile')}
            >
              Profile
            </AccountNavButton>
            <AccountNavButton
              type="button"
              $active={accountSection === 'contribute'}
              aria-pressed={accountSection === 'contribute'}
              onClick={() => setAccountSection('contribute')}
            >
              Share a hike
            </AccountNavButton>
          </AccountNav>

          {accountSection === 'overview' && (
            <TabPanel>
              <DashboardGrid>
                <Card>
                  <CardHeader>
                    <div>
                      <h2>
                        <CheckCircle2 size={18} aria-hidden="true" /> Recent Check-Ins
                      </h2>
                      <p>Your latest saved summit visits.</p>
                    </div>
                  </CardHeader>
                  {accountData.isLoading && <EmptyText>Loading check-ins…</EmptyText>}
                  {!accountData.isLoading && accountData.checkIns.length === 0 && (
                    <EmptyState>
                      <p>No check-ins yet. Open a mountain guide when you are at a summit to save your first visit.</p>
                      <PrimaryButton as={Link} to="/mountains">
                        <Compass size={17} aria-hidden="true" /> Find a mountain
                      </PrimaryButton>
                    </EmptyState>
                  )}
                  {!accountData.isLoading && accountData.checkIns.length > 0 && (
                    <CheckInList>
                      {accountData.checkIns.slice(0, 6).map((checkIn) => {
                        const mountainName =
                          checkIn.mountains?.name ?? checkIn.trails?.name ?? checkIn.mountain_id;
                        const mountainSlug = checkIn.mountains?.slug ?? checkIn.trails?.slug;
                        const distanceLabel = formatDistanceFromSummit(checkIn.distance_to_summit_meters);

                        return (
                          <li key={checkIn.id}>
                            <CheckInHeading>
                              {mountainSlug ? (
                                <Link to={`/mountains/${mountainSlug}`}>{mountainName}</Link>
                              ) : (
                                <strong>{mountainName}</strong>
                              )}
                              {checkIn.status === 'approved' ? (
                                <PointsBadge>{formatPoints(checkIn.points)}</PointsBadge>
                              ) : (
                                <StatusBadge $status={checkIn.status}>{formatStatus(checkIn.status)}</StatusBadge>
                              )}
                            </CheckInHeading>
                            <span>
                              {formatCheckInDate(checkIn.checked_in_at)}
                              {distanceLabel ? ` · ${distanceLabel}` : ''}
                            </span>
                            {checkIn.note && <Note>{checkIn.note}</Note>}
                          </li>
                        );
                      })}
                    </CheckInList>
                  )}
                </Card>

                <LeaderboardPanel entries={accountData.leaderboard} isLoading={accountData.isLoading} />
              </DashboardGrid>
            </TabPanel>
          )}

          {accountSection === 'profile' && (
            <TabPanel>
              <DashboardGrid>
                <Card>
                  <CardHeader>
                    <div>
                      <h2>
                        <UserCircle size={18} aria-hidden="true" /> Public Profile
                      </h2>
                      <p>Your display name and username may appear on the leaderboard and comments.</p>
                    </div>
                  </CardHeader>
                  <ProfileForm onSubmit={handleProfileUpdate}>
                    {!accountData.isLoading && !accountData.profileLoaded && (
                      <Message $error role="alert">
                        Profile details could not be loaded. Refresh the account before editing.
                      </Message>
                    )}
                    <ProfileFields>
                      <Field>
                        <span>Display name</span>
                        <input
                          required
                          type="text"
                          minLength={2}
                          maxLength={60}
                          value={profileForm.displayName}
                          autoComplete="name"
                          disabled={
                            profileStatus.type === 'loading' ||
                            accountData.isLoading ||
                            !accountData.profileLoaded
                          }
                          onChange={(event) => updateProfileForm('displayName', event.target.value)}
                        />
                        <small>This is public. Do not use your email address.</small>
                      </Field>
                      <Field>
                        <span>Username</span>
                        <input
                          type="text"
                          minLength={3}
                          maxLength={24}
                          pattern="[a-zA-Z0-9_]{3,24}"
                          value={profileForm.username}
                          autoComplete="username"
                          placeholder="lofoten_hiker"
                          disabled={
                            profileStatus.type === 'loading' ||
                            accountData.isLoading ||
                            !accountData.profileLoaded
                          }
                          onChange={(event) => updateProfileForm('username', event.target.value)}
                        />
                        <small>Optional: 3–24 letters, numbers, or underscores.</small>
                      </Field>
                      <FullField>
                        <span>Bio</span>
                        <SmallTextarea
                          maxLength={280}
                          value={profileForm.bio}
                          placeholder="A short introduction about your hiking interests."
                          disabled={
                            profileStatus.type === 'loading' ||
                            accountData.isLoading ||
                            !accountData.profileLoaded
                          }
                          onChange={(event) => updateProfileForm('bio', event.target.value)}
                        />
                        <small>{profileForm.bio.length}/280 characters</small>
                      </FullField>
                    </ProfileFields>
                    <ButtonRow>
                      <PrimaryButton
                        type="submit"
                        disabled={
                          profileStatus.type === 'loading' ||
                          accountData.isLoading ||
                          !accountData.profileLoaded ||
                          !profileHasChanges
                        }
                      >
                        <Save size={18} aria-hidden="true" />
                        {profileStatus.type === 'loading' ? 'Saving…' : 'Save profile'}
                      </PrimaryButton>
                      <SecondaryButton
                        type="button"
                        disabled={
                          profileStatus.type === 'loading' ||
                          accountData.isLoading ||
                          !accountData.profileLoaded ||
                          !profileHasChanges
                        }
                        onClick={() => {
                          setProfileForm(profileFormFromProfile(accountData.profile));
                          setProfileStatus({ type: 'idle', message: '' });
                        }}
                      >
                        Discard changes
                      </SecondaryButton>
                    </ButtonRow>
                  </ProfileForm>
                  {profileStatus.message && (
                    <Message
                      $error={profileStatus.type === 'error'}
                      role={profileStatus.type === 'error' ? 'alert' : 'status'}
                      aria-live="polite"
                    >
                      {profileStatus.message}
                    </Message>
                  )}
                </Card>

                <Card>
                  <h2>
                    <ShieldCheck size={18} aria-hidden="true" /> Account Details
                  </h2>
                  <AccountDetailList>
                    <div>
                      <dt>Email</dt>
                      <dd>{user.email}</dd>
                    </div>
                    <div>
                      <dt>Member since</dt>
                      <dd>{formatCheckInDate(user.created_at)}</dd>
                    </div>
                    <div>
                      <dt>Email status</dt>
                      <dd>{user.email_confirmed_at ? 'Verified' : 'Confirmation pending'}</dd>
                    </div>
                  </AccountDetailList>
                  <Message>
                    <ShieldCheck size={17} aria-hidden="true" /> Your email is private and is not shown on the
                    leaderboard.
                  </Message>
                </Card>
              </DashboardGrid>
            </TabPanel>
          )}

          {accountSection === 'contribute' && (
            <TabPanel>
              <DashboardGrid>
                <Card>
                  <CardHeader>
                    <div>
                      <h2>
                        <Map size={18} aria-hidden="true" /> Recommend a Hike
                      </h2>
                      <p>Share a route idea for review before it appears publicly.</p>
                    </div>
                  </CardHeader>
                  <ProfileForm onSubmit={handleHikeSubmit}>
                    <Field>
                      <span>Title</span>
                      <input
                        required
                        type="text"
                        minLength={4}
                        maxLength={80}
                        value={hikeForm.title}
                        disabled={hikeStatus.type === 'loading' || accountData.isLoading}
                        placeholder="Hidden beach route, winter viewpoint, or local loop"
                        onChange={(event) => updateHikeForm('title', event.target.value)}
                      />
                    </Field>
                    <Field>
                      <span>Difficulty</span>
                      <select
                        value={hikeForm.difficulty}
                        disabled={hikeStatus.type === 'loading' || accountData.isLoading}
                        onChange={(event) => updateHikeForm('difficulty', event.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="hard">Hard</option>
                        <option value="expert">Expert</option>
                      </select>
                    </Field>
                    <Field>
                      <span>Notes</span>
                      <SmallTextarea
                        maxLength={1200}
                        value={hikeForm.body}
                        disabled={hikeStatus.type === 'loading' || accountData.isLoading}
                        placeholder="Route condition, best season, parking, or why it is worth adding."
                        onChange={(event) => updateHikeForm('body', event.target.value)}
                      />
                      <small>{hikeForm.body.length}/1200 characters</small>
                    </Field>
                    <PrimaryButton
                      type="submit"
                      disabled={hikeStatus.type === 'loading' || accountData.isLoading}
                    >
                      <Send size={18} aria-hidden="true" />
                      {hikeStatus.type === 'loading' ? 'Sending…' : 'Send recommendation'}
                    </PrimaryButton>
                  </ProfileForm>
                  {hikeStatus.message && (
                    <Message
                      $error={hikeStatus.type === 'error'}
                      role={hikeStatus.type === 'error' ? 'alert' : 'status'}
                      aria-live="polite"
                    >
                      {hikeStatus.message}
                    </Message>
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <h2>
                        <FileText size={18} aria-hidden="true" /> Your Submissions
                      </h2>
                      <p>Track the review status of your recent ideas.</p>
                    </div>
                  </CardHeader>
                  {accountData.isLoading && <EmptyText>Loading submissions…</EmptyText>}
                  {!accountData.isLoading && accountData.hikes.length === 0 && (
                    <EmptyText>You have not submitted a hike recommendation yet.</EmptyText>
                  )}
                  {!accountData.isLoading && accountData.hikes.length > 0 && (
                    <SubmissionList>
                      {accountData.hikes.slice(0, 6).map((hike) => (
                        <li key={hike.id}>
                          <strong>{hike.title}</strong>
                          <SubmissionMeta>
                            <span>
                              {hike.difficulty ? formatStatus(hike.difficulty) : 'Difficulty not set'} ·{' '}
                              {formatCheckInDate(hike.created_at)}
                            </span>
                            <StatusBadge $status={hike.status}>{formatStatus(hike.status)}</StatusBadge>
                          </SubmissionMeta>
                          {hike.body && <Note>{hike.body}</Note>}
                        </li>
                      ))}
                    </SubmissionList>
                  )}
                </Card>
              </DashboardGrid>
            </TabPanel>
          )}
        </Dashboard>
      )}

      {isConfigured && !isLoading && !user && (
        <AuthLayout>
          <BenefitsPanel>
            <FormHeading>
              <h2>Your Lofoten logbook</h2>
              <p>Keep your summit memories and community contributions together in one place.</p>
            </FormHeading>
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
                  <strong>Collect points</strong>
                  <span>See your progress and compare it with the community leaderboard.</span>
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
            <Form onSubmit={handleSubmit}>
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
                    placeholder="Lofoten Hiker"
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                  <small>This may appear on the leaderboard. Do not use your email address.</small>
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
                  placeholder="you@example.com"
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
              <PrimaryButton type="submit" disabled={status.type === 'loading'}>
                <UserCircle size={18} aria-hidden="true" />
                {status.type === 'loading'
                  ? mode === 'register'
                    ? 'Creating account…'
                    : 'Signing in…'
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
