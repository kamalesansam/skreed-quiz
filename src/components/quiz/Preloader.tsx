'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { SHADES } from '@/data/shades';
import { Logomark } from '@/components/ui/Logo';

/**
 * Counter 0 to 100 while a strip of all 240 shades fills. Waits for fonts and the 3D model
 * (with a minimum of 1.7 s so it never flashes), then slides away.
 */
export function Preloader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const progress = useMotionValue(0);
  const text = useTransform(progress, (v) => Math.round(v).toString().padStart(3, '0'));
  const clip = useTransform(progress, (v) => `inset(0 ${100 - v}% 0 0)`);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const ctrl = animate(progress, ready ? 100 : 88, {
      duration: ready ? 0.7 : 1.7,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => ctrl.stop();
  }, [ready, progress]);

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    const t = setTimeout(() => setLeaving(true), 900);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col justify-between bg-paper text-ink px-6 py-6 md:px-10 md:py-8"
      style={{ zIndex: 'var(--z-preloader)' }}
      animate={leaving ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => leaving && onDone()}
      aria-busy={!ready}
      aria-label="Loading the shade diagnosis"
    >
      <div className="flex items-center justify-between">
        <Logomark className="h-8" />
        <span className="mono text-sm" style={{ color: 'var(--muted)' }}>
          The Shade Diagnosis
        </span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <p className="max-w-[22ch] text-lg leading-snug" style={{ color: 'var(--muted)' }}>
          Preparing 240 shades and one very honest test.
        </p>
        <motion.span className="mono text-6xl md:text-8xl font-medium tracking-tight tabular-nums">{text}</motion.span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--hair)' }}>
        <motion.div className="absolute inset-0 flex" style={{ clipPath: clip }}>
          {SHADES.map((s, i) => (
            <span key={`${s.n}-${i}`} className="h-full flex-1" style={{ background: s.h }} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
