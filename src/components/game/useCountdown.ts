'use client';

import { useEffect, useState } from 'react';

// Remaining seconds for a question, derived from the server's start anchor so
// every screen counts down in sync. Returns whole seconds remaining.
export function useCountdown(startTime: number | null | undefined, timeLimit: number | null | undefined) {
  const [remaining, setRemaining] = useState(timeLimit ?? 0);

  useEffect(() => {
    if (!startTime || !timeLimit) {
      setRemaining(timeLimit ?? 0);
      return;
    }
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRemaining(Math.max(0, timeLimit - elapsed));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [startTime, timeLimit]);

  return remaining;
}
