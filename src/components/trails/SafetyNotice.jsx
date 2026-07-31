import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const Notice = styled.aside`
  background: #e8f2ef;
  border: 1px solid #afcfc4;
  border-left: 5px solid ${theme.colors.forest};
  border-radius: ${theme.radii.medium};
  color: #183f35;
  display: grid;
  gap: 12px;
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
    font-size: 1.25rem;
    line-height: 1.25;
    margin: 0;
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
        <Compass size={23} aria-hidden="true" />
        <h2 id="route-safety-notice-title">Plan before you go</h2>
      </Heading>
      <p>
        Conditions in Lofoten can change quickly. Check current weather and local conditions, carry suitable equipment,
        and make decisions based on your own experience. Route descriptions and GPX tracks are helpful references and
        should not replace navigation skills or professional advice where appropriate.
      </p>
      <TermsLink to="/terms#hiking-safety">Read the hiking information and safety terms</TermsLink>
    </Notice>
  );
}
