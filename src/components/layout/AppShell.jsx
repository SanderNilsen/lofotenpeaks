import styled from 'styled-components';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';

const Main = styled.main`
  min-height: 70vh;
`;

export function AppShell({ children }) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
