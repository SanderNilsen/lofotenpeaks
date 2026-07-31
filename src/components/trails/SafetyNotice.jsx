import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const Notice = styled.aside`
  background: #fff7ed;
  border: 1px solid #d79b62;
  border-left: 5px solid ${theme.colors.warning};
  border-radius: ${theme.radii.medium};
  color: #4b2d18;
  display: grid;
  gap: 14px;
  margin-top: 28px;
  padding: 20px 22px;

  p {
    line-height: 1.65;
    margin: 0;
  }
`;

const Heading = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;

  h2 {
    font-size: 1.35rem;
    line-height: 1.25;
    margin: 0;
  }
`;

const SafetyList = styled.ul`
  display: grid;
  gap: 8px 28px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding-left: 22px;

  li {
    line-height: 1.55;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const TermsLink = styled(Link)`
  color: ${theme.colors.fjord};
  font-weight: 800;
  justify-self: start;
  text-underline-offset: 3px;

  &:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

export function SafetyNotice() {
  return (
    <Notice aria-labelledby="route-safety-notice-title">
      <Heading>
        <ShieldAlert size={24} aria-hidden="true" />
        <h2 id="route-safety-notice-title">Safety Notice</h2>
      </Heading>
      <p>
        Mountain conditions in Lofoten can change rapidly. This route description, map or GPX-derived line, and
        difficulty rating are informational only and may not reflect current conditions.
      </p>
      <SafetyList>
        <li>Check the latest weather forecast and local trail conditions.</li>
        <li>Check avalanche conditions when snow or avalanche terrain is relevant.</li>
        <li>Carry suitable clothing, navigation tools, and emergency equipment.</li>
        <li>Know your skill level and tell someone where you are going.</li>
        <li>Never rely solely on a phone, GPS, or GPX track.</li>
        <li>Turn back if conditions, visibility, or the group become unsafe.</li>
        <li>Use a map and the navigation skills needed for the terrain.</li>
        <li>Consider a qualified local mountain guide if you are uncertain or inexperienced.</li>
      </SafetyList>
      <p>You are responsible for your own preparation, route choices, and safety decisions while hiking.</p>
      <TermsLink to="/terms#safety">Read the full safety disclaimer</TermsLink>
    </Notice>
  );
}
