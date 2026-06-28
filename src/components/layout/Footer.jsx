import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const FooterFrame = styled.footer`
  margin-top: 64px;
`;

const FooterImage = styled.img`
  height: clamp(130px, 18vw, 250px);
  object-fit: cover;
  width: 100%;
  margin-bottom: -6px;
`;

const FooterInner = styled.div`
  align-items: center;
  background: ${theme.colors.ink};
  display: flex;
  justify-content: center;
  min-height: 132px;
  padding: 18px 24px;
`;

const Logo = styled.img`
  height: 112px;
  object-fit: contain;
  width: 112px;

  @media (max-width: 620px) {
    height: 88px;
    width: 88px;
  }
`;

export function Footer() {
  return (
    <FooterFrame>
      <FooterImage src="/images/footerv3.png" alt="Illustrated mountain footer" />
      <FooterInner>
        <Logo src="/images/logo-white.png" alt="Lofoten Peaks logo" />
      </FooterInner>
    </FooterFrame>
  );
}
