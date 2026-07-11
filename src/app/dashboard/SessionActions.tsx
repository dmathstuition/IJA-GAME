'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteSession } from '@/lib/game/actions';

/** Row controls for a live session: open panels + permanently delete it. */
export function SessionActions({ sessionId, joinCode }: { sessionId: string; joinCode: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, fontWeight: 700, alignItems: 'center' }}>
      <a href={`/host/${sessionId}`} style={{ color: '#fff', background: 'rgba(255,255,255,.08)', padding: '8px 14px', borderRadius: 9, textDecoration: 'none' }}>Control</a>
      <a href={`/display/${joinCode}`} style={{ color: '#a49db3', padding: '8px 12px', borderRadius: 9, textDecoration: 'none' }}>Display</a>
      <a href={`/play/${joinCode}`} style={{ color: '#a49db3', padding: '8px 12px', borderRadius: 9, textDecoration: 'none' }}>Play</a>
      <button
        disabled={pending}
        title="Delete this session"
        onClick={() => {
          if (!confirm(`Delete session ${joinCode}? Players and scores are removed permanently.`)) return;
          start(async () => {
            const r = await deleteSession(sessionId);
            if ('error' in r) alert(r.error);
            else router.refresh();
          });
        }}
        style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,45,85,.35)', background: 'rgba(255,45,85,.08)', color: '#ff6b8a', cursor: 'pointer' }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
