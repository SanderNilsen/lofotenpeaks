import { MapPinned } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { mountains } from '../../data/mountains.js';
import { theme } from '../../styles/theme.js';

const Hero = styled.section`
  position: relative;
  min-height: clamp(420px, 68vh, 640px);
  overflow: hidden;
`;

const HeroImage = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
`;

const HeroOverlay = styled.div`
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.16));
  inset: 0;
  position: absolute;
`;

const HeroContent = styled.div`
  color: ${theme.colors.surface};
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 112px 24px 72px;
  position: relative;

  h1 {
    font-size: clamp(2.4rem, 7vw, 5.6rem);
    line-height: 0.98;
    margin: 0;
    max-width: 820px;
  }

  p {
    font-size: 1.15rem;
    line-height: 1.6;
    max-width: 620px;
  }
`;

const HeroLink = styled(Link)`
  align-items: center;
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  padding: 12px 15px;
  text-decoration: none;
`;

const Section = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 48px 24px 0;
`;

const SectionHeader = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 22px;

  h2 {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 0;
    max-width: 760px;
  }
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

export function HomePage() {
  return (
    <>
      <Seo
        title="Lofoten Hiking Guides"
        description="Explore Lofoten Peaks, a practical guide to well-known mountain hikes in Lofoten with photos, route details, maps, weather, and safety notes."
        image="/images/homebanner.png"
      />
      <Hero>
        <HeroImage src="/images/homebanner.png" alt="Panorama overviewing Lofoten peaks" />
        <HeroOverlay />
        <HeroContent>
          <h1>Lofoten Peaks</h1>
          <p>
            A practical guide to well-known mountains and hiking trails in Lofoten, with photos,
            difficulty, height, distance, and maps.
          </p>
          <HeroLink to="/mountains">
            <MapPinned size={18} aria-hidden="true" /> Browse mountains
          </HeroLink>
        </HeroContent>
      </Hero>
      <Section>
        <SectionHeader>
          <h2>Featured Mountains</h2>
          <p>
            Phase 1 uses local static data so the site can be designed and published quickly. The
            same data shape can later move into Supabase for login, user hikes, and comments.
          </p>
        </SectionHeader>
        <Grid>
          {mountains.map((mountain) => (
            <MountainCard key={mountain.id} mountain={mountain} />
          ))}
        </Grid>
      </Section>
    </>
  );
}
