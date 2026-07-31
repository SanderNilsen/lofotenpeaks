import styled from 'styled-components';
import { CookieConsent } from '../privacy/CookieConsent.jsx';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
`;

export function AppShell({ children }) {
  return (
    <Shell>
      <Header />
      <Main>{children}</Main>
      <Footer />
      <CookieConsent />
    </Shell>
  );
}
