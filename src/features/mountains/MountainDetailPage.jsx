import { ArrowLeft, Route as RouteIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { DifficultyBadge } from '../../components/common/Badge.jsx';
import { getMountainBySlug } from '../../data/mountains.js';
import { getTrailsByMountainId } from '../../data/trails.js';
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

const Hero = styled.header`
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const HeroImage = styled.img`
  aspect-ratio: 16 / 10;
  border-radius: ${theme.radii.medium};
  object-fit: cover;
  width: 100%;
`;

const Summary = styled.div`
  align-content: center;
  display: grid;
  gap: 16px;

  h1 {
    font-size: clamp(2.4rem, 5vw, 4.8rem);
    line-height: 1;
    margin: 0;
  }

  p {
    line-height: 1.65;
    margin: 0;
  }
`;

const Stats = styled.dl`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;

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
    font-size: 1.2rem;
    font-weight: 800;
    margin: 5px 0 0;
  }
`;

const Section = styled.section`
  padding-top: 42px;

  h2 {
    font-size: 1.8rem;
    margin: 0 0 16px;
  }
`;

const Gallery = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  img {
    aspect-ratio: 16 / 10;
    border-radius: ${theme.radii.medium};
    object-fit: cover;
    width: 100%;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TrailList = styled.div`
  display: grid;
  gap: 12px;
`;

const TrailLink = styled(Link)`
  align-items: center;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding: 16px;
  text-decoration: none;

  span {
    color: ${theme.colors.muted};
  }
`;

export function MountainDetailPage() {
  const { slug } = useParams();
  const mountain = getMountainBySlug(slug);

  if (!mountain) {
    return <Page>Mountain not found.</Page>;
  }

  const trails = getTrailsByMountainId(mountain.id);

  return (
    <Page>
      <BackLink to="/mountains">
        <ArrowLeft size={16} aria-hidden="true" /> Mountains
      </BackLink>
      <Hero>
        <HeroImage src={mountain.heroImage.src} alt={mountain.heroImage.alt} />
        <Summary>
          <DifficultyBadge difficulty={mountain.difficulty} />
          <h1>{mountain.name}</h1>
          <p>{mountain.description}</p>
          <Stats>
            <div>
              <dt>Height</dt>
              <dd>{formatElevation(mountain.heightMeters)}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{mountain.region}</dd>
            </div>
          </Stats>
        </Summary>
      </Hero>
      <Section>
        <h2>Trails</h2>
        <TrailList>
          {trails.map((trail) => (
            <TrailLink key={trail.id} to={`/trails/${trail.slug}`}>
              <strong>
                <RouteIcon size={16} aria-hidden="true" /> {trail.name}
              </strong>
              <span>
                {formatDistance(trail.lengthKm)} · {formatElevation(trail.elevationGainMeters)}
              </span>
            </TrailLink>
          ))}
        </TrailList>
      </Section>
      <Section>
        <h2>Photos</h2>
        <Gallery>
          {mountain.images.map((image) => (
            <img key={image.src} src={image.src} alt={image.alt} />
          ))}
        </Gallery>
      </Section>
    </Page>
  );
}
