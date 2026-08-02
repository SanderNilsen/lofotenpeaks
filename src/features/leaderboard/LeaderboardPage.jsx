import styled from 'styled-components';
import { Seo } from '../../components/common/Seo.jsx';
import { LeaderboardPanel } from '../../components/community/LeaderboardPanel.jsx';
import { theme } from '../../styles/theme.js';
import { useAuth } from '../auth/AuthProvider.jsx';

const Page = styled.section`
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  padding: 48px 24px 80px;

  @media (max-width: 640px) {
    padding: 34px 16px 56px;
  }
`;

const Intro = styled.header`
  display: grid;
  gap: 10px;
  margin-bottom: 24px;

  h1 {
    font-size: 3rem;
    line-height: 1.08;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.65;
    margin: 0;
    max-width: 720px;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 2.25rem;
    }
  }
`;

export default function LeaderboardPage() {
  const { user } = useAuth();

  return (
    <Page>
      <Seo
        title="Hiking leaderboard"
        description="See approved summit check-ins, unique Lofoten summits, and points earned by the hiking community."
        canonicalPath="/leaderboard"
      />
      <Intro>
        <h1>Lofoten hiking leaderboard</h1>
        <p>
          A community overview based only on approved summit check-ins. Rankings celebrate consistent exploration without rewarding speed or risky conditions.
        </p>
      </Intro>
      <LeaderboardPanel currentUserId={user?.id ?? null} full />
    </Page>
  );
}
