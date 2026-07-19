import type { CSSProperties, ReactNode } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

// Pure presentational shell for 404 / error / loading screens. No hooks, so it
// is safe to import from both server (not-found) and client (error) components.
export function FullScreenMessage({
  code,
  title,
  message,
  children,
  showLogo = true,
}: {
  code?: string;
  title: string;
  message?: ReactNode;
  children?: ReactNode;
  showLogo?: boolean;
}) {
  const wrap: CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 24,
    background: '#080511',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif',
  };
  return (
    <main style={wrap}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 500, top: -160, left: -120, background: 'radial-gradient(ellipse, #FF6A0022, transparent 65%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 600, height: 500, bottom: -160, right: -120, background: 'radial-gradient(ellipse, #8b5cf625, transparent 65%)', filter: 'blur(40px)' }} />
      </div>

      {showLogo && (
        <a href="/" style={{ marginBottom: 26, textDecoration: 'none', zIndex: 1 }}>
          <BrandLogo height={40} tone="dark" />
        </a>
      )}
      {code && (
        <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1, letterSpacing: -2, zIndex: 1, background: 'linear-gradient(120deg,#FF6A00,#FF2D55)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{code}</div>
      )}
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: '10px 0 8px', zIndex: 1 }}>{title}</h1>
      {message && <p style={{ color: '#a49db3', fontSize: 15, maxWidth: 420, lineHeight: 1.6, zIndex: 1 }}>{message}</p>}
      {children && <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>{children}</div>}
    </main>
  );
}

export const fsmButton: CSSProperties = {
  padding: '13px 22px',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg,#FF6A00,#FF2D55)',
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: '0 10px 26px #FF2D5544',
};

export const fsmGhost: CSSProperties = {
  padding: '13px 22px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,.18)',
  background: 'rgba(255,255,255,.04)',
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  textDecoration: 'none',
};
