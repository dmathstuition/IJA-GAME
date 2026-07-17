import type { ReactNode } from 'react';
import { BackCacheGuard } from '@/components/BackCacheGuard';
import { BrandLogo } from '@/components/BrandLogo';

const ORANGE = '#FF6A00';

// Wraps an organiser control panel in the Qizora admin look: dark ground,
// ambient glows, and a branded top bar with a link back to the dashboard.
// The school's theme variables still cascade in, so per-school accents remain.
export function HostShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080511', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
      <BackCacheGuard />
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 700, height: 460, top: -200, right: -120, background: `radial-gradient(ellipse, ${ORANGE}12, transparent 65%)`, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', width: 600, height: 420, bottom: -160, left: -140, background: 'radial-gradient(ellipse, #8b5cf618, transparent 65%)', filter: 'blur(50px)' }} />
      </div>

      <header style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <BrandLogo height={32} tone="dark" />
          </a>
          <a href="/dashboard" style={{ marginLeft: 'auto', color: '#c9c2d6', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: 10 }}>← Dashboard</a>
        </div>
      </header>

      <div className="qz-in" style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </div>
  );
}
