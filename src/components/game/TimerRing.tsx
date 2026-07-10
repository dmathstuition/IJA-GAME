'use client';

// Circular countdown. `total` seconds, `remaining` seconds; colour shifts to
// red under 5s and the number gently pulses.
export function TimerRing({ remaining, total, size = 96 }: { remaining: number; total: number; size?: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const low = remaining <= 5;
  const color = low ? '#e21b3c' : 'var(--accent, #FFD600)';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s', filter: 'drop-shadow(0 0 6px currentColor)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'ui-monospace, monospace',
          fontWeight: 900,
          fontSize: size * 0.32,
          color: '#fff',
          animation: low ? 'streakPop 0.5s ease-in-out infinite alternate' : undefined,
        }}
      >
        {Math.ceil(Math.max(0, remaining))}
      </div>
    </div>
  );
}
