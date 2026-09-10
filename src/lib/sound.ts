import { loadPref, savePref } from './storage';

/**
 * Tiny sound layer. Ticks are synthesised with WebAudio (no assets).
 * The reveal chime is the brand's own "Go Beyond Basic" closing chime (public/audio/chime.mp3).
 * Off by default. Nothing plays until the user turns sound on.
 */
let ctx: AudioContext | null = null;
let enabled = false;
let loaded = false;
let chimeEl: HTMLAudioElement | null = null;
const listeners = new Set<(v: boolean) => void>();

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  enabled = loadPref<boolean>('sound', false);
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, duration = 0.09, gain = 0.06, type: OscillatorType = 'sine') {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, c.currentTime + duration);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.02);
}

export const sound = {
  get enabled(): boolean {
    ensureLoaded();
    return enabled;
  },
  setEnabled(v: boolean) {
    ensureLoaded();
    enabled = v;
    savePref('sound', v);
    if (v) getCtx();
    listeners.forEach((l) => l(v));
  },
  toggle() {
    this.setEnabled(!this.enabled);
  },
  subscribe(fn: (v: boolean) => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  tick() {
    if (!this.enabled) return;
    blip(1200, 0.06, 0.035);
  },
  select() {
    if (!this.enabled) return;
    blip(660, 0.12, 0.05);
    setTimeout(() => blip(990, 0.14, 0.04), 60);
  },
  step() {
    if (!this.enabled) return;
    blip(440, 0.08, 0.03, 'triangle');
  },
  chime() {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      if (!chimeEl) {
        chimeEl = new Audio('/audio/chime.mp3');
        chimeEl.preload = 'auto';
        chimeEl.volume = 0.7;
      }
      chimeEl.currentTime = 0;
      void chimeEl.play().catch(() => {});
    } catch {
      /* ignore */
    }
  },
};
