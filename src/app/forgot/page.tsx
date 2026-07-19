'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, field, primaryBtn } from '@/components/AuthShell';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setBusy(false);
    // Always show the same confirmation — never reveal whether an email exists.
    if (error && !/rate|limit/i.test(error.message)) return setErr(error.message);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" sub="If an account exists, a reset link is on its way.">
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
          We&apos;ve sent a password-reset link to <b style={{ color: 'var(--text)' }}>{email}</b>. Open it on this device and choose a new password. The link expires in an hour.
        </p>
        <a href="/login" style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Back to sign in</a>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" sub="Enter your organiser email and we&apos;ll send a reset link.">
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input autoFocus style={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
        <button style={primaryBtn} disabled={busy || !email}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
        Remembered it? <a href="/login" style={{ color: 'var(--accent)' }}>Sign in</a>
      </p>
    </AuthShell>
  );
}
