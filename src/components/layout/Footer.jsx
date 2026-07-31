import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { openCookieSettings } from '../../lib/cookieConsent.js';
import { theme } from '../../styles/theme.js';

const FooterFrame = styled.footer`
  margin-top: 64px;
`;

const FooterImage = styled.img`
  height: clamp(130px, 13.23vw, 571px);
  margin-bottom: -6px;
  object-fit: cover;
  object-position: center top;
  width: 100%;
`;

const FooterInner = styled.div`
  align-items: center;
  background: ${theme.colors.ink};
  display: grid;
  gap: 14px;
  justify-items: center;
  min-height: 160px;
  padding: 20px 24px 28px;
`;

const Logo = styled.img`
  height: 92px;
  object-fit: contain;
  width: 92px;

  @media (max-width: 620px) {
    height: 78px;
    width: 78px;
  }
`;

const FooterLinks = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  justify-content: center;

  a,
  button {
    background: transparent;
    border: 0;
    color: #fff;
    cursor: pointer;
    font-size: 0.92rem;
    font-weight: 700;
    padding: 5px;
    text-decoration: underline;
    text-decoration-color: rgba(255, 255, 255, 0.55);
    text-underline-offset: 4px;
  }

  a:hover,
  button:hover {
    text-decoration-color: #fff;
  }

  a:focus-visible,
  button:focus-visible {
    border-radius: ${theme.radii.small};
    outline: 3px solid #fff;
    outline-offset: 3px;
  }
`;

export function Footer() {
  return (
    <FooterFrame>
      <FooterImage src="/images/footerv3.png" alt="Illustrated mountain footer" />
      <FooterInner>
        <Logo src="/images/logo-white.png" alt="Lofoten Peaks logo" />
        <FooterLinks aria-label="Legal and privacy links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <button type="button" onClick={openCookieSettings}>
            Cookie settings
          </button>
        </FooterLinks>
      </FooterInner>
    </FooterFrame>
  );
}
