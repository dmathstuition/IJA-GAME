import type { CSSProperties, ReactNode } from 'react';

export const field: CSSProperties = {
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,.15)',
  background: 'rgba(0,0,0,.25)',
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none',
};

export const primaryBtn: CSSProperties = {
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--primary)',
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  marginTop: 4,
};

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'linear-gradient(160deg, var(--bg-from), var(--bg-to))',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'rgba(0,0,0,.35)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 20,
          padding: 32,
          backdropFilter: 'blur(16px)',
        }}
      >
        <h1 style={{ fontSize: 24, color: 'var(--accent)', marginBottom: 4 }}>{title}</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 22 }}>{sub}</p>
        {children}
      </div>
    </main>
  );
}
