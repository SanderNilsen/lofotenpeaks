import styled from 'styled-components';
import { theme } from '../../styles/theme.js';
import { titleCase } from '../../lib/formatters.js';

const BadgeBase = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: ${theme.radii.small};
  background: ${({ $tone }) => $tone.background};
  color: ${({ $tone }) => $tone.color};
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  padding: 7px 9px;
  text-transform: uppercase;
`;

const tones = {
  easy: { background: '#e4efe5', color: '#24513b' },
  moderate: { background: '#e7eef3', color: theme.colors.fjord },
  hard: { background: '#f2e6dc', color: theme.colors.warning },
  expert: { background: '#ebe4e4', color: '#743737' },
};

export function DifficultyBadge({ difficulty }) {
  return (
    <BadgeBase $tone={tones[difficulty] ?? tones.moderate}>
      {titleCase(difficulty)}
    </BadgeBase>
  );
}
