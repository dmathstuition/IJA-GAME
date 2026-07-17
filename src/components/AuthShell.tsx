import type { CSSProperties, ReactNode } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

const ORANGE = '#FF6A00';
const RED = '#ff2d55';
const PURPLE = '#8b5cf6';

export const field: CSSProperties = {
  padding: '13px 15px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(0,0,0,.3)',
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  width: '100%',
};

export const primaryBtn: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 12,
  border: 'none',
  background: `linear-gradient(135deg, ${ORANGE}, ${RED})`,
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 6,
  boxShadow: `0 10px 26px ${RED}44`,
};

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#080511',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 500, top: -160, left: -120, background: `radial-gradient(ellipse, ${ORANGE}22, transparent 65%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 600, height: 500, bottom: -160, right: -120, background: `radial-gradient(ellipse, ${PURPLE}25, transparent 65%)`, filter: 'blur(40px)' }} />
      </div>

      <a href="/" style={{ marginBottom: 22, textDecoration: 'none', zIndex: 1 }}>
        <BrandLogo height={42} tone="dark" />
      </a>

      <div
        className="qz-pop"
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(20,14,30,.72)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 22,
          padding: 34,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 30px 70px rgba(0,0,0,.5)',
          zIndex: 1,
        }}
      >
        <h1 style={{ fontSize: 25, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>{title}</h1>
        <p style={{ color: '#a49db3', fontSize: 14.5, marginBottom: 22, lineHeight: 1.5 }}>{sub}</p>
        {children}
      </div>
    </main>
  );
}
