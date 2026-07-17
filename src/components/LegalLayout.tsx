import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

const ORANGE = '#ff7a1a';
const PURPLE = '#8b5cf6';

/** Shared shell for the Privacy / Terms pages: branded header, readable column. */
export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080511', color: '#fff', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 500, top: -160, left: -120, background: `radial-gradient(ellipse, ${ORANGE}18, transparent 65%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 600, height: 500, bottom: -160, right: -120, background: `radial-gradient(ellipse, ${PURPLE}20, transparent 65%)`, filter: 'blur(40px)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 820, margin: '0 auto', padding: '28px 24px 80px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
          <a href="/" style={{ textDecoration: 'none' }}><BrandLogo height={34} tone="dark" /></a>
          <a href="/" style={{ color: '#c9c2d6', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: 10 }}>← Home</a>
        </header>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)', fontWeight: 900, letterSpacing: -1, margin: '0 0 6px' }}>{title}</h1>
        <div style={{ color: '#8b8296', fontSize: 13.5, marginBottom: 28 }}>Last updated: {updated}</div>
        <div style={{ color: '#c9c2d6', fontSize: 15.5, lineHeight: 1.75 }}>{children}</div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 13, color: '#8b8296' }}>
          Quizzard is founded and operated by <b style={{ color: '#c9c2d6' }}>DMaths Academy</b>. Questions? Email <a href="mailto:dmathstuition@gmail.com" style={{ color: ORANGE, textDecoration: 'none' }}>dmathstuition@gmail.com</a>.
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{heading}</h2>
      {children}
    </section>
  );
}
