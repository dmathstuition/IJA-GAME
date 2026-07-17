'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { sendWelcomeEmail } from '@/lib/notifyActions';
import { AuthShell, field, primaryBtn } from '@/components/AuthShell';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const effectiveSlug = slug || slugify(name);

  // Must be signed in to name a school; skip if already onboarded.
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login?next=/onboarding'); return; }
      const { data: profile } = await supabase.from('profiles').select('org_id').maybeSingle();
      if (profile) router.replace('/dashboard');
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const { error } = await supabase.rpc('create_organization', {
      p_name: name,
      p_slug: effectiveSlug,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    // Fire the welcome / login-affirmation email (best-effort).
    sendWelcomeEmail().catch(() => {});
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <AuthShell title="Name your school" sub="This becomes your students' join address.">
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input style={field} placeholder="School name (e.g. Infant Jesus Academy)" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={field} placeholder="URL slug" value={effectiveSlug} onChange={(e) => setSlug(slugify(e.target.value))} required />
        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {effectiveSlug || 'your-school'}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'qizora.com'}
        </p>
        {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
        <button style={primaryBtn} disabled={busy || !name}>{busy ? 'Setting up…' : 'Create school →'}</button>
      </form>
    </AuthShell>
  );
}
