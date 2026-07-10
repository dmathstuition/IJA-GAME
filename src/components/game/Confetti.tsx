'use client';

import { useEffect, useRef } from 'react';

// Canvas confetti burst — fires on mount and whenever `trigger` changes.
export function Confetti({ trigger = 0, continuous = false, inline = false }: { trigger?: number; continuous?: boolean; inline?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let W = (cv.width = cv.offsetWidth);
    let H = (cv.height = cv.offsetHeight);
    const onResize = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    window.addEventListener('resize', onResize);

    const cols = ['#FFD600', '#e21b3c', '#1368ce', '#26890c', '#a855f7', '#FF6A00', '#fff'];
    type P = { x: number; y: number; vx: number; vy: number; w: number; h: number; col: string; rot: number; rv: number; grav: number; life: number };
    let pieces: P[] = [];

    const burst = () => {
      for (let i = 0; i < 140; i++) {
        pieces.push({
          x: W / 2 + (-220 + Math.random() * 440), y: H * 0.32,
          vx: (Math.random() - 0.5) * 15, vy: -5 - Math.random() * 11,
          w: 7 + Math.random() * 9, h: 5 + Math.random() * 7,
          col: cols[(Math.random() * cols.length) | 0], rot: Math.random() * 360, rv: -4 + Math.random() * 8,
          grav: 0.16 + Math.random() * 0.1, life: 0,
        });
      }
    };
    burstRef.current = burst;
    burst();
    let interval: ReturnType<typeof setInterval> | undefined;
    if (continuous) interval = setInterval(burst, 2200);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.life++; p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.vx *= 0.99; p.rot += p.rv;
        const alpha = Math.max(0, 1 - p.life / 190);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = alpha; ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.y > H + 60 || alpha <= 0) pieces.splice(i, 1);
      }
    };
    loop();

    return () => { cancelAnimationFrame(raf); if (interval) clearInterval(interval); window.removeEventListener('resize', onResize); };
  }, [continuous]);

  useEffect(() => { if (trigger > 0) burstRef.current(); }, [trigger]);

  return <canvas ref={ref} style={{ position: inline ? 'absolute' : 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 40, pointerEvents: 'none' }} />;
}
