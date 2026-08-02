import { ChevronLeft, ChevronRight, Search, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  LEADERBOARD_METRICS,
  LEADERBOARD_TIMEFRAMES,
} from '../../lib/community.js';
import { getSafePublicDisplayName } from '../../lib/profile.js';
import { getLeaderboard, getMyLeaderboardPosition } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';

const PREVIEW_LIMIT = 6;
const PAGE_SIZE = 20;

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 18px;
  min-width: 0;
  padding: ${({ $full }) => ($full ? '24px' : '18px')};

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const Header = styled.header`
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.25rem;
    gap: 9px;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
    margin: 7px 0 0;
    max-width: 650px;
  }

  a {
    color: ${theme.colors.forest};
    flex: 0 0 auto;
    font-weight: 800;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  a:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 4px;
  }

  @media (max-width: 640px) {
    display: grid;
  }
`;

const Controls = styled.div`
  display: grid;
  gap: 12px;
`;

const ControlGroup = styled.div`
  border: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  min-width: 0;
  padding: 0;

  legend {
    color: ${theme.colors.muted};
    float: left;
    font-size: 0.8rem;
    font-weight: 800;
    margin: 0 12px 0 0;
    padding: 9px 0;
    text-transform: uppercase;
  }
`;

const ControlButton = styled.button`
  background: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.surface)};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $active }) => ($active ? theme.colors.surface : theme.colors.ink)};
  cursor: pointer;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  min-height: 38px;
  padding: 7px 11px;

  &:hover {
    border-color: ${theme.colors.forest};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  max-width: 430px;

  label {
    position: absolute;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    white-space: nowrap;
    width: 1px;
  }

  input {
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    font: inherit;
    min-height: 42px;
    min-width: 0;
    padding: 9px 11px;
    width: 100%;
  }

  button {
    align-items: center;
    background: ${theme.colors.forest};
    border: 1px solid ${theme.colors.forest};
    border-radius: ${theme.radii.small};
    color: white;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    min-height: 42px;
    min-width: 42px;
  }

  input:focus-visible,
  button:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const Podium = styled.ol`
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  list-style: none;
  margin: 2px 0 0;
  padding: 0;

  @media (max-width: 700px) {
    display: none;
  }
`;

const PodiumCard = styled.li`
  background: ${({ $isCurrent }) => ($isCurrent ? '#edf7f1' : theme.colors.background)};
  border: 1px solid ${({ $isCurrent }) => ($isCurrent ? '#9cc9b8' : theme.colors.line)};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 10px;
  min-height: ${({ $rank }) => ($rank === 1 ? '178px' : '158px')};
  padding: 16px;
  text-align: center;

  ${({ $rank }) => $rank === 1 && 'grid-column: 2; grid-row: 1;'}
  ${({ $rank }) => $rank === 2 && 'grid-column: 1; grid-row: 1;'}
  ${({ $rank }) => $rank === 3 && 'grid-column: 3; grid-row: 1;'}
`;

const Rank = styled.strong`
  color: ${theme.colors.forest};
  font-size: 0.82rem;
  text-transform: uppercase;
`;

const Avatar = styled.span`
  align-items: center;
  background: #dce8e3;
  border: 1px solid #b8cec4;
  border-radius: 50%;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 900;
  height: ${({ $large }) => ($large ? '48px' : '38px')};
  justify-content: center;
  overflow: hidden;
  width: ${({ $large }) => ($large ? '48px' : '38px')};

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`;

const PodiumIdentity = styled.div`
  display: grid;
  gap: 6px;
  justify-items: center;
  min-width: 0;

  strong {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: ${theme.colors.muted};
    font-size: 0.84rem;
  }
`;

const YouLabel = styled.span`
  background: ${theme.colors.forest};
  border-radius: 999px;
  color: white !important;
  font-size: 0.7rem !important;
  font-weight: 900;
  padding: 3px 7px;
  text-transform: uppercase;
`;

const DesktopRows = styled.ol`
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 700px) {
    display: none;
  }
`;

const MobileRows = styled.ol`
  display: none;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 700px) {
    display: grid;
  }
`;

const Row = styled.li`
  align-items: center;
  background: ${({ $isCurrent, $pinned }) => ($isCurrent || $pinned ? '#edf7f1' : theme.colors.background)};
  border: 1px solid ${({ $isCurrent, $pinned }) => ($isCurrent || $pinned ? '#9cc9b8' : theme.colors.line)};
  border-radius: ${theme.radii.small};
  display: grid;
  gap: ${({ $compact }) => ($compact ? '10px' : '12px')};
  grid-template-columns: ${({ $compact }) => ($compact
    ? '32px 38px minmax(0, 1fr) auto'
    : '38px 42px minmax(130px, 1fr) repeat(3, minmax(72px, auto))')};
  min-height: 64px;
  min-width: 0;
  padding: ${({ $compact }) => ($compact ? '10px' : '10px 12px')};

  @media (max-width: 700px) {
    gap: 10px;
    grid-template-columns: 32px 38px minmax(0, 1fr) auto;
    padding: 10px;
  }
`;

const RankNumber = styled.strong`
  color: ${theme.colors.forest};
  text-align: center;
`;

const Person = styled.div`
  min-width: 0;

  strong {
    align-items: center;
    display: flex;
    gap: 7px;
    min-width: 0;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: ${theme.colors.muted};
    display: ${({ $compact }) => ($compact ? 'block' : 'none')};
    line-height: 1.4;
    margin-top: 2px;
  }

  @media (max-width: 700px) {
    small {
      display: block;
    }
  }
`;

const Stat = styled.span`
  display: ${({ $compact, $primary }) => ($compact && !$primary ? 'none' : 'grid')};
  font-size: 0.9rem;
  font-weight: 900;
  gap: 2px;
  text-align: right;
  white-space: nowrap;

  small {
    color: ${theme.colors.muted};
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  @media (max-width: 700px) {
    display: ${({ $primary }) => ($primary ? 'grid' : 'none')};
  }
`;

const StateMessage = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.muted};
  font-weight: 700;
  line-height: 1.55;
  padding: 16px;

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
    outline-offset: 3px;
  }
`;

const Position = styled.div`
  border-top: 1px solid ${theme.colors.line};
  display: grid;
  gap: 8px;
  padding-top: 14px;

  h3 {
    font-size: 0.9rem;
    margin: 0;
  }
`;

const PinnedList = styled.ol`
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Footer = styled.footer`
  align-items: center;
  border-top: 1px solid ${theme.colors.line};
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-top: 14px;

  p {
    color: ${theme.colors.muted};
    font-size: 0.86rem;
    line-height: 1.5;
    margin: 0;
  }
`;

const Pagination = styled.nav`
  align-items: center;
  display: flex;
  gap: 8px;

  button {
    align-items: center;
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    min-height: 40px;
    min-width: 40px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  button:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

function getInitials(name) {
  return getSafePublicDisplayName(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function LeaderAvatar({ entry, large = false }) {
  const name = getSafePublicDisplayName(entry.display_name);

  return (
    <Avatar $large={large} aria-label={`${name} avatar`}>
      {entry.avatar_url ? <img src={entry.avatar_url} alt="" /> : getInitials(name)}
    </Avatar>
  );
}

function metricValue(entry, metric) {
  return Number(entry?.[metric] ?? 0);
}

function metricShortLabel(metric) {
  if (metric === 'unique_summits') return 'summits';
  if (metric === 'approved_check_ins') return 'check-ins';
  return 'pts';
}

function LeaderRow({ entry, currentUserId, metric, pinned = false, compact = false }) {
  const isCurrent = entry.user_id === currentUserId;
  const displayName = getSafePublicDisplayName(entry.display_name);

  return (
    <Row $isCurrent={isCurrent} $pinned={pinned} $compact={compact}>
      <RankNumber aria-label={`Rank ${entry.rank}`}>{entry.rank}</RankNumber>
      <LeaderAvatar entry={entry} />
      <Person $compact={compact}>
        <strong>
          <span className="name">{displayName}</span>
          {isCurrent && <YouLabel>You</YouLabel>}
        </strong>
        <small>
          {entry.unique_summits} summits · {entry.approved_check_ins} approved check-ins
        </small>
      </Person>
      <Stat $compact={compact} $primary={metric === 'points'}>
        {entry.points}<small>Points</small>
      </Stat>
      <Stat $compact={compact} $primary={metric === 'unique_summits'}>
        {entry.unique_summits}<small>Summits</small>
      </Stat>
      <Stat $compact={compact} $primary={metric === 'approved_check_ins'}>
        {entry.approved_check_ins}<small>Check-ins</small>
      </Stat>
    </Row>
  );
}

function LeaderRows({ entries, currentUserId, metric, mobile = false, compact = false }) {
  const List = mobile ? MobileRows : DesktopRows;
  return (
    <List>
      {entries.map((entry) => (
        <LeaderRow
          key={entry.user_id}
          entry={entry}
          currentUserId={currentUserId}
          metric={metric}
          compact={compact}
        />
      ))}
    </List>
  );
}

export function LeaderboardPanel({ currentUserId = null, full = false }) {
  const limit = full ? PAGE_SIZE : PREVIEW_LIMIT;
  const [timeframe, setTimeframe] = useState('all_time');
  const [metric, setMetric] = useState('points');
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState([]);
  const [myPosition, setMyPosition] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');

    Promise.allSettled([
      getLeaderboard({ timeframe, metric, limit, offset: page * limit, search }),
      currentUserId ? getMyLeaderboardPosition({ timeframe, metric }) : Promise.resolve(null),
    ]).then(([leadersResult, positionResult]) => {
      if (!active) return;

      if (leadersResult.status === 'rejected') {
        setEntries([]);
        setTotalCount(0);
        setStatus('error');
        return;
      }

      const nextEntries = leadersResult.value;
      setEntries(nextEntries);
      setTotalCount(Number(nextEntries[0]?.total_count ?? 0));
      setMyPosition(positionResult.status === 'fulfilled' ? positionResult.value : null);
      setStatus('ready');
    });

    return () => {
      active = false;
    };
  }, [currentUserId, limit, metric, page, reloadKey, search, timeframe]);

  const visibleUserIds = useMemo(() => new Set(entries.map((entry) => entry.user_id)), [entries]);
  const showPinnedPosition = myPosition && !visibleUserIds.has(myPosition.user_id);
  const showPodium = full && page === 0 && !search && entries.length >= 3;
  const desktopEntries = showPodium ? entries.slice(3) : entries;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  function changeTimeframe(value) {
    setTimeframe(value);
    setPage(0);
  }

  function changeMetric(value) {
    setMetric(value);
    setPage(0);
  }

  function submitSearch(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  }

  return (
    <Panel $full={full} aria-labelledby="leaderboard-heading" aria-busy={status === 'loading'}>
      <Header>
        <div>
          <h2 id="leaderboard-heading"><Trophy size={19} aria-hidden="true" /> Leaderboard</h2>
          {full && <p>Approved summit check-ins determine every position. Choose a period and the measure that matters to you.</p>}
        </div>
        {!full && <Link to="/leaderboard">View full leaderboard</Link>}
      </Header>

      <Controls>
        <ControlGroup as="fieldset">
          <legend>Period</legend>
          {LEADERBOARD_TIMEFRAMES.map((option) => (
            <ControlButton
              key={option.value}
              type="button"
              $active={timeframe === option.value}
              aria-pressed={timeframe === option.value}
              onClick={() => changeTimeframe(option.value)}
            >
              {option.label}
            </ControlButton>
          ))}
        </ControlGroup>
        <ControlGroup as="fieldset">
          <legend>Rank by</legend>
          {LEADERBOARD_METRICS.map((option) => (
            <ControlButton
              key={option.value}
              type="button"
              $active={metric === option.value}
              aria-pressed={metric === option.value}
              onClick={() => changeMetric(option.value)}
            >
              {option.label}
            </ControlButton>
          ))}
        </ControlGroup>
        {full && (
          <SearchForm onSubmit={submitSearch} role="search">
            <label htmlFor="leaderboard-search">Search display names</label>
            <input
              id="leaderboard-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search display names"
              maxLength={60}
            />
            <button type="submit" aria-label="Search leaderboard"><Search size={18} aria-hidden="true" /></button>
          </SearchForm>
        )}
      </Controls>

      {status === 'loading' && <StateMessage role="status"><p>Loading leaderboard...</p></StateMessage>}
      {status === 'error' && (
        <StateMessage role="alert">
          <p>We couldn’t load the leaderboard. Please try again.</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)}>Try again</button>
        </StateMessage>
      )}
      {status === 'ready' && entries.length === 0 && (
        <StateMessage>
          <p>{search ? 'No hikers match that display name.' : 'No approved check-ins are available for this period yet.'}</p>
        </StateMessage>
      )}
      {status === 'ready' && entries.length > 0 && (
        <>
          {showPodium && (
            <Podium aria-label="Top three hikers">
              {entries.slice(0, 3).map((entry) => {
                const isCurrent = entry.user_id === currentUserId;
                return (
                  <PodiumCard key={entry.user_id} $rank={Number(entry.rank)} $isCurrent={isCurrent}>
                    <Rank>Rank {entry.rank}</Rank>
                    <PodiumIdentity>
                      <LeaderAvatar entry={entry} large />
                      <strong>{getSafePublicDisplayName(entry.display_name)}</strong>
                      {isCurrent && <YouLabel>You</YouLabel>}
                      <span>{metricValue(entry, metric)} {metricShortLabel(metric)}</span>
                    </PodiumIdentity>
                  </PodiumCard>
                );
              })}
            </Podium>
          )}
          <LeaderRows
            entries={desktopEntries}
            currentUserId={currentUserId}
            metric={metric}
            compact={!full}
          />
          <LeaderRows
            entries={entries}
            currentUserId={currentUserId}
            metric={metric}
            mobile
            compact={!full}
          />
        </>
      )}

      {status === 'ready' && showPinnedPosition && (
        <Position>
          <h3>Your position</h3>
          <PinnedList>
            <LeaderRow
              entry={myPosition}
              currentUserId={currentUserId}
              metric={metric}
              pinned
              compact={!full}
            />
          </PinnedList>
        </Position>
      )}

      {full && status === 'ready' && entries.length > 0 && (
        <Footer>
          <p>
            Points come from approved summit check-ins. Repeat visits add check-ins and points, while each peak counts once under unique summits.
          </p>
          {totalPages > 1 && (
            <Pagination aria-label="Leaderboard pages">
              <button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} aria-label="Previous page">
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <span aria-live="polite">{page + 1} / {totalPages}</span>
              <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page">
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </Pagination>
          )}
        </Footer>
      )}
    </Panel>
  );
}
