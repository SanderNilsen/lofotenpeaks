import { LogIn, MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from '../../features/auth/AuthProvider.jsx';
import { createTrailComment, getCommentsForTrail } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';

const Panel = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.medium};
  display: grid;
  gap: 16px;
  padding: 18px;

  h2 {
    align-items: center;
    display: flex;
    font-size: 1.45rem;
    gap: 10px;
    margin: 0;
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
    min-height: 110px;
    padding: 11px;
    resize: vertical;
    width: 100%;
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
  return comment.profiles?.display_name || 'Hiker';
}

function CommentsPanelContent({ trail }) {
  const { isConfigured, isLoading: authIsLoading, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

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
          setStatus({ type: 'error', message: error.message });
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
        userId: user.id,
        mountainId: trail.mountainId,
        trailId: trail.id,
        body,
      });
      const nextComments = await getCommentsForTrail(trail.id);
      setComments(nextComments);
      setBody('');
      setStatus({ type: 'success', message: 'Comment posted.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
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
        <Message $error={status.type === 'error'}>{status.message}</Message>
      )}
      {isConfigured && status.type === 'loading' && comments.length === 0 && <Message>Loading comments...</Message>}
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
  return (
    <AuthProvider>
      <CommentsPanelContent trail={trail} />
    </AuthProvider>
  );
}

export default CommentsPanel;
