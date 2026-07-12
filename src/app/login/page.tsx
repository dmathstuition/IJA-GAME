'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell, field, primaryBtn } from '@/components/AuthShell';

interface SchoolRow { id: string; slug: string; name: string; logo_url: string | null }

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/dashboard';

  // Step 1 — find your school
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SchoolRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [school, setSchool] = useState<SchoolRow | null>(null);
  const [skipped, setSkipped] = useState(false);

  // Step 2 — credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Live school search against the public branding view.
  useEffect(() => {
    if (school || skipped) return;
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    let active = true;
    setSearching(true);
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('org_public').select('id, slug, name, logo_url').ilike('name', `%${q}%`).order('name').limit(6);
      if (active) { setResults((data as SchoolRow[]) ?? []); setSearching(false); }
    }, 200);
    return () => { active = false; clearTimeout(t); };
  }, [query, school, skipped]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return setErr(error.message); }

    const { data: profile } = await supabase.from('profiles').select('org_id').maybeSingle();
    // If a school was chosen, make sure this account belongs to it.
    if (school && profile && profile.org_id !== school.id) {
      await supabase.auth.signOut();
      setBusy(false);
      return setErr(`This account isn't part of ${school.name}. Pick the right school or sign in without one.`);
    }
    setBusy(false);
    router.push(profile ? next : '/onboarding');
    router.refresh();
  }

  const showCredentials = !!school || skipped;

  return (
    <AuthShell title={school ? `Sign in to ${school.name}` : 'Welcome back'} sub={showCredentials ? 'Enter your organiser email and password.' : 'Find your school to sign in.'}>
      {!showCredentials ? (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 13, top: 15, color: 'var(--text-dim)' }} />
            <input autoFocus style={{ ...field, paddingLeft: 38 }} placeholder="Search for your school" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {query.trim().length >= 2 && (
            <div style={{ display: 'grid', gap: 6 }}>
              {searching && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Searching…</p>}
              {!searching && results.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No school found for “{query.trim()}”.</p>}
              {results.map((s) => (
                <button key={s.id} onClick={() => setSchool(s)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', color: 'var(--text)', cursor: 'pointer' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#ff7a1a,#ff2d55)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}>{s.name[0]}</span>
                  <span><span style={{ fontWeight: 700, fontSize: 14, display: 'block' }}>{s.name}</span><span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.slug}</span></span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setSkipped(true)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textAlign: 'left', padding: '4px 0', textDecoration: 'underline' }}>
            My school isn&apos;t listed — sign in anyway
          </button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
          {school && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)' }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#ff7a1a,#ff2d55)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 13 }}>{school.name[0]}</span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{school.name}</span>
              <button type="button" onClick={() => { setSchool(null); setErr(''); }} title="Change school" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'grid' }}><X size={16} /></button>
            </div>
          )}
          <input style={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={field} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {err && <p style={{ color: 'var(--wrong)', fontSize: 13 }}>{err}</p>}
          <button style={primaryBtn} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          {skipped && !school && (
            <button type="button" onClick={() => { setSkipped(false); setErr(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>← Find my school instead</button>
          )}
        </form>
      )}

      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
        New here? <a href="/signup" style={{ color: 'var(--accent)' }}>Create a school</a> · <a href="/" style={{ color: 'var(--accent)' }}>Back to home</a>
      </p>
    </AuthShell>
  );
}
