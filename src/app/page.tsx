'use client';

import { Zap, Trophy, School, Play, ShieldCheck, Users, Gamepad2, Flame, Crown, TrendingUp, Mic, Upload, Palette, Timer, MonitorPlay, Check, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BrandLogo } from '@/components/BrandLogo';

const ORANGE = '#FF6A00';
const RED = '#ff2d55';
const PURPLE = '#6C5CE7';
const PINK = '#ec4899';
const GREEN = '#00C853';
const GOLD = '#f5b301';

type View = 'home' | 'features' | 'how' | 'schools' | 'pricing' | 'resources';
const NAV: { label: string; view: View }[] = [
  { label: 'Features', view: 'features' },
  { label: 'How It Works', view: 'how' },
  { label: 'Schools', view: 'schools' },
  { label: 'Pricing', view: 'pricing' },
  { label: 'Resources', view: 'resources' },
];

const CHIPS = [
  { i: <Zap size={20} />, c: ORANGE, t: 'Team Battles', s: 'Real-time action' },
  { i: <Mic size={20} />, c: PINK, t: 'Quiz Bowl', s: 'No devices needed' },
  { i: <Trophy size={20} />, c: GOLD, t: 'Live Rankings', s: 'Updated instantly' },
  { i: <ShieldCheck size={20} />, c: GREEN, t: 'Secure & Fair', s: '100% trusted' },
];
const OPTS = [['A', 'x = 6'], ['B', 'x = 7'], ['C', 'x = 8'], ['D', 'x = 11']] as const;
const LEADERS = [['Infant Jesus Academy', '9,840', true], ['DMaths Academy', '9,600', true]] as const;
const FEATURES = [
  { i: <MonitorPlay size={22} />, c: ORANGE, t: 'Four game modes', d: 'Standard, Team Battle, Speed round and on-stage Quiz Bowl — one bank, any format.' },
  { i: <Mic size={22} />, c: PURPLE, t: 'No-device quiz bowl', d: 'Interswitch-SPAK style: 2–6 groups compete out loud, host judges, misses pass on for bonus.' },
  { i: <Upload size={22} />, c: GREEN, t: 'Instant JSON import', d: 'Paste or upload questions straight into a live game — MCQ or theory — with a validity preview.' },
  { i: <Palette size={22} />, c: PINK, t: 'Your school’s brand', d: 'Choose colours, themes and animations so every screen belongs to your school.' },
  { i: <Trophy size={22} />, c: GOLD, t: 'Live leaderboards', d: 'Big-screen scoreboards, timers and confetti update in real time as students answer.' },
  { i: <Timer size={22} />, c: RED, t: 'Time-based scoring', d: 'Faster correct answers earn more — 10 points plus up to 5 for speed.' },
];
const STEPS: [string, string, string][] = [
  ['1', 'Build your questions', 'Create a reusable bank, or import JSON in seconds — MCQ and theory supported.'],
  ['2', 'Start a game & share the code', 'Pick a mode and put the join code on the projector for the whole hall.'],
  ['3', 'Play live — devices optional', 'Students buzz in from any phone, or compete on stage with no devices at all.'],
];
const USE_CASES = ['Inter-house championships', 'Interswitch-SPAK style quiz bowls', 'Revision & end-of-term games', 'Science & maths olympiad heats', 'Assembly & open-day showcases', 'Club & society tournaments'];
const FAQ: [string, string][] = [
  ['Do students need an app?', 'No. Players join from any phone browser at your link — and for Quiz Bowl mode, no devices at all.'],
  ['How does payment work?', 'A one-time PayPal payment activates your school for the term or year. No subscription, no card stored.'],
  ['Can we use our own questions?', 'Yes — paste or upload JSON right inside the live controller, or build banks in the dashboard.'],
  ['How many can take part?', 'Up to 250 on the Annual plan, and a live game runs on a single projector for the whole room.'],
];
const PRICE = [['Term pass', '$99', '120 days', false], ['Annual', '$249', '365 days', true]] as const;

const card: React.CSSProperties = { background: 'linear-gradient(160deg, rgba(30,20,45,.85), rgba(15,10,25,.9))', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, backdropFilter: 'blur(10px)' };
const pill = (bg: string, fg = '#fff'): React.CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 8, background: bg, color: fg, borderRadius: 999, fontWeight: 800, cursor: 'pointer', textDecoration: 'none' });
const eyebrow = (c: string): React.CSSProperties => ({ color: c, letterSpacing: 3, fontWeight: 800, fontSize: 12 });
const h2: React.CSSProperties = { fontSize: 'clamp(26px,3.4vw,40px)', fontWeight: 900, letterSpacing: -1, margin: '8px 0 6px' };

function Tile({ letter, from, to, pos }: { letter: string; from: string; to: string; pos: React.CSSProperties }) {
  return <div className="tile3d" style={{ position: 'absolute', ...pos }}><div style={{ background: `linear-gradient(150deg, ${from}, ${to})`, boxShadow: `0 20px 40px -8px ${to}88, inset 0 2px 4px rgba(255,255,255,.4), inset 0 -6px 10px rgba(0,0,0,.3)` }}>{letter}</div></div>;
}
function Ring({ secs }: { secs: string }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 84, height: 84 }}>
      <svg width="84" height="84" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.45} style={{ filter: `drop-shadow(0 0 5px ${GOLD})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', lineHeight: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 20, fontFamily: 'ui-monospace,monospace' }}>{secs}</div>
        <div style={{ fontSize: 9, color: '#8b8296', letterSpacing: 2 }}>SEC</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [view, setView] = useState<View>('home');
  const [t, setT] = useState({ h: '01', m: '24', s: '59' });
  const rootRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let total = 1 * 3600 + 24 * 60 + 59;
    const id = setInterval(() => {
      total = total > 0 ? total - 1 : 1 * 3600 + 24 * 60 + 59;
      const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
      setT({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Premium pointer engine: cursor spotlight + subtle 3D tilt on the live mock,
  // rAF-throttled and disabled under reduced motion.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const nx = e.clientX / window.innerWidth;
        const ny = e.clientY / window.innerHeight;
        rootRef.current?.style.setProperty('--mx', `${e.clientX}px`);
        rootRef.current?.style.setProperty('--my', `${e.clientY}px`);
        if (mockRef.current) {
          const rx = (0.5 - ny) * 9;
          const ry = (nx - 0.5) * 12;
          mockRef.current.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        }
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={rootRef} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080511', color: '#fff', fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .tile3d>div{width:100%;height:100%;border-radius:20px;display:grid;place-items:center;font-size:2rem;font-weight:900;color:#fff}
        .tile3d{animation:floaty var(--d,6s) ease-in-out infinite alternate}
        @keyframes floaty{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-16px) rotate(4deg)}}
        @keyframes liveDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
        .navtab{color:#c9c2d6;font-weight:600;font-size:15px;cursor:pointer;transition:color .15s;background:none;border:none;padding:6px 4px}
        .navtab:hover{color:#fff}
        .navtab.on{color:#fff}
        .navtab.on::after{content:'';display:block;height:2px;border-radius:2px;margin-top:4px;background:linear-gradient(90deg,${ORANGE},${RED})}
        .primaryCta{position:relative;overflow:hidden;transition:transform .18s cubic-bezier(.22,1,.36,1),filter .18s,box-shadow .18s}
        .primaryCta:hover{filter:brightness(1.06);transform:translateY(-2px)}
        .primaryCta::after{content:'';position:absolute;top:0;left:-140%;width:60%;height:100%;background:linear-gradient(115deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-18deg);transition:left .6s cubic-bezier(.22,1,.36,1)}
        .primaryCta:hover::after{left:160%}
        .vfade{animation:vf .35s cubic-bezier(.22,1,.36,1)}
        @keyframes vf{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .contentArea{flex:1;min-height:0;overflow:auto}
        /* animated gradient shimmer on the hero headline */
        .shimmer{background:linear-gradient(100deg,${ORANGE},${RED},#ff9d5c,${ORANGE});background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmerMove 6s linear infinite}
        @keyframes shimmerMove{to{background-position:250% 0}}
        /* cursor spotlight follows the pointer for depth */
        .spotlight{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(360px 360px at var(--mx,50%) var(--my,30%),rgba(255,106,0,.14),transparent 70%);transition:background .1s linear}
        /* fine grain for a premium matte surface */
        .grain{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        /* 3D parallax stage for the live-competition mock */
        .mock3d{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .18s cubic-bezier(.22,1,.36,1)}
        .rise{animation:rise .7s cubic-bezier(.22,1,.36,1) both}
        @keyframes rise{from{opacity:0;transform:translateY(22px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
        .rise-1{animation-delay:.05s}.rise-2{animation-delay:.14s}.rise-3{animation-delay:.23s}.rise-4{animation-delay:.32s}.rise-5{animation-delay:.41s}
        @media(prefers-reduced-motion:reduce){.shimmer{animation:none}.mock3d{transform:none!important}.spotlight{display:none}.rise{animation:none}}
        @media(max-width:960px){.hide-sm{display:none!important}.home-grid{grid-template-columns:1fr!important}.home-mock{display:none!important}}
      `}</style>

      {/* ambient glows */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="qz-drift" style={{ position: 'absolute', width: 700, height: 500, top: -160, left: -120, background: `radial-gradient(ellipse, ${ORANGE}22, transparent 65%)`, filter: 'blur(40px)' }} />
        <div className="qz-drift" style={{ position: 'absolute', width: 800, height: 700, top: 40, right: -200, background: `radial-gradient(ellipse, ${PURPLE}22, transparent 65%)`, filter: 'blur(40px)', animationDelay: '-8s' }} />
        <div className="qz-drift" style={{ position: 'absolute', width: 520, height: 520, bottom: -160, left: '38%', background: `radial-gradient(ellipse, ${RED}18, transparent 62%)`, filter: 'blur(46px)', animationDelay: '-14s' }} />
      </div>
      <div className="spotlight" aria-hidden />
      <div className="grain" aria-hidden />

      {/* NAV */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><BrandLogo height={40} tone="dark" tagline /></button>
        <div className="hide-sm" style={{ display: 'flex', gap: 26 }}>
          {NAV.map((n) => <button key={n.view} className={`navtab${view === n.view ? ' on' : ''}`} onClick={() => setView(n.view)}>{n.label}</button>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,.15)', padding: '9px 18px', borderRadius: 10, fontSize: 14 }}>Login</a>
          <a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '10px 18px', fontSize: 14 }}><Zap size={15} /> Start Free Trial</a>
        </div>
      </nav>

      {/* CONTENT — swaps on click, no page scroll */}
      <div className="contentArea" style={{ position: 'relative', zIndex: 10 }}>
        <div key={view} className="vfade" style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 32px', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {view === 'home' && (
            <div className="home-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 40, alignItems: 'center' }}>
              <div>
                <div className="rise rise-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 999, padding: '8px 16px', fontWeight: 800, fontSize: 12.5 }}>
                  <Flame size={14} color={ORANGE} />LIVE QUIZZES RUNNING NOW <span style={{ width: 9, height: 9, borderRadius: '50%', background: GREEN, animation: 'liveDot 1.5s infinite', boxShadow: `0 0 8px ${GREEN}` }} />
                </div>
                <h1 className="rise rise-2" style={{ fontSize: 'clamp(40px, 5.4vw, 76px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: -2, margin: '18px 0 0' }}>
                  <span className="shimmer">Live Quiz</span><br />
                  Competitions<br /><span style={{ fontSize: '0.62em' }}>for Every School<span style={{ color: ORANGE }}>.</span></span>
                </h1>
                <p className="rise rise-3" style={{ color: '#a49db3', fontSize: 17, lineHeight: 1.5, margin: '18px 0 22px', maxWidth: 440 }}>Team battles, speed rounds and on-stage quiz bowls on the big screen — branded in your school&apos;s colours.</p>
                <div className="rise rise-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {CHIPS.map((c) => (
                    <div key={c.t} className="qz-lift" style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '9px 13px' }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: `${c.c}22`, color: c.c, display: 'grid', placeItems: 'center' }}>{c.i}</span>
                      <div style={{ lineHeight: 1.2 }}><div style={{ fontWeight: 800, fontSize: 13 }}>{c.t}</div><div style={{ fontSize: 11, color: '#8b8296' }}>{c.s}</div></div>
                    </div>
                  ))}
                </div>
                <div className="rise rise-5" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                  <a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '15px 30px', fontSize: 16, boxShadow: `0 12px 30px ${RED}55` }}><Flame size={17} />Start Hosting Quiz <ArrowRight size={17} /></a>
                  <button onClick={() => setView('how')} style={{ ...pill('rgba(255,255,255,.05)'), padding: '15px 26px', fontSize: 16, border: '1px solid rgba(255,255,255,.15)' }}><Play size={16} fill="currentColor" />How it works</button>
                </div>
              </div>

              {/* dashboard mock — 3D parallax stage */}
              <div className="home-mock rise rise-3" style={{ position: 'relative', minHeight: 440, perspective: 1100 }}>
               <div ref={mockRef} className="mock3d">
                <Tile letter="A" from={PURPLE} to="#6d28d9" pos={{ top: 8, left: 60, width: 66, height: 66, transform: 'translateZ(70px)', ['--d' as string]: '5.5s' }} />
                <Tile letter="B" from={PINK} to="#be185d" pos={{ top: 16, right: 14, width: 72, height: 72, transform: 'translateZ(90px)', ['--d' as string]: '6.5s' }} />
                <Tile letter="C" from={ORANGE} to="#c2410c" pos={{ top: 320, left: -22, width: 62, height: 62, transform: 'translateZ(55px)', ['--d' as string]: '5s' }} />
                <div style={{ ...card, position: 'absolute', top: 0, right: 56, padding: '12px 18px', zIndex: 3, border: `1px solid ${RED}44`, transform: 'translateZ(55px)' }}>
                  <div style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 800, letterSpacing: 2, color: RED, marginBottom: 5 }}>NEXT LIVE QUIZ</div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
                    {[['HR', t.h], ['MIN', t.m], ['SEC', t.s]].map(([l, v], i) => (
                      <div key={l} style={{ display: 'flex', gap: 5 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 900, fontSize: 26, background: 'rgba(0,0,0,.3)', borderRadius: 7, padding: '3px 7px', minWidth: 40 }}>{v}</div>
                          <div style={{ fontSize: 8.5, color: '#8b8296', marginTop: 2 }}>{l}</div>
                        </div>
                        {i < 2 && <div style={{ color: RED, fontWeight: 900, fontSize: 22, marginTop: 3 }}>:</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...card, position: 'absolute', top: 100, left: 14, right: 6, padding: 18, zIndex: 2, boxShadow: `0 30px 70px rgba(0,0,0,.5), 0 0 40px ${PURPLE}22`, transform: 'translateZ(24px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontWeight: 800, letterSpacing: 1, fontSize: 12.5 }}>LIVE COMPETITION</span>
                    <span style={{ background: RED, fontSize: 8.5, fontWeight: 900, padding: '3px 8px', borderRadius: 5, letterSpacing: 1 }}>● LIVE</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr .7fr 1.2fr', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#d9d3e6', marginBottom: 9 }}>What is x in 2x + 5 = 17?</div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {OPTS.map(([k, v]) => {
                          const ok = k === 'B';
                          return <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, border: `1px solid ${ok ? GREEN : 'rgba(255,255,255,.1)'}`, background: ok ? `${GREEN}1f` : 'rgba(255,255,255,.03)' }}><span style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${ok ? GREEN : 'rgba(255,255,255,.2)'}`, color: ok ? GREEN : '#8b8296', display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 800 }}>{k}</span><span style={{ fontSize: 12.5, fontWeight: 600 }}>{v}</span></div>;
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ fontSize: 9.5, color: '#8b8296', letterSpacing: 1 }}>TIME LEFT</div><Ring secs="28" />
                    </div>
                    <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: 12, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 11.5, marginBottom: 9 }}><Trophy size={13} color={GOLD} /> LEADERBOARD</div>
                      {LEADERS.map(([name, pts, up], i) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 0', fontSize: 11.5 }}>
                          <b style={{ color: '#8b8296', width: 12 }}>{i + 1}</b><span style={{ flex: 1, fontWeight: 600 }}>{name}</span><b style={{ fontFamily: 'ui-monospace,monospace', color: GOLD }}>{pts}</b><span style={{ color: up ? GREEN : RED, fontSize: 10 }}>{up ? '▲' : '▼'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
               </div>
              </div>
            </div>
          )}

          {view === 'features' && (
            <div>
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 26px' }}>
                <div style={eyebrow(ORANGE)}>FEATURES</div>
                <h2 style={h2}>Everything you need to run a live quiz</h2>
              </div>
              <div className="qz-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
                {FEATURES.map((f) => (
                  <div key={f.t} className="qz-lift" style={{ ...card, padding: 20 }}>
                    <span style={{ width: 46, height: 46, borderRadius: 12, background: `${f.c}1f`, color: f.c, display: 'grid', placeItems: 'center', marginBottom: 12 }}>{f.i}</span>
                    <div style={{ fontWeight: 800, fontSize: 16.5, marginBottom: 5 }}>{f.t}</div>
                    <div style={{ color: '#a49db3', fontSize: 13.5, lineHeight: 1.5 }}>{f.d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'how' && (
            <div>
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 26px' }}>
                <div style={eyebrow(PURPLE)}>HOW IT WORKS</div>
                <h2 style={h2}>Live in three steps</h2>
              </div>
              <div className="qz-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
                {STEPS.map(([n, ti, d]) => (
                  <div key={n} className="qz-lift" style={{ ...card, padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 999, background: `linear-gradient(135deg,${ORANGE},${RED})`, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, boxShadow: `0 6px 16px ${RED}44` }}>{n}</span>
                      <div style={{ fontWeight: 800, fontSize: 16.5 }}>{ti}</div>
                    </div>
                    <div style={{ color: '#a49db3', fontSize: 14, lineHeight: 1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}><a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '13px 26px', fontSize: 15 }}>Get started free <ArrowRight size={16} /></a></div>
            </div>
          )}

          {view === 'schools' && (
            <div style={{ ...card, padding: 'clamp(22px,4vw,40px)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 32, alignItems: 'center' }} className="home-grid">
              <div>
                <div style={eyebrow(GREEN)}>FOR SCHOOLS</div>
                <h2 style={h2}>Built for real school competitions</h2>
                <p style={{ color: '#a49db3', fontSize: 15.5, lineHeight: 1.6, margin: '12px 0 18px' }}>From an inter-house championship on the assembly stage to a quick revision buzzer game in class — projected big, scored automatically, branded as yours.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 20 }}>
                  {USE_CASES.map((u) => <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#d9d3e6' }}><span style={{ width: 20, height: 20, borderRadius: 999, background: `${GREEN}22`, color: GREEN, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Check size={12} /></span>{u}</div>)}
                </div>
                <a href="/signup" className="primaryCta" style={{ ...pill(`linear-gradient(135deg, ${ORANGE}, ${RED})`), padding: '13px 24px', fontSize: 15 }}>Start your free trial <ArrowRight size={16} /></a>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ textAlign: 'center', letterSpacing: 3, fontSize: 11, fontWeight: 800, color: '#8b8296', marginBottom: 2 }}>TRUSTED BY SCHOOLS</div>
                {[['Infant Jesus Academy', 'Runs inter-house championships for the whole hall on one screen.', ORANGE, 'I'], ['DMaths Academy', 'Weekly quiz bowls — zero devices, every group engaged.', PURPLE, 'D']].map(([name, quote, col, ltr]) => (
                  <div key={name} style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 15, display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                    <span style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${col}, #222)`, display: 'grid', placeItems: 'center', fontWeight: 900, flexShrink: 0 }}>{ltr}</span>
                    <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>{name}</div><div style={{ color: '#a49db3', fontSize: 13, lineHeight: 1.5, marginTop: 2 }}>{quote}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'pricing' && (
            <div style={{ textAlign: 'center' }}>
              <div style={eyebrow(GOLD)}>PRICING</div>
              <h2 style={h2}>Simple, one-time pricing</h2>
              <p style={{ color: '#a49db3', fontSize: 15.5, maxWidth: 540, margin: '0 auto 24px' }}>Start free, then pay once with PayPal to unlock live hosting for the term or the year. No subscription.</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
                {PRICE.map(([n, p, dur, feat]) => (
                  <div key={n} className="qz-lift" style={{ ...card, padding: '26px 34px', minWidth: 220, border: feat ? `1px solid ${ORANGE}66` : card.border, boxShadow: feat ? `0 0 34px ${ORANGE}22` : 'none' }}>
                    {feat && <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: 1, color: ORANGE, marginBottom: 6 }}>BEST VALUE</div>}
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#a49db3' }}>{n}</div>
                    <div style={{ fontWeight: 900, fontSize: 44, letterSpacing: -1, margin: '4px 0' }}>{p}</div>
                    <div style={{ fontSize: 12.5, color: '#8b8296', marginBottom: 16 }}>one-time · {dur}</div>
                    <a href="/pricing" className="primaryCta" style={{ ...pill(feat ? `linear-gradient(135deg, ${ORANGE}, ${RED})` : 'rgba(255,255,255,.06)'), padding: '11px 22px', fontSize: 14, border: feat ? 'none' : '1px solid rgba(255,255,255,.15)', justifyContent: 'center' }}>Choose {n}</a>
                  </div>
                ))}
              </div>
              <a href="/pricing" style={{ color: '#a49db3', fontSize: 14, textDecoration: 'none' }}>See full pricing details →</a>
            </div>
          )}

          {view === 'resources' && (
            <div>
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 24px' }}>
                <div style={eyebrow(PINK)}>RESOURCES</div>
                <h2 style={h2}>Frequently asked questions</h2>
              </div>
              <div className="qz-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12, maxWidth: 960, margin: '0 auto' }}>
                {FAQ.map(([q, a]) => (
                  <div key={q} className="qz-lift" style={{ ...card, padding: 18 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 7 }}>{q}</div>
                    <div style={{ color: '#a49db3', fontSize: 13.5, lineHeight: 1.55 }}>{a}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 22, color: '#8b8296', fontSize: 13.5 }}>Still curious? Email <a href="mailto:dmathstuition@gmail.com" style={{ color: ORANGE, textDecoration: 'none' }}>dmathstuition@gmail.com</a></div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER — always visible, legal + founder */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,.06)', padding: '12px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 13 }}>
        <div style={{ color: '#8b8296' }}>© {new Date().getFullYear()} Qizora · Founded by <b style={{ color: '#c9c2d6' }}>DMaths Academy</b></div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <a href="/privacy" style={{ color: '#c9c2d6', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ color: '#c9c2d6', textDecoration: 'none' }}>Terms &amp; Conditions</a>
          <a href="mailto:dmathstuition@gmail.com" style={{ color: '#c9c2d6', textDecoration: 'none' }}>Contact</a>
          <a href="/login" style={{ color: ORANGE, textDecoration: 'none', fontWeight: 700 }}>Login</a>
        </div>
      </footer>
    </div>
  );
}
