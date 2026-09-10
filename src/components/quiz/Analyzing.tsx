'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { COPY } from '@/data/quiz';
import { sound } from '@/lib/sound';

/**
 * The read-out. Terminal lines type in on ink while the bead field converges behind them.
 * Calls onDone when the last line lands.
 */
export function Analyzing({ onDone }: { onDone: () => void }) {
  const lines = COPY.analysing;
  const [shown, setShown] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const step = reduce ? 350 : 820;
    const timers: number[] = [];
    lines.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setShown(i + 1);
          sound.tick();
        }, 500 + i * step),
      );
    });
    timers.push(window.setTimeout(onDone, 500 + lines.length * step + 700));
    return () => timers.forEach(clearTimeout);
  }, [lines, onDone, reduce]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col justify-end px-5 pb-16 md:px-10 md:pb-24"
      aria-live="polite"
      aria-busy={shown < lines.length}
    >
      <ol className="mono flex flex-col gap-3 text-base md:text-xl">
        {lines.map((line, i) => {
          const on = i < shown;
          const last = i === lines.length - 1;
          return (
            <li key={line} className="flex items-center gap-4" style={{ opacity: on ? 1 : 0.28 }}>
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: on ? (last ? 'var(--mood)' : 'var(--fg)') : 'transparent', border: on ? 'none' : '1px solid var(--hair)' }} />
              <span className={on ? '' : 'blur-[1px]'}>
                {line}
                {on && !last ? <Dots /> : null}
                {on && last ? '.' : null}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 h-1 w-full overflow-hidden rounded-full" style={{ background: 'var(--hair)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--mood)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${(shown / lines.length) * 100}%` }}
          transition={{ duration: reduce ? 0.2 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.section>
  );
}

function Dots() {
  return (
    <span className="inline-flex" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18 }}>
          .
        </motion.span>
      ))}
    </span>
  );
}
