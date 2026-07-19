'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Copy, Check, Trash2, Shield, Crown, User } from 'lucide-react';
import { adminCard } from '@/components/AdminShell';
import { inviteMember, revokeInvite, removeMember } from '@/lib/org/actions';

interface Member { id: string; email: string | null; full_name: string | null; role: string; created_at: string }
interface Invite { id: string; email: string; role: string; created_at: string; expires_at: string; token: string }

const ROLE_ICON: Record<string, React.ReactNode> = {
  owner: <Crown size={13} color="#fbbf24" />,
  admin: <Shield size={13} color="#60a5fa" />,
  host: <User size={13} color="#a49db3" />,
};

const inputStyle: React.CSSProperties = { padding: '11px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(0,0,0,.3)', color: '#fff', fontSize: 14, outline: 'none' };
const linkFor = (token: string) => (typeof window !== 'undefined' ? `${window.location.origin}/invite/${token}` : `/invite/${token}`);

export function TeamManager({ meId, canManage, members, invites }: { meId: string | null; canManage: boolean; members: Member[]; invites: Invite[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'host'>('host');
  const [err, setErr] = useState('');
  const [freshLink, setFreshLink] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1800); } catch { /* clipboard blocked */ }
  };

  const invite = () =>
    start(async () => {
      setErr('');
      setFreshLink(null);
      const res = await inviteMember(email, role);
      if (res.error) return setErr(res.error);
      if (res.token) { setFreshLink(linkFor(res.token)); setEmail(''); router.refresh(); }
    });

  return (
    <div style={{ display: 'grid', gap: 26 }}>
      {/* Invite */}
      {canManage && (
        <section style={adminCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <UserPlus size={18} color="#FF6A00" />
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Invite a colleague</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} type="email" placeholder="colleague@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'host')}>
              <option value="host">Host — run games</option>
              <option value="admin">Admin — full access</option>
            </select>
            <button onClick={invite} disabled={pending || !email} style={{ padding: '11px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#FF6A00,#ff2d55)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: pending || !email ? 0.6 : 1 }}>
              {pending ? 'Sending…' : 'Send invite'}
            </button>
          </div>
          {err && <p style={{ color: '#ff6b8a', fontSize: 13, marginTop: 10 }}>{err}</p>}
          {freshLink && (
            <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.35)' }}>
              <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, marginBottom: 6 }}>✓ Invite created — share this link with them:</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <code style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: '#c9c2d6', wordBreak: 'break-all' }}>{freshLink}</code>
                <button onClick={() => copy(freshLink, 'fresh')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.06)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {copied === 'fresh' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: '#8b8296', marginTop: 6 }}>They sign up with this exact email to join. Link expires in 14 days.</div>
            </div>
          )}
        </section>
      )}

      {/* Members */}
      <section>
        <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 12px' }}>Members · {members.length}</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {members.map((m) => (
            <div key={m.id} style={{ ...adminCard, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, background: 'linear-gradient(135deg,#FF6A00,#ff2d55)', flexShrink: 0 }}>{(m.full_name || m.email || '?')[0]?.toUpperCase()}</span>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.full_name || m.email}{m.id === meId && <span style={{ color: '#8b8296', fontWeight: 600 }}> · you</span>}</div>
                {m.full_name && <div style={{ fontSize: 12.5, color: '#8b8296' }}>{m.email}</div>}
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,.06)', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{ROLE_ICON[m.role]} {m.role}</span>
              {canManage && m.id !== meId && m.role !== 'owner' && (
                <button
                  onClick={() => { if (confirm(`Remove ${m.full_name || m.email} from your team?`)) start(async () => { const r = await removeMember(m.id); if (r.error) alert(r.error); else router.refresh(); }); }}
                  disabled={pending}
                  title="Remove member"
                  style={{ background: 'none', border: 'none', color: '#ff6b8a', cursor: 'pointer', display: 'grid', padding: 4 }}
                ><Trash2 size={16} /></button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pending invites */}
      {invites.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, color: '#8b8296', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 12px' }}>Pending invites · {invites.length}</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {invites.map((iv) => (
              <div key={iv.id} style={{ ...adminCard, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderStyle: 'dashed' }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{iv.email}</div>
                  <div style={{ fontSize: 12, color: '#8b8296' }}>Invited as {iv.role} · expires {new Date(iv.expires_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => copy(linkFor(iv.token), iv.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {copied === iv.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Link</>}
                </button>
                {canManage && (
                  <button onClick={() => start(async () => { const r = await revokeInvite(iv.id); if (r.error) alert(r.error); else router.refresh(); })} disabled={pending} title="Revoke invite" style={{ background: 'none', border: 'none', color: '#ff6b8a', cursor: 'pointer', display: 'grid', padding: 4 }}><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
