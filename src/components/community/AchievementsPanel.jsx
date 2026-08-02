import {
  CalendarCheck,
  Check,
  Crown,
  Flag,
  Footprints,
  Lock,
  MapPinned,
  MessageCircle,
  Mountain,
  Pickaxe,
  Repeat2,
  Telescope,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { BADGE_FILTERS, BADGE_STATES } from '../../lib/community.js';
import { acknowledgeMyBadges, getMyBadges } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';

const iconByName = {
  flag: Flag,
  footprints: Footprints,
  mountain: Mountain,
  telescope: Telescope,
  crown: Crown,
  pickaxe: Pickaxe,
  'calendar-check': CalendarCheck,
  'message-circle': MessageCircle,
  'map-pinned': MapPinned,
  'repeat-2': Repeat2,
};

const Panel = styled.section`
  display: grid;
  gap: 18px;
`;

const Summary = styled.div`
  align-items: center;
  background: #e7eef3;
  border: 1px solid #cad9e3;
  border-radius: ${theme.radii.medium};
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 18px;

  strong {
    display: block;
    font-size: 1.15rem;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.5;
    margin: 4px 0 0;
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    display: grid;
  }
`;

const RecentList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    align-items: center;
    background: ${theme.colors.surface};
    border: 1px solid #b8cec4;
    border-radius: 999px;
    color: ${theme.colors.forest};
    display: inline-flex;
    font-size: 0.82rem;
    font-weight: 900;
    gap: 6px;
    padding: 7px 10px;
  }
`;

const Recent = styled.div`
  display: grid;
  gap: 7px;

  > span {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterButton = styled.button`
  background: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.surface)};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $active }) => ($active ? theme.colors.surface : theme.colors.ink)};
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  min-height: 40px;
  padding: 8px 12px;

  &:hover {
    border-color: ${theme.colors.forest};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 880px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const BadgeCard = styled.article`
  background: ${({ $state }) => ($state === BADGE_STATES.UNLOCKED ? '#edf7f1' : theme.colors.surface)};
  border: 1px solid ${({ $state }) => ($state === BADGE_STATES.UNLOCKED ? '#9cc9b8' : theme.colors.line)};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 12px;
  min-height: 205px;
  opacity: ${({ $state }) => ($state === BADGE_STATES.LOCKED ? 0.72 : 1)};
  padding: 16px;
`;

const BadgeHeader = styled.header`
  align-items: flex-start;
  display: flex;
  gap: 12px;
`;

const IconFrame = styled.span`
  align-items: center;
  background: ${({ $state }) => ($state === BADGE_STATES.UNLOCKED ? theme.colors.forest : theme.colors.background)};
  border: 1px solid ${({ $state }) => ($state === BADGE_STATES.UNLOCKED ? theme.colors.forest : theme.colors.line)};
  border-radius: 50%;
  color: ${({ $state }) => ($state === BADGE_STATES.UNLOCKED ? theme.colors.surface : theme.colors.muted)};
  display: inline-flex;
  flex: 0 0 auto;
  height: 42px;
  justify-content: center;
  width: 42px;
`;

const BadgeTitle = styled.div`
  min-width: 0;

  h3 {
    font-size: 1rem;
    line-height: 1.25;
    margin: 0;
  }

  span {
    align-items: center;
    color: ${theme.colors.muted};
    display: inline-flex;
    font-size: 0.76rem;
    font-weight: 800;
    gap: 4px;
    margin-top: 5px;
    text-transform: uppercase;
  }
`;

const Description = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
`;

const Progress = styled.div`
  align-self: end;
  display: grid;
  gap: 7px;

  span {
    color: ${theme.colors.muted};
    font-size: 0.82rem;
    font-weight: 800;
  }
`;

const ProgressTrack = styled.div`
  background: #e5e2dc;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;

  div {
    background: ${theme.colors.forest};
    height: 100%;
    width: ${({ $percent }) => `${$percent}%`};
  }
`;

const EarnedDate = styled.p`
  align-self: end;
  color: ${theme.colors.forest};
  font-size: 0.82rem;
  font-weight: 900;
  margin: 0;
`;

const StateMessage = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  line-height: 1.55;
  padding: 18px;

  p {
    margin: 0;
  }

  button {
    background: none;
    border: 0;
    color: ${theme.colors.forest};
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    margin-top: 8px;
    padding: 0;
  }

  button:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const ViewButton = styled.button`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  justify-self: start;
  min-height: 42px;
  padding: 9px 13px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const AwardNotice = styled.p`
  background: #edf7f1;
  border: 1px solid #9cc9b8;
  border-radius: ${theme.radii.small};
  color: ${theme.colors.forest};
  font-weight: 800;
  line-height: 1.5;
  margin: 0;
  padding: 12px 14px;
`;

function formatEarnedDate(value) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function stateLabel(state) {
  if (state === BADGE_STATES.UNLOCKED) return 'Earned';
  if (state === BADGE_STATES.IN_PROGRESS) return 'In progress';
  return 'Locked';
}

function AchievementCard({ badge }) {
  const Icon = iconByName[badge.icon_name] ?? Mountain;
  const progress = Math.min(Number(badge.current_progress) || 0, Number(badge.target) || 1);
  const percent = Math.min(100, Math.round((progress / Number(badge.target || 1)) * 100));

  return (
    <BadgeCard $state={badge.badge_state}>
      <BadgeHeader>
        <IconFrame $state={badge.badge_state} aria-hidden="true"><Icon size={21} /></IconFrame>
        <BadgeTitle>
          <h3>{badge.name}</h3>
          <span>
            {badge.badge_state === BADGE_STATES.UNLOCKED && <Check size={13} aria-hidden="true" />}
            {badge.badge_state === BADGE_STATES.LOCKED && <Lock size={13} aria-hidden="true" />}
            {stateLabel(badge.badge_state)}
          </span>
        </BadgeTitle>
      </BadgeHeader>
      <Description>{badge.description}</Description>
      {badge.badge_state === BADGE_STATES.UNLOCKED && badge.earned_at ? (
        <EarnedDate>Earned {formatEarnedDate(badge.earned_at)}</EarnedDate>
      ) : (
        <Progress>
          <span>{progress} of {badge.target}</span>
          <ProgressTrack
            $percent={percent}
            role="progressbar"
            aria-label={`${badge.name} progress`}
            aria-valuemin="0"
            aria-valuemax={badge.target}
            aria-valuenow={progress}
          >
            <div aria-hidden="true" />
          </ProgressTrack>
        </Progress>
      )}
    </BadgeCard>
  );
}

export function AchievementsPanel({ currentUserId }) {
  const [badges, setBadges] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const acknowledged = useRef(new Set());

  useEffect(() => {
    if (!currentUserId) return undefined;
    let active = true;
    setStatus('loading');

    getMyBadges()
      .then((result) => {
        if (!active) return;
        setBadges(result);
        setStatus('ready');

        const newBadgeIds = result
          .filter((badge) => badge.is_new && !acknowledged.current.has(badge.badge_id))
          .map((badge) => badge.badge_id);

        if (newBadgeIds.length) {
          newBadgeIds.forEach((badgeId) => acknowledged.current.add(badgeId));
          acknowledgeMyBadges(newBadgeIds).catch(() => {});
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [currentUserId, reloadKey]);

  const earned = useMemo(
    () => badges.filter((badge) => badge.badge_state === BADGE_STATES.UNLOCKED),
    [badges],
  );
  const recentEarned = useMemo(
    () => [...earned].sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at)).slice(0, 3),
    [earned],
  );
  const newBadges = badges.filter((badge) => badge.is_new);
  const filtered = filter === 'all' ? badges : badges.filter((badge) => badge.badge_state === filter);
  const visible = showAll || filter !== 'all' ? filtered : filtered.slice(0, 6);

  return (
    <Panel aria-busy={status === 'loading'}>
      {newBadges.length > 0 && (
        <AwardNotice role="status" aria-live="polite">
          New badge earned: {newBadges.map((badge) => badge.name).join(', ')}.
        </AwardNotice>
      )}
      {status === 'loading' && <StateMessage role="status"><p>Loading achievements...</p></StateMessage>}
      {status === 'error' && (
        <StateMessage role="alert">
          <p>We couldn’t load your achievements. Please try again.</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>Try again</button>
        </StateMessage>
      )}
      {status === 'ready' && (
        <>
          <Summary>
            <div>
              <strong>{earned.length} of {badges.length} badges earned</strong>
              <p>Badges reflect approved hiking and community activity. There are no speed or weather-risk challenges.</p>
            </div>
            {recentEarned.length > 0 && (
              <Recent>
                <span>Recently earned</span>
                <RecentList>
                  {recentEarned.map((badge) => {
                    const Icon = iconByName[badge.icon_name] ?? Mountain;
                    return <li key={badge.badge_id}><Icon size={15} aria-hidden="true" /> {badge.name}</li>;
                  })}
                </RecentList>
              </Recent>
            )}
          </Summary>
          <Filters role="group" aria-label="Filter achievements">
            {BADGE_FILTERS.map((option) => (
              <FilterButton
                key={option.value}
                type="button"
                $active={filter === option.value}
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </FilterButton>
            ))}
          </Filters>
          {visible.length > 0 ? (
            <Grid>
              {visible.map((badge) => <AchievementCard key={badge.badge_id} badge={badge} />)}
            </Grid>
          ) : (
            <StateMessage><p>No badges match this filter yet.</p></StateMessage>
          )}
          {filter === 'all' && filtered.length > 6 && (
            <ViewButton type="button" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Show fewer badges' : 'View all badges'}
            </ViewButton>
          )}
        </>
      )}
    </Panel>
  );
}
