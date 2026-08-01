import { Check, ExternalLink, Flag, MessageSquareWarning, RefreshCw, Route, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  getAdminModerationQueues,
  moderateAdminComment,
  moderateAdminHikeRecommendation,
  reviewAdminRouteCorrection,
} from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';

const Workspace = styled.section`
  display: grid;
  gap: 30px;
`;

const Header = styled.div`
  align-items: end;
  display: flex;
  gap: 20px;
  justify-content: space-between;

  h2 {
    font-size: 1.8rem;
    margin: 0;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.6;
    margin: 7px 0 0;
    max-width: 680px;
  }

  @media (max-width: 680px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const RefreshButton = styled.button`
  align-items: center;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
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
    cursor: wait;
    opacity: 0.62;
  }
`;

const Status = styled.p`
  background: ${({ $error }) => ($error ? '#f2e6dc' : '#e8f2ef')};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : '#bdd8cf')};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? '#713d1f' : theme.colors.forest)} !important;
  font-weight: 750;
  margin: 0 !important;
  padding: 12px 14px;
`;

const Queue = styled.section`
  border-top: 1px solid ${theme.colors.line};
  padding-top: 24px;

  > header {
    align-items: center;
    display: flex;
    gap: 10px;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  h3 {
    align-items: center;
    display: flex;
    font-size: 1.2rem;
    gap: 8px;
    margin: 0;
  }
`;

const Count = styled.span`
  background: ${theme.colors.ink};
  border-radius: 999px;
  color: ${theme.colors.surface};
  font-size: 0.76rem;
  font-weight: 900;
  min-width: 27px;
  padding: 5px 8px;
  text-align: center;
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
`;

const FilterButton = styled.button`
  background: ${({ $active }) => ($active ? theme.colors.ink : theme.colors.surface)};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.ink : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $active }) => ($active ? theme.colors.surface : theme.colors.ink)};
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 850;
  min-height: 42px;
  padding: 8px 11px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const ItemList = styled.div`
  display: grid;
  gap: 12px;
`;

const Item = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 14px;
  padding: 18px;

  h4 {
    font-size: 1.02rem;
    margin: 0;
  }

  p {
    line-height: 1.58;
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

const ItemMeta = styled.div`
  color: ${theme.colors.muted};
  display: flex;
  flex-wrap: wrap;
  font-size: 0.82rem;
  font-weight: 750;
  gap: 6px 14px;
`;

const TrailLink = styled(Link)`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 850;
  gap: 6px;
  justify-self: start;
  min-height: 44px;
`;

const SourceLink = styled.a`
  align-items: center;
  color: ${theme.colors.forest};
  display: inline-flex;
  font-weight: 800;
  gap: 6px;
  overflow-wrap: anywhere;
`;

const NoteField = styled.label`
  display: grid;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 6px;

  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    font: inherit;
    min-height: 76px;
    padding: 10px;
    resize: vertical;
    width: 100%;
  }

  textarea:focus-visible {
    border-color: ${theme.colors.fjord};
    outline: 3px solid rgba(36, 95, 130, 0.2);
    outline-offset: 1px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ActionButton = styled.button`
  align-items: center;
  background: ${({ $danger, $primary }) =>
    $danger ? '#f2e6dc' : $primary ? theme.colors.forest : theme.colors.background};
  border: 1px solid ${({ $danger, $primary }) =>
    $danger ? '#dfc4af' : $primary ? theme.colors.forest : theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${({ $danger, $primary }) =>
    $danger ? '#713d1f' : $primary ? theme.colors.surface : theme.colors.ink};
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 850;
  gap: 6px;
  justify-content: center;
  min-height: 44px;
  padding: 9px 12px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.58;
  }
`;

const Empty = styled.p`
  background: ${theme.colors.surface};
  border: 1px dashed ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.muted};
  padding: 20px;
`;

const emptyQueues = { reports: [], hikes: [], corrections: [] };

const reportFilters = [
  { value: 'active', label: 'Active' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under review' },
  { value: 'action_taken', label: 'Action taken' },
  { value: 'no_action_required', label: 'No action' },
  { value: 'all', label: 'All' },
];

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Oslo',
  }).format(date);
}

export function AdminModerationPanel() {
  const [queues, setQueues] = useState(emptyQueues);
  const [notes, setNotes] = useState({});
  const [status, setStatus] = useState({ type: 'loading', message: '' });
  const [activeItem, setActiveItem] = useState('');
  const [reportFilter, setReportFilter] = useState('active');

  const filteredReports = queues.reports.filter((report) => {
    if (reportFilter === 'all') return true;
    if (reportFilter === 'active') return ['open', 'under_review'].includes(report.report_status);
    return report.report_status === reportFilter;
  });

  const loadQueues = useCallback(async () => {
    setStatus({ type: 'loading', message: '' });

    try {
      setQueues(await getAdminModerationQueues());
      setStatus({ type: 'idle', message: '' });
    } catch {
      setStatus({ type: 'error', message: 'The moderation queues could not be loaded. Please try again.' });
    }
  }, []);

  useEffect(() => {
    loadQueues();
  }, [loadQueues]);

  function updateNote(id, value) {
    setNotes((current) => ({ ...current, [id]: value }));
  }

  async function runAction(itemKey, action) {
    setActiveItem(itemKey);
    setStatus({ type: 'idle', message: '' });

    try {
      await action();
      await loadQueues();
      setNotes((current) => ({ ...current, [itemKey]: '' }));
      setStatus({ type: 'success', message: 'The moderation decision was saved.' });
    } catch {
      setStatus({ type: 'error', message: 'The moderation decision could not be saved. Please try again.' });
    } finally {
      setActiveItem('');
    }
  }

  function runCommentAction({ key, report, action }) {
    if (action !== 'under_review' && !notes[key]?.trim()) {
      setStatus({ type: 'error', message: 'Add a decision note before completing this moderation action.' });
      return;
    }

    runAction(key, () => moderateAdminComment({
      commentId: report.comment_id,
      reportId: report.report_id,
      action,
      internalNote: notes[key],
    }));
  }

  function runHikeAction({ key, hike, action }) {
    if (!notes[key]?.trim()) {
      setStatus({ type: 'error', message: 'Add a decision note before completing this recommendation review.' });
      return;
    }

    runAction(key, () => moderateAdminHikeRecommendation({
      hikeId: hike.id,
      action,
      note: notes[key],
    }));
  }

  function runCorrectionAction({ key, correction, action }) {
    if (action !== 'under_review' && !notes[key]?.trim()) {
      setStatus({ type: 'error', message: 'Add a resolution note before completing this correction review.' });
      return;
    }

    runAction(key, () => reviewAdminRouteCorrection({
      correctionId: correction.id,
      action,
      note: notes[key],
    }));
  }

  return (
    <Workspace aria-labelledby="moderation-heading">
      <Header>
        <div>
          <h2 id="moderation-heading">Community review</h2>
          <p>Review reported comments, hike recommendations, and route corrections. Decisions are recorded server-side.</p>
        </div>
        <RefreshButton type="button" onClick={loadQueues} disabled={status.type === 'loading'}>
          <RefreshCw size={16} aria-hidden="true" /> {status.type === 'loading' ? 'Loading...' : 'Refresh queues'}
        </RefreshButton>
      </Header>

      {status.message && (
        <Status $error={status.type === 'error'} role={status.type === 'error' ? 'alert' : 'status'} aria-live="polite">
          {status.message}
        </Status>
      )}

      <Queue aria-labelledby="comment-reports-heading">
        <header>
          <h3 id="comment-reports-heading"><MessageSquareWarning size={19} aria-hidden="true" /> Reported comments</h3>
          <Count aria-label={`${filteredReports.length} reports shown`}>{filteredReports.length}</Count>
        </header>
        <FilterBar role="group" aria-label="Filter comment reports by status">
          {reportFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              type="button"
              $active={reportFilter === filter.value}
              aria-pressed={reportFilter === filter.value}
              onClick={() => setReportFilter(filter.value)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterBar>
        <ItemList>
          {filteredReports.map((report) => {
            const key = `report-${report.report_id}`;
            const isBusy = activeItem === key;
            return (
              <Item key={report.report_id}>
                <div>
                  <h4>{report.reason.replaceAll('_', ' ')}</h4>
                  <ItemMeta>
                    <span>By {report.author_name}</span>
                    <span>Reported {formatDate(report.reported_at)}</span>
                    <span>Status: {report.report_status.replaceAll('_', ' ')}</span>
                    <span>Visibility: {report.visibility_status}</span>
                    {report.resolved_at && <span>Resolved {formatDate(report.resolved_at)}</span>}
                  </ItemMeta>
                </div>
                <p>{report.comment_body}</p>
                {report.details && <p><strong>Report details:</strong> {report.details}</p>}
                {report.resolution_note && <p><strong>Previous decision note:</strong> {report.resolution_note}</p>}
                {report.trail_slug && (
                  <TrailLink to={`/mountains/${report.trail_slug}`} target="_blank" rel="noreferrer">
                    Open {report.trail_name ?? 'hike'} <ExternalLink size={15} aria-hidden="true" />
                  </TrailLink>
                )}
                <NoteField>
                  Decision note (required for a final action)
                  <textarea value={notes[key] ?? ''} onChange={(event) => updateNote(key, event.target.value)} />
                </NoteField>
                <Actions>
                  {report.report_status === 'open' && (
                    <ActionButton
                      type="button"
                      disabled={isBusy}
                      onClick={() => runCommentAction({ key, report, action: 'under_review' })}
                    >
                      Start review
                    </ActionButton>
                  )}
                  <ActionButton
                    type="button"
                    $primary
                    disabled={isBusy}
                    onClick={() => runCommentAction({ key, report, action: 'no_action' })}
                  >
                    <Check size={15} aria-hidden="true" /> No action needed
                  </ActionButton>
                  {report.comment_available && report.visibility_status !== 'published' && (
                    <ActionButton
                      type="button"
                      disabled={isBusy}
                      onClick={() => runCommentAction({ key, report, action: 'publish' })}
                    >
                      <Check size={15} aria-hidden="true" /> Restore comment
                    </ActionButton>
                  )}
                  {report.comment_available && (
                    <ActionButton
                      type="button"
                      disabled={isBusy}
                      onClick={() => runCommentAction({ key, report, action: 'hide' })}
                    >
                      <X size={15} aria-hidden="true" /> Hide
                    </ActionButton>
                  )}
                  <ActionButton
                    type="button"
                    $danger
                    disabled={isBusy}
                    onClick={() => runCommentAction({ key, report, action: 'remove' })}
                  >
                    <X size={15} aria-hidden="true" /> Remove
                  </ActionButton>
                </Actions>
              </Item>
            );
          })}
          {status.type !== 'loading' && filteredReports.length === 0 && <Empty>No reports match this filter.</Empty>}
        </ItemList>
      </Queue>

      <Queue aria-labelledby="hike-recommendations-heading">
        <header>
          <h3 id="hike-recommendations-heading"><Route size={19} aria-hidden="true" /> Hike recommendations</h3>
          <Count aria-label={`${queues.hikes.length} hike recommendations`}>{queues.hikes.length}</Count>
        </header>
        <ItemList>
          {queues.hikes.map((hike) => {
            const key = `hike-${hike.id}`;
            const isBusy = activeItem === key;
            const removalRequested = Boolean(hike.removal_requested_at);
            return (
              <Item key={hike.id}>
                <div>
                  <h4>{hike.title}</h4>
                  <ItemMeta>
                    <span>By {hike.author_name}</span>
                    <span>{formatDate(hike.created_at)}</span>
                    <span>Difficulty: {hike.difficulty}</span>
                    {removalRequested && <span>Author requested removal</span>}
                  </ItemMeta>
                </div>
                {hike.body && <p>{hike.body}</p>}
                <NoteField>
                  Decision note (required)
                  <textarea value={notes[key] ?? ''} onChange={(event) => updateNote(key, event.target.value)} />
                </NoteField>
                <Actions>
                  {!removalRequested && (
                    <ActionButton
                      type="button"
                      $primary
                      disabled={isBusy}
                      onClick={() => runHikeAction({ key, hike, action: 'approve' })}
                    >
                      <Check size={15} aria-hidden="true" /> Approve
                    </ActionButton>
                  )}
                  <ActionButton
                    type="button"
                    $danger={removalRequested}
                    disabled={isBusy}
                    onClick={() => runHikeAction({
                      key,
                      hike,
                      action: removalRequested ? 'remove' : 'reject',
                    })}
                  >
                    <X size={15} aria-hidden="true" /> {removalRequested ? 'Confirm removal' : 'Reject'}
                  </ActionButton>
                </Actions>
              </Item>
            );
          })}
          {status.type !== 'loading' && queues.hikes.length === 0 && <Empty>No recommendations awaiting review.</Empty>}
        </ItemList>
      </Queue>

      <Queue aria-labelledby="route-corrections-heading">
        <header>
          <h3 id="route-corrections-heading"><Flag size={19} aria-hidden="true" /> Route corrections</h3>
          <Count aria-label={`${queues.corrections.length} route corrections`}>{queues.corrections.length}</Count>
        </header>
        <ItemList>
          {queues.corrections.map((correction) => {
            const key = `correction-${correction.id}`;
            const isBusy = activeItem === key;
            return (
              <Item key={correction.id}>
                <div>
                  <h4>{correction.trail_name}: {correction.category.replaceAll('_', ' ')}</h4>
                  <ItemMeta>
                    <span>By {correction.submitter_name}</span>
                    <span>Submitted {formatDate(correction.created_at)}</span>
                    {correction.observed_on && <span>Observed {formatDate(correction.observed_on)}</span>}
                    {correction.affected_section && <span>Section: {correction.affected_section}</span>}
                  </ItemMeta>
                </div>
                <p>{correction.details}</p>
                {correction.source_url && (
                  <SourceLink href={correction.source_url} target="_blank" rel="noreferrer">
                    Review submitted source <ExternalLink size={15} aria-hidden="true" />
                  </SourceLink>
                )}
                <TrailLink to={`/mountains/${correction.trail_slug}`} target="_blank" rel="noreferrer">
                  Open guide <ExternalLink size={15} aria-hidden="true" />
                </TrailLink>
                <NoteField>
                  Resolution note (required to accept or reject)
                  <textarea value={notes[key] ?? ''} onChange={(event) => updateNote(key, event.target.value)} />
                </NoteField>
                <Actions>
                  <ActionButton
                    type="button"
                    disabled={isBusy}
                    onClick={() => runCorrectionAction({ key, correction, action: 'under_review' })}
                  >
                    Review in progress
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $primary
                    disabled={isBusy}
                    onClick={() => runCorrectionAction({ key, correction, action: 'accepted' })}
                  >
                    <Check size={15} aria-hidden="true" /> Accept
                  </ActionButton>
                  <ActionButton
                    type="button"
                    $danger
                    disabled={isBusy}
                    onClick={() => runCorrectionAction({ key, correction, action: 'rejected' })}
                  >
                    <X size={15} aria-hidden="true" /> Reject
                  </ActionButton>
                </Actions>
              </Item>
            );
          })}
          {status.type !== 'loading' && queues.corrections.length === 0 && <Empty>No route corrections awaiting review.</Empty>}
        </ItemList>
      </Queue>
    </Workspace>
  );
}
