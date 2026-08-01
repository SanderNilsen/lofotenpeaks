import {
  ArrowRight,
  Backpack,
  Bus,
  Camera,
  CalendarDays,
  Car,
  Clock,
  ExternalLink,
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
import { Seo } from '../../components/common/Seo.jsx';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { SafetyNotice } from '../../components/trails/SafetyNotice.jsx';
import { RouteCorrectionPanel } from '../../components/trails/RouteCorrectionPanel.jsx';
import { TrailPhotoGallery } from '../../components/trails/TrailPhotoGallery.jsx';
import { MountainWeatherPanel } from '../../components/weather/MountainWeatherPanel.jsx';
import { mountains } from '../../data/mountains.js';
import { getTrailBySlug } from '../../data/trails.js';
import { formatDistance, formatElevation } from '../../lib/formatters.js';
import { getRemoteMountainGuideBySlug } from '../../lib/supabase/api.js';
import { isSupabaseConfigured } from '../../lib/supabase/client.js';
import { theme } from '../../styles/theme.js';

const CheckInPanel = lazy(() => import('../../components/community/CheckInPanel.jsx'));
const CommentsPanel = lazy(() => import('../../components/community/CommentsPanel.jsx'));
const TrailMap = lazy(() =>
  import('../../components/trails/TrailMap.jsx').then((module) => ({ default: module.TrailMap })),
);

const Page = styled.article`
  min-width: 0;
`;

const Hero = styled.header`
  background: ${theme.colors.ink};
  color: ${theme.colors.surface};
  min-height: 520px;
  overflow: hidden;
  position: relative;

  @media (max-width: 640px) {
    min-height: 500px;
  }
`;

const HeroImage = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center;
  position: absolute;
  width: 100%;
`;

const HeroOverlay = styled.div`
  background:
    linear-gradient(90deg, rgba(18, 24, 23, 0.76) 0%, rgba(18, 24, 23, 0.36) 65%, rgba(18, 24, 23, 0.18) 100%),
    linear-gradient(0deg, rgba(18, 24, 23, 0.78) 0%, rgba(18, 24, 23, 0.08) 65%);
  inset: 0;
  position: absolute;
`;

const HeroInner = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  min-height: 520px;
  padding: 28px 24px 58px;
  position: relative;

  @media (max-width: 640px) {
    min-height: 500px;
    padding: 22px 16px 42px;
  }
`;

const Breadcrumbs = styled.nav`
  ol {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    color: rgba(255, 255, 255, 0.84);
    font-size: 0.88rem;
    font-weight: 700;
  }

  li + li::before {
    color: rgba(255, 255, 255, 0.58);
    content: '/';
    margin-right: 7px;
  }

  a {
    color: ${theme.colors.surface};
    text-underline-offset: 3px;
  }

  a:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.surface};
    outline-offset: 3px;
  }
`;

const HeroContent = styled.div`
  align-self: end;
  display: grid;
  gap: 15px;
  max-width: 780px;

  h1 {
    font-size: 4.5rem;
    line-height: 1.02;
    margin: 0;
  }

  > p {
    font-size: 1.12rem;
    line-height: 1.62;
    margin: 0;
    max-width: 680px;
  }

  @media (max-width: 900px) {
    h1 {
      font-size: 3.4rem;
    }
  }

  @media (max-width: 640px) {
    gap: 12px;

    h1 {
      font-size: 2.65rem;
      line-height: 1.07;
    }

    > p {
      font-size: 1rem;
      line-height: 1.55;
    }
  }
`;

const MetaLine = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-weight: 750;
  gap: 9px 16px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
`;

const HeroAction = styled.a`
  align-items: center;
  background: ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.1)' : theme.colors.surface)};
  border: 1px solid ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.75)' : theme.colors.surface)};
  border-radius: ${theme.radii.small};
  color: ${({ $secondary }) => ($secondary ? theme.colors.surface : theme.colors.ink)};
  display: inline-flex;
  font-weight: 850;
  gap: 8px;
  justify-content: center;
  min-height: 46px;
  padding: 10px 15px;
  text-decoration: none;

  &:hover {
    background: ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.2)' : '#f4f4f2')};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.surface};
    outline-offset: 3px;
  }
`;

const FactsBand = styled.section`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.line};
`;

const Facts = styled.dl`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 0 24px;

  > div {
    align-items: center;
    display: grid;
    gap: 2px 12px;
    grid-template-columns: 24px minmax(0, 1fr);
    min-height: 108px;
    padding: 22px 24px;
  }

  > div + div {
    border-left: 1px solid ${theme.colors.line};
  }

  svg {
    color: ${theme.colors.forest};
    grid-row: 1 / span 2;
  }

  dt {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  dd {
    font-size: 1.08rem;
    font-weight: 850;
    line-height: 1.3;
    margin: 0;
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 0 16px;

    > div {
      min-height: 96px;
      padding: 18px 14px;
    }

    > div:nth-child(3) {
      border-left: 0;
    }

    > div:nth-child(n + 3) {
      border-top: 1px solid ${theme.colors.line};
    }
  }

  @media (max-width: 420px) {
    > div {
      gap: 2px 8px;
      grid-template-columns: 20px minmax(0, 1fr);
      padding-left: 9px;
      padding-right: 9px;
    }

    dd {
      font-size: 0.98rem;
    }
  }
`;

const GuideNavBand = styled.div`
  border-bottom: 1px solid ${theme.colors.line};
`;

const GuideNav = styled.nav`
  display: flex;
  gap: 3px;
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  overflow-x: auto;
  padding: 0 24px;
  scrollbar-width: thin;

  a {
    align-items: center;
    color: ${theme.colors.ink};
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.9rem;
    font-weight: 800;
    min-height: 54px;
    padding: 0 13px;
    text-decoration: none;
  }

  a:hover {
    color: ${theme.colors.forest};
  }

  a:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: -3px;
  }

  @media (max-width: 640px) {
    padding: 0 8px;

    a {
      font-size: 0.84rem;
      padding-left: 8px;
      padding-right: 8px;
    }
  }
`;

const MainContent = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 40px 24px 0;

  @media (max-width: 640px) {
    padding: 30px 16px 0;
  }
`;

const NoticeWrap = styled.div`
  margin-bottom: 52px;

  @media (max-width: 640px) {
    margin-bottom: 40px;
  }
`;

const OverviewGrid = styled.div`
  align-items: start;
  display: grid;
  gap: 56px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 350px);

  @media (max-width: 920px) {
    gap: 38px;
    grid-template-columns: 1fr;
  }
`;

const GuideColumn = styled.div`
  display: grid;
  gap: 52px;
  min-width: 0;
`;

const ToolColumn = styled.aside`
  display: grid;
  gap: 18px;
  min-width: 0;
`;

const Section = styled.section`
  scroll-margin-top: 104px;
`;

const SectionHeading = styled.div`
  margin-bottom: 20px;

  h2 {
    align-items: center;
    display: flex;
    font-size: 2rem;
    gap: 10px;
    line-height: 1.18;
    margin: 0;
  }

  > p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 8px 0 0;
    max-width: 720px;
  }

  @media (max-width: 640px) {
    h2 {
      font-size: 1.7rem;
    }
  }
`;

const Lead = styled.p`
  font-size: 1.08rem;
  line-height: 1.8;
  margin: 0;
`;

const ReviewDetails = styled.div`
  align-items: center;
  border-top: 1px solid ${theme.colors.line};
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.86rem;
  font-weight: 750;
  gap: 8px 18px;
  margin-top: 22px;
  padding-top: 15px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 7px;
  }
`;

const PlanningList = styled.div`
  border-bottom: 1px solid ${theme.colors.line};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const PlanningItem = styled.div`
  border-top: 1px solid ${theme.colors.line};
  display: grid;
  gap: 4px 12px;
  grid-template-columns: 24px minmax(0, 1fr);
  padding: 18px 18px 18px 0;

  &:nth-child(even) {
    border-left: 1px solid ${theme.colors.line};
    padding-left: 18px;
  }

  svg {
    color: ${theme.colors.forest};
    grid-row: 1 / span 2;
    margin-top: 1px;
  }

  h3 {
    font-size: 0.9rem;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.58;
    margin: 0;
  }

  @media (max-width: 680px) {
    padding: 16px 0;

    &:nth-child(even) {
      border-left: 0;
      padding-left: 0;
    }
  }
`;

const BeforeYouGo = styled.div`
  background: #e8f2ef;
  border-left: 4px solid ${theme.colors.forest};
  margin-top: 22px;
  padding: 20px 22px;

  h3 {
    align-items: center;
    display: flex;
    font-size: 1.08rem;
    gap: 8px;
    margin: 0 0 13px;
  }
`;

const Checklist = styled.ul`
  display: grid;
  gap: 9px;
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

const RouteSafety = styled.section`
  border-bottom: 1px solid ${theme.colors.line};
  border-top: 1px solid ${theme.colors.line};
  padding: 28px 0;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.55rem;
    gap: 9px;
    margin: 0 0 18px;
  }
`;

const SafetyList = styled.ul`
  display: grid;
  gap: 11px 28px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    line-height: 1.6;
    padding-left: 20px;
    position: relative;
  }

  li::before {
    color: ${theme.colors.warning};
    content: '\u2022';
    font-size: 1.45rem;
    left: 2px;
    line-height: 1;
    position: absolute;
    top: 0.2em;
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const OfficialSafetyLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;

  a {
    align-items: center;
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.forest};
    display: inline-flex;
    font-size: 0.88rem;
    font-weight: 850;
    gap: 7px;
    min-height: 44px;
    padding: 9px 12px;
    text-decoration: none;
  }

  a:hover {
    background: ${theme.colors.surface};
  }

  a:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const FullSection = styled.section`
  border-top: 1px solid ${theme.colors.line};
  margin-top: 64px;
  padding-top: 54px;
  scroll-margin-top: 104px;

  @media (max-width: 640px) {
    margin-top: 48px;
    padding-top: 40px;
  }
`;

const CorrectionWrap = styled.div`
  margin-top: 64px;
  scroll-margin-top: 104px;

  @media (max-width: 640px) {
    margin-top: 48px;
  }
`;

const MapNote = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.93rem;
  line-height: 1.55;
  margin: 0 0 16px;
`;

const MapFallback = styled.div`
  align-items: center;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  display: flex;
  font-weight: 700;
  height: 500px;
  justify-content: center;

  @media (max-width: 640px) {
    height: 360px;
  }
`;

const ToolFallback = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  min-height: 132px;
  padding: 20px;

  strong {
    color: ${theme.colors.ink};
    display: block;
    margin-bottom: 8px;
  }
`;

const RelatedBand = styled.section`
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.line};
  margin-top: 72px;
`;

const RelatedSection = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 58px 24px 72px;

  @media (max-width: 640px) {
    padding: 44px 16px 56px;
  }
`;

const RelatedHeader = styled.div`
  align-items: end;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 22px;

  h2 {
    font-size: 2rem;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 7px 0 0;
  }

  a {
    align-items: center;
    color: ${theme.colors.forest};
    display: inline-flex;
    flex: 0 0 auto;
    font-weight: 800;
    gap: 7px;
    min-height: 44px;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  a:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  @media (max-width: 680px) {
    align-items: start;
    flex-direction: column;
    gap: 8px;
  }
`;

const RelatedGrid = styled.div`
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const StatePage = styled.div`
  align-content: center;
  display: grid;
  justify-items: start;
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  min-height: 58vh;
  padding: 64px 24px;

  h1 {
    font-size: 2.5rem;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.65;
    margin: 12px 0 22px;
    max-width: 560px;
  }

  a {
    align-items: center;
    background: ${theme.colors.forest};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.surface};
    display: inline-flex;
    font-weight: 800;
    gap: 8px;
    min-height: 46px;
    padding: 10px 15px;
    text-decoration: none;
  }

  a:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    padding: 48px 16px;

    h1 {
      font-size: 2rem;
    }
  }
`;

const LoadingLine = styled.div`
  background: ${theme.colors.line};
  border-radius: ${theme.radii.small};
  height: 18px;
  margin-bottom: 12px;
  max-width: 100%;
  width: ${({ $width }) => $width};
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

function formatReviewDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Oslo',
  }).format(date);
}

function LoadingState() {
  return (
    <StatePage role="status" aria-live="polite">
      <LoadingLine $width="180px" />
      <LoadingLine $width="min(520px, 92vw)" />
      <LoadingLine $width="min(380px, 72vw)" />
      <span>Loading hiking guide...</span>
    </StatePage>
  );
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
  const mountain = trail
    ? remoteGuide?.mountain ?? mountains.find((item) => item.id === trail.mountainId)
    : null;
  const trailImages = trail ? getTrailImages(trail, mountain) : [];
  const heroImage = trailImages[0] ?? mountain?.heroImage;
  const galleryImages = trailImages.length > 1 ? trailImages.slice(1) : trailImages;

  if (!trail && !remoteIsLoading) {
    return (
      <>
        <Seo title="Hike not found" description="This Lofoten hiking guide could not be found." noIndex />
        <StatePage>
          <h1>Hike not found</h1>
          <p>The guide may have moved or is not published. Browse the current hiking guides instead.</p>
          <Link to="/mountains">
            Explore hikes <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </StatePage>
      </>
    );
  }

  if (!trail) {
    return <LoadingState />;
  }

  const region = mountain?.region ?? 'Lofoten';
  const highPoint = mountain?.heightMeters ?? trail.elevationGainMeters;
  const weatherLocationId = trail.weatherLocationId ?? mountain?.weatherLocationId;
  const finishPointWeatherLocation = getFinishPointWeatherLocation(trail);
  const guideItems = getGuideItems(trail.guide);
  const lastReviewedDate = formatReviewDate(trail.lastReviewedAt);
  const island = region.split(',')[0];
  const relatedMountains = mountains
    .filter((item) => item.id !== mountain?.id)
    .sort((first, second) => {
      const firstMatchesIsland = first.region.startsWith(island) ? 1 : 0;
      const secondMatchesIsland = second.region.startsWith(island) ? 1 : 0;
      return secondMatchesIsland - firstMatchesIsland;
    })
    .slice(0, 3);
  const seoDescription = `${trail.summary ?? mountain?.summary} Route: ${formatDistance(trail.lengthKm)}, ${formatElevation(
    trail.elevationGainMeters,
  )} elevation gain, ${trail.estimatedDuration}.`;
  const canonicalPath = `/mountains/${trail.slug}`;

  return (
    <Page>
      <Seo
        title={`${trail.name} Hiking Guide`}
        description={seoDescription}
        image={heroImage?.src}
        imageAlt={heroImage?.alt}
        type="article"
        canonicalPath={canonicalPath}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://lofotenpeaks.no/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Hikes',
              item: 'https://lofotenpeaks.no/mountains',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: trail.name,
              item: `https://lofotenpeaks.no${canonicalPath}`,
            },
          ],
        }}
      />

      <Hero>
        {heroImage && (
          <HeroImage
            src={heroImage.src}
            alt=""
            aria-hidden="true"
            width="1920"
            height="1200"
            fetchpriority="high"
            decoding="async"
          />
        )}
        <HeroOverlay />
        <HeroInner>
          <Breadcrumbs aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/mountains">Hikes</Link>
              </li>
              <li aria-current="page">{trail.name}</li>
            </ol>
          </Breadcrumbs>
          <div />
          <HeroContent>
            <DifficultyBadge difficulty={trail.difficulty} />
            <h1>{trail.name}</h1>
            <MetaLine>
              <span>
                <MapPin size={17} aria-hidden="true" /> {region}
              </span>
              <span>
                <MountainIcon size={17} aria-hidden="true" /> {formatElevation(highPoint)} high point
              </span>
            </MetaLine>
            <p>{trail.summary ?? mountain?.summary}</p>
            <HeroActions>
              <HeroAction href="#route-map">
                <MapPin size={18} aria-hidden="true" /> View route map
              </HeroAction>
              <HeroAction href="#planning" $secondary>
                <ListChecks size={18} aria-hidden="true" /> Plan this hike
              </HeroAction>
            </HeroActions>
          </HeroContent>
        </HeroInner>
      </Hero>

      <FactsBand aria-label="Route facts">
        <Facts>
          <div>
            <RouteIcon size={22} aria-hidden="true" />
            <dt>Distance</dt>
            <dd>{formatDistance(trail.lengthKm)}</dd>
          </div>
          <div>
            <TrendingUp size={22} aria-hidden="true" />
            <dt>Elevation gain</dt>
            <dd>{formatElevation(trail.elevationGainMeters)}</dd>
          </div>
          <div>
            <Clock size={22} aria-hidden="true" />
            <dt>Estimated time</dt>
            <dd>{trail.estimatedDuration}</dd>
          </div>
          <div>
            <Flag size={22} aria-hidden="true" />
            <dt>High point</dt>
            <dd>{formatElevation(highPoint)}</dd>
          </div>
        </Facts>
      </FactsBand>

      <GuideNavBand>
        <GuideNav aria-label="On this hiking guide">
          <a href="#route-overview">Overview</a>
          {trail.guide && <a href="#planning">Planning</a>}
          <a href="#route-map">Route map</a>
          {galleryImages.length > 0 && <a href="#photos">Photos</a>}
          <a href="#route-correction">Report incorrect information</a>
          <a href="#comments">Comments</a>
        </GuideNav>
      </GuideNavBand>

      <MainContent>
        <NoticeWrap>
          <SafetyNotice />
        </NoticeWrap>

        <OverviewGrid>
          <GuideColumn>
            <Section id="route-overview" aria-labelledby="route-overview-heading">
              <SectionHeading>
                <h2 id="route-overview-heading">
                  <RouteIcon size={24} aria-hidden="true" /> Route overview
                </h2>
              </SectionHeading>
              <Lead>{trail.description ?? mountain?.description}</Lead>
              {lastReviewedDate && (
                <ReviewDetails aria-label="Guide review information">
                  <span>
                    <CalendarDays size={16} aria-hidden="true" /> Route information reviewed {lastReviewedDate}
                  </span>
                </ReviewDetails>
              )}
            </Section>

            {trail.guide && (
              <Section id="planning" aria-labelledby="planning-heading">
                <SectionHeading>
                  <h2 id="planning-heading">
                    <ListChecks size={24} aria-hidden="true" /> Plan your hike
                  </h2>
                  <p>Practical details to review before travelling to the trailhead.</p>
                </SectionHeading>
                {guideItems.length > 0 && (
                  <PlanningList>
                    {guideItems.map(({ label, value, Icon }) => (
                      <PlanningItem key={label}>
                        <Icon size={19} aria-hidden="true" />
                        <h3>{label}</h3>
                        <p>{value}</p>
                      </PlanningItem>
                    ))}
                  </PlanningList>
                )}
                {trail.guide.beforeYouGo?.length > 0 && (
                  <BeforeYouGo>
                    <h3>
                      <ListChecks size={19} aria-hidden="true" /> Before you go
                    </h3>
                    <Checklist>
                      {trail.guide.beforeYouGo.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </Checklist>
                  </BeforeYouGo>
                )}
              </Section>
            )}

            <RouteSafety aria-labelledby="route-safety-heading">
              <h2 id="route-safety-heading">
                <ShieldAlert size={22} aria-hidden="true" /> Route-specific safety
              </h2>
              {trail.safetyNotes?.length > 0 && (
                <SafetyList>
                  {trail.safetyNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </SafetyList>
              )}
              <OfficialSafetyLinks aria-label="Official safety forecasts">
                <a href="https://www.yr.no/en" target="_blank" rel="noreferrer">
                  Official weather forecast (Yr) <ExternalLink size={15} aria-hidden="true" />
                </a>
                <a href="https://www.varsom.no/en/avalanches/" target="_blank" rel="noreferrer">
                  Snow season: check avalanche conditions (Varsom) <ExternalLink size={15} aria-hidden="true" />
                </a>
              </OfficialSafetyLinks>
            </RouteSafety>
          </GuideColumn>

          <ToolColumn aria-label="Hike tools">
            <Suspense
              fallback={
                <ToolFallback role="status">
                  <strong>Summit check-in</strong>
                  Loading account tools...
                </ToolFallback>
              }
            >
              <CheckInPanel trail={trail} />
            </Suspense>

            {finishPointWeatherLocation ? (
              <MountainWeatherPanel title="Summit weather" locations={[finishPointWeatherLocation]} compact />
            ) : (
              weatherLocationId && (
                <MountainWeatherPanel title="Weather near this hike" locationIds={[weatherLocationId]} compact />
              )
            )}
          </ToolColumn>
        </OverviewGrid>

        <FullSection id="route-map" aria-labelledby="route-map-heading">
          <SectionHeading>
            <h2 id="route-map-heading">
              <MapPin size={24} aria-hidden="true" /> Route map
            </h2>
            <p>Use the map to understand the route shape and trailhead area. Carry a separate map or navigation tool.</p>
          </SectionHeading>
          {trail.routeNote && <MapNote>{trail.routeNote}</MapNote>}
          <Suspense fallback={<MapFallback role="status">Loading route map...</MapFallback>}>
            <TrailMap trail={trail} />
          </Suspense>
        </FullSection>

        {galleryImages.length > 0 && (
          <FullSection id="photos" aria-labelledby="photos-heading">
            <SectionHeading>
              <h2 id="photos-heading">
                <Camera size={24} aria-hidden="true" /> From the route
              </h2>
              <p>Views from the mountain and the surrounding landscape.</p>
            </SectionHeading>
            <TrailPhotoGallery
              images={galleryImages}
              credits={trail.imageCredits ?? mountain?.imageCredits ?? []}
              imageFiles={trail.imageFiles ?? []}
            />
          </FullSection>
        )}

        <CorrectionWrap id="route-correction">
          <RouteCorrectionPanel trail={trail} />
        </CorrectionWrap>

        <FullSection id="comments" aria-label="Comments and trail updates">
          <Suspense
            fallback={
              <ToolFallback role="status">
                <strong>
                  <MessageCircle size={18} aria-hidden="true" /> Comments
                </strong>
                Loading trail comments...
              </ToolFallback>
            }
          >
            <CommentsPanel trail={trail} />
          </Suspense>
        </FullSection>
      </MainContent>

      {relatedMountains.length > 0 && (
        <RelatedBand aria-labelledby="related-hikes-heading">
          <RelatedSection>
            <RelatedHeader>
              <div>
                <h2 id="related-hikes-heading">Explore more Lofoten hikes</h2>
                <p>Compare another route and find the right mountain for your next day out.</p>
              </div>
              <Link to="/mountains">
                View all hikes <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </RelatedHeader>
            <RelatedGrid>
              {relatedMountains.map((relatedMountain) => (
                <MountainCard
                  key={relatedMountain.id}
                  mountain={relatedMountain}
                  trail={getTrailBySlug(relatedMountain.slug)}
                  headingLevel={3}
                />
              ))}
            </RelatedGrid>
          </RelatedSection>
        </RelatedBand>
      )}

    </Page>
  );
}
