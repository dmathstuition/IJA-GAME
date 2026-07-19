'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, KeyRound, School, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { adminCard } from '@/components/AdminShell';
import { renameOrg, updateDisplayName, deleteOrg } from '@/lib/org/actions';

const input: React.CSSProperties = { padding: '11px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(0,0,0,.3)', color: '#fff', fontSize: 14, outline: 'none', width: '100%' };
const btn: React.CSSProperties = { padding: '11px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#FF6A00,#ff2d55)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' };
const okStyle: React.CSSProperties = { color: '#4ade80', fontSize: 13 };
const errStyle: React.CSSProperties = { color: '#ff6b8a', fontSize: 13 };

function Section({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section style={adminCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: desc ? 4 : 12 }}>
        {icon}
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{title}</h2>
      </div>
      {desc && <p style={{ color: '#8b8296', fontSize: 13, margin: '0 0 12px' }}>{desc}</p>}
      {children}
    </section>
  );
}

export function AccountSettings({ email, fullName, role, orgName, orgSlug }: { email: string; fullName: string; role: string; orgName: string; orgSlug: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const canManageOrg = role === 'owner' || role === 'admin';
  const isOwner = role === 'owner';

  // Display name
  const [name, setName] = useState(fullName);
  const [nameMsg, setNameMsg] = useState('');

  // Email
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ ok?: string; err?: string }>({});

  // Password
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwMsg, setPwMsg] = useState<{ ok?: string; err?: string }>({});

  // School
  const [school, setSchool] = useState(orgName);
  const [schoolMsg, setSchoolMsg] = useState('');

  // Delete
  const [confirmText, setConfirmText] = useState('');
  const [delErr, setDelErr] = useState('');

  const saveName = () => start(async () => { setNameMsg(''); const r = await updateDisplayName(name); setNameMsg(r.error ? '' : 'Saved'); if (r.error) alert(r.error); else router.refresh(); });

  const changeEmail = () => start(async () => {
    setEmailMsg({});
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) setEmailMsg({ err: error.message });
    else { setEmailMsg({ ok: `Confirmation sent to ${newEmail.trim()}. Click the link there to finish.` }); setNewEmail(''); }
  });

  const changePw = () => start(async () => {
    setPwMsg({});
    if (pw !== pw2) return setPwMsg({ err: 'Passwords do not match.' });
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setPwMsg({ err: error.message });
    else { setPwMsg({ ok: 'Password updated.' }); setPw(''); setPw2(''); }
  });

  const saveSchool = () => start(async () => { setSchoolMsg(''); const r = await renameOrg(school); if (r.error) alert(r.error); else { setSchoolMsg('Saved'); router.refresh(); } });

  const doDelete = () => start(async () => {
    setDelErr('');
    const r = await deleteOrg();
    if (r.error) return setDelErr(r.error);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  });

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 640 }}>
      {/* Display name */}
      <Section icon={<User size={18} color="#60a5fa" />} title="Your name" desc="Shown to your teammates.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={{ ...input, flex: 1, minWidth: 200 }} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <button style={btn} disabled={pending} onClick={saveName}>Save</button>
        </div>
        {nameMsg && <p style={{ ...okStyle, marginTop: 8 }}>{nameMsg}</p>}
      </Section>

      {/* Email */}
      <Section icon={<Mail size={18} color="#8b5cf6" />} title="Email" desc={`You currently sign in with ${email}.`}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={{ ...input, flex: 1, minWidth: 200 }} type="email" placeholder="New email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <button style={btn} disabled={pending || !newEmail} onClick={changeEmail}>Update</button>
        </div>
        {emailMsg.ok && <p style={{ ...okStyle, marginTop: 8 }}>{emailMsg.ok}</p>}
        {emailMsg.err && <p style={{ ...errStyle, marginTop: 8 }}>{emailMsg.err}</p>}
      </Section>

      {/* Password */}
      <Section icon={<KeyRound size={18} color="#fbbf24" />} title="Password">
        <div style={{ display: 'grid', gap: 8 }}>
          <input style={input} type="password" placeholder="New password (8+ characters)" value={pw} minLength={8} onChange={(e) => setPw(e.target.value)} />
          <input style={input} type="password" placeholder="Confirm new password" value={pw2} minLength={8} onChange={(e) => setPw2(e.target.value)} />
          <button style={{ ...btn, justifySelf: 'start' }} disabled={pending || !pw} onClick={changePw}>Update password</button>
        </div>
        {pwMsg.ok && <p style={{ ...okStyle, marginTop: 8 }}>{pwMsg.ok}</p>}
        {pwMsg.err && <p style={{ ...errStyle, marginTop: 8 }}>{pwMsg.err}</p>}
      </Section>

      {/* School */}
      <Section icon={<School size={18} color="#4ade80" />} title="School" desc={canManageOrg ? 'Your students join at this address.' : 'Only owners and admins can rename the school.'}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={{ ...input, flex: 1, minWidth: 200 }} value={school} disabled={!canManageOrg} onChange={(e) => setSchool(e.target.value)} />
          {canManageOrg && <button style={btn} disabled={pending} onClick={saveSchool}>Save</button>}
        </div>
        <p style={{ fontSize: 12.5, color: '#8b8296', marginTop: 8 }}>Address: <b style={{ color: '#c9c2d6' }}>{orgSlug}</b> — the join address can&apos;t be changed.</p>
        {schoolMsg && <p style={{ ...okStyle, marginTop: 8 }}>{schoolMsg}</p>}
      </Section>

      {/* Danger zone */}
      {isOwner && (
        <section style={{ ...adminCard, borderColor: 'rgba(255,45,85,.35)', background: 'rgba(255,45,85,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangle size={18} color="#ff6b8a" />
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#ff6b8a' }}>Delete school</h2>
          </div>
          <p style={{ color: '#c9a3ad', fontSize: 13, margin: '0 0 12px', lineHeight: 1.6 }}>
            Permanently deletes <b>{orgName}</b> and everything in it — members, question banks, sessions and past results. This cannot be undone. Type <b style={{ color: '#fff' }}>{orgSlug}</b> to confirm.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input style={{ ...input, flex: 1, minWidth: 200 }} placeholder={orgSlug} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            <button
              onClick={() => { if (confirm('Delete this school permanently? This cannot be undone.')) doDelete(); }}
              disabled={pending || confirmText !== orgSlug}
              style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: confirmText === orgSlug ? '#ff2d55' : 'rgba(255,45,85,.3)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: confirmText === orgSlug ? 'pointer' : 'not-allowed' }}
            >Delete forever</button>
          </div>
          {delErr && <p style={{ ...errStyle, marginTop: 8 }}>{delErr}</p>}
        </section>
      )}
    </div>
  );
}
