/**
 * Tiny event bus for the particle burst overlay. Any component can fire a burst at a screen point.
 */
export type BurstEvent = { x: number; y: number; colors: string[]; count?: number; power?: number };

const listeners = new Set<(e: BurstEvent) => void>();

export function burst(e: BurstEvent) {
  listeners.forEach((l) => l(e));
}

export function onBurst(fn: (e: BurstEvent) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
