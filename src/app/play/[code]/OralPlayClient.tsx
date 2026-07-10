'use client';

import '../../../components/game/game.css';
import { useRealtimeSession } from '@/lib/game/useRealtimeSession';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import type { AnimationStyle } from '@/lib/themes';

const GROUP_COLOR = ['#8b5cf6', '#f97316'];

// Oral rounds are host-judged and group-based — phones don't buzz. This screen
// just keeps the audience oriented: which group is up, and the live scores.
export function OralPlayClient({ sessionId, schoolName, animation }: { sessionId: string; orgId: string; schoolName: string; animation: AnimationStyle }) {
  const { session } = useRealtimeSession(sessionId);
  const ms = (session as any)?.mode_state ?? { groups: [{ name: 'Group A', score: 0 }, { name: 'Group B', score: 0 }] };
  const groups = ms.groups as [{ name: string; score: number }, { name: string; score: number }];
  const active = (session as any)?.active_team ?? 0;
  const bonus = (session as any)?.is_bonus ?? false;
  const state = session?.state;
  const live = state === 'question_active';
  const ended = state === 'ended';

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={animation} />
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
        <div style={{ fontWeight: 900, letterSpacing: 3, color: 'var(--accent)', fontSize: 13 }}>{schoolName.toUpperCase()} · 🎤 ORAL ROUND</div>
        <h1 style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 26, color: 'var(--accent)', margin: '8px 0 6px' }}>
          {ended ? (groups[0].score === groups[1].score ? "It's a tie!" : `${groups[groups[0].score > groups[1].score ? 0 : 1].name} win!`) : live ? `${groups[active].name} is answering${bonus ? ' (bonus)' : ''}…` : 'Watch the big screen'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', marginBottom: 16 }}>The host reads each question aloud.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 380 }}>
          {groups.map((g, i) => (
            <div key={i} style={{ borderRadius: 14, padding: 16, border: `2px solid ${GROUP_COLOR[i]}`, background: `${GROUP_COLOR[i]}22`, boxShadow: active === i && live ? `0 0 20px ${GROUP_COLOR[i]}66` : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</div>
              <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 30, fontWeight: 900, color: 'var(--accent)' }}>{g.score}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
