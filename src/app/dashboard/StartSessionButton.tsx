'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
      style={{ padding: '14px 22px', borderRadius: 12, border: 'none', background: 'var(--primary, #cc0022)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}
    >
      {pending ? 'Starting…' : '▶ Start a Standard game'}
    </button>
  );
}
