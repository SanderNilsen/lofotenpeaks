import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatElevation } from '../../lib/formatters.js';
import { theme } from '../../styles/theme.js';
import { DifficultyBadge } from '../common/Badge.jsx';

const Card = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  overflow: hidden;
`;

const Image = styled.img`
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
`;

const Body = styled.div`
  display: grid;
  gap: 12px;
  padding: 18px;
`;

const TitleRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;

  h2 {
    font-size: 1.25rem;
    margin: 0;
  }
`;

const Meta = styled.p`
  color: ${theme.colors.muted};
  margin: 0;
`;

const Summary = styled.p`
  line-height: 1.55;
  margin: 0;
`;

const CardLink = styled(Link)`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  text-decoration: none;
`;

export function MountainCard({ mountain }) {
  return (
    <Card>
      <Image src={mountain.heroImage.src} alt={mountain.heroImage.alt} />
      <Body>
        <TitleRow>
          <h2>{mountain.name}</h2>
          <DifficultyBadge difficulty={mountain.difficulty} />
        </TitleRow>
        <Meta>
          {formatElevation(mountain.heightMeters)} · {mountain.region}
        </Meta>
        <Summary>{mountain.summary}</Summary>
        <CardLink to={`/mountains/${mountain.slug}`}>
          View hiking guide <ArrowRight size={16} aria-hidden="true" />
        </CardLink>
      </Body>
    </Card>
  );
}
