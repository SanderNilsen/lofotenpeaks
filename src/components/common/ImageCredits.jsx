import { ExternalLink } from 'lucide-react';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const CreditList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CreditItem = styled.li`
  border-top: 1px solid ${theme.colors.line};
  display: grid;
  gap: 4px;
  line-height: 1.45;
  padding-top: 10px;

  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
`;

const CreditLabel = styled.span`
  color: ${theme.colors.muted};
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const CreditLink = styled.a`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    border-radius: 2px;
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const CreditText = styled.span`
  color: ${theme.colors.ink};
  font-weight: 800;
`;

const License = styled.span`
  color: ${theme.colors.muted};
  font-size: 0.9rem;
`;

const StatusText = styled.p`
  color: ${theme.colors.muted};
  line-height: 1.5;
  margin: 0;
`;

function formatFileLabel(fileName) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isUrl(value) {
  return /^https?:\/\//i.test(value ?? '');
}

function getCreditHref(credit) {
  if (credit.creditUrl) {
    return credit.creditUrl;
  }

  return isUrl(credit.source) ? credit.source : '';
}

function getCreditLabel(credit) {
  if (!credit.source || isUrl(credit.source)) {
    return 'Photo source';
  }

  return credit.source;
}

export function ImageCredits({ credits = [] }) {
  if (credits.length === 0) {
    return <StatusText>No photo credits listed yet.</StatusText>;
  }

  return (
    <CreditList>
      {credits.map((credit, index) => (
        <CreditItem key={credit.fileName || credit.creditUrl || `${credit.source}-${index}`}>
          <CreditLabel>{credit.fileName ? formatFileLabel(credit.fileName) : 'Photo credit'}</CreditLabel>
          {getCreditHref(credit) ? (
            <CreditLink href={getCreditHref(credit)} target="_blank" rel="noreferrer">
              {getCreditLabel(credit)} <ExternalLink size={14} aria-hidden="true" />
            </CreditLink>
          ) : (
            credit.source && <CreditText>{credit.source}</CreditText>
          )}
          {credit.license && <License>{credit.license}</License>}
        </CreditItem>
      ))}
    </CreditList>
  );
}
