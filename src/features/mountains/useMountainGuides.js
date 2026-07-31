import { useEffect, useState } from 'react';
import { mountains as staticMountains } from '../../data/mountains.js';
import { trails as staticTrails } from '../../data/trails.js';
import { getRemoteMountainGuides } from '../../lib/supabase/api.js';
import { isSupabaseConfigured } from '../../lib/supabase/client.js';

const fallbackContent = {
  mountains: staticMountains,
  trails: staticTrails,
  isLoading: isSupabaseConfigured,
  source: 'static',
};

export function useMountainGuides() {
  const [content, setContent] = useState(fallbackContent);

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

        if (remoteContent.mountains.length > 0) {
          setContent({ ...remoteContent, isLoading: false, source: 'supabase' });
        } else {
          setContent((current) => ({ ...current, isLoading: false }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setContent((current) => ({ ...current, isLoading: false }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return content;
}
