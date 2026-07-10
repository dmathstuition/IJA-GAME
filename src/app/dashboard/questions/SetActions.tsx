'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/game/actions';
import { deleteQuestionSet } from '@/lib/questions/actions';

export function SetActions({ setId, canStart }: { setId: string; canStart: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <a href={`/dashboard/questions/${setId}`} style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>Edit</a>
      <button
        disabled={pending || !canStart}
        title={canStart ? 'Start a live game with this set' : 'Add questions first'}
        onClick={() =>
          start(async () => {
            const r = await createSession('standard', setId);
            if ('id' in r) router.push(`/host/${r.id}`);
            else alert(r.error);
          })
        }
        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: canStart ? '#22c55e' : '#1c2330', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        ▶ Start game
      </button>
      <button
        disabled={pending}
        onClick={() => start(async () => { if (confirm('Delete this set?')) { await deleteQuestionSet(setId); router.refresh(); } })}
        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13 }}
      >
        Delete
      </button>
    </div>
  );
}
