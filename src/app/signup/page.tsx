'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, field, primaryBtn } from '@/components/AuthShell';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    // Email confirmation may be required depending on project settings.
    router.push('/onboarding');
    router.refresh();
  }

  return (
    <AuthShell title="Create your school" sub="Start a 14-day free trial. No card required.">
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input style={field} type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={field} type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
        <button style={primaryBtn} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
        Already have an account? <a href="/login" style={{ color: 'var(--accent)' }}>Sign in</a>
      </p>
    </AuthShell>
  );
}
