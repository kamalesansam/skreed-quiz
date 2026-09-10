/**
 * Lightweight analytics bridge. Pushes events to window.dataLayer (GTM / GA4) when present.
 * Set NEXT_PUBLIC_GTM_ID to load Google Tag Manager in layout.tsx.
 */
type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: string, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[skreed-quiz]', event, params);
    }
  } catch {
    /* ignore */
  }
}
