import type { CSSProperties, ReactNode } from 'react';
import { BackCacheGuard } from '@/components/BackCacheGuard';
import { BrandLogo } from '@/components/BrandLogo';

const ORANGE = '#FF6A00';
const RED = '#ff2d55';

export const adminCard: CSSProperties = {
  background: 'linear-gradient(160deg, rgba(30,20,45,.6), rgba(15,10,25,.75))',
  border: '1px solid rgba(255,255,255,.09)',
  borderRadius: 18,
  padding: 22,
};

export const adminPrimary: CSSProperties = {
  padding: '13px 22px',
  borderRadius: 12,
  border: 'none',
  background: `linear-gradient(135deg, ${ORANGE}, ${RED})`,
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  boxShadow: `0 10px 26px ${RED}44`,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

const NAV = [
  ['Sessions', '/dashboard'],
  ['Questions', '/dashboard/questions'],
  ['History', '/dashboard/history'],
  ['Branding', '/dashboard/branding'],
  ['Billing', '/dashboard/billing'],
];

export function AdminShell({ active, title, subtitle, children }: { active?: string; title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080511', color: '#fff', fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>
      <BackCacheGuard />
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 700, height: 460, top: -200, right: -120, background: `radial-gradient(ellipse, ${ORANGE}18, transparent 65%)`, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', width: 600, height: 420, bottom: -160, left: -120, background: `radial-gradient(ellipse, #8b5cf620, transparent 65%)`, filter: 'blur(50px)' }} />
      </div>

      {/* top bar */}
      <header style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a href="/dashboard" style={{ textDecoration: 'none' }}>
            <BrandLogo height={34} tone="dark" />
          </a>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([label, href]) => {
              const on = active === label;
              return (
                <a key={href} href={href} style={{ padding: '8px 14px', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none', color: on ? '#fff' : '#a49db3', background: on ? 'rgba(255,255,255,.08)' : 'transparent' }}>{label}</a>
              );
            })}
          </nav>
          <form action="/auth/signout" method="post" style={{ marginLeft: 'auto' }}>
            <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#c9c2d6', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Sign out</button>
          </form>
        </div>
      </header>

      <main className="qz-in" style={{ position: 'relative', zIndex: 10, maxWidth: 1040, margin: '0 auto', padding: '32px 24px 60px' }}>
        {title && <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, marginBottom: subtitle ? 4 : 22 }}>{title}</h1>}
        {subtitle && <p style={{ color: '#a49db3', fontSize: 15, marginBottom: 24 }}>{subtitle}</p>}
        {children}
      </main>
    </div>
  );
}
