import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { openCookieSettings } from '../../lib/cookieConsent.js';
import { theme } from '../../styles/theme.js';

const FooterFrame = styled.footer`
  margin-top: 64px;
`;

const FooterImage = styled.img`
  height: auto;
  margin-bottom: -6px;
  object-fit: cover;
  object-position: center top;
  width: 100%;

  @media (max-width: 720px) {
    height: 130px;
  }
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

const FooterCopy = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
`;

const FooterLinks = styled.nav`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  justify-content: center;

  a,
  button {
    align-items: center;
    appearance: none;
    background: transparent;
    border: 0;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    font-size: 0.92rem;
    font-weight: 700;
    justify-content: center;
    line-height: 1.4;
    min-height: 36px;
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
      <FooterImage
        src="/images/footerv3.png"
        alt=""
        aria-hidden="true"
        width="4317"
        height="571"
        loading="lazy"
        decoding="async"
      />
      <FooterInner>
        <FooterLinks aria-label="Footer navigation">
          <Link to="/mountains">Hikes</Link>
          <Link to="/#hike-map">Map</Link>
          <Link to="/terms#hiking-safety">Safety</Link>
          <Link to="/#about">About</Link>
          <a href="mailto:contact@lofotenpeaks.no">Contact</a>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <button type="button" onClick={openCookieSettings}>
            Cookie settings
          </button>
        </FooterLinks>
        <FooterCopy>Independent hiking information for Lofoten, Norway.</FooterCopy>
      </FooterInner>
    </FooterFrame>
  );
}
