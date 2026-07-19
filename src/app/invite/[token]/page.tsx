'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, primaryBtn } from '@/components/AuthShell';

interface InviteInfo { org_name: string; invite_role: string; email: string; valid: boolean }

export default function InvitePage() {
  const router = useRouter();
  const token = useParams().token as string;
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const [{ data: rows }, { data: { user } }] = await Promise.all([
        supabase.rpc('invite_info', { p_token: token }),
        supabase.auth.getUser(),
      ]);
      setInfo((rows as InviteInfo[] | null)?.[0] ?? null);
      setUserEmail(user?.email ?? null);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('id').maybeSingle();
        setHasProfile(!!profile);
      }
      setPhase('ready');
    })();
  }, [token]);

  async function accept() {
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const { error } = await supabase.rpc('accept_invite', { p_token: token });
    setBusy(false);
    if (error) return setErr(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  if (phase === 'loading') {
    return <AuthShell title="Opening your invite" sub="One moment…"><p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Loading…</p></AuthShell>;
  }

  if (!info || !info.valid) {
    return (
      <AuthShell title="Invitation unavailable" sub="This invite link is invalid, already used, or expired.">
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>Ask your school&apos;s organiser to send you a fresh invitation.</p>
        <a href="/" style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Back to home</a>
      </AuthShell>
    );
  }

  const next = encodeURIComponent(`/invite/${token}`);

  // Signed in, but already belongs to a school.
  if (userEmail && hasProfile) {
    return (
      <AuthShell title={`Join ${info.org_name}`} sub="You already belong to a school.">
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
          Each account can belong to one school. To join <b style={{ color: 'var(--text)' }}>{info.org_name}</b>, accept this invite with a new account created using <b style={{ color: 'var(--text)' }}>{info.email}</b>.
        </p>
        <a href="/dashboard" style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Go to my dashboard</a>
      </AuthShell>
    );
  }

  // Signed in with the wrong email.
  if (userEmail && userEmail.toLowerCase() !== info.email.toLowerCase()) {
    return (
      <AuthShell title={`Join ${info.org_name}`} sub="This invite is for a different email.">
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
          You&apos;re signed in as <b style={{ color: 'var(--text)' }}>{userEmail}</b>, but this invite was sent to <b style={{ color: 'var(--text)' }}>{info.email}</b>. Sign in (or sign up) with that address to join.
        </p>
        <form action="/auth/signout" method="post" style={{ marginTop: 16 }}>
          <button style={{ ...primaryBtn, width: '100%' }}>Sign out & switch account</button>
        </form>
      </AuthShell>
    );
  }

  // Signed in with the right email → can accept.
  if (userEmail) {
    return (
      <AuthShell title={`Join ${info.org_name}`} sub={`You've been invited as ${info.invite_role}.`}>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, marginBottom: 4 }}>
          Accept to join <b style={{ color: 'var(--text)' }}>{info.org_name}</b> as a team {info.invite_role}.
        </p>
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
        <button onClick={accept} disabled={busy} style={{ ...primaryBtn, width: '100%', marginTop: 12 }}>{busy ? 'Joining…' : `Accept & join ${info.org_name}`}</button>
      </AuthShell>
    );
  }

  // Not signed in.
  return (
    <AuthShell title={`Join ${info.org_name}`} sub={`You've been invited as ${info.invite_role}.`}>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6 }}>
        Create an account (or sign in) with <b style={{ color: 'var(--text)' }}>{info.email}</b> to join <b style={{ color: 'var(--text)' }}>{info.org_name}</b>.
      </p>
      <a href={`/signup?next=${next}`} style={{ ...primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 16 }}>Create account & join</a>
      <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text-dim)' }}>
        Already have an account? <a href={`/login?next=${next}`} style={{ color: 'var(--accent)' }}>Sign in</a>
      </p>
    </AuthShell>
  );
}
