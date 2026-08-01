import { Flag, LogIn, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../features/auth/AuthProvider.jsx';
import { submitRouteCorrection } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';

const Panel = styled.section`
  border-bottom: 1px solid ${theme.colors.line};
  border-top: 1px solid ${theme.colors.line};
  display: grid;
  gap: 14px;
  padding: 24px 0;

  h2,
  p {
    margin: 0;
  }

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.25rem;
    gap: 8px;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    max-width: 760px;
  }
`;

const Form = styled.form`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  display: grid;
  gap: 14px;
  max-width: 760px;
  padding: 18px;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  font-size: 0.84rem;
  font-weight: 800;
  gap: 6px;

  input,
  select,
  textarea {
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    font: inherit;
    min-height: 44px;
    padding: 10px;
    width: 100%;

    &:focus-visible {
      border-color: ${theme.colors.fjord};
      outline: 3px solid rgba(36, 95, 130, 0.2);
      outline-offset: 1px;
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  small {
    color: ${theme.colors.muted};
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.45;
  }
`;

const FullField = styled(Field)`
  grid-column: 1 / -1;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
`;

const Button = styled.button`
  align-items: center;
  background: ${({ $secondary }) => ($secondary ? theme.colors.surface : theme.colors.forest)};
  border: 1px solid ${({ $secondary }) => ($secondary ? theme.colors.line : theme.colors.forest)};
  border-radius: ${theme.radii.small};
  color: ${({ $secondary }) => ($secondary ? theme.colors.ink : theme.colors.surface)};
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: 850;
  gap: 7px;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }
`;

const AccountLink = styled(Link)`
  color: ${theme.colors.forest};
  font-weight: 850;
`;

const Message = styled.p`
  background: ${({ $error }) => ($error ? '#f2e6dc' : '#e8f2ef')};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : '#bdd8cf')};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? '#713d1f' : theme.colors.forest)} !important;
  font-weight: 750;
  padding: 11px;
`;

const initialForm = {
  category: 'route_description',
  affectedSection: '',
  details: '',
  sourceUrl: '',
  observedOn: '',
};

export function RouteCorrectionPanel({ trail }) {
  const { isConfigured, isLoading, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus({ type: 'idle', message: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.details.trim().length < 20) {
      setStatus({ type: 'error', message: 'Describe the correction in at least 20 characters.' });
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      await submitRouteCorrection({ trailId: trail.id, ...form });
      setForm(initialForm);
      setIsOpen(false);
      setStatus({ type: 'success', message: 'Correction sent for administrator review. Thank you.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message?.includes('Accept the current Terms')
          ? 'Review and accept the current Terms in Account settings before submitting a correction.'
          : 'We could not send the correction. Please try again.',
      });
    }
  }

  return (
    <Panel aria-labelledby="route-correction-heading">
      <h2 id="route-correction-heading"><Flag size={19} aria-hidden="true" /> Is this guide inaccurate?</h2>
      <p>Report changed access, route, difficulty, or safety information.</p>
      {!isConfigured && <Message>Route reports are not connected.</Message>}
      {isConfigured && isLoading && <p role="status">Checking account...</p>}
      {isConfigured && !isLoading && !user && (
        <p><AccountLink to="/account"><LogIn size={16} aria-hidden="true" /> Sign in</AccountLink> to submit a correction.</p>
      )}
      {isConfigured && !isLoading && user && !isOpen && (
        <Button type="button" $secondary onClick={() => setIsOpen(true)}>
          <Flag size={16} aria-hidden="true" /> Report incorrect information
        </Button>
      )}
      {isOpen && (
        <Form onSubmit={handleSubmit}>
          <Grid>
            <Field>
              Category
              <select value={form.category} onChange={(event) => updateField('category', event.target.value)}>
                <option value="route_description">Route description</option>
                <option value="map_gpx">Map or GPX data</option>
                <option value="trailhead">Trailhead location</option>
                <option value="parking_access">Parking or access</option>
                <option value="difficulty">Difficulty</option>
                <option value="duration_distance">Duration or distance</option>
                <option value="safety">Safety information</option>
                <option value="broken_link">Broken link</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field>
              Date observed (optional)
              <input type="date" value={form.observedOn} onChange={(event) => updateField('observedOn', event.target.value)} />
            </Field>
            <Field>
              Affected section (optional)
              <input
                maxLength="120"
                value={form.affectedSection}
                placeholder="For example: upper ridge"
                onChange={(event) => updateField('affectedSection', event.target.value)}
              />
            </Field>
            <Field>
              Source link (optional)
              <input
                type="url"
                maxLength="500"
                value={form.sourceUrl}
                placeholder="https://"
                onChange={(event) => updateField('sourceUrl', event.target.value)}
              />
            </Field>
            <FullField>
              What needs correction?
              <textarea
                required
                minLength="20"
                maxLength="2000"
                value={form.details}
                onChange={(event) => updateField('details', event.target.value)}
              />
              <small>Include what changed and how it affects a hiker.</small>
            </FullField>
          </Grid>
          <Actions>
            <Button type="submit" disabled={status.type === 'loading'}>
              <Send size={16} aria-hidden="true" /> {status.type === 'loading' ? 'Sending...' : 'Send correction'}
            </Button>
            <Button type="button" $secondary onClick={() => setIsOpen(false)}>
              <X size={16} aria-hidden="true" /> Cancel
            </Button>
          </Actions>
        </Form>
      )}
      {status.message && (
        <Message $error={status.type === 'error'} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite">
          {status.message}
        </Message>
      )}
    </Panel>
  );
}
