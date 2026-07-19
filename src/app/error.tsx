'use client';

import { useEffect } from 'react';
import { FullScreenMessage, fsmButton, fsmGhost } from '@/components/FullScreenMessage';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the error for server-side logging / observability.
    console.error(error);
  }, [error]);

  return (
    <FullScreenMessage
      title="Something went wrong"
      message="An unexpected error interrupted this page. Try again — if it keeps happening, head back home and reopen it."
    >
      <button onClick={reset} style={fsmButton}>Try again</button>
      <a href="/" style={fsmGhost}>Back to home</a>
    </FullScreenMessage>
  );
}
