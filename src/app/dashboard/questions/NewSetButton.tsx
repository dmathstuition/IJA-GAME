'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createQuestionSet } from '@/lib/questions/actions';

export function NewSetButton() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pending, start] = useTransition();

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New set name (e.g. Term 1 Finals)"
        style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #2a3244', background: '#0c1018', color: '#e8eef5', fontSize: 14, minWidth: 260 }}
      />
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await createQuestionSet(name);
            if ('id' in r) router.push(`/dashboard/questions/${r.id}`);
            else alert(r.error);
          })
        }
        style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: 'var(--primary,#cc0022)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
      >
        {pending ? 'Creating…' : '+ New set'}
      </button>
    </div>
  );
}
