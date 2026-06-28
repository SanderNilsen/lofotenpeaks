import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { DifficultyBadge } from '../../components/common/Badge.jsx';
import { TrailMap } from '../../components/trails/TrailMap.jsx';
import { getMountainBySlug, mountains } from '../../data/mountains.js';
import { getTrailBySlug } from '../../data/trails.js';
import { formatDistance, formatElevation } from '../../lib/formatters.js';
import { theme } from '../../styles/theme.js';

const Page = styled.article`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 32px 24px 0;
`;

const BackLink = styled(Link)`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  margin-bottom: 20px;
  text-decoration: none;
`;

const Header = styled.header`
  display: grid;
  gap: 14px;
  margin-bottom: 24px;

  h1 {
    font-size: clamp(2.1rem, 5vw, 4.2rem);
    line-height: 1;
    margin: 0;
  }
`;

const Stats = styled.dl`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 24px 0;

  div {
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.medium};
    padding: 14px;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  dd {
    font-size: 1.15rem;
    font-weight: 800;
    margin: 5px 0 0;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Notes = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  margin-top: 24px;
  padding: 18px;

  h2 {
    margin: 0 0 12px;
  }

  ul {
    margin-bottom: 0;
  }
`;

export function TrailDetailPage() {
  const { slug } = useParams();
  const trail = getTrailBySlug(slug);

  if (!trail) {
    return <Page>Trail not found.</Page>;
  }

  const mountain = mountains.find((item) => item.id === trail.mountainId);
  const mountainSlug = mountain ? getMountainBySlug(mountain.slug)?.slug : 'mountains';

  return (
    <Page>
      <BackLink to={mountain ? `/mountains/${mountainSlug}` : '/mountains'}>
        <ArrowLeft size={16} aria-hidden="true" /> {mountain?.name ?? 'Mountains'}
      </BackLink>
      <Header>
        <DifficultyBadge difficulty={trail.difficulty} />
        <h1>{trail.name}</h1>
      </Header>
      <Stats>
        <div>
          <dt>Length</dt>
          <dd>{formatDistance(trail.lengthKm)}</dd>
        </div>
        <div>
          <dt>Elevation gain</dt>
          <dd>{formatElevation(trail.elevationGainMeters)}</dd>
        </div>
        <div>
          <dt>Estimated time</dt>
          <dd>{trail.estimatedDuration}</dd>
        </div>
      </Stats>
      <TrailMap trail={trail} />
      <Notes>
        <h2>Safety Notes</h2>
        <ul>
          {trail.safetyNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Notes>
    </Page>
  );
}
