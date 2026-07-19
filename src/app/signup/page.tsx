'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, field, primaryBtn } from '@/components/AuthShell';

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '';
  const invited = next.startsWith('/invite');
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
      // Signed in immediately (email confirmation disabled).
      router.push(invited ? next : '/onboarding');
      router.refresh();
    } else {
      // Email confirmation required → account exists but no session yet.
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <AuthShell title="Check your email" sub={invited ? 'Confirm your address, then sign in to accept your invite.' : 'Confirm your address, then sign in to name your school.'}>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
          We sent a confirmation link to <b style={{ color: 'var(--text)' }}>{email}</b>. Click it, then sign in to finish.
        </p>
        <a href={invited ? `/login?next=${encodeURIComponent(next)}` : '/login'} style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Go to sign in</a>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={invited ? 'Accept your invite' : 'Create your school'} sub={invited ? 'Create your account to join the team.' : 'Start a 14-day free trial. No card required.'}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input style={field} type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={field} type="password" placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
        <button style={primaryBtn} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
        Already have an account? <a href={invited ? `/login?next=${encodeURIComponent(next)}` : '/login'} style={{ color: 'var(--accent)' }}>Sign in</a> · <a href="/" style={{ color: 'var(--accent)' }}>Back to home</a>
      </p>
    </AuthShell>
  );
}
