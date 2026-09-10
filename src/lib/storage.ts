import type { OutcomeId, GenId } from '@/data/quiz';

export type Profile = { name: string; device: string; gen: GenId | null };

export type Saved = {
  v: 1;
  ts: number;
  step: 'landing' | 'profile' | 'quiz' | 'result';
  profile: Profile;
  answers: OutcomeId[];
  result: OutcomeId | null;
  seed: number;
};

const KEY = 'skreed-shade-diagnosis-v1';
const TTL = 1000 * 60 * 60 * 24; // 24 hours, then the session is considered expired

export function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Saved;
    if (data.v !== 1 || typeof data.ts !== 'number') return null;
    if (Date.now() - data.ts > TTL) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function save(data: Omit<Saved, 'v' | 'ts'>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, ts: Date.now(), ...data }));
  } catch {
    /* storage unavailable (private mode, quota). The quiz still works without it. */
  }
}

export function clearSaved(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

const PREF_KEY = 'skreed-quiz-prefs';

export function loadPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return fallback;
    const prefs = JSON.parse(raw) as Record<string, unknown>;
    return (prefs[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function savePref(key: string, value: unknown): void {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    const prefs = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    prefs[key] = value;
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}
