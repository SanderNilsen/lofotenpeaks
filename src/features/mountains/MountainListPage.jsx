import styled from 'styled-components';
import { MountainCard } from '../../components/mountains/MountainCard.jsx';
import { mountains } from '../../data/mountains.js';
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

export function MountainListPage() {
  return (
    <Page>
      <Header>
        <h1>Mountains</h1>
        <p>
          Browse starter mountain profiles for the MVP. Each profile links to route information,
          difficulty, images, and map data.
        </p>
      </Header>
      <Grid>
        {mountains.map((mountain) => (
          <MountainCard key={mountain.id} mountain={mountain} />
        ))}
      </Grid>
    </Page>
  );
}
