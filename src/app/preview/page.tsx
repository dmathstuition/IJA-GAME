'use client';

import { Zap, Users } from 'lucide-react';
import '../../components/game/game.css';
import { useEffect, useState } from 'react';
import { resolveTheme, themeToCssVars, THEME_PRESETS, type Theme } from '@/lib/themes';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { AnswerTile } from '@/components/game/AnswerTile';
import { TimerRing } from '@/components/game/TimerRing';
import { Confetti } from '@/components/game/Confetti';
import { Trophy, Star, Bolt } from '@/components/game/Shapes';
import { ChampionSpotlight } from '@/components/game/ChampionSpotlight';
import type { Choice } from '@/lib/types';

const OPTS: Record<Choice, string> = { A: '96', B: '84', C: '108', D: '88' };
const TALLY: Record<Choice, number> = { A: 14, B: 3, C: 2, D: 5 };
const PLAYERS = [
  ['Amara', 980], ['Chidi', 910], ['Zoe', 870], ['Leo', 760], ['Fatima', 700], ['Sam', 640],
] as const;
const AV = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#a855f7', '#FF6A00'];

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', margin: '0 0 8px 4px' }}>{label}</div>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, border: '1px solid rgba(255,255,255,.14)', minHeight: 320, background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
        {children}
      </div>
    </div>
  );
}

export default function Preview() {
  const [themeId, setThemeId] = useState('steam');
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('theme');
    if (t && THEME_PRESETS[t]) setThemeId(t);
  }, []);
  const theme: Theme = resolveTheme({ preset: themeId });
  const vars = themeToCssVars(theme) as React.CSSProperties;

  return (
    <div style={{ ...vars, minHeight: '100vh', background: 'linear-gradient(160deg,var(--bg-from),var(--bg-to))', color: '#fff', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <AnimatedBackground style={theme.animation} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1080, margin: '0 auto', padding: '32px 20px 80px', display: 'grid', gap: 34 }}>
        <header style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontSize: 13 }}>★ QUIZARENA · UI PREVIEW ★</div>
          <h1 style={{ fontFamily: '"Fredoka One", Nunito, sans-serif', fontSize: 'clamp(32px,6vw,58px)', color: 'var(--accent)', margin: '6px 0 14px', textShadow: '0 6px 30px rgba(0,0,0,.35)' }}>Game screens</h1>
          <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', background: 'rgba(0,0,0,.25)', padding: 6, borderRadius: 999 }}>
            {Object.values(THEME_PRESETS).map((t) => (
              <button key={t.id} onClick={() => setThemeId(t.id)} className="kbtn" style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, background: themeId === t.id ? 'var(--primary)' : 'transparent', boxShadow: 'none' }}>{t.name}</button>
            ))}
          </div>
        </header>

        {/* DISPLAY — LOBBY */}
        <Frame label="Projector · Lobby">
          <div style={{ padding: '38px 24px', textAlign: 'center', display: 'grid', gap: 14, placeItems: 'center' }}>
            <div style={{ fontWeight: 900, letterSpacing: 4, color: 'var(--accent)', fontSize: 14 }}>INFANT JESUS ACADEMY</div>
            <div style={{ fontFamily: '"Fredoka One", sans-serif', fontSize: 'clamp(30px,6vw,64px)', color: 'var(--accent)', lineHeight: 1, textShadow: '0 8px 30px rgba(0,0,0,.4)' }}>Join the game!</div>
            <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 18, fontWeight: 700 }}>Enter this code on your phone</div>
            <div className="codechip float-y" style={{ fontSize: 'clamp(44px,9vw,86px)' }}>DEMO01</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              {PLAYERS.map(([n], i) => (
                <span key={n} className="pop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', padding: '6px 14px 6px 6px', borderRadius: 999, fontWeight: 800, animationDelay: `${i * 0.08}s` }}>
                  <span className="avatar" style={{ width: 30, height: 30, fontSize: 13, background: AV[i % AV.length] }}>{n[0]}</span>{n}
                </span>
              ))}
            </div>
            <div style={{ fontWeight: 800, color: 'var(--accent)', marginTop: 6 }}><Users size={16} style={{ verticalAlign: '-2px', marginRight: 5 }} />{PLAYERS.length} joined</div>
          </div>
        </Frame>

        {/* DISPLAY — QUESTION */}
        <Frame label="Projector · Live question (votes coming in)">
          <div style={{ padding: '18px 28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.3)', padding: '6px 14px', borderRadius: 999 }}>Question 1 / 5</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, background: 'rgba(0,0,0,.3)', padding: '6px 14px', borderRadius: 999 }}><Users size={16} /> 24 answered</span>
              <TimerRing remaining={8} total={20} size={84} />
            </div>
            <div className="qcard" style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900 }}>What is 12 × 8?</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['A', 'B', 'C', 'D'] as Choice[]).map((c) => (
                <div key={c} style={{ position: 'relative' }}>
                  <AnswerTile choice={c} label={OPTS[c]} state="idle" />
                  <span style={{ position: 'absolute', top: 12, right: 14, fontWeight: 900, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.4)', padding: '2px 11px', borderRadius: 999, fontSize: 14 }}>{TALLY[c]}</span>
                </div>
              ))}
            </div>
          </div>
        </Frame>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {/* PLAYER — BUZZER */}
          <Frame label="Phone · Answering">
            <div style={{ padding: '16px 16px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: 'rgba(255,255,255,.8)' }}>Question 1</span>
                <TimerRing remaining={12} total={20} size={56} />
              </div>
              <div className="qcard" style={{ textAlign: 'center', marginBottom: 14, padding: 18 }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>What is 12 × 8?</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['A', 'B', 'C', 'D'] as Choice[]).map((c) => (
                  <AnswerTile key={c} choice={c} label={OPTS[c]} compact state={c === 'A' ? 'picked' : 'idle'} />
                ))}
              </div>
            </div>
          </Frame>

          {/* PLAYER — CORRECT */}
          <Frame label="Phone · Correct!">
            <Confetti inline continuous />
            <div style={{ position: 'relative', zIndex: 2, padding: '40px 20px', textAlign: 'center', display: 'grid', gap: 8, placeItems: 'center', minHeight: 320, alignContent: 'center' }}>
              <div className="pop-in" style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--correct)', display: 'grid', placeItems: 'center', fontSize: 52, boxShadow: '0 10px 0 rgba(0,0,0,.2), 0 0 50px var(--correct)' }}>✓</div>
              <div style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 34, color: '#fff' }}>Correct!</div>
              <div className="pop-in" style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 44, color: 'var(--accent)', textShadow: '0 0 30px rgba(255,214,0,.4)' }}>+850</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,.25)', padding: '6px 16px', borderRadius: 999, fontWeight: 800 }}><Bolt size={18} /> 3 in a row!</div>
            </div>
          </Frame>
        </div>

        {/* TEAM BATTLE */}
        <Frame label="Projector · Team Battle (bonus round)">
          <div style={{ padding: '18px 28px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace', background: 'rgba(0,0,0,.3)', padding: '6px 14px', borderRadius: 999 }}>Q3 · Blue Lions</span>
              <span style={{ fontWeight: 900, color: '#f97316', background: 'rgba(249,115,22,.15)', border: '1px solid #f97316', padding: '6px 16px', borderRadius: 999 }}><Zap size={16} style={{ verticalAlign: '-2px', marginRight: 4 }} />BONUS · +5</span>
              <TimerRing remaining={11} total={20} size={72} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[['Red Eagles', 30, '#e21b3c', false], ['Blue Lions', 20, '#1368ce', true]].map(([n, s, col, act]) => (
                <div key={n as string} style={{ borderRadius: 16, padding: 16, border: `3px solid ${col as string}`, background: `${col as string}22`, boxShadow: act ? `0 0 30px ${col as string}88` : 'none', transform: act ? 'scale(1.03)' : 'none' }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{n as string}</div>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 40, color: 'var(--accent)' }}>{s as number}</div>
                </div>
              ))}
            </div>
            <div className="qcard" style={{ textAlign: 'center', marginBottom: 14 }}><div style={{ fontSize: 'clamp(22px,3.4vw,36px)', fontWeight: 900 }}>Which is a prime number?</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['A', 'B', 'C', 'D'] as Choice[]).map((c) => (
                <AnswerTile key={c} choice={c} label={{ A: '21', B: '27', C: '29', D: '33' }[c]} />
              ))}
            </div>
          </div>
        </Frame>

        {/* ORAL */}
        <Frame label="Projector · Oral (teacher recorded the learner's answer)">
          <div style={{ padding: '18px 28px 26px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[['Group A', 20, '#8b5cf6'], ['Group B', 30, '#f97316']].map(([n, s, col]) => (
                <div key={n as string} style={{ borderRadius: 16, padding: 14, border: `3px solid ${col as string}`, background: `${col as string}22` }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{n as string}</div>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 34, color: 'var(--accent)' }}>{s as number}</div>
                </div>
              ))}
            </div>
            <div className="qcard" style={{ textAlign: 'center', marginBottom: 12 }}><div style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900 }}>Which is a prime number?</div></div>
            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 20, color: 'var(--wrong)', marginBottom: 12 }}>Group B answered <b>C</b> — Wrong — the answer was A</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['A', 'B', 'C', 'D'] as Choice[]).map((c) => {
                const isCorrect = c === 'A';
                const isChosen = c === 'C';
                return (
                  <div key={c} style={{ position: 'relative', borderRadius: 18, outline: isChosen ? '3px solid var(--wrong)' : 'none' }}>
                    <AnswerTile choice={c} label={{ A: '29', B: '27', C: '21', D: '33' }[c]} state={isCorrect ? 'reveal-correct' : isChosen ? 'idle' : 'reveal-wrong'} />
                    {isChosen && <span style={{ position: 'absolute', top: 10, right: 14, background: 'var(--wrong)', padding: '3px 12px', borderRadius: 999, fontSize: 13, fontWeight: 800 }}>Learner ✗</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Frame>

        {/* SPEED */}
        <Frame label="Projector · Speed Round (solo runner)">
          <div style={{ padding: '18px 28px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, background: '#f97316', padding: '7px 16px', borderRadius: 999, fontSize: 18 }}>
                <span className="avatar" style={{ width: 32, height: 32, fontSize: 14, background: 'rgba(0,0,0,.25)' }}>A</span>Amara
              </span>
              <span style={{ fontWeight: 900, fontFamily: 'ui-monospace,monospace', fontSize: 22, color: 'var(--accent)' }}>7 ✓ · Q9/15</span>
              <TimerRing remaining={6} total={15} size={72} />
            </div>
            <div className="qcard" style={{ textAlign: 'center', marginBottom: 14 }}><div style={{ fontSize: 'clamp(22px,3.4vw,36px)', fontWeight: 900 }}>15% of 200 = ?</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(['A', 'B', 'C', 'D'] as Choice[]).map((c) => (
                <AnswerTile key={c} choice={c} label={{ A: '25', B: '30', C: '35', D: '40' }[c]} />
              ))}
            </div>
          </div>
        </Frame>

        {/* CHAMPION SPOTLIGHT */}
        <Frame label="Projector · Champion spotlight (game over)">
          <Confetti inline continuous />
          <div style={{ position: 'relative', zIndex: 2, padding: '30px 24px 40px' }}>
            <ChampionSpotlight name="Amara" subtitle="980 pts" />
          </div>
        </Frame>

        {/* PODIUM */}
        <Frame label="Projector · Champions">
          <Confetti inline continuous />
          <div style={{ position: 'relative', zIndex: 2, padding: '28px 24px 34px', textAlign: 'center' }}>
            <div className="float-y" style={{ display: 'inline-block' }}><Trophy size={72} /></div>
            <div style={{ fontFamily: '"Fredoka One",sans-serif', fontSize: 'clamp(28px,5vw,48px)', color: 'var(--accent)', margin: '2px 0 20px' }}>Champions!</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 22 }}>
              {[[1, PLAYERS[1], 150, '#C0C0C0'], [0, PLAYERS[0], 200, 'var(--accent)'], [2, PLAYERS[2], 110, '#cd7f32']].map(([rank, p, h, col]) => {
                const [name, score] = p as readonly [string, number];
                return (
                  <div key={name} style={{ display: 'grid', gap: 8, placeItems: 'center' }}>
                    <span className="avatar" style={{ width: 52, height: 52, fontSize: 20, background: col as string }}>{name[0]}</span>
                    <div style={{ fontWeight: 900 }}>{name}</div>
                    <div style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)', fontWeight: 900 }}>{score}</div>
                    <div className="slide-up" style={{ width: 96, height: h as number, borderRadius: '14px 14px 0 0', background: `linear-gradient(180deg, ${col as string}, transparent)`, border: `2px solid ${col as string}`, display: 'grid', placeItems: 'start center', paddingTop: 8, fontFamily: '"Fredoka One",sans-serif', fontSize: 26 }}>
                      {(rank as number) === 0 ? <Star size={30} /> : `#${(rank as number) + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ maxWidth: 460, margin: '0 auto', display: 'grid', gap: 8 }}>
              {PLAYERS.map(([n, s], i) => (
                <div key={n} className={`lbrow ${i === 0 ? 'top1' : ''}`} style={{ animationDelay: `${i * 0.06}s` }}>
                  <b style={{ width: 26, textAlign: 'center', color: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,.7)' }}>{i + 1}</b>
                  <span className="avatar" style={{ width: 34, height: 34, fontSize: 15, background: AV[i % AV.length] }}>{n[0]}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontWeight: 800 }}>{n}</span>
                  <b style={{ fontFamily: 'ui-monospace,monospace', color: 'var(--accent)' }}>{s}</b>
                </div>
              ))}
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
}
