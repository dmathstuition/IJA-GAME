'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, field, primaryBtn } from '@/components/AuthShell';

export default function ResetPage() {
  const router = useRouter();
  // 'checking' → waiting for the recovery session from the email link.
  // 'ready'    → session established, show the new-password form.
  // 'invalid'  → no session (link expired, already used, or opened elsewhere).
  const [phase, setPhase] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // The @supabase/ssr browser client auto-exchanges the recovery code in the
  // URL for a session on load. Watch for it, with a timeout fallback.
  useEffect(() => {
    const supabase = createClient();
    let settled = false;
    const mark = (p: 'ready' | 'invalid') => { if (!settled) { settled = true; setPhase(p); } };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) mark('ready');
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) mark('ready'); });
    const t = setTimeout(() => mark('invalid'), 4000);

    return () => { clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setErr('Passwords do not match.');
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 1200);
  }

  if (phase === 'checking') {
    return <AuthShell title="Opening your reset link" sub="One moment…"><p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Verifying…</p></AuthShell>;
  }

  if (phase === 'invalid') {
    return (
      <AuthShell title="Link expired" sub="This reset link is no longer valid.">
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>Reset links expire after an hour and can be used once. Request a fresh one to continue.</p>
        <a href="/forgot" style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Send a new link</a>
      </AuthShell>
    );
  }

  if (done) {
    return <AuthShell title="Password updated" sub="You&apos;re all set."><p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Taking you to your dashboard…</p></AuthShell>;
  }

  return (
    <AuthShell title="Choose a new password" sub="Enter a new password for your account.">
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input autoFocus style={field} type="password" placeholder="New password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        <input style={field} type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
        <button style={primaryBtn} disabled={busy || !password}>{busy ? 'Updating…' : 'Update password'}</button>
      </form>
    </AuthShell>
  );
}
