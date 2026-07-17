import type { CSSProperties } from 'react';

// Qizora brand palette (from the brand guide).
const ORANGE = '#FF6A00';
const RED = '#FF2D55';

/**
 * Qizora logo mark — a rounded-square gradient tile with a white "Q", per the
 * brand guide. Vector, so it stays crisp at any size. `id` keeps the gradient
 * defs unique when several marks share a page.
 */
export function LogoMark({ size = 40, id = 'qz' }: { size?: number; id?: string }) {
  const g = `${id}-grad`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={g} x1="8%" y1="6%" x2="92%" y2="96%">
          <stop offset="0" stopColor={ORANGE} />
          <stop offset="1" stopColor={RED} />
        </linearGradient>
      </defs>
      {/* rounded-square tile */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${g})`} />
      {/* white Q: ring + tail */}
      <circle cx="30" cy="30" r="14" fill="none" stroke="#fff" strokeWidth="7" />
      <rect x="36" y="37" width="7.5" height="16" rx="3.75" fill="#fff" transform="rotate(-40 40 45)" />
    </svg>
  );
}

/**
 * Full Qizora lockup: mark + wordmark (+ optional tagline).
 * `tone` picks the "QIZ" colour so it reads on dark or light backgrounds;
 * "ORA" is always the orange→red gradient.
 */
export function BrandLogo({
  height = 40,
  tone = 'dark',
  tagline = false,
  style,
}: {
  height?: number;
  tone?: 'dark' | 'light'; // dark = on dark bg (QIZ white); light = on light bg (QIZ ink)
  tagline?: boolean;
  style?: CSSProperties;
}) {
  const qizColor = tone === 'dark' ? '#fff' : '#1B1D2B';
  const word = Math.round(height * 0.52);
  const uid = `qz-${tone}-${height}`;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: height * 0.3, fontFamily: 'var(--font-poppins), system-ui, sans-serif', ...style }}>
      <LogoMark size={height} id={uid} />
      <span style={{ lineHeight: 1 }}>
        <span style={{ fontWeight: 800, fontSize: word, letterSpacing: -0.5, display: 'block' }}>
          <span style={{ color: qizColor }}>QIZ</span>
          <span style={{ background: `linear-gradient(100deg, ${ORANGE}, ${RED})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>ORA</span>
        </span>
        {tagline && (
          <span style={{ display: 'block', fontSize: Math.max(8, Math.round(height * 0.2)), letterSpacing: 2.5, color: tone === 'dark' ? '#8b8296' : '#64748b', fontWeight: 600, marginTop: height * 0.08 }}>
            LEARN. PRACTICE. WIN.
          </span>
        )}
      </span>
    </span>
  );
}
