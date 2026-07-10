'use client';

// Tiny Web Audio SFX kit — no asset files. Respects a mute flag in localStorage.
let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

export function isMuted() {
  return typeof window !== 'undefined' && localStorage.getItem('sfx-muted') === '1';
}
export function toggleMute() {
  const m = !isMuted();
  localStorage.setItem('sfx-muted', m ? '1' : '0');
  return m;
}

function tone(freq: number, start: number, dur: number, vol: number, type: OscillatorType = 'sine') {
  const a = ac();
  if (!a || isMuted()) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + start + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur);
}

export const sfx = {
  tap: () => tone(660, 0, 0.09, 0.14, 'triangle'),
  join: () => { tone(523, 0, 0.1, 0.16); tone(784, 0.08, 0.14, 0.14); },
  lock: () => { tone(880, 0, 0.08, 0.14, 'square'); tone(1180, 0.06, 0.12, 0.1, 'square'); },
  correct: () => { tone(659, 0, 0.12, 0.18); tone(880, 0.1, 0.12, 0.16); tone(1319, 0.2, 0.22, 0.16); },
  wrong: () => { tone(220, 0, 0.22, 0.18, 'sawtooth'); tone(160, 0.08, 0.26, 0.14, 'sawtooth'); },
  reveal: () => { tone(440, 0, 0.1, 0.12); tone(587, 0.08, 0.14, 0.12); },
  win: () => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.12, 0.5, 0.16)); },
};

/** Browsers require a user gesture before audio — call once on first tap. */
export function unlockAudio() {
  const a = ac();
  if (a && a.state === 'suspended') a.resume();
}
