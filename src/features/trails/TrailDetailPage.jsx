import {
  ArrowLeft,
  Backpack,
  Bus,
  Camera,
  CalendarDays,
  Car,
  Clock,
  Flag,
  Footprints,
  ListChecks,
  MapPin,
  MessageCircle,
  Mountain as MountainIcon,
  Route as RouteIcon,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { DifficultyBadge } from '../../components/common/Badge.jsx';
import { ImageCredits } from '../../components/common/ImageCredits.jsx';
import { Seo } from '../../components/common/Seo.jsx';
import { TrailMap } from '../../components/trails/TrailMap.jsx';
import { MountainWeatherPanel } from '../../components/weather/MountainWeatherPanel.jsx';
import { mountains } from '../../data/mountains.js';
import { getTrailBySlug } from '../../data/trails.js';
import { formatDistance, formatElevation } from '../../lib/formatters.js';
import { getRemoteMountainGuideBySlug } from '../../lib/supabase/api.js';
import { isSupabaseConfigured } from '../../lib/supabase/client.js';
import { theme } from '../../styles/theme.js';

const CheckInPanel = lazy(() => import('../../components/community/CheckInPanel.jsx'));
const CommentsPanel = lazy(() => import('../../components/community/CommentsPanel.jsx'));

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
  grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroImage = styled.img`
  aspect-ratio: 16 / 10;
  border-radius: ${theme.radii.medium};
  object-fit: cover;
  width: 100%;
`;

const HeroContent = styled.div`
  align-content: center;
  display: grid;
  gap: 16px;

  h1 {
    font-size: clamp(2.35rem, 5vw, 4.8rem);
    line-height: 1;
    margin: 0;
  }

  p {
    font-size: 1.05rem;
    line-height: 1.65;
    margin: 0;
  }
`;

const MetaLine = styled.div`
  align-items: center;
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-weight: 700;
  gap: 10px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }
`;

const Stats = styled.dl`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 10px 0 0;

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

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.55fr);
  padding-top: 44px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const GuideColumn = styled.div`
  display: grid;
  gap: 38px;
`;

const Section = styled.section`
  h2 {
    align-items: center;
    display: flex;
    font-size: 1.75rem;
    gap: 10px;
    margin: 0 0 14px;
  }

  p {
    line-height: 1.7;
    margin: 0;
  }
`;

const MapNote = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.92rem;
  margin: 0 0 14px;
`;

const GuideGrid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const GuideCard = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 8px;
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
  padding: 16px;

  h3 {
    align-items: center;
    display: flex;
    font-size: 1rem;
    gap: 8px;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
  }
`;

const Checklist = styled.ul`
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    line-height: 1.55;
    padding-left: 18px;
    position: relative;
  }

  li::before {
    background: ${theme.colors.forest};
    border-radius: 999px;
    content: '';
    height: 6px;
    left: 0;
    position: absolute;
    top: 0.62em;
    width: 6px;
  }
`;

const Gallery = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  img {
    aspect-ratio: 4 / 3;
    border-radius: ${theme.radii.medium};
    object-fit: cover;
    width: 100%;
  }

  img:first-child {
    aspect-ratio: auto;
    grid-column: span 2;
    grid-row: span 2;
    height: 100%;
    min-height: 360px;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;

    img:first-child {
      aspect-ratio: 16 / 10;
      grid-column: auto;
      grid-row: auto;
      min-height: 0;
    }
  }
`;

const SideBar = styled.aside`
  display: grid;
  gap: 18px;
  height: fit-content;

  @media (min-width: 901px) {
    position: sticky;
    top: 24px;
  }
`;

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  padding: 18px;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.2rem;
    gap: 8px;
    margin: 0 0 14px;
  }
`;

const FactList = styled.div`
  display: grid;
  gap: 14px;

  > div {
    align-items: start;
    display: grid;
    gap: 10px;
    grid-template-columns: 22px minmax(0, 1fr);
  }

  small {
    color: ${theme.colors.muted};
    display: block;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  strong {
    display: block;
    font-weight: 800;
    line-height: 1.35;
    margin-top: 3px;
  }
`;

const SafetyList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    border-top: 1px solid ${theme.colors.line};
    line-height: 1.55;
    padding-top: 10px;
  }

  li:first-child {
    border-top: 0;
    padding-top: 0;
  }
`;

function getFileName(src) {
  return src.split('/').pop();
}

function imageFromFile(fileName, trailName) {
  return {
    src: `/images/${fileName}`,
    alt: `${trailName} trail view`,
  };
}

function getTrailImages(trail, mountain) {
  const mountainImagesByFile = new Map((mountain?.images ?? []).map((image) => [getFileName(image.src), image]));

  return (trail.imageFiles ?? []).map((fileName) => mountainImagesByFile.get(fileName) ?? imageFromFile(fileName, trail.name));
}

function formatCoordinate(point) {
  if (!isValidCoordinatePoint(point)) {
    return 'Not set';
  }

  return `${Number(point[0]).toFixed(5)}, ${Number(point[1]).toFixed(5)}`;
}

function isValidCoordinatePoint(point) {
  return (
    Array.isArray(point) &&
    point.length >= 2 &&
    Number.isFinite(Number(point[0])) &&
    Number.isFinite(Number(point[1]))
  );
}

function getFinishPointWeatherLocation(trail) {
  if (!isValidCoordinatePoint(trail.endPoint)) {
    return null;
  }

  const [latitude, longitude] = trail.endPoint.map(Number);

  return {
    id: `${trail.id ?? trail.slug}-finish-point`,
    name: trail.name,
    latitude,
    longitude,
  };
}

function getGuideItems(guide) {
  if (!guide) {
    return [];
  }

  return [
    { label: 'Parking', value: guide.parking, Icon: Car },
    { label: 'Trailhead', value: guide.trailhead, Icon: Footprints },
    { label: 'Best season', value: guide.bestSeason, Icon: CalendarDays },
    { label: 'Suitable for', value: guide.suitableFor, Icon: MountainIcon },
    { label: 'Gear notes', value: guide.gearNotes, Icon: Backpack },
    { label: 'Access', value: guide.access, Icon: Bus },
  ].filter((item) => item.value);
}

export function TrailDetailPage() {
  const { slug } = useParams();
  const staticTrail = getTrailBySlug(slug);
  const [remoteGuide, setRemoteGuide] = useState(null);
  const [remoteIsLoading, setRemoteIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    setRemoteGuide(null);

    if (!isSupabaseConfigured) {
      setRemoteIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    setRemoteIsLoading(true);

    getRemoteMountainGuideBySlug(slug)
      .then((guide) => {
        if (isMounted) {
          setRemoteGuide(guide);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRemoteGuide(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setRemoteIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const trail = remoteGuide?.trail ?? staticTrail;

  if (!trail && !remoteIsLoading) {
    return <Page>Trail not found.</Page>;
  }

  if (!trail) {
    return <Page>Loading hiking guide...</Page>;
  }

  const mountain = remoteGuide?.mountain ?? mountains.find((item) => item.id === trail.mountainId);
  const trailImages = getTrailImages(trail, mountain);
  const heroImage = trailImages[0] ?? mountain?.heroImage;
  const galleryImages = trailImages.length > 1 ? trailImages.slice(1) : trailImages;
  const region = mountain?.region ?? 'Lofoten';
  const highPoint = mountain?.heightMeters ?? trail.elevationGainMeters;
  const weatherLocationId = trail.weatherLocationId ?? mountain?.weatherLocationId;
  const finishPointWeatherLocation = getFinishPointWeatherLocation(trail);
  const guideItems = getGuideItems(trail.guide);
  const seoDescription = `${trail.summary ?? mountain?.summary} Route: ${formatDistance(trail.lengthKm)}, ${formatElevation(
    trail.elevationGainMeters,
  )} elevation gain, ${trail.estimatedDuration}.`;

  return (
    <Page>
      <Seo title={`${trail.name} Hiking Guide`} description={seoDescription} image={heroImage?.src} type="article" />
      <BackLink to="/mountains">
        <ArrowLeft size={16} aria-hidden="true" /> Mountains
      </BackLink>
      <Hero>
        {heroImage && <HeroImage src={heroImage.src} alt={heroImage.alt} />}
        <HeroContent>
          <DifficultyBadge difficulty={trail.difficulty} />
          <h1>{trail.name}</h1>
          <MetaLine>
            <span>
              <MapPin size={16} aria-hidden="true" /> {region}
            </span>
            {mountain && (
              <span>
                <MountainIcon size={16} aria-hidden="true" /> {mountain.name}
              </span>
            )}
          </MetaLine>
          <p>{trail.summary ?? mountain?.summary}</p>
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
              <dt>Time</dt>
              <dd>{trail.estimatedDuration}</dd>
            </div>
            <div>
              <dt>High point</dt>
              <dd>{formatElevation(highPoint)}</dd>
            </div>
          </Stats>
        </HeroContent>
      </Hero>

      <ContentGrid>
        <GuideColumn>
          <Section>
            <h2>
              <RouteIcon size={22} aria-hidden="true" /> Route Overview
            </h2>
            <p>{trail.description ?? mountain?.description}</p>
          </Section>

          {trail.guide && (
            <Section>
              <h2>
                <ListChecks size={22} aria-hidden="true" /> Planning Notes
              </h2>
              <GuideGrid>
                {guideItems.map(({ label, value, Icon }) => (
                  <GuideCard key={label}>
                    <h3>
                      <Icon size={18} aria-hidden="true" /> {label}
                    </h3>
                    <p>{value}</p>
                  </GuideCard>
                ))}
                {trail.guide.beforeYouGo?.length > 0 && (
                  <GuideCard $wide>
                    <h3>
                      <ListChecks size={18} aria-hidden="true" /> Before You Go
                    </h3>
                    <Checklist>
                      {trail.guide.beforeYouGo.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </Checklist>
                  </GuideCard>
                )}
              </GuideGrid>
            </Section>
          )}

          <Section>
            <h2>
              <MapPin size={22} aria-hidden="true" /> Map
            </h2>
            <MapNote>{trail.routeNote}</MapNote>
            <TrailMap trail={trail} />
          </Section>

          {galleryImages.length > 0 && (
            <Section>
              <h2>
                <Camera size={22} aria-hidden="true" /> Photos
              </h2>
              <Gallery>
                {galleryImages.map((image) => (
                  <img key={image.src} src={image.src} alt={image.alt} loading="lazy" />
                ))}
              </Gallery>
            </Section>
          )}

          <Suspense
            fallback={
              <Panel>
                <h2>
                  <MessageCircle size={18} aria-hidden="true" /> Comments
                </h2>
                <MapNote>Loading comments...</MapNote>
              </Panel>
            }
          >
            <CommentsPanel trail={trail} />
          </Suspense>
        </GuideColumn>

        <SideBar>
          <Suspense
            fallback={
              <Panel>
                <h2>
                  <MapPin size={18} aria-hidden="true" /> Summit Check-In
                </h2>
                <MapNote>Loading account tools...</MapNote>
              </Panel>
            }
          >
            <CheckInPanel trail={trail} />
          </Suspense>

          <Panel>
            <h2>
              <RouteIcon size={18} aria-hidden="true" /> Trail Facts
            </h2>
            <FactList>
              <div>
                <Clock size={18} aria-hidden="true" />
                <span>
                  <small>Estimated time</small>
                  <strong>{trail.estimatedDuration}</strong>
                </span>
              </div>
              <div>
                <TrendingUp size={18} aria-hidden="true" />
                <span>
                  <small>Elevation gain</small>
                  <strong>{formatElevation(trail.elevationGainMeters)}</strong>
                </span>
              </div>
              <div>
                <MapPin size={18} aria-hidden="true" />
                <span>
                  <small>Start point</small>
                  <strong>{formatCoordinate(trail.startPoint)}</strong>
                </span>
              </div>
              <div>
                <Flag size={18} aria-hidden="true" />
                <span>
                  <small>Finish point</small>
                  <strong>{formatCoordinate(trail.endPoint)}</strong>
                </span>
              </div>
            </FactList>
          </Panel>

          {finishPointWeatherLocation ? (
            <MountainWeatherPanel
              title="Mountain Weather"
              locations={[finishPointWeatherLocation]}
              compact
            />
          ) : (
            weatherLocationId && (
              <MountainWeatherPanel title="Weather Near This Hike" locationIds={[weatherLocationId]} compact />
            )
          )}

          <Panel>
            <h2>
              <ShieldAlert size={18} aria-hidden="true" /> Safety Notes
            </h2>
            <SafetyList>
              {trail.safetyNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </SafetyList>
          </Panel>

          <Panel>
            <h2>
              <Camera size={18} aria-hidden="true" /> Photo Credits
            </h2>
            <ImageCredits
              credits={trail.imageCredits ?? mountain?.imageCredits ?? []}
              imageFiles={trail.imageFiles ?? []}
            />
          </Panel>
        </SideBar>
      </ContentGrid>
    </Page>
  );
}
