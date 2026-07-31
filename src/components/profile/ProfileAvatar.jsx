import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme.js';

const AvatarImage = styled.img`
  background: ${theme.colors.background};
  border: 2px solid ${theme.colors.surface};
  border-radius: 50%;
  box-shadow: 0 0 0 1px ${theme.colors.line};
  flex: 0 0 auto;
  height: 76px;
  object-fit: cover;
  width: 76px;
`;

const AvatarFallback = styled.div`
  align-items: center;
  background: ${theme.colors.forest};
  border: 2px solid ${theme.colors.surface};
  border-radius: 50%;
  box-shadow: 0 0 0 1px ${theme.colors.line};
  color: ${theme.colors.surface};
  display: flex;
  flex: 0 0 auto;
  font-size: 1.3rem;
  font-weight: 900;
  height: 76px;
  justify-content: center;
  text-transform: uppercase;
  width: 76px;
`;

function getInitials(name) {
  return String(name || 'Hiker')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export function ProfileAvatar({ name, src }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (src && !imageFailed) {
    return (
      <AvatarImage
        src={src}
        alt={`${name || 'Hiker'} profile avatar`}
        width="76"
        height="76"
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <AvatarFallback role="img" aria-label={`Profile avatar for ${name || 'Hiker'}`}>
      {getInitials(name)}
    </AvatarFallback>
  );
}

