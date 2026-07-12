'use client';

import { useEffect } from 'react';

/**
 * Security guard for authenticated pages. If the browser restores this page
 * from the back/forward cache (bfcache) — e.g. a user hits Back after logging
 * out — `pageshow` fires with `persisted = true`. We force a fresh load so the
 * request goes through middleware, which redirects a signed-out user to /login
 * instead of showing stale protected content.
 */
export function BackCacheGuard() {
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);
  return null;
}
