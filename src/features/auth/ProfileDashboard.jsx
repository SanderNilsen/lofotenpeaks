import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileText,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { LeaderboardPanel } from '../../components/community/LeaderboardPanel.jsx';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar.jsx';
import { ProfileSummitCard } from '../../components/profile/ProfileSummitCard.jsx';
import { mountains as staticMountains } from '../../data/mountains.js';
import { trails as staticTrails } from '../../data/trails.js';
import { getSafePublicDisplayName, isEmailLike } from '../../lib/profile.js';
import {
  createUserHike,
  getLeaderboard,
  getProfile,
  getRemoteMountainGuides,
  getUserCheckIns,
  getUserComments,
  getUserHikes,
  signOut,
  updateProfile,
} from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from './AuthProvider.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 48px 24px 80px;

  @media (max-width: 640px) {
    padding: 34px 16px 56px;
  }
`;

const PageIntro = styled.header`
  display: grid;
  gap: 11px;
  margin-bottom: 24px;

  h1 {
    font-size: 3rem;
    line-height: 1.08;
    margin: 0;
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

const Dashboard = styled.div`
  display: grid;
  gap: 28px;
`;

const ProfileHeader = styled.section`
  align-items: center;
  background: #e7eef3;
  border: 1px solid #cad9e3;
  border-radius: ${theme.radii.medium};
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: 22px;

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const ProfileIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: 17px;
  min-width: 0;

  @media (max-width: 440px) {
    align-items: start;
  }
`;

const IdentityCopy = styled.div`
  min-width: 0;

  h2 {
    font-size: 1.65rem;
    line-height: 1.2;
    margin: 0;
    overflow-wrap: anywhere;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.5;
    margin: 5px 0 0;
    max-width: 620px;
    overflow-wrap: anywhere;
  }
`;

const IdentityMeta = styled.div`
  align-items: center;
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.84rem;
  font-weight: 700;
  gap: 6px 14px;
  margin-top: 8px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 9px;

  @media (max-width: 520px) {
    > * {
      flex: 1 1 auto;
    }
  }
`;

const ButtonBase = styled.button`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${theme.radii.small};
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  justify-content: center;
  min-height: 46px;
  padding: 10px 15px;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }
`;

const PrimaryButton = styled(ButtonBase)`
  background: ${theme.colors.forest};
  color: ${theme.colors.surface};

  &:hover:not(:disabled) {
    background: #245a4c;
  }
`;

const SecondaryButton = styled(ButtonBase)`
  background: ${theme.colors.surface};
  border-color: ${theme.colors.line};
  color: ${theme.colors.ink};

  &:hover:not(:disabled) {
    border-color: #aaa69d;
  }
`;

const TextAction = styled(Link)`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 7px;
  min-height: 44px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  &:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const AccountNav = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 5px;
`;

const AccountNavButton = styled.button`
  background: ${({ $active }) => ($active ? theme.colors.background : 'transparent')};
  border: 0;
  border-radius: ${theme.radii.small};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 0 0 1px #cbc7bd' : 'none')};
  color: ${theme.colors.ink};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 800;
  min-height: 46px;
  padding: 8px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const TabPanel = styled.div`
  display: grid;
  gap: 52px;

  @media (max-width: 640px) {
    gap: 42px;
  }
`;

const Section = styled.section`
  display: grid;
  gap: 20px;
`;

const SectionHeader = styled.header`
  align-items: end;
  display: flex;
  gap: 20px;
  justify-content: space-between;

  h2 {
    font-size: 2rem;
    line-height: 1.18;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 7px 0 0;
    max-width: 680px;
  }

  @media (max-width: 680px) {
    align-items: start;
    flex-direction: column;
    gap: 10px;

    h2 {
      font-size: 1.7rem;
    }
  }
`;

const Stats = styled.dl`
  border-bottom: 1px solid ${theme.colors.line};
  border-top: 1px solid ${theme.colors.line};
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;

  div {
    border-right: 1px solid ${theme.colors.line};
    min-width: 0;
    padding: 19px 20px;
  }

  div:last-child {
    border-right: 0;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.8rem;
    font-weight: 800;
    line-height: 1.35;
  }

  dd {
    font-size: 1.85rem;
    font-weight: 900;
    line-height: 1.1;
    margin: 7px 0 0;
  }

  small {
    color: ${theme.colors.muted};
    display: block;
    font-size: 0.75rem;
    line-height: 1.4;
    margin-top: 5px;
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    div:nth-child(2) {
      border-right: 0;
    }

    div:nth-child(-n + 2) {
      border-bottom: 1px solid ${theme.colors.line};
    }
  }

  @media (max-width: 420px) {
    div {
      padding: 16px 12px;
    }

    dd {
      font-size: 1.55rem;
    }
  }
`;

const SummitGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 920px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;

const TwoColumnLayout = styled.div`
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.75fr);

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityPanel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 15px;
  padding: 18px;

  h3 {
    font-size: 1.2rem;
    margin: 0;
  }
`;

const ActivityList = styled.ul`
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ActivityItem = styled.li`
  align-items: start;
  border-bottom: 1px solid ${theme.colors.line};
  display: grid;
  gap: 12px;
  grid-template-columns: 38px minmax(0, 1fr);
  padding: 14px 0;

  &:first-child {
    padding-top: 2px;
  }

  &:last-child {
    border-bottom: 0;
    padding-bottom: 2px;
  }
`;

const ActivityIcon = styled.span`
  align-items: center;
  background: ${({ $type }) => ($type === 'check-in' ? '#e4eee6' : '#e7eef3')};
  border-radius: 50%;
  color: ${({ $type }) => ($type === 'check-in' ? theme.colors.forest : theme.colors.fjord)};
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
`;

const ActivityCopy = styled.div`
  min-width: 0;

  a,
  strong {
    color: ${theme.colors.ink};
    font-weight: 850;
    line-height: 1.4;
    overflow-wrap: anywhere;
    text-decoration: none;
  }

  a:hover {
    color: ${theme.colors.forest};
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  a:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.86rem;
    line-height: 1.5;
    margin: 4px 0 0;
  }
`;

const ContributionGrid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ContributionCard = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 10px;
  padding: 16px;

  h3 {
    font-size: 1.05rem;
    line-height: 1.35;
    margin: 0;
    overflow-wrap: anywhere;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.88rem;
    line-height: 1.5;
    margin: 0;
  }
`;

const StatusBadge = styled.span`
  background: ${({ $status }) =>
    $status === 'approved' ? '#e4eee6' : $status === 'rejected' ? '#f2e6dc' : '#f2ead8'};
  border-radius: 999px;
  color: ${({ $status }) =>
    $status === 'approved' ? theme.colors.forest : $status === 'rejected' ? theme.colors.warning : '#735716'};
  font-size: 0.72rem;
  font-weight: 900;
  justify-self: start;
  padding: 5px 8px;
  text-transform: uppercase;
`;

const ExploreGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  align-items: start;
  background: ${theme.colors.surface};
  border: 1px dashed #bcb8ae;
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 22px;

  h3 {
    font-size: 1.2rem;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
    margin: 0;
    max-width: 620px;
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingBlock = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  min-height: 190px;
`;

const Message = styled.p`
  align-items: center;
  background: ${({ $error }) => ($error ? '#f7ece4' : '#e8f2ef')};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : '#bfd6cf')};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? '#713d1f' : '#214e43')};
  display: flex;
  gap: 8px;
  line-height: 1.55;
  margin: 0;
  padding: 12px;
`;

const LoadError = styled(Message)`
  justify-content: space-between;

  button {
    flex: 0 0 auto;
  }

  @media (max-width: 620px) {
    align-items: start;
    flex-direction: column;
  }
`;

const ToolGrid = styled.div`
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const ToolCard = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 18px;
  padding: 20px;

  h2,
  h3,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.45rem;
  }

  h3 {
    font-size: 1.15rem;
  }

  > p {
    color: ${theme.colors.muted};
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    padding: 17px 15px;
  }
`;

const ToolIntro = styled.div`
  display: grid;
  gap: 6px;

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
  }
`;

const ToolStack = styled.div`
  display: grid;
  gap: 20px;
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const FormFields = styled.div`
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  gap: 7px;

  label {
    color: ${theme.colors.ink};
    font-size: 0.86rem;
    font-weight: 800;
  }

  input,
  select,
  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${({ $invalid }) => ($invalid ? '#a55232' : theme.colors.line)};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 46px;
    padding: 10px 12px;
    width: 100%;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
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

const FullField = styled(Field)`
  grid-column: 1 / -1;
`;

const FieldError = styled.span`
  color: #713d1f;
  font-size: 0.8rem;
  font-weight: 750;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const AccountDetails = styled.dl`
  display: grid;
  gap: 13px;
  margin: 0;

  div {
    border-bottom: 1px solid ${theme.colors.line};
    display: grid;
    gap: 4px;
    padding-bottom: 13px;
  }

  div:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 800;
  }

  dd {
    font-weight: 800;
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

const DangerCard = styled(ToolCard)`
  border-color: #dfc4af;
`;

const SubmissionList = styled.ul`
  display: grid;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    display: grid;
    gap: 8px;
    padding: 13px;
  }

  strong {
    overflow-wrap: anywhere;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.5;
    margin: 0;
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

const initialProfileForm = {
  displayName: '',
  username: '',
  bio: '',
};

const initialHikeForm = {
  title: '',
  body: '',
  difficulty: 'moderate',
};

function createInitialAccountData() {
  return {
    profile: null,
    profileLoaded: false,
    checkIns: [],
    comments: [],
    hikes: [],
    leaderboard: [],
    guides: { mountains: staticMountains, trails: staticTrails },
    isLoading: false,
    errors: {},
  };
}

function profileFormFromProfile(profile) {
  return {
    displayName: profile?.display_name ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
  };
}

function formatDate(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatStatus(value) {
  if (!value) {
    return 'Pending';
  }

  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll('_', ' ');
}

function relationValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function friendlyMutationError(error, fallback) {
  const message = String(error?.message ?? '').toLowerCase();

  if (error?.code === '23505' || message.includes('unique')) {
    return 'That username is already in use. Choose another one.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'We could not reach the service. Check your connection and try again.';
  }

  return fallback;
}

function validateProfile(form) {
  const errors = {};
  const displayName = form.displayName.trim();
  const username = form.username.trim().replace(/^@/, '');

  if (displayName.length < 2 || displayName.length > 60) {
    errors.displayName = 'Use between 2 and 60 characters.';
  } else if (isEmailLike(displayName)) {
    errors.displayName = 'Do not use an email address as your public display name.';
  }

  if (username && !/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    errors.username = 'Use 3-24 letters, numbers, or underscores.';
  }

  return errors;
}

export function ProfileDashboard() {
  const { user } = useAuth();
  const userId = user?.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = ['overview', 'profile', 'contribute'].includes(searchParams.get('section'))
    ? searchParams.get('section')
    : 'overview';
  const [accountSection, setAccountSection] = useState(requestedSection);
  const [reloadKey, setReloadKey] = useState(0);
  const [showAllSummits, setShowAllSummits] = useState(false);
  const [accountData, setAccountData] = useState(createInitialAccountData);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [profileTouched, setProfileTouched] = useState({});
  const [profileStatus, setProfileStatus] = useState({ type: 'idle', message: '' });
  const [hikeForm, setHikeForm] = useState(initialHikeForm);
  const [hikeStatus, setHikeStatus] = useState({ type: 'idle', message: '' });
  const [sessionStatus, setSessionStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    setAccountData(createInitialAccountData());
    setProfileForm(initialProfileForm);
    setProfileTouched({});
    setHikeForm(initialHikeForm);
    setProfileStatus({ type: 'idle', message: '' });
    setHikeStatus({ type: 'idle', message: '' });
    setSessionStatus({ type: 'idle', message: '' });
    setAccountSection('overview');
  }, [userId]);

  useEffect(() => {
    setAccountSection(requestedSection);
  }, [requestedSection]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let isMounted = true;
    setAccountData((current) => ({ ...current, isLoading: true, errors: {} }));

    Promise.allSettled([
      getProfile(userId),
      getUserCheckIns(userId),
      getLeaderboard({ limit: 6 }),
      getUserHikes(userId),
      getUserComments(userId, { limit: 12 }),
      getRemoteMountainGuides(),
    ]).then(([profileResult, checkInsResult, leaderboardResult, hikesResult, commentsResult, guidesResult]) => {
      if (!isMounted) {
        return;
      }

      const errors = {};

      if (profileResult.status === 'rejected') {
        errors.profile = 'We could not load your profile details.';
      }
      if (checkInsResult.status === 'rejected') {
        errors.checkIns = 'We could not load your summit collection.';
      }
      if (leaderboardResult.status === 'rejected') {
        errors.leaderboard = 'We could not load the leaderboard.';
      }
      if (hikesResult.status === 'rejected') {
        errors.hikes = 'We could not load your hike recommendations.';
      }
      if (commentsResult.status === 'rejected') {
        errors.comments = 'We could not load your recent comments.';
      }

      if (profileResult.status === 'fulfilled') {
        setProfileForm(profileFormFromProfile(profileResult.value));
      }

      setAccountData((current) => ({
        profile: profileResult.status === 'fulfilled' ? profileResult.value : current.profile,
        profileLoaded: profileResult.status === 'fulfilled',
        checkIns: checkInsResult.status === 'fulfilled' ? checkInsResult.value : [],
        leaderboard: leaderboardResult.status === 'fulfilled' ? leaderboardResult.value : [],
        hikes: hikesResult.status === 'fulfilled' ? hikesResult.value : [],
        comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
        guides:
          guidesResult.status === 'fulfilled' && guidesResult.value.mountains.length > 0
            ? guidesResult.value
            : current.guides,
        isLoading: false,
        errors,
      }));
    });

    return () => {
      isMounted = false;
    };
  }, [reloadKey, userId]);

  const profileValidation = useMemo(() => validateProfile(profileForm), [profileForm]);
  const profileHasChanges = useMemo(
    () => JSON.stringify(profileForm) !== JSON.stringify(profileFormFromProfile(accountData.profile)),
    [accountData.profile, profileForm],
  );
  const hikeHasChanges = useMemo(
    () => JSON.stringify(hikeForm) !== JSON.stringify(initialHikeForm),
    [hikeForm],
  );

  useEffect(() => {
    if (!profileHasChanges && !hikeHasChanges) {
      return undefined;
    }

    function warnBeforeLeaving(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hikeHasChanges, profileHasChanges]);

  const metadataDisplayName = String(user?.user_metadata?.display_name ?? '').trim();
  const publicDisplayName = getSafePublicDisplayName(
    accountData.profile?.display_name,
    accountData.profile?.username,
    metadataDisplayName,
  );
  const personalName = [accountData.profile?.display_name, metadataDisplayName]
    .map((value) => String(value ?? '').trim())
    .find((value) => value && !isEmailLike(value));
  const firstName = personalName?.split(/\s+/)[0];
  const avatarUrl = accountData.profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null;

  const approvedCheckIns = useMemo(
    () => accountData.checkIns.filter((checkIn) => checkIn.status === 'approved'),
    [accountData.checkIns],
  );

  const accountStats = useMemo(
    () => ({
      summits: new Set(approvedCheckIns.map((checkIn) => checkIn.mountain_id).filter(Boolean)).size,
      checkIns: approvedCheckIns.length,
      points: approvedCheckIns.reduce((total, checkIn) => total + (Number(checkIn.points) || 0), 0),
      recommendations: accountData.hikes.length,
    }),
    [accountData.hikes.length, approvedCheckIns],
  );

  const summitCollection = useMemo(() => {
    const guidesById = new Map(accountData.guides.mountains.map((mountain) => [mountain.id, mountain]));
    const collection = new Map();

    approvedCheckIns.forEach((checkIn) => {
      const mountainRelation = relationValue(checkIn.mountains);
      const guide = guidesById.get(checkIn.mountain_id);
      const key = checkIn.mountain_id ?? mountainRelation?.slug;

      if (!key) {
        return;
      }

      const existing = collection.get(key);
      const checkedInAt = checkIn.checked_in_at;
      const latestCheckInAt =
        !existing || new Date(checkedInAt) > new Date(existing.latestCheckInAt)
          ? checkedInAt
          : existing.latestCheckInAt;

      collection.set(key, {
        name: mountainRelation?.name ?? guide?.name ?? 'Lofoten summit',
        slug: mountainRelation?.slug ?? guide?.slug,
        region: mountainRelation?.region ?? guide?.region,
        heightMeters: mountainRelation?.height_meters ?? guide?.heightMeters,
        difficulty: mountainRelation?.difficulty ?? guide?.difficulty,
        imageSrc: mountainRelation?.hero_image_path ?? guide?.heroImage?.src,
        imageAlt: guide?.heroImage?.alt,
        latestCheckInAt,
        checkInCount: (existing?.checkInCount ?? 0) + 1,
        points: (existing?.points ?? 0) + (Number(checkIn.points) || 0),
      });
    });

    return [...collection.values()]
      .filter((summit) => summit.slug)
      .sort((a, b) => new Date(b.latestCheckInAt) - new Date(a.latestCheckInAt));
  }, [accountData.guides.mountains, approvedCheckIns]);

  const recentActivity = useMemo(() => {
    const checkIns = accountData.checkIns.map((checkIn) => {
      const mountain = relationValue(checkIn.mountains);
      const trail = relationValue(checkIn.trails);
      const name = mountain?.name ?? trail?.name ?? 'a Lofoten summit';
      const slug = mountain?.slug;

      return {
        id: `check-in-${checkIn.id}`,
        type: 'check-in',
        title: `Checked in at ${name}`,
        date: checkIn.checked_in_at,
        detail:
          checkIn.status === 'approved'
            ? `${Number(checkIn.points) || 0} points earned`
            : `${formatStatus(checkIn.status)} check-in`,
        to: slug ? `/mountains/${slug}` : null,
      };
    });
    const comments = accountData.comments.map((comment) => {
      const mountain = relationValue(comment.mountains);
      const trail = relationValue(comment.trails);
      const subject = mountain?.name ?? trail?.name ?? 'a hiking guide';
      const slug = mountain?.slug;

      return {
        id: `comment-${comment.id}`,
        type: 'comment',
        title: `Commented on ${subject}`,
        date: comment.created_at,
        detail: `${formatStatus(comment.status)} comment`,
        to: slug ? `/mountains/${slug}` : null,
      };
    });
    const recommendations = accountData.hikes.map((hike) => ({
      id: `recommendation-${hike.id}`,
      type: 'recommendation',
      title: `Recommended ${hike.title}`,
      date: hike.created_at,
      detail: `${formatStatus(hike.status)} recommendation`,
      to: '/account?section=contribute',
    }));

    return [...checkIns, ...comments, ...recommendations]
      .filter((activity) => activity.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [accountData.checkIns, accountData.comments, accountData.hikes]);

  const contributionPreview = useMemo(() => {
    const comments = accountData.comments.map((comment) => {
      const mountain = relationValue(comment.mountains);
      const trail = relationValue(comment.trails);
      const subject = mountain?.name ?? trail?.name ?? 'a hiking guide';

      return {
        id: `comment-${comment.id}`,
        title: `Commented on ${subject}`,
        date: comment.created_at,
        status: comment.status,
        label: `${formatStatus(comment.status)} comment`,
      };
    });
    const recommendations = accountData.hikes.map((hike) => ({
      id: `recommendation-${hike.id}`,
      title: `Recommended ${hike.title}`,
      date: hike.created_at,
      status: hike.status,
      label: `${formatStatus(hike.status)} recommendation`,
    }));

    return [...comments, ...recommendations]
      .filter((activity) => activity.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [accountData.comments, accountData.hikes]);

  const exploreGuides = useMemo(() => {
    const completedMountainIds = new Set(approvedCheckIns.map((checkIn) => checkIn.mountain_id));

    return accountData.guides.mountains
      .filter((mountain) => mountain.published !== false && !completedMountainIds.has(mountain.id))
      .map((mountain) => ({
        mountain,
        trail: accountData.guides.trails.find(
          (trail) => trail.mountainId === mountain.id && trail.published !== false,
        ),
      }))
      .slice(0, 3);
  }, [accountData.guides, approvedCheckIns]);

  function updateProfileForm(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileStatus({ type: 'idle', message: '' });
  }

  function updateHikeForm(field, value) {
    setHikeForm((current) => ({ ...current, [field]: value }));
    setHikeStatus({ type: 'idle', message: '' });
  }

  function selectSection(nextSection) {
    if (nextSection === accountSection) {
      return;
    }

    if (
      ((accountSection === 'profile' && profileHasChanges) ||
        (accountSection === 'contribute' && hikeHasChanges)) &&
      !window.confirm('Discard your unsaved changes and open another account section?')
    ) {
      return;
    }

    if (accountSection === 'profile' && profileHasChanges) {
      setProfileForm(profileFormFromProfile(accountData.profile));
      setProfileTouched({});
    }
    if (accountSection === 'contribute' && hikeHasChanges) {
      setHikeForm(initialHikeForm);
    }

    setAccountSection(nextSection);
    setSearchParams(nextSection === 'overview' ? {} : { section: nextSection }, { replace: true });
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();
    setProfileTouched({ displayName: true, username: true, bio: true });

    if (Object.keys(profileValidation).length > 0) {
      setProfileStatus({ type: 'error', message: 'Review the highlighted profile fields.' });
      return;
    }

    setProfileStatus({ type: 'loading', message: '' });

    try {
      const updatedProfile = await updateProfile(userId, {
        display_name: profileForm.displayName.trim(),
        username: profileForm.username.trim().replace(/^@/, '') || null,
        bio: profileForm.bio.trim() || null,
      });
      setProfileForm(profileFormFromProfile(updatedProfile));
      setProfileTouched({});
      setAccountData((current) => ({
        ...current,
        profile: updatedProfile,
        leaderboard: current.leaderboard.map((entry) =>
          entry.user_id === userId ? { ...entry, display_name: updatedProfile.display_name } : entry,
        ),
      }));
      setProfileStatus({ type: 'success', message: 'Your profile has been updated.' });
    } catch (error) {
      setProfileStatus({
        type: 'error',
        message: friendlyMutationError(error, 'We could not save your profile. Please try again.'),
      });
    }
  }

  async function handleHikeSubmit(event) {
    event.preventDefault();
    const title = hikeForm.title.trim();

    if (title.length < 4) {
      setHikeStatus({ type: 'error', message: 'Use a clear title with at least 4 characters.' });
      return;
    }

    setHikeStatus({ type: 'loading', message: '' });

    try {
      const createdHike = await createUserHike({
        user_id: userId,
        title,
        body: hikeForm.body.trim() || null,
        difficulty: hikeForm.difficulty,
        status: 'pending',
      });
      setAccountData((current) => ({ ...current, hikes: [createdHike, ...current.hikes] }));
      setHikeForm(initialHikeForm);
      setHikeStatus({
        type: 'success',
        message: 'Your hike recommendation has been sent for review.',
      });
    } catch (error) {
      setHikeStatus({
        type: 'error',
        message: friendlyMutationError(error, 'We could not send your recommendation. Please try again.'),
      });
    }
  }

  async function handleSignOut() {
    if ((profileHasChanges || hikeHasChanges) && !window.confirm('Sign out and discard your unsaved changes?')) {
      return;
    }

    setSessionStatus({ type: 'loading', message: '' });

    try {
      await signOut();
    } catch (error) {
      setSessionStatus({
        type: 'error',
        message: friendlyMutationError(error, 'We could not sign you out. Please try again.'),
      });
    }
  }

  function reloadAccount() {
    if (profileHasChanges || hikeHasChanges) {
      return;
    }
    setReloadKey((current) => current + 1);
  }

  const activityErrors = accountData.errors.checkIns || accountData.errors.comments || accountData.errors.hikes;
  const visibleSummits = showAllSummits ? summitCollection : summitCollection.slice(0, 6);

  return (
    <Page>
      <Seo
        title="Your Lofoten adventures"
        description="Review your private Lofoten Peaks hiking progress and manage your account."
        canonicalPath="/account"
        noIndex
      />
      <PageIntro>
        <h1>{firstName ? `Welcome back, ${firstName}` : 'Your Lofoten adventures'}</h1>
        <p>Track your summits, revisit your hikes, and continue exploring Lofoten.</p>
      </PageIntro>

      <Dashboard>
        <ProfileHeader aria-labelledby="profile-identity-heading">
          <ProfileIdentity>
            <ProfileAvatar name={publicDisplayName} src={avatarUrl} />
            <IdentityCopy>
              <h2 id="profile-identity-heading">{publicDisplayName}</h2>
              {accountData.profile?.username && publicDisplayName !== accountData.profile.username && (
                <p>@{accountData.profile.username}</p>
              )}
              {accountData.profile?.bio && <p>{accountData.profile.bio}</p>}
              <IdentityMeta>
                {accountData.profile?.created_at && (
                  <span>
                    <CalendarDays size={15} aria-hidden="true" /> Member since{' '}
                    {formatDate(accountData.profile.created_at)}
                  </span>
                )}
                <span>
                  <ShieldCheck size={15} aria-hidden="true" /> Signed-in account dashboard
                </span>
              </IdentityMeta>
            </IdentityCopy>
          </ProfileIdentity>
          <HeaderActions>
            <PrimaryButton type="button" onClick={() => selectSection('profile')}>
              <UserCircle size={18} aria-hidden="true" /> Edit profile
            </PrimaryButton>
            <SecondaryButton
              type="button"
              disabled={accountData.isLoading || profileHasChanges || hikeHasChanges}
              title={profileHasChanges || hikeHasChanges ? 'Save or discard changes before refreshing.' : undefined}
              onClick={reloadAccount}
            >
              <RefreshCw size={18} aria-hidden="true" /> Refresh
            </SecondaryButton>
          </HeaderActions>
        </ProfileHeader>

        {sessionStatus.message && (
          <Message $error={sessionStatus.type === 'error'} role="alert" aria-live="assertive">
            {sessionStatus.message}
          </Message>
        )}

        <AccountNav role="tablist" aria-label="Account sections">
          <AccountNavButton
            id="account-tab-overview"
            role="tab"
            type="button"
            $active={accountSection === 'overview'}
            aria-selected={accountSection === 'overview'}
            aria-controls="account-panel-overview"
            onClick={() => selectSection('overview')}
          >
            Overview
          </AccountNavButton>
          <AccountNavButton
            id="account-tab-profile"
            role="tab"
            type="button"
            $active={accountSection === 'profile'}
            aria-selected={accountSection === 'profile'}
            aria-controls="account-panel-profile"
            onClick={() => selectSection('profile')}
          >
            Profile
          </AccountNavButton>
          <AccountNavButton
            id="account-tab-contribute"
            role="tab"
            type="button"
            $active={accountSection === 'contribute'}
            aria-selected={accountSection === 'contribute'}
            aria-controls="account-panel-contribute"
            onClick={() => selectSection('contribute')}
          >
            Recommend
          </AccountNavButton>
        </AccountNav>

        {accountSection === 'overview' && (
          <TabPanel
            id="account-panel-overview"
            role="tabpanel"
            aria-labelledby="account-tab-overview"
            tabIndex="0"
          >
            <Section aria-labelledby="progress-heading">
              <SectionHeader>
                <div>
                  <h2 id="progress-heading">Your progress</h2>
                  <p>A concise view of your approved summit visits and community activity.</p>
                </div>
              </SectionHeader>
              <Stats>
                <div>
                  <dt>Summits reached</dt>
                  <dd>{accountData.isLoading ? '-' : accountStats.summits}</dd>
                </div>
                <div>
                  <dt>Total check-ins</dt>
                  <dd>{accountData.isLoading ? '-' : accountStats.checkIns}</dd>
                </div>
                <div>
                  <dt>Points</dt>
                  <dd>{accountData.isLoading ? '-' : accountStats.points}</dd>
                  <small>Earned from approved summit check-ins.</small>
                </div>
                <div>
                  <dt>Recommendations</dt>
                  <dd>{accountData.isLoading ? '-' : accountStats.recommendations}</dd>
                  <small>Hike recommendations sent for review.</small>
                </div>
              </Stats>
            </Section>

            <Section aria-labelledby="summits-heading">
              <SectionHeader>
                <div>
                  <h2 id="summits-heading">Your summit collection</h2>
                  <p>Mountains where you have completed an approved summit check-in.</p>
                </div>
              </SectionHeader>
              {accountData.isLoading && (
                <LoadingGrid aria-label="Loading your summit collection" role="status">
                  <LoadingBlock aria-hidden="true" />
                  <LoadingBlock aria-hidden="true" />
                  <LoadingBlock aria-hidden="true" />
                </LoadingGrid>
              )}
              {!accountData.isLoading && accountData.errors.checkIns && (
                <LoadError $error role="alert">
                  <span>{accountData.errors.checkIns} Please try again.</span>
                  <SecondaryButton type="button" onClick={reloadAccount}>
                    <RefreshCw size={17} aria-hidden="true" /> Retry
                  </SecondaryButton>
                </LoadError>
              )}
              {!accountData.isLoading && !accountData.errors.checkIns && summitCollection.length === 0 && (
                <EmptyState>
                  <h3>Your first summit is waiting</h3>
                  <p>Explore a hiking guide and check in when you reach the summit.</p>
                  <PrimaryButton as={Link} to="/mountains">
                    <Compass size={18} aria-hidden="true" /> Find a hike
                  </PrimaryButton>
                </EmptyState>
              )}
              {!accountData.isLoading && !accountData.errors.checkIns && summitCollection.length > 0 && (
                <>
                  <SummitGrid>
                    {visibleSummits.map((summit) => (
                      <ProfileSummitCard key={summit.slug} summit={summit} />
                    ))}
                  </SummitGrid>
                  {summitCollection.length > 6 && (
                    <SecondaryButton type="button" onClick={() => setShowAllSummits((current) => !current)}>
                      {showAllSummits ? 'Show fewer summits' : 'View all summits'}
                    </SecondaryButton>
                  )}
                </>
              )}
            </Section>

            <Section aria-labelledby="activity-heading">
              <SectionHeader>
                <div>
                  <h2 id="activity-heading">Recent activity</h2>
                  <p>Your latest check-ins, comments, and hike recommendations.</p>
                </div>
              </SectionHeader>
              <TwoColumnLayout>
                <ActivityPanel>
                  <h3>Latest updates</h3>
                  {accountData.isLoading && <p role="status">Loading recent activity...</p>}
                  {!accountData.isLoading && activityErrors && (
                    <Message $error role="alert">Some recent activity could not be loaded.</Message>
                  )}
                  {!accountData.isLoading && recentActivity.length === 0 && (
                    <EmptyState>
                      <h3>Build your hiking history</h3>
                      <p>Your check-ins and contributions will appear here as you explore Lofoten.</p>
                      <TextAction to="/mountains">
                        Explore hikes <ArrowRight size={17} aria-hidden="true" />
                      </TextAction>
                    </EmptyState>
                  )}
                  {!accountData.isLoading && recentActivity.length > 0 && (
                    <ActivityList>
                      {recentActivity.map((activity) => (
                        <ActivityItem key={activity.id}>
                          <ActivityIcon $type={activity.type} aria-hidden="true">
                            {activity.type === 'check-in' ? (
                              <CheckCircle2 size={19} />
                            ) : activity.type === 'comment' ? (
                              <MessageSquare size={18} />
                            ) : (
                              <FileText size={18} />
                            )}
                          </ActivityIcon>
                          <ActivityCopy>
                            {activity.to ? <Link to={activity.to}>{activity.title}</Link> : <strong>{activity.title}</strong>}
                            <p>{formatDate(activity.date)} | {activity.detail}</p>
                          </ActivityCopy>
                        </ActivityItem>
                      ))}
                    </ActivityList>
                  )}
                </ActivityPanel>
                {accountData.errors.leaderboard ? (
                  <ActivityPanel>
                    <h3>Leaderboard</h3>
                    <Message $error role="alert">{accountData.errors.leaderboard}</Message>
                  </ActivityPanel>
                ) : (
                  <LeaderboardPanel entries={accountData.leaderboard} isLoading={accountData.isLoading} />
                )}
              </TwoColumnLayout>
            </Section>

            <Section aria-labelledby="contributions-heading">
              <SectionHeader>
                <div>
                  <h2 id="contributions-heading">Your contributions</h2>
                  <p>Comments and route ideas you have shared with Lofoten Peaks.</p>
                </div>
                {accountData.hikes.length > 0 && (
                  <SecondaryButton type="button" onClick={() => selectSection('contribute')}>
                    View recommendations
                  </SecondaryButton>
                )}
              </SectionHeader>
              {!accountData.isLoading && (accountData.errors.comments || accountData.errors.hikes) && (
                <Message $error role="alert">
                  Some contributions could not be loaded. Refresh the page to try again.
                </Message>
              )}
              {!accountData.isLoading && !accountData.errors.comments && !accountData.errors.hikes && contributionPreview.length === 0 && (
                <EmptyState>
                  <h3>Share local hiking knowledge</h3>
                  <p>Recommend a hike for review or add a useful comment to an existing guide.</p>
                  <PrimaryButton type="button" onClick={() => selectSection('contribute')}>
                    <MapIcon size={18} aria-hidden="true" /> Recommend a hike
                  </PrimaryButton>
                </EmptyState>
              )}
              {!accountData.isLoading && contributionPreview.length > 0 && (
                <ContributionGrid>
                  {contributionPreview.map((activity) => (
                    <ContributionCard key={activity.id}>
                      <StatusBadge $status={activity.status}>
                        {activity.label}
                      </StatusBadge>
                      <h3>{activity.title}</h3>
                      <p>{formatDate(activity.date)}</p>
                    </ContributionCard>
                  ))}
                </ContributionGrid>
              )}
            </Section>

            <Section aria-labelledby="explore-heading">
              <SectionHeader>
                <div>
                  <h2 id="explore-heading">Continue exploring</h2>
                  <p>Published Lofoten hiking guides not yet in your summit collection.</p>
                </div>
                <TextAction to="/mountains">
                  Explore more hikes <ArrowRight size={17} aria-hidden="true" />
                </TextAction>
              </SectionHeader>
              {exploreGuides.length > 0 ? (
                <ExploreGrid>
                  {exploreGuides.map(({ mountain, trail }) => (
                    <MountainCard key={mountain.id} mountain={mountain} trail={trail} headingLevel={3} />
                  ))}
                </ExploreGrid>
              ) : (
                <EmptyState>
                  <h3>Choose your next Lofoten hike</h3>
                  <p>Browse all published guides and find a route that suits today&apos;s conditions.</p>
                  <PrimaryButton as={Link} to="/mountains">
                    <Compass size={18} aria-hidden="true" /> Explore hikes
                  </PrimaryButton>
                </EmptyState>
              )}
            </Section>
          </TabPanel>
        )}

        {accountSection === 'profile' && (
          <TabPanel
            id="account-panel-profile"
            role="tabpanel"
            aria-labelledby="account-tab-profile"
            tabIndex="0"
          >
            <ToolGrid>
              <ToolCard>
                <ToolIntro>
                  <h2>Edit profile</h2>
                  <p>Your display name, username, and bio are stored as public profile details.</p>
                </ToolIntro>
                {!accountData.isLoading && accountData.errors.profile && (
                  <Message $error role="alert">{accountData.errors.profile} Refresh before editing.</Message>
                )}
                <Form onSubmit={handleProfileUpdate} noValidate>
                  <FormFields>
                    <Field $invalid={profileTouched.displayName && profileValidation.displayName}>
                      <label htmlFor="profile-display-name">Display name</label>
                      <input
                        id="profile-display-name"
                        type="text"
                        required
                        minLength="2"
                        maxLength="60"
                        autoComplete="name"
                        value={profileForm.displayName}
                        disabled={
                          accountData.isLoading || !accountData.profileLoaded || profileStatus.type === 'loading'
                        }
                        aria-invalid={Boolean(profileTouched.displayName && profileValidation.displayName)}
                        aria-describedby="profile-display-name-help profile-display-name-error"
                        onBlur={() => setProfileTouched((current) => ({ ...current, displayName: true }))}
                        onChange={(event) => updateProfileForm('displayName', event.target.value)}
                      />
                      <small id="profile-display-name-help">Shown on comments and the leaderboard. Do not use your email.</small>
                      {profileTouched.displayName && profileValidation.displayName && (
                        <FieldError id="profile-display-name-error">{profileValidation.displayName}</FieldError>
                      )}
                    </Field>
                    <Field $invalid={profileTouched.username && profileValidation.username}>
                      <label htmlFor="profile-username">Username</label>
                      <input
                        id="profile-username"
                        type="text"
                        minLength="3"
                        maxLength="24"
                        autoComplete="username"
                        value={profileForm.username}
                        disabled={
                          accountData.isLoading || !accountData.profileLoaded || profileStatus.type === 'loading'
                        }
                        aria-invalid={Boolean(profileTouched.username && profileValidation.username)}
                        aria-describedby="profile-username-help profile-username-error"
                        onBlur={() => setProfileTouched((current) => ({ ...current, username: true }))}
                        onChange={(event) => updateProfileForm('username', event.target.value)}
                      />
                      <small id="profile-username-help">Optional. Use 3-24 letters, numbers, or underscores.</small>
                      {profileTouched.username && profileValidation.username && (
                        <FieldError id="profile-username-error">{profileValidation.username}</FieldError>
                      )}
                    </Field>
                    <FullField>
                      <label htmlFor="profile-bio">Biography</label>
                      <textarea
                        id="profile-bio"
                        maxLength="280"
                        value={profileForm.bio}
                        disabled={
                          accountData.isLoading || !accountData.profileLoaded || profileStatus.type === 'loading'
                        }
                        aria-describedby="profile-bio-help"
                        onChange={(event) => updateProfileForm('bio', event.target.value)}
                      />
                      <small id="profile-bio-help">A short public introduction about your hiking interests. {profileForm.bio.length}/280 characters.</small>
                    </FullField>
                  </FormFields>
                  <ButtonRow>
                    <PrimaryButton
                      type="submit"
                      disabled={
                        accountData.isLoading ||
                        !accountData.profileLoaded ||
                        !profileHasChanges ||
                        profileStatus.type === 'loading'
                      }
                    >
                      <Save size={18} aria-hidden="true" />
                      {profileStatus.type === 'loading' ? 'Saving...' : 'Save profile'}
                    </PrimaryButton>
                    <SecondaryButton
                      type="button"
                      disabled={!profileHasChanges || profileStatus.type === 'loading'}
                      onClick={() => {
                        setProfileForm(profileFormFromProfile(accountData.profile));
                        setProfileTouched({});
                        setProfileStatus({ type: 'idle', message: '' });
                      }}
                    >
                      Cancel
                    </SecondaryButton>
                  </ButtonRow>
                  {profileStatus.message && (
                    <Message
                      $error={profileStatus.type === 'error'}
                      role={profileStatus.type === 'error' ? 'alert' : 'status'}
                      aria-live="polite"
                    >
                      {profileStatus.message}
                    </Message>
                  )}
                </Form>
              </ToolCard>

              <ToolStack>
                <ToolCard>
                  <ToolIntro>
                    <h2>Account settings</h2>
                    <p>Private details used to access your account.</p>
                  </ToolIntro>
                  <AccountDetails>
                    <div>
                      <dt>Email address</dt>
                      <dd>{user.email}</dd>
                    </div>
                    <div>
                      <dt>Email status</dt>
                      <dd>{user.email_confirmed_at ? 'Verified' : 'Confirmation pending'}</dd>
                    </div>
                  </AccountDetails>
                  <Message>
                    <ShieldCheck size={18} aria-hidden="true" /> Your email is private and is not shown on public community features.
                  </Message>
                  <SecondaryButton
                    type="button"
                    disabled={sessionStatus.type === 'loading'}
                    onClick={handleSignOut}
                  >
                    <LogOut size={18} aria-hidden="true" />
                    {sessionStatus.type === 'loading' ? 'Signing out...' : 'Sign out'}
                  </SecondaryButton>
                </ToolCard>
                <DangerCard>
                  <ToolIntro>
                    <h3>Delete your account</h3>
                    <p>Self-service deletion is not available yet. Send a deletion request to the privacy contact.</p>
                  </ToolIntro>
                  <SecondaryButton as="a" href="mailto:privacy@lofotenpeaks.no?subject=Account%20deletion%20request">
                    Request account deletion
                  </SecondaryButton>
                </DangerCard>
              </ToolStack>
            </ToolGrid>
          </TabPanel>
        )}

        {accountSection === 'contribute' && (
          <TabPanel
            id="account-panel-contribute"
            role="tabpanel"
            aria-labelledby="account-tab-contribute"
            tabIndex="0"
          >
            <ToolGrid>
              <ToolCard>
                <ToolIntro>
                  <h2>Recommend a hike</h2>
                  <p>Share a route idea for review. It will not appear publicly unless an administrator approves it.</p>
                </ToolIntro>
                <Form onSubmit={handleHikeSubmit}>
                  <Field>
                    <label htmlFor="hike-title">Hike title</label>
                    <input
                      id="hike-title"
                      type="text"
                      required
                      minLength="4"
                      maxLength="80"
                      value={hikeForm.title}
                      disabled={accountData.isLoading || hikeStatus.type === 'loading'}
                      aria-describedby="hike-title-help"
                      onChange={(event) => updateHikeForm('title', event.target.value)}
                    />
                    <small id="hike-title-help">Use a clear mountain, route, or viewpoint name.</small>
                  </Field>
                  <Field>
                    <label htmlFor="hike-difficulty">Suggested difficulty</label>
                    <select
                      id="hike-difficulty"
                      value={hikeForm.difficulty}
                      disabled={accountData.isLoading || hikeStatus.type === 'loading'}
                      onChange={(event) => updateHikeForm('difficulty', event.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </Field>
                  <Field>
                    <label htmlFor="hike-description">What should hikers know?</label>
                    <textarea
                      id="hike-description"
                      maxLength="1200"
                      value={hikeForm.body}
                      disabled={accountData.isLoading || hikeStatus.type === 'loading'}
                      aria-describedby="hike-description-help"
                      onChange={(event) => updateHikeForm('body', event.target.value)}
                    />
                    <small id="hike-description-help">Optional route conditions, access, season, or safety context. {hikeForm.body.length}/1200 characters.</small>
                  </Field>
                  <PrimaryButton
                    type="submit"
                    disabled={accountData.isLoading || hikeStatus.type === 'loading'}
                  >
                    <Send size={18} aria-hidden="true" />
                    {hikeStatus.type === 'loading' ? 'Sending...' : 'Send recommendation'}
                  </PrimaryButton>
                  {hikeStatus.message && (
                    <Message
                      $error={hikeStatus.type === 'error'}
                      role={hikeStatus.type === 'error' ? 'alert' : 'status'}
                      aria-live="polite"
                    >
                      {hikeStatus.message}
                    </Message>
                  )}
                </Form>
              </ToolCard>

              <ToolCard>
                <ToolIntro>
                  <h2>Your recommendations</h2>
                  <p>Review status for the hike ideas you have submitted.</p>
                </ToolIntro>
                {accountData.isLoading && <p role="status">Loading recommendations...</p>}
                {!accountData.isLoading && accountData.errors.hikes && (
                  <Message $error role="alert">{accountData.errors.hikes}</Message>
                )}
                {!accountData.isLoading && !accountData.errors.hikes && accountData.hikes.length === 0 && (
                  <EmptyState>
                    <h3>No recommendations yet</h3>
                    <p>Your submitted hike ideas will appear here with their review status.</p>
                  </EmptyState>
                )}
                {!accountData.isLoading && accountData.hikes.length > 0 && (
                  <SubmissionList>
                    {accountData.hikes.map((hike) => (
                      <li key={hike.id}>
                        <strong>{hike.title}</strong>
                        <SubmissionMeta>
                          <span>{formatStatus(hike.difficulty)} | {formatDate(hike.created_at)}</span>
                          <StatusBadge $status={hike.status}>{formatStatus(hike.status)}</StatusBadge>
                        </SubmissionMeta>
                        {hike.body && <p>{hike.body}</p>}
                      </li>
                    ))}
                  </SubmissionList>
                )}
              </ToolCard>
            </ToolGrid>
          </TabPanel>
        )}
      </Dashboard>
    </Page>
  );
}
