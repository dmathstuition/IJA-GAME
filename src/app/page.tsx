'use client';

import { Zap, Trophy, School, Play, ShieldCheck, Users, Gamepad2, Flame, Crown, TrendingUp, Mic, Upload, Palette, Timer, MonitorPlay, Check, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const ORANGE = '#ff7a1a';
const RED = '#ff2d55';
const PURPLE = '#8b5cf6';
const PINK = '#ec4899';
const GREEN = '#25d366';
const GOLD = '#f5b301';

const NAV: { label: string; href: string }[] = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Schools', href: '#schools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#resources' },
];
const CHIPS = [
  { i: <Zap size={22} />, c: ORANGE, t: 'Team Battles', s: 'Real-time action' },
  { i: '◎', c: PINK, t: 'AI Questions', s: 'Smart & adaptive' },
  { i: <Trophy size={22} />, c: GOLD, t: 'Live Rankings', s: 'Updated instantly' },
  { i: <ShieldCheck size={22} />, c: GREEN, t: 'Secure & Fair', s: '100% trusted' },
];
const OPTS = [['A', 'x = 6'], ['B', 'x = 7'], ['C', 'x = 8'], ['D', 'x = 11']] as const;
const LEADERS = [
  ['Greenfield School', '9,840', true], ['Wisdom Academy', '9,750', true], ['King’s College', '9,600', false],
  ['Royal Academy', '9,230', true], ['Bright Future School', '8,900', true],
] as const;
const STATS = [
  { i: <School size={22} />, c: PURPLE, n: '245 +', l: 'Schools Onboarded' },
  { i: <Users size={22} />, c: ORANGE, n: '48,000 +', l: 'Students Engaged' },
  { i: <Gamepad2 size={22} />, c: PINK, n: '12,300 +', l: 'Games Played' },
  { i: <ShieldCheck size={22} />, c: GREEN, n: '99.99%', l: 'Uptime Guarantee' },
];
const SCHOOLS = ['Greenfield School', 'Whyte Pyramid Academy', 'King’s College', 'Royal Academy', 'Wisdom Academy', 'Bright Future School'];

const FEATURES = [
  { i: <MonitorPlay size={22} />, c: ORANGE, t: 'Four game modes', d: 'Standard, Team Battle, Speed round and on-stage Quiz Bowl — one question bank, any format.' },
  { i: <Mic size={22} />, c: PURPLE, t: 'No-device quiz bowl', d: 'Interswitch-SPAK style: 2–6 groups compete out loud, the host judges, misses pass on for bonus. No phones needed.' },
  { i: <Upload size={22} />, c: GREEN, t: 'Instant JSON import', d: 'Paste or upload questions straight into a live game — MCQ or theory — with a live validity preview.' },
  { i: <Palette size={22} />, c: PINK, t: 'Your school’s brand', d: 'Choose colours, themes and animations so every screen looks like it belongs to your school.' },
  { i: <Trophy size={22} />, c: GOLD, t: 'Live projector leaderboards', d: 'Big-screen scoreboards, timers and confetti update in real time as students answer.' },
  { i: <Timer size={22} />, c: RED, t: 'Time-based scoring', d: 'Faster correct answers earn more — 10 points plus up to 5 for speed, just like the big competitions.' },
];
const STEPS: [string, string, string][] = [
  ['1', 'Build your questions', 'Create a reusable bank in the dashboard, or import JSON in seconds — MCQ and theory both supported.'],
  ['2', 'Start a game & share the code', 'Pick a mode and put the join code on the projector for the whole hall to see.'],
  ['3', 'Play live — devices optional', 'Students buzz in from any phone browser, or compete on stage with no devices at all.'],
];
const USE_CASES = ['Inter-house championships', 'Interswitch-SPAK style quiz bowls', 'Revision & end-of-term games', 'Science & maths olympiad heats', 'Assembly & open-day showcases', 'Club and society tournaments'];
const FAQ: [string, string][] = [
  ['Do students need to install an app?', 'No. Players join from any phone browser at your link — and for Quiz Bowl mode, no devices are needed at all.'],
  ['How does payment work?', 'A one-time PayPal payment activates your school for the term or the year. No subscription, and no card details are stored.'],
  ['Can we use our own questions?', 'Yes — paste or upload JSON right inside the live controller, or build reusable banks in the dashboard.'],
  ['How many students can take part?', 'Up to 250 on the Annual plan, and a live game runs on a single projector for the whole room.'],
];

function Tile({ letter, from, to, pos }: { letter: string; from: string; to: string; pos: React.CSSProperties }) {
  return (
    <div className="tile3d" style={{ position: 'absolute', ...pos }}>
      <div style={{ background: `linear-gradient(150deg, ${from}, ${to})`, boxShadow: `0 20px 40px -8px ${to}88, inset 0 2px 4px rgba(255,255,255,.4), inset 0 -6px 10px rgba(0,0,0,.3)` }}>{letter}</div>
    </div>
  );
}

function Ring({ pct, secs }: { pct: number; secs: string }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 92, height: 92 }}>
      <svg width="92" height="92" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ filter: `drop-shadow(0 0 5px ${GOLD})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', lineHeight: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 22, fontFamily: 'ui-monospace,monospace' }}>{secs}</div>
        <div style={{ fontSize: 9, color: '#8b8296', letterSpacing: 2 }}>SEC</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [t, setT] = useState({ h: '01', m: '24', s: '59' });
  useEffect(() => {
    let total = 1 * 3600 + 24 * 60 + 59;
    const id = setInterval(() => {
      total = total > 0 ? total - 1 : 1 * 3600 + 24 * 60 + 59;
      const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
      setT({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const card: React.CSSProperties = { background: 'linear-gradient(160deg, rgba(30,20,45,.85), rgba(15,10,25,.9))', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, backdropFilter: 'blur(10px)' };
  const pill = (bg: string, fg = '#fff'): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 8, background: bg, color: fg, borderRadius: 999, fontWeight: 800, cursor: 'pointer' });

  return (
    <div style={{ minHeight: '100vh', background: '#080511', color: '#fff', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .tile3d>div{width:100%;height:100%;border-radius:22px;display:grid;place-items:center;font-size:2.4rem;font-weight:900;color:#fff;transform:rotate(var(--rot,0deg))}
        .tile3d{animation:floaty var(--d,6s) ease-in-out infinite alternate}
        @keyframes floaty{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-22px) rotate(4deg)}}
        @keyframes glowPulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes liveDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
        html{scroll-behavior:smooth}
        section[id]{scroll-margin-top:24px}
        .navlink{color:#c9c2d6;font-weight:600;font-size:15px;cursor:pointer;transition:color .15s}
        .navlink:hover{color:#fff}
        .featcard{transition:transform .15s, border-color .15s}
        .featcard:hover{transform:translateY(-4px);border-color:rgba(255,255,255,.2)}
        .primaryCta:hover{filter:brightness(1.08);transform:translateY(-2px)}
        .primaryCta{transition:all .15s}
        @media(max-width:960px){.hero-grid{grid-template-columns:1fr!important}.right-col{display:none!important}.navlinks{display:none!important}}
      `}</style>

      {/* ambient glows */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 700, height: 500, top: -160, left: -120, background: `radial-gradient(ellipse, ${ORANGE}22, transparent 65%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 800, height: 700, top: 80, right: -200, background: `radial-gradient(ellipse, ${PURPLE}25, transparent 65%)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 500, height: 400, bottom: -100, left: '30%', background: `radial-gradient(ellipse, ${RED}18, transparent 65%)`, filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1440, margin: '0 auto', padding: '0 32px' }}>
        {/* NAV */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(140deg, ${ORANGE}, ${RED})`, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 26, boxShadow: `0 8px 20px ${RED}66` }}>Q</div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5 }}>QUIZ<span style={{ color: ORANGE }}>ARENA</span></div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: '#8b8296', marginTop: 3 }}>LIVE. COMPETE. WIN.</div>
            </div>
          </div>
          <div className="navlinks" style={{ display: 'flex', gap: 30 }}>
            {NAV.map((n) => <a key={n.label} href={n.href} className="navlink" style={{ textDecoration: 'none' }}>{n.label}</a>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a href="/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,.15)', padding: '10px 22px', borderRadius: 10 }}>Login</a>
            <a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '11px 22px', textDecoration: 'none' }}><Zap size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />Start Free Trial</a>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 40, alignItems: 'center', paddingTop: 20 }}>
          {/* LEFT */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 999, padding: '9px 18px', fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>
              <Flame size={14} color={ORANGE} style={{ verticalAlign: '-2px', marginRight: 5 }} />125 SCHOOLS LIVE RIGHT NOW <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, animation: 'liveDot 1.5s infinite', boxShadow: `0 0 8px ${GREEN}` }} />
            </div>
            <h1 style={{ fontSize: 'clamp(48px, 6.6vw, 92px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: -2, margin: '22px 0 0' }}>
              <span style={{ background: `linear-gradient(100deg, ${ORANGE}, ${RED})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Live Quiz</span><br />
              Competitions<br />
              <span style={{ fontSize: '0.62em' }}>for Every School<span style={{ color: ORANGE }}>.</span></span>
            </h1>
            <p style={{ color: '#a49db3', fontSize: 19, lineHeight: 1.5, margin: '22px 0 28px', maxWidth: 460 }}>Team battles, speed rounds and live leaderboards on the big screen — branded in your school&apos;s colours.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
              {CHIPS.map((c) => (
                <div key={c.t} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '10px 14px' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: `${c.c}22`, color: c.c, display: 'grid', placeItems: 'center', fontSize: 15 }}>{c.i}</span>
                  <div style={{ lineHeight: 1.2 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{c.t}</div><div style={{ fontSize: 11, color: '#8b8296' }}>{c.s}</div></div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '17px 34px', fontSize: 17, textDecoration: 'none', boxShadow: `0 12px 30px ${RED}55` }}><Flame size={17} style={{ verticalAlign: '-3px', marginRight: 7 }} />Start Hosting Quiz <span style={{ fontSize: 20 }}>→</span></a>
              <button style={{ ...pill('rgba(255,255,255,.05)'), padding: '17px 30px', fontSize: 17, border: '1px solid rgba(255,255,255,.15)' }}><Play size={16} fill="currentColor" style={{ verticalAlign: '-3px', marginRight: 7 }} />Watch Live Demo</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
              <div style={{ display: 'flex' }}>
                {[PURPLE, ORANGE, PINK, GREEN].map((c, i) => <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${c}, #222)`, border: '2px solid #080511', marginLeft: i ? -12 : 0, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800 }}>{'AKMS'[i]}</div>)}
              </div>
              <span style={{ color: '#a49db3', fontSize: 15 }}>Join <b style={{ color: ORANGE }}>245+</b> schools already competing</span>
            </div>
          </div>

          {/* RIGHT — dashboard mock */}
          <div className="right-col" style={{ position: 'relative', minHeight: 560 }}>
            <Tile letter="A" from={PURPLE} to="#6d28d9" pos={{ top: 20, left: 70, width: 78, height: 78, ['--d' as string]: '5.5s' }} />
            <Tile letter="B" from={PINK} to="#be185d" pos={{ top: 30, right: 20, width: 84, height: 84, ['--d' as string]: '6.5s' }} />
            <Tile letter="C" from={ORANGE} to="#c2410c" pos={{ top: 372, left: -34, width: 74, height: 74, ['--d' as string]: '5s' }} />
            <Tile letter="D" from={PURPLE} to="#6d28d9" pos={{ top: 300, right: -30, width: 80, height: 80, ['--d' as string]: '7s' }} />

            {/* countdown card */}
            <div style={{ ...card, position: 'absolute', top: 0, right: 70, padding: '14px 20px', zIndex: 3, border: `1px solid ${RED}44` }}>
              <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, letterSpacing: 2, color: RED, marginBottom: 6 }}>NEXT LIVE QUIZ</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                {[['HR', t.h], ['MIN', t.m], ['SEC', t.s]].map(([l, v], i) => (
                  <div key={l} style={{ display: 'flex', gap: 6 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 30, background: 'rgba(0,0,0,.3)', borderRadius: 8, padding: '4px 8px', minWidth: 46 }}>{v}</div>
                      <div style={{ fontSize: 9, color: '#8b8296', marginTop: 3 }}>{l}</div>
                    </div>
                    {i < 2 && <div style={{ color: RED, fontWeight: 900, fontSize: 26, marginTop: 4 }}>:</div>}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 11, color: GOLD, marginTop: 6 }}>Get your students ready!</div>
            </div>

            {/* main dashboard */}
            <div style={{ ...card, position: 'absolute', top: 118, left: 18, right: 8, padding: 20, zIndex: 2, boxShadow: `0 30px 70px rgba(0,0,0,.5), 0 0 40px ${PURPLE}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontWeight: 800, letterSpacing: 1, fontSize: 13 }}>LIVE COMPETITION</span>
                <span style={{ background: RED, fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 5, letterSpacing: 1 }}>● LIVE</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .8fr 1.2fr', gap: 16 }}>
                {/* question */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#d9d3e6', marginBottom: 10 }}>What is the value of x in the equation 2x + 5 = 17?</div>
                  <div style={{ display: 'grid', gap: 7 }}>
                    {OPTS.map(([k, v]) => {
                      const ok = k === 'B';
                      return (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 9, border: `1px solid ${ok ? GREEN : 'rgba(255,255,255,.1)'}`, background: ok ? `${GREEN}1f` : 'rgba(255,255,255,.03)' }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${ok ? GREEN : 'rgba(255,255,255,.2)'}`, color: ok ? GREEN : '#8b8296', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{k}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* timer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ fontSize: 10, color: '#8b8296', letterSpacing: 1 }}>TIME LEFT</div>
                  <Ring pct={0.55} secs="28" />
                  <div style={{ fontSize: 11, color: '#8b8296' }}>QUESTION <b style={{ color: '#fff' }}>7 / 20</b></div>
                  <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: '35%', height: '100%', background: `linear-gradient(90deg, ${PURPLE}, ${PINK})` }} /></div>
                </div>
                {/* leaderboard */}
                <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12, marginBottom: 10 }}><Trophy size={13} color={GOLD} /> LEADERBOARD</div>
                  {LEADERS.map(([name, pts, up], i) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12 }}>
                      <b style={{ color: '#8b8296', width: 12 }}>{i + 1}</b>
                      <span style={{ flex: 1, fontWeight: 600 }}>{name}</span>
                      <b style={{ fontFamily: 'ui-monospace,monospace', color: GOLD }}>{pts}</b>
                      <span style={{ color: up ? GREEN : RED, fontSize: 10 }}>{up ? '▲' : '▼'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* trophy */}
            <div style={{ position: 'absolute', bottom: 62, left: '43%', transform: 'translateX(-50%)', fontSize: 76, zIndex: 4, filter: `drop-shadow(0 10px 30px ${GOLD}88)`, animation: 'floaty 4s ease-in-out infinite alternate' }}><Trophy size={76} color={GOLD} strokeWidth={1.6} /></div>

            {/* mini cards */}
            <div style={{ position: 'absolute', bottom: 0, left: 18, right: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, zIndex: 3 }}>
              <div style={{ ...card, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, marginBottom: 4 }}><Crown size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Weekly Champions</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Greenfield School</div>
                <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, color: GOLD, fontSize: 18 }}>9,540 <span style={{ fontSize: 10, color: '#8b8296' }}>pts</span></div>
                <div style={{ fontSize: 10, color: '#8b8296', marginTop: 2 }}>View all champions →</div>
              </div>
              <div style={{ ...card, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: PURPLE, marginBottom: 4 }}><Zap size={12} style={{ verticalAlign: '-2px', marginRight: 3 }} />Speed Round</div>
                <div style={{ fontSize: 11, color: '#8b8296' }}>Starts in</div>
                <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, color: PURPLE, fontSize: 20 }}>00:{t.s}</div>
                <div style={{ fontSize: 10, color: '#8b8296', marginTop: 2 }}>Be ready!</div>
              </div>
              <div style={{ ...card, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: GREEN, marginBottom: 4 }}><TrendingUp size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Live Participants</div>
                <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 20 }}>18,245</div>
                <div style={{ fontSize: 10, color: '#8b8296' }}>Students online</div>
                <svg viewBox="0 0 80 20" style={{ width: '100%', height: 18, marginTop: 2 }}><polyline points="0,16 15,12 30,14 45,7 60,9 80,2" fill="none" stroke={GREEN} strokeWidth="2" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, padding: '26px 34px', margin: '54px 0 34px' }}>
          {STATS.map((s) => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 54, height: 54, borderRadius: 14, background: `${s.c}1f`, color: s.c, display: 'grid', placeItems: 'center', fontSize: 24 }}>{s.i}</span>
              <div><div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.5 }}>{s.n}</div><div style={{ color: '#8b8296', fontSize: 13 }}>{s.l}</div></div>
            </div>
          ))}
        </div>

        {/* TRUSTED BY */}
        <div style={{ ...card, padding: '20px 30px', marginBottom: 50 }}>
          <div style={{ textAlign: 'center', letterSpacing: 4, fontSize: 12, fontWeight: 800, color: '#8b8296', marginBottom: 18 }}>TRUSTED BY SCHOOLS WORLDWIDE</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            {SCHOOLS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.85 }}>
                <svg width="34" height="40" viewBox="0 0 34 40"><path d="M17 2 L31 7 V20 C31 30 24 36 17 38 C10 36 3 30 3 20 V7 Z" fill={`${[PURPLE, ORANGE, GOLD, RED, PURPLE, GREEN][i]}33`} stroke={[PURPLE, ORANGE, GOLD, RED, PURPLE, GREEN][i]} strokeWidth="1.5" /><text x="17" y="24" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="900">{s[0]}</text></svg>
                <span style={{ fontWeight: 800, fontSize: 13, maxWidth: 90, lineHeight: 1.15 }}>{s.toUpperCase()}</span>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 900, fontSize: 22, color: PINK }}>+200</div><div style={{ fontSize: 11, color: '#8b8296' }}>More Schools</div></div>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" style={{ padding: '40px 0 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 34px' }}>
            <div style={{ color: ORANGE, letterSpacing: 3, fontWeight: 800, fontSize: 12 }}>FEATURES</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: -1, margin: '10px 0 8px' }}>Everything you need to run a live quiz</h2>
            <p style={{ color: '#a49db3', fontSize: 16, lineHeight: 1.55 }}>From casual revision to full inter-school championships — all on one branded platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.t} className="featcard" style={{ ...card, padding: 22 }}>
                <span style={{ width: 48, height: 48, borderRadius: 12, background: `${f.c}1f`, color: f.c, display: 'grid', placeItems: 'center', marginBottom: 14 }}>{f.i}</span>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{f.t}</div>
                <div style={{ color: '#a49db3', fontSize: 14, lineHeight: 1.55 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" style={{ padding: '48px 0 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 34px' }}>
            <div style={{ color: PURPLE, letterSpacing: 3, fontWeight: 800, fontSize: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: -1, margin: '10px 0 8px' }}>Live in three steps</h2>
            <p style={{ color: '#a49db3', fontSize: 16 }}>No setup calls, no installs — sign up and run your first game the same day.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            {STEPS.map(([n, t, d]) => (
              <div key={n} style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: `linear-gradient(135deg,${ORANGE},${RED})`, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, boxShadow: `0 6px 16px ${RED}44` }}>{n}</span>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{t}</div>
                </div>
                <div style={{ color: '#a49db3', fontSize: 14.5, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SCHOOLS */}
        <section id="schools" style={{ padding: '48px 0 20px' }}>
          <div style={{ ...card, padding: 'clamp(24px,4vw,44px)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 36, alignItems: 'center' }} className="hero-grid">
            <div>
              <div style={{ color: GREEN, letterSpacing: 3, fontWeight: 800, fontSize: 12 }}>FOR SCHOOLS</div>
              <h2 style={{ fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 900, letterSpacing: -1, margin: '10px 0 14px' }}>Built for real school competitions</h2>
              <p style={{ color: '#a49db3', fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>Whether it&apos;s an inter-house championship on the assembly stage or a quick revision buzzer game in class, QuizArena runs it — projected big, scored automatically, branded as yours.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {USE_CASES.map((u) => (
                  <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: '#d9d3e6' }}>
                    <span style={{ width: 20, height: 20, borderRadius: 999, background: `${GREEN}22`, color: GREEN, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Check size={12} /></span>{u}
                  </div>
                ))}
              </div>
              <a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '14px 26px', fontSize: 15, textDecoration: 'none' }}>Start your free trial <ArrowRight size={16} /></a>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {[['Greenfield School', 'Ran a 12-house championship for 480 students on one screen.', PURPLE, 'G'], ['King’s College', 'Weekly Friday quiz bowl — zero devices, full hall engaged.', ORANGE, 'K'], ['Wisdom Academy', 'Imported past exam questions as JSON and launched in minutes.', GREEN, 'W']].map(([name, quote, col, ltr]) => (
                <div key={name as string} style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${col}, #222)`, display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>{ltr}</span>
                  <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>{name}</div><div style={{ color: '#a49db3', fontSize: 13.5, lineHeight: 1.5, marginTop: 2 }}>{quote}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING teaser */}
        <section style={{ padding: '48px 0 20px', textAlign: 'center' }}>
          <div style={{ color: GOLD, letterSpacing: 3, fontWeight: 800, fontSize: 12 }}>PRICING</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: -1, margin: '10px 0 8px' }}>Simple, one-time pricing</h2>
          <p style={{ color: '#a49db3', fontSize: 16, maxWidth: 560, margin: '0 auto 26px' }}>Start with a free trial, then pay once with PayPal to unlock live hosting for the term or the year. No subscription.</p>
          <div style={{ display: 'inline-flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 26 }}>
            {[['Term pass', '$99', '120 days'], ['Annual', '$249', '365 days']].map(([n, p, dur], i) => (
              <div key={n} style={{ ...card, padding: '22px 28px', minWidth: 200, border: i === 1 ? `1px solid ${ORANGE}66` : card.border }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#a49db3' }}>{n}</div>
                <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: -1, margin: '4px 0' }}>{p}</div>
                <div style={{ fontSize: 12.5, color: '#8b8296' }}>one-time · {dur}</div>
              </div>
            ))}
          </div>
          <div><a href="/pricing" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '14px 30px', fontSize: 15, textDecoration: 'none' }}>See full pricing <ArrowRight size={16} /></a></div>
        </section>

        {/* RESOURCES / FAQ */}
        <section id="resources" style={{ padding: '48px 0 30px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 30px' }}>
            <div style={{ color: PINK, letterSpacing: 3, fontWeight: 800, fontSize: 12 }}>RESOURCES</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: -1, margin: '10px 0 8px' }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, maxWidth: 960, margin: '0 auto' }}>
            {FAQ.map(([q, a]) => (
              <div key={q} style={{ ...card, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 8 }}>{q}</div>
                <div style={{ color: '#a49db3', fontSize: 14, lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '34px 0 40px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(140deg, ${ORANGE}, ${RED})`, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 22 }}>Q</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>QUIZ<span style={{ color: ORANGE }}>ARENA</span></div>
              <div style={{ fontSize: 12, color: '#8b8296' }}>© {new Date().getFullYear()} QuizArena. Live. Compete. Win.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <a href="#features" className="navlink" style={{ textDecoration: 'none' }}>Features</a>
            <a href="#how" className="navlink" style={{ textDecoration: 'none' }}>How it works</a>
            <a href="/pricing" className="navlink" style={{ textDecoration: 'none' }}>Pricing</a>
            <a href="/login" className="navlink" style={{ textDecoration: 'none' }}>Login</a>
            <a href="/signup" className="navlink" style={{ textDecoration: 'none', color: ORANGE }}>Start free trial</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
