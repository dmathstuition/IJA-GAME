// Kahoot-style answer shapes as crisp SVG (scale + animate cleanly, unlike PNG).
import type { Choice } from '@/lib/types';

export function Shape({ choice }: { choice: Choice }) {
  const c = '#fff';
  switch (choice) {
    case 'A': // triangle
      return (
        <svg className="shape" viewBox="0 0 40 40" aria-hidden>
          <path d="M20 5 L37 35 L3 35 Z" fill={c} />
        </svg>
      );
    case 'B': // diamond
      return (
        <svg className="shape" viewBox="0 0 40 40" aria-hidden>
          <path d="M20 3 L37 20 L20 37 L3 20 Z" fill={c} />
        </svg>
      );
    case 'C': // circle
      return (
        <svg className="shape" viewBox="0 0 40 40" aria-hidden>
          <circle cx="20" cy="20" r="16" fill={c} />
        </svg>
      );
    case 'D': // square
      return (
        <svg className="shape" viewBox="0 0 40 40" aria-hidden>
          <rect x="5" y="5" width="30" height="30" rx="4" fill={c} />
        </svg>
      );
  }
}

export function Bolt({ size = 40, color = '#FFD600' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z" fill={color} stroke="rgba(0,0,0,.15)" strokeWidth="0.5" />
    </svg>
  );
}

export function Star({ size = 40, color = '#FFD600' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2 L15 9 L22 9.5 L16.5 14 L18.5 21 L12 17 L5.5 21 L7.5 14 L2 9.5 L9 9 Z" fill={color} stroke="rgba(0,0,0,.15)" strokeWidth="0.5" />
    </svg>
  );
}

export function Trophy({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE45C" />
          <stop offset="1" stopColor="#F5B301" />
        </linearGradient>
      </defs>
      <path d="M18 8 h28 v10 a14 14 0 0 1 -28 0 Z" fill="url(#tg)" stroke="#c68a00" strokeWidth="1.5" />
      <path d="M18 12 h-7 a7 7 0 0 0 7 10 M46 12 h7 a7 7 0 0 1 -7 10" fill="none" stroke="#c68a00" strokeWidth="3" />
      <rect x="28" y="30" width="8" height="12" fill="#e0a200" />
      <rect x="20" y="42" width="24" height="7" rx="2" fill="url(#tg)" stroke="#c68a00" strokeWidth="1.5" />
      <rect x="16" y="49" width="32" height="7" rx="2" fill="url(#tg)" stroke="#c68a00" strokeWidth="1.5" />
    </svg>
  );
}
