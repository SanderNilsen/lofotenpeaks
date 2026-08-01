import { useEffect, useState } from 'react';
import { getRemoteMountainGuides } from '../../lib/supabase/api.js';
import { isSupabaseConfigured } from '../../lib/supabase/client.js';

const initialContent = {
  mountains: [],
  trails: [],
  isLoading: isSupabaseConfigured,
  error: isSupabaseConfigured ? null : 'The hiking guide service is not configured.',
};

export function useMountainGuides() {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    let isMounted = true;

    getRemoteMountainGuides()
      .then((remoteContent) => {
        if (!isMounted) {
          return;
        }

        setContent({ ...remoteContent, isLoading: false, error: null });
      })
      .catch(() => {
        if (isMounted) {
          setContent({
            mountains: [],
            trails: [],
            isLoading: false,
            error: 'We could not load the latest hiking guides. Please try again.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return content;
}
