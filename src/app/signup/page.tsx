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
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    if (data.session) {
      // Signed in immediately (email confirmation disabled) → set up the school.
      router.push('/onboarding');
      router.refresh();
    } else {
      // Email confirmation required → account exists but no session yet.
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <AuthShell title="Check your email" sub="Confirm your address, then sign in to name your school.">
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
          We sent a confirmation link to <b style={{ color: 'var(--text)' }}>{email}</b>. Click it, then sign in to finish setting up your school.
        </p>
        <a href="/login" style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Go to sign in</a>
      </AuthShell>
    );
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
