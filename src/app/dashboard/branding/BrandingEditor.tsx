'use client';

import '../../../components/game/game.css';
import { useState, useTransition } from 'react';
import { THEME_PRESETS, resolveTheme, themeToCssVars, type AnimationStyle } from '@/lib/themes';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { updateBranding } from '@/lib/branding/actions';
import type { Choice } from '@/lib/types';

const ANIMS: { id: AnimationStyle; label: string }[] = [
  { id: 'steam', label: 'Math symbols' },
  { id: 'confetti', label: 'Confetti' },
  { id: 'bubbles', label: 'Bubbles' },
  { id: 'neon', label: 'Neon' },
  { id: 'minimal', label: 'Minimal' },
];
const OPTS: Record<Choice, string> = { A: '96', B: '84', C: '108', D: '88' };

export function BrandingEditor({ initialPreset, initialAnimation }: { initialPreset: string; initialAnimation: string }) {
  const [preset, setPreset] = useState(initialPreset in THEME_PRESETS ? initialPreset : 'steam');
  const [animation, setAnimation] = useState<AnimationStyle>((initialAnimation as AnimationStyle) || THEME_PRESETS[initialPreset]?.animation || 'steam');
  const [saving, start] = useTransition();
  const [flash, setFlash] = useState('');

  const theme = resolveTheme({ preset, animation });
  const vars = themeToCssVars(theme) as React.CSSProperties;

  function save() {
    start(async () => {
      const r = await updateBranding(preset, animation);
      setFlash('error' in r ? r.error ?? 'Save failed' : 'Saved — your game now uses this look.');
      setTimeout(() => setFlash(''), 3500);
    });
  }

  const card: React.CSSProperties = { background: 'linear-gradient(160deg, rgba(30,20,45,.6), rgba(15,10,25,.75))', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, padding: 20 };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)', gap: 20, alignItems: 'start' }}>
      {/* controls */}
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={card}>
          <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 12 }}>Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
            {Object.values(THEME_PRESETS).map((t) => {
              const on = preset === t.id;
              return (
                <button key={t.id} onClick={() => { setPreset(t.id); setAnimation(t.animation); }}
                  style={{ textAlign: 'left', cursor: 'pointer', border: `2px solid ${on ? '#ff7a1a' : 'rgba(255,255,255,.1)'}`, borderRadius: 14, overflow: 'hidden', background: 'rgba(0,0,0,.2)', padding: 0 }}>
                  <div style={{ height: 46, background: `linear-gradient(120deg, ${t.palette.bgGradientFrom}, ${t.palette.bgGradientTo})`, display: 'flex', alignItems: 'flex-end', gap: 5, padding: 8 }}>
                    {[t.palette.primary, t.palette.accent, t.palette.correct].map((c, i) => <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: c, border: '1px solid rgba(255,255,255,.2)' }} />)}
                  </div>
                  <div style={{ padding: '8px 10px', fontSize: 13, fontWeight: 800, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>{t.name}{on && <span style={{ color: '#ff7a1a' }}>✓</span>}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 12 }}>Animated background</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ANIMS.map((a) => {
              const on = animation === a.id;
              return (
                <button key={a.id} onClick={() => setAnimation(a.id)}
                  style={{ padding: '9px 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 13.5, border: `1px solid ${on ? '#ff7a1a' : 'rgba(255,255,255,.15)'}`, background: on ? 'rgba(255,122,26,.15)' : 'transparent', color: on ? '#fff' : '#a49db3' }}>{a.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={save} disabled={saving} style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ff7a1a, #ff2d55)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 26px rgba(255,45,85,.4)' }}>{saving ? 'Saving…' : 'Save branding'}</button>
          {flash && <span style={{ color: flash.includes('Saved') ? '#4ade80' : '#ff6b8a', fontSize: 14, fontWeight: 600 }}>{flash}</span>}
        </div>
      </div>

      {/* live preview */}
      <div>
        <div style={{ fontSize: 12, color: '#8b8296', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, marginBottom: 10 }}>Live preview</div>
        <div style={{ ...vars, position: 'relative', overflow: 'hidden', borderRadius: 18, border: '1px solid rgba(255,255,255,.12)', minHeight: 360, background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))' }}>
          <AnimatedBackground style={animation} />
          <div style={{ position: 'relative', zIndex: 10, padding: 20, color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 800, fontSize: 12, background: 'rgba(0,0,0,.3)', padding: '5px 12px', borderRadius: 999 }}>Question 1</span>
              <TimerRing remaining={12} total={20} size={48} />
            </div>
            <div className="qcard" style={{ marginBottom: 12, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 18, fontWeight: 900 }}>What is 12 × 8?</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['A', 'B', 'C', 'D'] as Choice[]).map((c) => <AnswerTile key={c} choice={c} label={OPTS[c]} compact state={c === 'B' ? 'reveal-correct' : 'idle'} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
