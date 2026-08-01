import {
  CloudSun,
  Compass,
  List,
  Map as MapIcon,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { MountainWeatherPanel } from '../../components/weather/MountainWeatherPanel.jsx';
import { titleCase } from '../../lib/formatters.js';
import { theme } from '../../styles/theme.js';
import { useMountainGuides } from './useMountainGuides.js';

const MountainOverviewMap = lazy(
  () => import('../../components/mountains/MountainOverviewMap.jsx'),
);

const pageDescription =
  'Browse practical Lofoten hiking guides by area, difficulty, and route length, with maps, mountain weather, photos, and safety information.';

const Hero = styled.section`
  background: ${theme.colors.ink};
  min-height: 430px;
  overflow: hidden;
  position: relative;
`;

const HeroImage = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center 54%;
  position: absolute;
  width: 100%;
`;

const HeroOverlay = styled.div`
  background:
    linear-gradient(90deg, rgba(15, 20, 19, 0.82) 0%, rgba(15, 20, 19, 0.48) 54%, rgba(15, 20, 19, 0.12) 100%),
    linear-gradient(0deg, rgba(15, 20, 19, 0.5) 0%, transparent 58%);
  inset: 0;
  position: absolute;
`;

const HeroInner = styled.div`
  align-content: center;
  color: ${theme.colors.surface};
  display: grid;
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  min-height: 430px;
  padding: 68px 24px 58px;
  position: relative;

  h1 {
    font-size: 4.2rem;
    line-height: 1.04;
    margin: 0;
    max-width: 720px;
  }

  > p {
    font-size: 1.12rem;
    line-height: 1.65;
    margin: 18px 0 0;
    max-width: 650px;
  }

  @media (max-width: 760px) {
    h1 {
      font-size: 3.2rem;
    }
  }

  @media (max-width: 560px) {
    min-height: 420px;
    padding: 54px 20px 42px;

    h1 {
      font-size: 2.55rem;
      line-height: 1.08;
    }

    > p {
      font-size: 1rem;
      line-height: 1.55;
    }
  }
`;

const Eyebrow = styled.p`
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.78rem !important;
  font-weight: 800;
  margin: 0 0 12px !important;
  text-transform: uppercase;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
`;

const HeroAction = styled.a`
  align-items: center;
  background: ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.1)' : theme.colors.surface)};
  border: 1px solid ${({ $secondary }) => ($secondary ? 'rgba(255, 255, 255, 0.82)' : theme.colors.surface)};
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

const HeroSummary = styled.div`
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.45);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.88rem;
  font-weight: 800;
  gap: 10px 24px;
  margin-top: 34px;
  max-width: 650px;
  padding-top: 16px;

  span {
    align-items: center;
    display: inline-flex;
    gap: 7px;
  }
`;

const DirectoryBand = styled.section`
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.line};
`;

const Directory = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 58px 24px 72px;
  scroll-margin-top: 90px;

  @media (max-width: 640px) {
    padding: 42px 16px 54px;
  }
`;

const SectionHeader = styled.header`
  align-items: end;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  margin-bottom: 24px;

  h2 {
    font-size: 2.45rem;
    line-height: 1.14;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 8px 0 0;
    max-width: 680px;
  }

  @media (max-width: 760px) {
    align-items: start;
    flex-direction: column;
    gap: 18px;

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
  grid-template-columns: repeat(2, minmax(96px, 1fr));
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

const FilterPanel = styled.section`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 16px;
  margin-bottom: 22px;
  padding: 18px;

  @media (max-width: 560px) {
    padding: 15px;
  }
`;

const FilterHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;

  h3 {
    align-items: center;
    display: inline-flex;
    font-size: 1.08rem;
    gap: 8px;
    margin: 0;
  }
`;

const ResetButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: ${theme.radii.small};
  color: ${theme.colors.forest};
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  min-height: 40px;
  padding: 7px 4px;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(220px, 1.5fr) repeat(3, minmax(145px, 1fr));

  @media (max-width: 940px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  min-width: 0;

  span {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  input,
  select {
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 46px;
    padding: 10px 11px;
    width: 100%;
  }

  input:focus-visible,
  select:focus-visible {
    border-color: ${theme.colors.fjord};
    outline: 3px solid rgba(36, 95, 130, 0.2);
    outline-offset: 1px;
  }
`;

const SearchField = styled(Field)`
  position: relative;

  input {
    padding-left: 39px;
  }

  svg {
    bottom: 14px;
    color: ${theme.colors.muted};
    left: 12px;
    position: absolute;
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

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DirectoryView = styled.div`
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
  align-items: start;
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 28px;

  h3 {
    font-size: 1.35rem;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.55;
    margin: 0;
  }
`;

const EmptyAction = styled.button`
  align-items: center;
  background: ${theme.colors.forest};
  border: 1px solid ${theme.colors.forest};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 7px;
  min-height: 44px;
  padding: 10px 14px;

  &:hover {
    background: #245b4d;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const WeatherBand = styled.section`
  background: ${theme.colors.background};
`;

const WeatherInner = styled.div`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 64px 24px 72px;
  scroll-margin-top: 90px;

  @media (max-width: 640px) {
    padding: 48px 16px 56px;
  }
`;

const islandNameAliases = {
  Austvågøy: 'Austvågøya',
  Flakstadøy: 'Flakstadøya',
  Gimsøy: 'Gimsøya',
  Moskenesøy: 'Moskenesøya',
  Vestvågøy: 'Vestvågøya',
};

function getRegionLabel(region = '') {
  const label = region.split(',')[0].trim();

  return islandNameAliases[label] ?? label;
}

function getPrimaryTrail(mountain, trails) {
  return trails.find((trail) => trail.mountainId === mountain.id);
}

function matchesLengthFilter(lengthFilter, trail) {
  if (lengthFilter === 'all') {
    return true;
  }

  if (!trail) {
    return false;
  }

  if (lengthFilter === 'short') {
    return trail.lengthKm <= 3.5;
  }

  if (lengthFilter === 'half-day') {
    return trail.lengthKm > 3.5 && trail.lengthKm <= 8;
  }

  return trail.lengthKm > 8;
}

export function MountainListPage() {
  const content = useMountainGuides();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [lengthFilter, setLengthFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const mountainItems = useMemo(
    () => content.mountains.map((mountain) => ({ mountain, trail: getPrimaryTrail(mountain, content.trails) })),
    [content.mountains, content.trails],
  );

  const regionOptions = useMemo(
    () =>
      [...new Set(content.mountains.map((mountain) => getRegionLabel(mountain.region)).filter(Boolean))].sort(),
    [content.mountains],
  );

  const difficultyOptions = useMemo(
    () => [...new Set(content.mountains.map((mountain) => mountain.difficulty).filter(Boolean))].sort(),
    [content.mountains],
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return mountainItems.filter(({ mountain, trail }) => {
      const searchableText = [mountain.name, mountain.region, mountain.summary, trail?.summary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);
      const matchesDifficulty = difficultyFilter === 'all' || mountain.difficulty === difficultyFilter;
      const matchesRegion = regionFilter === 'all' || getRegionLabel(mountain.region) === regionFilter;

      return matchesSearch && matchesDifficulty && matchesRegion && matchesLengthFilter(lengthFilter, trail);
    });
  }, [difficultyFilter, lengthFilter, mountainItems, regionFilter, searchTerm]);

  const filtersAreActive = Boolean(
    searchTerm || difficultyFilter !== 'all' || regionFilter !== 'all' || lengthFilter !== 'all',
  );

  function resetFilters() {
    setSearchTerm('');
    setDifficultyFilter('all');
    setRegionFilter('all');
    setLengthFilter('all');
  }

  return (
    <>
      <Seo
        title="Lofoten Hikes"
        description={pageDescription}
        image="/images/matmorapanorama.png"
        imageAlt="Wide mountain and coastal panorama from Matmora in Lofoten"
        canonicalPath="/mountains"
      />

      <Hero>
        <HeroImage
          src="/images/matmorapanorama.png"
          alt="Hikers overlooking mountains, islands, and the coast from Matmora in Lofoten"
          width="1512"
          height="507"
          fetchpriority="high"
          decoding="async"
        />
        <HeroOverlay />
        <HeroInner>
          <Eyebrow>Lofoten hiking guides</Eyebrow>
          <h1>Hikes in Lofoten</h1>
          <p>
            Compare mountain routes by difficulty, area, and length. Each guide brings together
            practical planning details, maps, photos, current weather, and route-specific safety notes.
          </p>
          <HeroActions>
            <HeroAction href="#hike-directory">
              <Compass size={19} aria-hidden="true" /> Browse hiking guides
            </HeroAction>
            <HeroAction href="#lofoten-weather" $secondary>
              <CloudSun size={19} aria-hidden="true" /> Current weather
            </HeroAction>
          </HeroActions>
          <HeroSummary aria-label="Hiking guide collection summary">
            <span>{content.mountains.length} detailed guides</span>
            <span>Across Lofoten</span>
            <span>List and map views</span>
          </HeroSummary>
        </HeroInner>
      </Hero>

      <DirectoryBand>
        <Directory id="hike-directory">
          <SectionHeader>
            <div>
              <h2>Choose your hike</h2>
              <p>Search the full guide collection or narrow it down by route difficulty, area, and distance.</p>
            </div>
            <ModeControl role="group" aria-label="Hiking guide view">
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
                onClick={() => setViewMode('map')}
              >
                <MapIcon size={17} aria-hidden="true" /> Map
              </ModeButton>
            </ModeControl>
          </SectionHeader>

          <FilterPanel aria-labelledby="mountain-filters-heading">
            <FilterHeader>
              <h3 id="mountain-filters-heading">
                <SlidersHorizontal size={18} aria-hidden="true" /> Refine your search
              </h3>
              {filtersAreActive && (
                <ResetButton type="button" onClick={resetFilters}>
                  <RotateCcw size={15} aria-hidden="true" /> Reset
                </ResetButton>
              )}
            </FilterHeader>
            <FilterGrid>
              <SearchField>
                <span>Search</span>
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={searchTerm}
                  placeholder="Mountain, area, or keyword"
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </SearchField>
              <Field>
                <span>Difficulty</span>
                <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
                  <option value="all">All difficulties</option>
                  {difficultyOptions.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {titleCase(difficulty)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <span>Area</span>
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                  <option value="all">All areas</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <span>Route length</span>
                <select value={lengthFilter} onChange={(event) => setLengthFilter(event.target.value)}>
                  <option value="all">All lengths</option>
                  <option value="short">Short, up to 3.5 km</option>
                  <option value="half-day">Half-day, 3.5-8 km</option>
                  <option value="long">Long, over 8 km</option>
                </select>
              </Field>
            </FilterGrid>
          </FilterPanel>

          <ResultLine role="status" aria-live="polite">
            {content.isLoading
              ? 'Loading the latest hiking guides...'
              : content.error ??
                `${filteredItems.length} of ${content.mountains.length} ${content.mountains.length === 1 ? 'guide' : 'guides'} shown`}
          </ResultLine>

          <DirectoryView id="hike-results">
            {content.isLoading ? (
              <EmptyState role="status">
                <h3>Loading hiking guides</h3>
                <p>The latest published guides are being retrieved.</p>
              </EmptyState>
            ) : content.error ? (
              <EmptyState role="alert">
                <SearchX size={24} aria-hidden="true" />
                <h3>Hiking guides are unavailable</h3>
                <p>{content.error}</p>
              </EmptyState>
            ) : filteredItems.length === 0 ? (
              <EmptyState>
                <SearchX size={24} aria-hidden="true" />
                <h3>No hikes match these filters</h3>
                <p>Try a different area or difficulty, or clear the filters to see every hiking guide.</p>
                <EmptyAction type="button" onClick={resetFilters}>
                  <RotateCcw size={16} aria-hidden="true" /> Show all hikes
                </EmptyAction>
              </EmptyState>
            ) : viewMode === 'list' ? (
              <Grid>
                {filteredItems.map(({ mountain, trail }) => (
                  <MountainCard
                    key={mountain.id}
                    mountain={mountain}
                    trail={trail}
                    headingLevel={3}
                  />
                ))}
              </Grid>
            ) : (
              <Suspense fallback={<MapFallback role="status">Loading the hike map...</MapFallback>}>
                <MountainOverviewMap items={filteredItems} />
              </Suspense>
            )}
          </DirectoryView>
        </Directory>
      </DirectoryBand>

      <WeatherBand>
        <WeatherInner id="lofoten-weather">
          <MountainWeatherPanel
            title="Current weather around Lofoten"
            description="A regional snapshot for planning. Open each hiking guide for weather based on that route's finish-point coordinates."
          />
        </WeatherInner>
      </WeatherBand>
    </>
  );
}
