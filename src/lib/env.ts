'use client';

import { useSyncExternalStore } from 'react';

let webglCache: boolean | null = null;

/** True when WebGL is available. Cached after the first check. */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    webglCache = !!gl;
  } catch {
    webglCache = false;
  }
  return webglCache;
}

const noop = () => () => {};

export function useWebGL(): boolean {
  return useSyncExternalStore(noop, hasWebGL, () => false);
}

function subscribeOnline(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

let fineMq: MediaQueryList | null = null;
function getFineMq() {
  if (!fineMq && typeof window !== 'undefined') fineMq = window.matchMedia('(pointer: fine)');
  return fineMq;
}
function subscribeFine(cb: () => void) {
  const mq = getFineMq();
  if (!mq) return () => {};
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/** Coarse pointer (touch) devices do not get hover-only effects. */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeFine, () => !!getFineMq()?.matches, () => false);
}

type Conn = { effectiveType?: string; saveData?: boolean; addEventListener?: (t: string, f: () => void) => void; removeEventListener?: (t: string, f: () => void) => void };
function getConn(): Conn | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: Conn }).connection;
}
function subscribeConn(cb: () => void) {
  const c = getConn();
  c?.addEventListener?.('change', cb);
  return () => c?.removeEventListener?.('change', cb);
}

/** Slow network hint from the Network Information API (Chrome / Android). */
export function useSlowNetwork(): boolean {
  return useSyncExternalStore(
    subscribeConn,
    () => {
      const c = getConn();
      return !!c && (!!c.saveData || c.effectiveType === '2g' || c.effectiveType === 'slow-2g');
    },
    () => false,
  );
}
