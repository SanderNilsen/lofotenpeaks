import { ArrowRight, Clock, MapPin, Mountain, Route, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatDistance, formatElevation } from '../../lib/formatters.js';
import { theme } from '../../styles/theme.js';
import { DifficultyBadge } from '../common/Badge.jsx';

const CardLink = styled(Link)`
  color: inherit;
  display: block;
  height: 100%;
  text-decoration: none;

  &:focus-visible {
    border-radius: ${theme.radii.medium};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 4px;
  }
`;

const Card = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  overflow: hidden;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  @media (hover: hover) {
    ${CardLink}:hover & {
      border-color: #b8b4aa;
      box-shadow: 0 10px 24px rgba(38, 40, 36, 0.1);
      transform: translateY(-2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ImageFrame = styled.div`
  aspect-ratio: 4 / 3;
  overflow: hidden;
`;

const Image = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const Body = styled.div`
  align-content: start;
  display: grid;
  gap: 12px;
  padding: 18px;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  line-height: 1.2;
  margin: 0;
`;

const Region = styled.p`
  align-items: center;
  color: ${theme.colors.muted};
  display: inline-flex;
  font-size: 0.92rem;
  gap: 6px;
  margin: 0;
`;

const RouteMeta = styled.div`
  align-items: center;
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.88rem;
  font-weight: 700;
  gap: 9px 12px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }
`;

const Summary = styled.p`
  display: -webkit-box;
  line-height: 1.55;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`;

const Action = styled.span`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  margin-top: 2px;
`;

export function MountainCard({ mountain, trail, headingLevel = 2 }) {
  return (
    <CardLink
      to={`/mountains/${mountain.slug}`}
      aria-label={`View the ${mountain.name} hiking guide`}
    >
      <Card>
        <ImageFrame>
          <Image
            src={mountain.heroImage.src}
            alt={mountain.heroImage.alt}
            width="800"
            height="600"
            loading="lazy"
            decoding="async"
          />
        </ImageFrame>
        <Body>
          <Title as={`h${headingLevel}`}>{mountain.name}</Title>
          <Region>
            <MapPin size={15} aria-hidden="true" /> {mountain.region}
          </Region>
          <RouteMeta aria-label={`${mountain.name} route summary`}>
            <DifficultyBadge difficulty={trail?.difficulty ?? mountain.difficulty} />
            {trail ? (
              <>
                <span>
                  <Clock size={15} aria-hidden="true" /> {trail.estimatedDuration}
                </span>
                <span>
                  <Route size={15} aria-hidden="true" /> {formatDistance(trail.lengthKm)}
                </span>
                <span>
                  <TrendingUp size={15} aria-hidden="true" /> {formatElevation(trail.elevationGainMeters)} ascent
                </span>
              </>
            ) : (
              <span>
                <Mountain size={15} aria-hidden="true" /> {formatElevation(mountain.heightMeters)} high
              </span>
            )}
          </RouteMeta>
          <Summary>{mountain.summary}</Summary>
          <Action>
            View hiking guide <ArrowRight size={16} aria-hidden="true" />
          </Action>
        </Body>
      </Card>
    </CardLink>
  );
}
