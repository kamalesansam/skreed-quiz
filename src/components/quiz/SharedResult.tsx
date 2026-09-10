'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { OUTCOMES, type OutcomeId } from '@/data/quiz';
import { readableOn } from '@/data/shades';
import { useWebGL } from '@/lib/env';
import { ToastProvider } from '@/components/ui/Toast';
import { ResultView } from './ResultView';

const OverlayCanvas = dynamic(() => import('@/components/three/OverlayCanvas'), { ssr: false });

/** The shareable result page. Same report, without the answers, with a CTA to take the test. */
export default function SharedResult({ outcomeId, name }: { outcomeId: OutcomeId; name: string }) {
  const outcome = OUTCOMES[outcomeId];
  const webgl = useWebGL();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--mood', outcome.hex);
    root.style.setProperty('--mood-ink', readableOn(outcome.hex));
    root.setAttribute('data-ground', 'shade');
    return () => root.removeAttribute('data-ground');
  }, [outcome]);
  return (
    <ToastProvider>
      <main className="relative" style={{ zIndex: 'var(--z-content)' }}>
        <ResultView outcome={outcome} name={name} webgl={webgl} mode="shared" />
      </main>
      {webgl ? <OverlayCanvas /> : null}
      <div className="film" aria-hidden />
    </ToastProvider>
  );
}
