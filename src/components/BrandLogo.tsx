import type { CSSProperties } from 'react';

const ORANGE = '#ff7a1a';
const RED = '#ff2d55';
const NAVY = '#10233f';

/**
 * Quizzard logo mark — the gradient "Q" droplet with the dissolving pixel
 * squares and a check inside a white lens. Vector, so it stays crisp at any
 * size. `id` keeps the gradient defs unique when several marks share a page.
 */
export function LogoMark({ size = 40, id = 'qa' }: { size?: number; id?: string }) {
  const g = `${id}-grad`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={g} x1="18%" y1="4%" x2="82%" y2="98%">
          <stop offset="0" stopColor="#ff9022" />
          <stop offset="0.55" stopColor="#ff5a20" />
          <stop offset="1" stopColor={RED} />
        </linearGradient>
      </defs>
      {/* dissolving pixel squares, top-left */}
      <rect x="9.5" y="15" width="8" height="8" rx="2.3" fill={`url(#${g})`} />
      <rect x="2.5" y="9" width="6" height="6" rx="1.8" fill={`url(#${g})`} opacity="0.92" />
      <rect x="11.5" y="3.5" width="5" height="5" rx="1.6" fill={`url(#${g})`} opacity="0.82" />
      {/* Q tail */}
      <rect x="39.5" y="40" width="9.5" height="18" rx="4.75" fill={`url(#${g})`} transform="rotate(38 44 49)" />
      {/* Q body */}
      <circle cx="31" cy="34" r="20" fill={`url(#${g})`} />
      {/* white lens */}
      <circle cx="33" cy="33" r="12.5" fill="#fff" />
      {/* check */}
      <path d="M27 33.6 l4.3 4.5 l8.4 -9.2" stroke={NAVY} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Full Quizzard lockup: mark + wordmark (+ optional tagline).
 * `tone` picks the "QUIZ" colour so it reads on dark or light backgrounds;
 * "ARENA" is always the orange→red gradient.
 */
export function BrandLogo({
  height = 40,
  tone = 'dark',
  tagline = false,
  style,
}: {
  height?: number;
  tone?: 'dark' | 'light'; // dark = on dark bg (QUIZ white); light = on light bg (QUIZ navy)
  tagline?: boolean;
  style?: CSSProperties;
}) {
  const quizColor = tone === 'dark' ? '#fff' : NAVY;
  const word = Math.round(height * 0.52);
  const uid = `qa-${tone}-${height}`;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: height * 0.3, ...style }}>
      <LogoMark size={height} id={uid} />
      <span style={{ lineHeight: 1 }}>
        <span style={{ fontWeight: 900, fontSize: word, letterSpacing: -0.5, display: 'block' }}>
          <span style={{ color: quizColor }}>QUIZ</span>
          <span style={{ background: `linear-gradient(100deg, ${ORANGE}, ${RED})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>ZARD</span>
        </span>
        {tagline && (
          <span style={{ display: 'block', fontSize: Math.max(8, Math.round(height * 0.2)), letterSpacing: 2.5, color: tone === 'dark' ? '#8b8296' : '#64748b', fontWeight: 700, marginTop: height * 0.08 }}>
            LEARN. PRACTICE. WIN.
          </span>
        )}
      </span>
    </span>
  );
}
