import { Flag, LogIn, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../features/auth/AuthProvider.jsx';
import { getSafePublicDisplayName } from '../../lib/profile.js';
import {
  createTrailComment,
  deleteOwnComment,
  getCommentsForTrail,
  reportContent,
} from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 16px;
  padding: 24px;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.75rem;
    gap: 10px;
    margin: 0;
  }

  @media (max-width: 640px) {
    padding: 18px;

    h2 {
      font-size: 1.5rem;
    }
  }
`;

const Intro = styled.p`
  color: ${theme.colors.muted};
  line-height: 1.6;
  margin: 0;
`;

const CommentList = styled.ul`
  display: grid;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CommentItem = styled.li`
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  display: grid;
  gap: 8px;
  padding: 14px;
`;

const CommentMeta = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  strong {
    color: ${theme.colors.ink};
  }

  span {
    color: ${theme.colors.muted};
    font-size: 0.88rem;
    font-weight: 700;
  }
`;

const CommentBody = styled.p`
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

const CommentActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TextButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: ${theme.radii.small};
  color: ${({ $danger }) => ($danger ? theme.colors.warning : theme.colors.muted)};
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 6px;
  min-height: 40px;
  padding: 7px 8px;

  &:hover {
    color: ${theme.colors.ink};
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 2px;
  }
`;

const ReportForm = styled.form`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  display: grid;
  gap: 12px;
  margin-top: 4px;
  padding: 14px;

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 1rem;
  }

  p {
    color: ${theme.colors.muted};
    font-size: 0.86rem;
    line-height: 1.5;
  }

  label {
    display: grid;
    font-size: 0.84rem;
    font-weight: 800;
    gap: 6px;
  }

  select,
  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    font: inherit;
    padding: 10px;
    width: 100%;

    &:focus-visible {
      border-color: ${theme.colors.fjord};
      outline: 3px solid rgba(36, 95, 130, 0.2);
      outline-offset: 1px;
    }
  }

  textarea {
    min-height: 86px;
    resize: vertical;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 10px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;

  span {
    color: ${theme.colors.muted};
    font-size: 0.76rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  textarea {
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.line};
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    font: inherit;
    min-height: 110px;
    padding: 11px;
    resize: vertical;
    width: 100%;

    &:focus-visible {
      border-color: ${theme.colors.fjord};
      outline: 3px solid rgba(36, 95, 130, 0.2);
      outline-offset: 1px;
    }
  }
`;

const Button = styled.button`
  align-items: center;
  background: ${theme.colors.forest};
  border: 0;
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-content: center;
  justify-self: start;
  min-height: 44px;
  padding: 10px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const AccountLink = styled(Link)`
  align-items: center;
  background: ${theme.colors.forest};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.surface};
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-content: center;
  justify-self: start;
  min-height: 44px;
  padding: 10px 14px;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }
`;

const Message = styled.p`
  background: ${({ $error }) => ($error ? '#f2e6dc' : theme.colors.background)};
  border: 1px solid ${({ $error }) => ($error ? '#dfc4af' : theme.colors.line)};
  border-radius: ${theme.radii.small};
  color: ${({ $error }) => ($error ? theme.colors.warning : theme.colors.muted)};
  font-weight: 800;
  line-height: 1.55;
  margin: 0;
  padding: 11px;
`;

function formatCommentDate(value) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getDisplayName(comment) {
  return getSafePublicDisplayName(comment.profiles?.display_name);
}

function getCommunityError(error, fallback) {
  if (error?.message?.includes('Accept the current Terms')) {
    return 'Review and accept the current Terms in Account settings before contributing.';
  }

  if (error?.message?.includes('already reported')) {
    return 'You have already reported this comment for review.';
  }

  if (error?.message?.includes('wait')) {
    return error.message;
  }

  return fallback;
}

function CommentsPanelContent({ trail }) {
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [reportForm, setReportForm] = useState({ reason: 'misleading', details: '' });
  const [reportStatus, setReportStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (!isConfigured || !trail?.id) {
      setComments([]);
      return undefined;
    }

    let isMounted = true;
    setStatus({ type: 'loading', message: '' });

    getCommentsForTrail(trail.id)
      .then((items) => {
        if (isMounted) {
          setComments(items);
          setStatus({ type: 'idle', message: '' });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setStatus({ type: 'error', message: 'We could not load the trail comments. Please try again.' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isConfigured, trail?.id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (body.trim().length < 2) {
      setStatus({ type: 'error', message: 'Write at least 2 characters.' });
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      await createTrailComment({
        mountainId: trail.mountainId,
        trailId: trail.id,
        body,
      });
      const nextComments = await getCommentsForTrail(trail.id);
      setComments(nextComments);
      setBody('');
      setStatus({ type: 'success', message: 'Comment posted.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getCommunityError(error, 'We could not post your comment. Please try again.'),
      });
    }
  }

  async function handleDelete(comment) {
    if (!window.confirm('Delete this comment? It will disappear from the public guide.')) {
      return;
    }

    setStatus({ type: 'loading', message: '' });

    try {
      await deleteOwnComment(comment.id);
      setComments((items) => items.filter((item) => item.id !== comment.id));
      setStatus({ type: 'success', message: 'Comment deleted.' });
    } catch (error) {
      setStatus({ type: 'error', message: 'We could not delete this comment. Please try again.' });
    }
  }

  function openReport(commentId) {
    if (!user) {
      setStatus({ type: 'error', message: 'Sign in before reporting community content.' });
      return;
    }

    setReportingCommentId(commentId);
    setReportForm({ reason: 'misleading', details: '' });
    setReportStatus({ type: 'idle', message: '' });
  }

  async function handleReport(event) {
    event.preventDefault();
    setReportStatus({ type: 'loading', message: '' });

    try {
      await reportContent({
        contentType: 'comment',
        targetId: reportingCommentId,
        reason: reportForm.reason,
        details: reportForm.details,
      });
      setReportingCommentId(null);
      setReportStatus({ type: 'idle', message: '' });
      setStatus({ type: 'success', message: 'Report sent for administrator review.' });
    } catch (error) {
      setReportStatus({
        type: 'error',
        message: getCommunityError(error, 'We could not send this report. Please try again.'),
      });
    }
  }

  return (
    <Panel>
      <h2>
        <MessageCircle size={22} aria-hidden="true" /> Comments
      </h2>
      <Intro>Share recent trail conditions, parking notes, or practical advice for this hike.</Intro>

      {!isConfigured && <Message>Account features are not connected yet.</Message>}
      {isConfigured && status.message && status.type !== 'idle' && status.type !== 'loading' && (
        <Message role="status" aria-live="polite" $error={status.type === 'error'}>
          {status.message}
        </Message>
      )}
      {isConfigured && status.type === 'loading' && comments.length === 0 && (
        <Message role="status">Loading comments...</Message>
      )}
      {isConfigured && status.type !== 'loading' && comments.length === 0 && (
        <Message>No comments yet. Add the first practical note for this route.</Message>
      )}
      {isConfigured && comments.length > 0 && (
        <CommentList>
          {comments.map((comment) => (
            <CommentItem key={comment.id}>
              <CommentMeta>
                <strong>{getDisplayName(comment)}</strong>
                <span>{formatCommentDate(comment.created_at)}</span>
              </CommentMeta>
              <CommentBody>{comment.body}</CommentBody>
              <CommentActions>
                {user?.id !== comment.user_id && (
                  <TextButton type="button" onClick={() => openReport(comment.id)}>
                    <Flag size={15} aria-hidden="true" /> Report
                  </TextButton>
                )}
                {user?.id === comment.user_id && (
                  <TextButton type="button" $danger onClick={() => handleDelete(comment)}>
                    <Trash2 size={15} aria-hidden="true" /> Delete
                  </TextButton>
                )}
              </CommentActions>
              {reportingCommentId === comment.id && (
                <ReportForm onSubmit={handleReport} aria-label="Report comment">
                  <div>
                    <h3>Report this comment</h3>
                    <p>Reports are private and reviewed by an administrator. Reporting does not automatically remove the comment.</p>
                  </div>
                  <label>
                    Reason
                    <select
                      value={reportForm.reason}
                      disabled={reportStatus.type === 'loading'}
                      onChange={(event) => setReportForm((current) => ({ ...current, reason: event.target.value }))}
                    >
                      <option value="spam">Spam</option>
                      <option value="harassment">Harassment or abusive language</option>
                      <option value="dangerous">Dangerous advice</option>
                      <option value="misleading">Misleading hiking information</option>
                      <option value="privacy">Personal information</option>
                      <option value="illegal">Illegal content</option>
                      <option value="copyright">Copyright concern</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    Details (optional)
                    <textarea
                      maxLength="500"
                      value={reportForm.details}
                      disabled={reportStatus.type === 'loading'}
                      onChange={(event) => setReportForm((current) => ({ ...current, details: event.target.value }))}
                    />
                  </label>
                  <CommentActions>
                    <Button type="submit" disabled={reportStatus.type === 'loading'}>
                      <Flag size={16} aria-hidden="true" />
                      {reportStatus.type === 'loading' ? 'Sending...' : 'Send report'}
                    </Button>
                    <TextButton type="button" onClick={() => setReportingCommentId(null)}>
                      <X size={15} aria-hidden="true" /> Cancel
                    </TextButton>
                  </CommentActions>
                  {reportStatus.message && (
                    <Message $error role="alert">{reportStatus.message}</Message>
                  )}
                </ReportForm>
              )}
            </CommentItem>
          ))}
        </CommentList>
      )}

      {isConfigured && authIsLoading && <Message>Checking account...</Message>}
      {isConfigured && !authIsLoading && !user && (
        <>
          <Intro>Sign in to add your own note.</Intro>
          <AccountLink to="/account">
            <LogIn size={18} aria-hidden="true" /> Sign in
          </AccountLink>
        </>
      )}
      {isConfigured && !authIsLoading && user && (
        <Form onSubmit={handleSubmit}>
          <Field>
            <span>Your comment</span>
            <textarea
              value={body}
              maxLength={1200}
              placeholder="Trail condition, parking, weather, or advice"
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>
          <Button type="submit" disabled={status.type === 'loading'}>
            <Send size={18} aria-hidden="true" /> Post comment
          </Button>
        </Form>
      )}
    </Panel>
  );
}

export function CommentsPanel({ trail }) {
  return <CommentsPanelContent trail={trail} />;
}

export default CommentsPanel;
