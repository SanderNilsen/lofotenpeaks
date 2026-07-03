import { Trophy } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

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
`;

const List = styled.ol`
  counter-reset: leaderboard;
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Row = styled.li`
  align-items: center;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  counter-increment: leaderboard;
  display: grid;
  gap: 12px;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  padding: 12px;

  &::before {
    align-items: center;
    background: ${theme.colors.forest};
    border-radius: 50%;
    color: ${theme.colors.surface};
    content: counter(leaderboard);
    display: inline-flex;
    font-size: 0.85rem;
    font-weight: 900;
    height: 30px;
    justify-content: center;
    width: 30px;
  }
`;

const Person = styled.div`
  min-width: 0;

  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: ${theme.colors.muted};
    display: block;
    font-size: 0.86rem;
    font-weight: 700;
    margin-top: 2px;
  }
`;

const Points = styled.strong`
  font-size: 1rem;
  white-space: nowrap;
`;

const Empty = styled.p`
  color: ${theme.colors.muted};
  font-weight: 700;
  line-height: 1.55;
  margin: 0;
`;

export function LeaderboardPanel({ entries = [], isLoading = false }) {
  return (
    <Panel>
      <h2>
        <Trophy size={18} aria-hidden="true" /> Leaderboard
      </h2>
      {isLoading && <Empty>Loading leaderboard...</Empty>}
      {!isLoading && entries.length === 0 && <Empty>No check-ins yet. The first summit point is still open.</Empty>}
      {!isLoading && entries.length > 0 && (
        <List>
          {entries.map((entry) => {
            const completedMountains = entry.completed_mountains ?? 0;
            const mountainLabel = completedMountains === 1 ? 'mountain' : 'mountains';
            const checkInLabel = entry.check_in_count === 1 ? 'check-in' : 'check-ins';

            return (
              <Row key={entry.user_id}>
                <Person>
                  <strong>{entry.display_name}</strong>
                  <span>
                    {completedMountains} {mountainLabel} · {entry.check_in_count} {checkInLabel}
                  </span>
                </Person>
                <Points>{entry.points} pts</Points>
              </Row>
            );
          })}
        </List>
      )}
    </Panel>
  );
}
