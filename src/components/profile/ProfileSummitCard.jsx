import { CalendarDays, CheckCircle2, MapPin, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatElevation } from '../../lib/formatters.js';
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
  aspect-ratio: 16 / 10;
  background: ${theme.colors.background};
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
  gap: 11px;
  padding: 16px;
`;

const TitleRow = styled.div`
  align-items: start;
  display: flex;
  gap: 10px;
  justify-content: space-between;

  h3 {
    font-size: 1.18rem;
    line-height: 1.25;
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

const Area = styled.p`
  align-items: center;
  color: ${theme.colors.muted};
  display: flex;
  font-size: 0.88rem;
  gap: 6px;
  margin: 0;
`;

const Meta = styled.div`
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.84rem;
  font-weight: 700;
  gap: 8px 14px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }
`;

const VisitSummary = styled.div`
  border-top: 1px solid ${theme.colors.line};
  display: flex;
  flex-wrap: wrap;
  gap: 7px 14px;
  justify-content: space-between;
  padding-top: 11px;

  span {
    align-items: center;
    color: ${theme.colors.muted};
    display: inline-flex;
    font-size: 0.82rem;
    font-weight: 700;
    gap: 5px;
  }

  strong {
    color: ${theme.colors.forest};
    font-size: 0.84rem;
  }
`;

function formatDate(value) {
  if (!value) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function ProfileSummitCard({ summit }) {
  const checkInLabel = summit.checkInCount === 1 ? 'check-in' : 'check-ins';

  return (
    <CardLink to={`/mountains/${summit.slug}`} aria-label={`Open the ${summit.name} hiking guide`}>
      <Card>
        <ImageFrame>
          <Image
            src={summit.imageSrc || '/images/homebanner-900.jpg'}
            alt={summit.imageAlt || `${summit.name} mountain view`}
            width="720"
            height="450"
            loading="lazy"
            decoding="async"
          />
        </ImageFrame>
        <Body>
          <TitleRow>
            <h3>{summit.name}</h3>
            {summit.difficulty && <DifficultyBadge difficulty={summit.difficulty} />}
          </TitleRow>
          {summit.region && (
            <Area>
              <MapPin size={15} aria-hidden="true" /> {summit.region}
            </Area>
          )}
          <Meta>
            {summit.heightMeters != null && (
              <span>
                <Mountain size={15} aria-hidden="true" /> {formatElevation(summit.heightMeters)} summit
              </span>
            )}
            <span>
              <CalendarDays size={15} aria-hidden="true" /> Last reached {formatDate(summit.latestCheckInAt)}
            </span>
          </Meta>
          <VisitSummary>
            <span>
              <CheckCircle2 size={14} aria-hidden="true" /> {summit.checkInCount} {checkInLabel}
            </span>
            <strong>{summit.points} points earned</strong>
          </VisitSummary>
        </Body>
      </Card>
    </CardLink>
  );
}
