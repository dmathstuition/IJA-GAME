'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Swords, Zap, Mic, Trash2 } from 'lucide-react';
import { createSession } from '@/lib/game/actions';
import { createTeamSession } from '@/lib/game/team';
import { createSpeedSession } from '@/lib/game/speed';
import { createOralSession } from '@/lib/game/oral';
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
        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, background: canStart ? '#22c55e' : '#1c2330', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        <Play size={13} fill="currentColor" /> Standard
      </button>
      <button
        disabled={pending || !canStart}
        title={canStart ? 'Start a Team Battle with this set' : 'Add questions first'}
        onClick={() =>
          start(async () => {
            const r = await createTeamSession(setId);
            if ('id' in r) router.push(`/host/${r.id}`);
            else alert(r.error);
          })
        }
        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, background: canStart ? '#e21b3c' : '#1c2330', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        <Swords size={13} /> Team
      </button>
      <button
        disabled={pending || !canStart}
        title={canStart ? 'Start a Speed round with this set' : 'Add questions first'}
        onClick={() =>
          start(async () => {
            const r = await createSpeedSession(setId);
            if ('id' in r) router.push(`/host/${r.id}`);
            else alert(r.error);
          })
        }
        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, background: canStart ? '#f97316' : '#1c2330', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        <Zap size={13} fill="currentColor" /> Speed
      </button>
      <button
        disabled={pending || !canStart}
        title={canStart ? 'Start an Oral round with this set' : 'Add questions first'}
        onClick={() =>
          start(async () => {
            const r = await createOralSession(setId);
            if ('id' in r) router.push(`/host/${r.id}`);
            else alert(r.error);
          })
        }
        style={{ padding: '6px 12px', borderRadius: 7, border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, background: canStart ? '#8b5cf6' : '#1c2330', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        <Mic size={13} /> Oral
      </button>
      <button
        disabled={pending}
        onClick={() => start(async () => { if (confirm('Delete this set?')) { await deleteQuestionSet(setId); router.refresh(); } })}
        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
}
