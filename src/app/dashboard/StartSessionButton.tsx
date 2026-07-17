'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { createSession } from '@/lib/game/actions';

export function StartSessionButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await createSession('standard');
          if ('id' in r) router.push(`/host/${r.id}`);
          else alert(r.error);
        })
      }
      style={{ padding: '14px 26px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #FF6A00, #ff2d55)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 26px rgba(255,45,85,.4)' }}
    >
      {pending ? 'Starting…' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Play size={16} fill="currentColor" /> Start a Standard game</span>}
    </button>
  );
}
