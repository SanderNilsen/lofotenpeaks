import {
  ArrowRight,
  Clock,
  CloudSun,
  Compass,
  List,
  LogIn,
  Map as MapIcon,
  MapPinned,
  Medal,
  Mountain,
  Route,
  ShieldCheck,
  UserCircle,
  UserPlus,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useMountainGuides } from '../mountains/useMountainGuides.js';
import { theme } from '../../styles/theme.js';

const MountainOverviewMap = lazy(
  () => import('../../components/mountains/MountainOverviewMap.jsx'),
);

const pageDescription =
  'Find practical Lofoten hiking guides with route maps, photos, mountain weather, clear difficulty information, and safety notes.';

const Hero = styled.section`
  background: ${theme.colors.ink};
  min-height: 500px;
  overflow: hidden;
  position: relative;

  @media (max-width: 640px) {
    min-height: 470px;
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
    linear-gradient(90deg, rgba(19, 25, 24, 0.8) 0%, rgba(19, 25, 24, 0.48) 52%, rgba(19, 25, 24, 0.16) 100%),
    linear-gradient(0deg, rgba(19, 25, 24, 0.45) 0%, transparent 48%);
  inset: 0;
  position: absolute;
`;

const HeroContent = styled.div`
  align-content: center;
  color: ${theme.colors.surface};
  display: grid;
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  min-height: 500px;
  padding: 72px 24px;
  position: relative;

  h1 {
    font-size: 4.5rem;
    line-height: 1.03;
    margin: 0;
    max-width: 760px;
  }

  p {
    font-size: 1.15rem;
    line-height: 1.65;
    margin: 20px 0 0;
    max-width: 620px;
  }

  @media (max-width: 900px) {
    h1 {
      font-size: 3.3rem;
    }
  }

  @media (max-width: 640px) {
    min-height: 470px;
    padding: 58px 20px;

    h1 {
      font-size: 2.55rem;
      line-height: 1.08;
    }

    p {
      font-size: 1rem;
      line-height: 1.55;
    }
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
`;

const HeroAction = styled.a`
  align-items: center;
  background: ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.1)' : theme.colors.surface)};
  border: 1px solid ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.8)' : theme.colors.surface)};
  border-radius: ${theme.radii.small};
  color: ${({ $secondary }) => ($secondary ? theme.colors.surface : theme.colors.ink)};
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  justify-content: center;
  min-height: 48px;
  padding: 12px 17px;
  text-decoration: none;

  &:hover {
    background: ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.2)' : '#f4f4f2')};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.surface};
    outline-offset: 3px;
  }
`;

const DiscoveryBand = styled.section`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.line};
`;

const Discovery = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 48px 24px 56px;
  scroll-margin-top: 96px;

  @media (max-width: 640px) {
    padding: 38px 16px 44px;
  }
`;

const SectionHeader = styled.div`
  align-items: end;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 22px;

  h2 {
    font-size: 2.45rem;
    line-height: 1.15;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 8px 0 0;
    max-width: 700px;
  }

  @media (max-width: 720px) {
    align-items: start;
    flex-direction: column;

    h2 {
      font-size: 2rem;
    }
  }
`;

const ModeControl = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: repeat(2, minmax(92px, 1fr));
  padding: 4px;
`;

const ModeButton = styled.button`
  align-items: center;
  background: ${({ $active }) => ($active ? theme.colors.surface : 'transparent')};
  border: 0;
  border-radius: ${theme.radii.small};
  box-shadow: ${({ $active }) => ($active ? '0 1px 5px rgba(38, 40, 36, 0.12)' : 'none')};
  color: ${theme.colors.ink};
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 7px;
  justify-content: center;
  min-height: 42px;
  padding: 8px 12px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const QuickChoices = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 22px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 460px) {
    grid-template-columns: 1fr;
  }
`;

const QuickChoice = styled.button`
  align-items: center;
  background: ${({ $active }) => ($active ? '#e8f2ef' : theme.colors.background)};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.line)};
  border-radius: ${theme.radii.medium};
  color: ${({ $active }) => ($active ? '#183f35' : theme.colors.ink)};
  cursor: pointer;
  display: grid;
  font-weight: 800;
  gap: 2px 10px;
  grid-template-columns: 22px minmax(0, 1fr);
  min-height: 66px;
  padding: 11px 13px;
  text-align: left;

  svg {
    grid-row: 1 / span 2;
  }

  small {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const ResultLine = styled.p`
  color: ${theme.colors.muted};
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0 0 18px;
`;

const Grid = styled.div`
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

const DiscoveryView = styled.div`
  min-width: 0;
  scroll-margin-top: 96px;
`;

const MapFallback = styled.div`
  align-items: center;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  display: flex;
  font-weight: 700;
  height: 510px;
  justify-content: center;
  padding: 24px;

  @media (max-width: 640px) {
    height: 430px;
  }
`;

const EmptyState = styled.div`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  padding: 24px;
`;

const DiscoveryFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const TextLink = styled(Link)`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 7px;
  min-height: 44px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  &:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const StandardSection = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 64px 24px 0;
  scroll-margin-top: 96px;

  @media (max-width: 640px) {
    padding: 48px 16px 0;
  }
`;

const Benefits = styled.div`
  border-bottom: 1px solid ${theme.colors.line};
  border-top: 1px solid ${theme.colors.line};
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Benefit = styled.article`
  padding: 24px 20px;

  & + & {
    border-left: 1px solid ${theme.colors.line};
  }

  svg {
    color: ${theme.colors.forest};
  }

  h3 {
    font-size: 1.05rem;
    margin: 14px 0 7px;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.92rem;
    line-height: 1.55;
    margin: 0;
  }

  @media (max-width: 820px) {
    &:nth-child(3) {
      border-left: 0;
      border-top: 1px solid ${theme.colors.line};
    }

    &:nth-child(4) {
      border-top: 1px solid ${theme.colors.line};
    }
  }

  @media (max-width: 520px) {
    & + &,
    &:nth-child(4) {
      border-left: 0;
      border-top: 1px solid ${theme.colors.line};
    }
  }
`;

const AccountBand = styled.section`
  background: #e7eef3;
  border-bottom: 1px solid #cad9e3;
  border-top: 1px solid #cad9e3;
  margin-top: 64px;
`;

const AccountInner = styled.div`
  align-items: center;
  display: grid;
  gap: 34px;
  grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.7fr);
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 42px 24px;

  h2 {
    font-size: 2rem;
    margin: 0 0 10px;
  }

  p {
    color: #3f5968;
    line-height: 1.65;
    margin: 0;
    max-width: 680px;
  }

  @media (max-width: 760px) {
    align-items: start;
    grid-template-columns: 1fr;
    padding: 36px 16px;
  }
`;

const AccountActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;

  @media (max-width: 760px) {
    justify-content: flex-start;
  }
`;

const AccountAction = styled(Link)`
  align-items: center;
  background: ${({ $secondary }) => ($secondary ? 'transparent' : theme.colors.fjord)};
  border: 1px solid ${theme.colors.fjord};
  border-radius: ${theme.radii.small};
  color: ${({ $secondary }) => ($secondary ? theme.colors.fjord : theme.colors.surface)};
  display: inline-flex;
  font-weight: 800;
  gap: 7px;
  justify-content: center;
  min-height: 46px;
  padding: 10px 14px;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const PracticalGrid = styled.div`
  display: grid;
  gap: 48px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 720px) {
    gap: 34px;
    grid-template-columns: 1fr;
  }
`;

const PracticalBlock = styled.section`
  border-left: 4px solid ${({ $trust }) => ($trust ? theme.colors.fjord : theme.colors.forest)};
  padding-left: 20px;

  h2 {
    font-size: 1.55rem;
    margin: 0 0 10px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.65;
    margin: 0 0 14px;
  }

  a {
    color: ${({ $trust }) => ($trust ? theme.colors.fjord : theme.colors.forest)};
    font-weight: 800;
    text-underline-offset: 4px;
  }

  a:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const quickFilters = [
  { id: 'all', label: 'All hikes', detail: 'Browse every guide', Icon: Compass },
  { id: 'short', label: 'Short hikes', detail: 'Up to 3.5 km', Icon: Route },
  { id: 'half-day', label: 'Half-day hikes', detail: '3.5 to 8 km', Icon: Clock },
  { id: 'challenging', label: 'Challenging summits', detail: 'Hard difficulty', Icon: Mountain },
];

function getPrimaryTrail(mountain, trails) {
  return trails.find((trail) => trail.mountainId === mountain.id);
}

function matchesQuickFilter(filter, { mountain, trail }) {
  if (filter === 'all') {
    return true;
  }

  if (!trail) {
    return false;
  }

  if (filter === 'short') {
    return trail.lengthKm <= 3.5;
  }

  if (filter === 'half-day') {
    return trail.lengthKm > 3.5 && trail.lengthKm <= 8;
  }

  return (trail.difficulty ?? mountain.difficulty) === 'hard';
}

export function HomePage() {
  const { hash } = useLocation();
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const content = useMountainGuides();
  const [quickFilter, setQuickFilter] = useState('all');
  const [viewMode, setViewMode] = useState(hash === '#hike-map' ? 'map' : 'list');

  const mountainItems = useMemo(
    () =>
      content.mountains.map((mountain) => ({
        mountain,
        trail: getPrimaryTrail(mountain, content.trails),
      })),
    [content.mountains, content.trails],
  );

  const filteredItems = useMemo(
    () => mountainItems.filter((item) => matchesQuickFilter(quickFilter, item)),
    [mountainItems, quickFilter],
  );
  const visibleItems = filteredItems.slice(0, 6);

  useEffect(() => {
    if (hash !== '#hike-map' && hash !== '#find-a-hike' && hash !== '#about') {
      return undefined;
    }

    if (hash === '#hike-map') {
      setViewMode('map');
    }

    const timeoutId = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hash]);

  function showMap() {
    setViewMode('map');
  }

  return (
    <>
      <Seo
        title="Lofoten Hiking Guides"
        description={pageDescription}
        image="/images/homebanner.jpg"
        imageAlt="Mountain panorama in Lofoten"
        canonicalPath="/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Lofoten Peaks',
          url: 'https://lofotenpeaks.no/',
          description: pageDescription,
        }}
      />

      <Hero>
        <HeroImage
          src="/images/homebanner.jpg"
          srcSet="/images/homebanner-900.jpg 900w, /images/homebanner.jpg 1512w"
          sizes="100vw"
          alt="Rocky mountain ridge overlooking lakes, peaks, and the Lofoten coast"
          width="1512"
          height="509"
          fetchpriority="high"
          decoding="async"
        />
        <HeroOverlay />
        <HeroContent>
          <h1>Find your next hike in Lofoten</h1>
          <p>Practical route guides with maps, photos, weather information, and clear safety notes.</p>
          <HeroActions>
            <HeroAction href="#find-a-hike">
              <Compass size={19} aria-hidden="true" /> Explore hikes
            </HeroAction>
            <HeroAction href="#hike-map" $secondary onClick={showMap}>
              <MapPinned size={19} aria-hidden="true" /> View map
            </HeroAction>
          </HeroActions>
        </HeroContent>
      </Hero>

      <DiscoveryBand>
        <Discovery id="find-a-hike">
          <SectionHeader>
            <div>
              <h2>Find a hike</h2>
              <p>Choose a quick option, then compare practical route details in the list or on the map.</p>
            </div>
            <ModeControl role="group" aria-label="Hike discovery view">
              <ModeButton
                type="button"
                $active={viewMode === 'list'}
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <List size={17} aria-hidden="true" /> List
              </ModeButton>
              <ModeButton
                type="button"
                $active={viewMode === 'map'}
                aria-pressed={viewMode === 'map'}
                onClick={showMap}
              >
                <MapIcon size={17} aria-hidden="true" /> Map
              </ModeButton>
            </ModeControl>
          </SectionHeader>

          <QuickChoices role="group" aria-label="Quick hike filters">
            {quickFilters.map(({ id, label, detail, Icon }) => (
              <QuickChoice
                key={id}
                type="button"
                $active={quickFilter === id}
                aria-pressed={quickFilter === id}
                onClick={() => setQuickFilter(id)}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
                <small>{detail}</small>
              </QuickChoice>
            ))}
          </QuickChoices>

          <ResultLine role="status" aria-live="polite">
            {content.isLoading
              ? 'Loading the latest hiking guides...'
              : content.error ?? `${filteredItems.length} ${filteredItems.length === 1 ? 'hike' : 'hikes'} match this choice`}
          </ResultLine>

          <DiscoveryView id="hike-map">
            {content.isLoading ? (
              <EmptyState>Loading the latest hiking guides...</EmptyState>
            ) : content.error ? (
              <EmptyState>{content.error}</EmptyState>
            ) : filteredItems.length === 0 ? (
              <EmptyState>No hiking guides match this choice yet.</EmptyState>
            ) : viewMode === 'list' ? (
              <Grid>
                {visibleItems.map(({ mountain, trail }) => (
                  <MountainCard
                    key={mountain.id}
                    mountain={mountain}
                    trail={trail}
                    headingLevel={3}
                  />
                ))}
              </Grid>
            ) : (
              <Suspense fallback={<MapFallback role="status">Loading hike map...</MapFallback>}>
                <MountainOverviewMap items={filteredItems} />
              </Suspense>
            )}
          </DiscoveryView>

          <DiscoveryFooter>
            <TextLink to="/mountains">
              View all hikes and filters <ArrowRight size={17} aria-hidden="true" />
            </TextLink>
          </DiscoveryFooter>
        </Discovery>
      </DiscoveryBand>

      <StandardSection id="about">
        <SectionHeader>
          <div>
            <h2>Built specifically for hiking in Lofoten</h2>
            <p>Focused information for planning mountain days across the Lofoten islands.</p>
          </div>
        </SectionHeader>
        <Benefits>
          <Benefit>
            <Route size={23} aria-hidden="true" />
            <h3>Practical route details</h3>
            <p>Compare distance, duration, elevation gain, difficulty, access notes, and trailhead details.</p>
          </Benefit>
          <Benefit>
            <MapPinned size={23} aria-hidden="true" />
            <h3>Maps and route guidance</h3>
            <p>Review route maps and use GPX guidance where a route file is available.</p>
          </Benefit>
          <Benefit>
            <CloudSun size={23} aria-hidden="true" />
            <h3>Mountain weather</h3>
            <p>Check forecasts based on each hike&apos;s finish-point coordinates before setting out.</p>
          </Benefit>
          <Benefit>
            <ShieldCheck size={23} aria-hidden="true" />
            <h3>Clear safety notes</h3>
            <p>See route-specific cautions and planning advice alongside each hiking guide.</p>
          </Benefit>
        </Benefits>
      </StandardSection>

      <AccountBand>
        <AccountInner>
          <div>
            <h2>Keep track of your Lofoten adventures</h2>
            <p>
              Check in at summits, collect points, and keep a personal record of your Lofoten hikes.
              Public guides remain available without an account.
            </p>
          </div>
          <AccountActions>
            {!authIsLoading && user ? (
              <>
                <AccountAction to="/account?section=profile">
                  <UserCircle size={18} aria-hidden="true" /> View your profile
                </AccountAction>
                <AccountAction to="/account?section=overview" $secondary>
                  <Medal size={18} aria-hidden="true" /> Summit collection
                </AccountAction>
              </>
            ) : isConfigured && !authIsLoading ? (
              <>
                <AccountAction to="/account?mode=register">
                  <UserPlus size={18} aria-hidden="true" /> Create an account
                </AccountAction>
                <AccountAction to="/account?mode=sign-in" $secondary>
                  <LogIn size={18} aria-hidden="true" /> Sign in
                </AccountAction>
              </>
            ) : (
              <AccountAction to="/account">
                <UserCircle size={18} aria-hidden="true" /> Account
              </AccountAction>
            )}
          </AccountActions>
        </AccountInner>
      </AccountBand>

      <StandardSection>
        <PracticalGrid>
          <PracticalBlock>
            <h2>Plan before you go</h2>
            <p>
              Conditions in Lofoten can change quickly. Check current weather and local conditions,
              carry suitable equipment, and choose a route that matches your experience.
            </p>
            <Link to="/terms#hiking-safety">Read our hiking safety advice</Link>
          </PracticalBlock>
          <PracticalBlock $trust>
            <h2>Help keep information useful</h2>
            <p>
              Hiking guides are maintained by Lofoten Peaks. Community comments are shown separately
              and may contain personal opinions or mistakes.
            </p>
            <a href="mailto:contact@lofotenpeaks.no?subject=Incorrect%20hiking%20information">
              Report incorrect or outdated information
            </a>
          </PracticalBlock>
        </PracticalGrid>
      </StandardSection>
    </>
  );
}
