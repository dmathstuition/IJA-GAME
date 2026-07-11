'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Shows the organiser's broadcast message on every projector / player screen.
 * Self-contained: subscribes to the session's `broadcast` column and slides a
 * banner in whenever it changes, so a host can message the whole room mid-game.
 */
export function BroadcastBanner({ sessionId }: { sessionId: string }) {
  const [msg, setMsg] = useState<{ text: string; ts: number } | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const supabase = createClient();
    let active = true;

    supabase.from('game_sessions').select('broadcast').eq('id', sessionId).maybeSingle().then(({ data }) => {
      if (active) setMsg((data?.broadcast as { text: string; ts: number } | null) ?? null);
    });

    const channel = supabase
      .channel(`broadcast:${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => setMsg(((payload.new as any).broadcast as { text: string; ts: number } | null) ?? null))
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [sessionId]);

  if (!msg?.text) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80, padding: '14px 20px', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 'clamp(15px, 2.4vw, 22px)', background: 'linear-gradient(90deg,#ff7a1a,#ff2d55)', boxShadow: '0 6px 24px rgba(255,45,85,.4)', animation: 'qaBcast .4s ease-out' }}>
      📢 {msg.text}
      <style>{`@keyframes qaBcast{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
