'use client';

import { useEffect, useState } from 'react';
import type { AnimationStyle } from '@/lib/themes';

// Ambient, themeable background. Generated on the client (in an effect) so the
// randomised positions never cause a hydration mismatch.
const SYMBOLS: Record<AnimationStyle, string[]> = {
  steam: ['π', '√', '∑', '∞', '∫', 'Δ', 'θ', '±', '÷', '×', '²', '≠', 'φ', 'λ'],
  confetti: ['▰', '●', '▲', '◆', '■', '★'],
  bubbles: ['○', '◯', '°'],
  neon: ['+', '×', '•', '◇'],
  minimal: [],
};

const SPARK_COLORS = ['#FFD600', '#e21b3c', '#1368ce', '#26890c', '#FF3D8A', '#FF6A00'];

interface Floater { left: number; top: number; size: number; dur: number; delay: number; char: string; dy: number; rot: number; }
interface Spark { left: number; top: number; size: number; dur: number; delay: number; color: string; }

export function AnimatedBackground({ style = 'steam' }: { style?: AnimationStyle }) {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const syms = SYMBOLS[style] ?? SYMBOLS.steam;
    const rising = style === 'bubbles';
    setFloaters(
      syms.length
        ? Array.from({ length: 26 }, (_, i) => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: 16 + Math.random() * 46,
            dur: 9 + Math.random() * 12,
            delay: Math.random() * 8,
            char: syms[i % syms.length],
            dy: (rising ? 1 : -1) * (24 + Math.random() * 60),
            rot: (Math.random() - 0.5) * 40,
          }))
        : [],
    );
    setSparks(
      Array.from({ length: style === 'minimal' ? 0 : 34 }, (_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 7,
        dur: 1.4 + Math.random() * 3,
        delay: Math.random() * 4,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      })),
    );
  }, [style]);

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes bgOrb { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(var(--ox),var(--oy)) scale(1.15)} }
        @keyframes bgFloat { 0%{transform:translateY(0) rotate(var(--r0))} 100%{transform:translateY(var(--dy)) rotate(var(--r1)) scale(1.08)} }
        @keyframes bgTwinkle { 0%,100%{transform:scale(0);opacity:0} 50%{transform:scale(1);opacity:1} }
      `}</style>

      {/* glowing orbs (themed) */}
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', filter: 'blur(90px)', top: -140, left: -120, background: 'var(--primary)', opacity: 0.35, ['--ox' as string]: '60px', ['--oy' as string]: '80px', animation: 'bgOrb 22s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', filter: 'blur(90px)', bottom: -120, right: -80, background: 'var(--accent)', opacity: 0.22, ['--ox' as string]: '-50px', ['--oy' as string]: '-60px', animation: 'bgOrb 18s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', filter: 'blur(90px)', top: '42%', left: '52%', background: 'var(--primary)', opacity: 0.18, ['--ox' as string]: '-40px', ['--oy' as string]: '50px', animation: 'bgOrb 26s ease-in-out infinite alternate' }} />

      {floaters.map((f, i) => (
        <div key={`f${i}`} style={{ position: 'absolute', left: `${f.left}%`, top: `${f.top}%`, fontSize: f.size, fontWeight: 800, color: 'rgba(255,255,255,.12)', ['--dy' as string]: `${f.dy}px`, ['--r0' as string]: `${-f.rot}deg`, ['--r1' as string]: `${f.rot}deg`, animation: `bgFloat ${f.dur}s ease-in-out ${f.delay}s infinite alternate` }}>{f.char}</div>
      ))}
      {sparks.map((s, i) => (
        <div key={`s${i}`} style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: '50%', background: s.color, boxShadow: `0 0 ${s.size * 2}px ${s.color}`, animation: `bgTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}
