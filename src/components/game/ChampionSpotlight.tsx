'use client';

import './game.css';
import { Trophy, Star } from './Shapes';

// Big single-winner celebration for the end of a game (projector).
export function ChampionSpotlight({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24, zIndex: 2 }}>
      <style>{`
        @keyframes champGlow{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.25);opacity:1}}
        @keyframes champName{0%{opacity:0;transform:scale(.6) rotate(-6deg)}60%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:scale(1)}}
        @keyframes champSpin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,0,.3), transparent 65%)', animation: 'champGlow 2s ease-in-out infinite', zIndex: -1 }} />
        <div className="float-y"><Trophy size={104} /></div>
        <div style={{ position: 'absolute', inset: -18, animation: 'champSpin 6s linear infinite' }}><span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}><Star size={22} /></span></div>
        <div style={{ position: 'absolute', inset: -18, animation: 'champSpin 8s linear infinite reverse' }}><span style={{ position: 'absolute', bottom: 4, right: 6 }}><Star size={16} color="#fff" /></span></div>
      </div>

      <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(16px,2.2vw,26px)', letterSpacing: 5, fontWeight: 900, background: 'linear-gradient(120deg,#FFE45C,#fff,#F5B301)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>★ CHAMPION ★</div>
      <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(40px,7vw,96px)', fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 0 40px rgba(255,214,0,.5), 0 6px 30px rgba(0,0,0,.6)', animation: 'champName .7s cubic-bezier(.2,1.4,.3,1) both', textAlign: 'center', maxWidth: '90vw', overflowWrap: 'anywhere' }}>{name}</div>
      {subtitle && <div style={{ fontSize: 'clamp(14px,1.8vw,20px)', fontWeight: 800, color: 'var(--accent)', fontFamily: 'ui-monospace,monospace' }}>{subtitle}</div>}
    </div>
  );
}
