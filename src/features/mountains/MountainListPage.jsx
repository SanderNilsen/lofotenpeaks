import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { MountainWeatherPanel } from '../../components/weather/MountainWeatherPanel.jsx';
import { mountains as staticMountains } from '../../data/mountains.js';
import { trails as staticTrails } from '../../data/trails.js';
import { getRemoteMountainGuides } from '../../lib/supabase/api.js';
import { isSupabaseConfigured } from '../../lib/supabase/client.js';
import { theme } from '../../styles/theme.js';

const Page = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 48px 24px 0;
`;

const Header = styled.header`
  margin-bottom: 26px;

  h1 {
    font-size: clamp(2.2rem, 5vw, 4rem);
    margin: 0 0 10px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 0;
    max-width: 720px;
  }
`;

const FilterPanel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  padding: 18px;
`;

const FilterHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;

  h2 {
    align-items: center;
    display: inline-flex;
    font-size: 1.2rem;
    gap: 8px;
    margin: 0;
  }
`;

const ResetButton = styled.button`
  background: transparent;
  border: 0;
  color: ${theme.colors.forest};
  cursor: pointer;
  font-weight: 800;
  padding: 4px 0;

  &:hover {
    text-decoration: underline;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(220px, 1.4fr) repeat(3, minmax(150px, 1fr));

  @media (max-width: 920px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;

  span {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  input,
  select {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    min-height: 44px;
    padding: 10px 11px;
    width: 100%;
  }
`;

const SearchField = styled(Field)`
  position: relative;

  input {
    padding-left: 38px;
  }

  svg {
    bottom: 13px;
    color: ${theme.colors.muted};
    left: 12px;
    position: absolute;
  }
`;

const ResultLine = styled.p`
  color: ${theme.colors.muted};
  font-weight: 700;
  margin: 0;
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

const EmptyState = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  color: ${theme.colors.muted};
  font-weight: 700;
  padding: 22px;
`;

function getRegionLabel(region) {
  return region.split(',')[0].trim();
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
  const [content, setContent] = useState({
    mountains: staticMountains,
    trails: staticTrails,
    isLoading: isSupabaseConfigured,
    source: 'static',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [lengthFilter, setLengthFilter] = useState('all');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    let isMounted = true;

    getRemoteMountainGuides()
      .then((remoteContent) => {
        if (!isMounted) {
          return;
        }

        if (remoteContent.mountains.length > 0) {
          setContent({ ...remoteContent, isLoading: false, source: 'supabase' });
        } else {
          setContent((current) => ({ ...current, isLoading: false }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setContent((current) => ({ ...current, isLoading: false }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mountainItems = useMemo(
    () => content.mountains.map((mountain) => ({ mountain, trail: getPrimaryTrail(mountain, content.trails) })),
    [content.mountains, content.trails],
  );

  const regionOptions = useMemo(
    () => [...new Set(content.mountains.map((mountain) => getRegionLabel(mountain.region)))].sort(),
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

  const filtersAreActive =
    searchTerm || difficultyFilter !== 'all' || regionFilter !== 'all' || lengthFilter !== 'all';

  function resetFilters() {
    setSearchTerm('');
    setDifficultyFilter('all');
    setRegionFilter('all');
    setLengthFilter('all');
  }

  return (
    <Page>
      <Seo
        title="Mountains"
        description="Browse Lofoten mountain hiking guides by difficulty, region, route length, weather, photos, and map details."
        image="/images/reinebringen-gallery-1.jpg"
      />
      <Header>
        <h1>Mountains</h1>
        <p>
          Browse hiking guides for well-known Lofoten mountains. Each guide includes route
          information, difficulty, photos, map data, and safety notes.
        </p>
      </Header>
      <MountainWeatherPanel />
      <FilterPanel aria-labelledby="mountain-filters-heading">
        <FilterHeader>
          <h2 id="mountain-filters-heading">
            <SlidersHorizontal size={18} aria-hidden="true" /> Find a hike
          </h2>
          {filtersAreActive && (
            <ResetButton type="button" onClick={resetFilters}>
              Reset filters
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
              placeholder="Search mountain, region, or keyword"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </SearchField>
          <Field>
            <span>Difficulty</span>
            <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
              <option value="all">All difficulties</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </Field>
          <Field>
            <span>Region</span>
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              <option value="all">All regions</option>
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
        <ResultLine>
          Showing {filteredItems.length} of {content.mountains.length} mountain guides
          {content.isLoading ? ' · Syncing Supabase content...' : ''}
        </ResultLine>
      </FilterPanel>
      {filteredItems.length > 0 ? (
        <Grid>
          {filteredItems.map(({ mountain, trail }) => (
            <MountainCard key={mountain.id} mountain={mountain} trail={trail} />
          ))}
        </Grid>
      ) : (
        <EmptyState>No mountains match the selected filters.</EmptyState>
      )}
    </Page>
  );
}
