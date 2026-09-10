'use client';

import { motion, useReducedMotion } from 'motion/react';
import { OUTCOMES, TOTAL_QUESTIONS, type OutcomeId } from '@/data/quiz';

/**
 * The progress bar is a glass vial. Every answer drops a bead of that outcome's colour in and settles
 * as a stripe. By the last question you are looking at your own pigment stack.
 */
export function Vial({ answers, className = '' }: { answers: OutcomeId[]; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`relative h-5 w-full overflow-hidden rounded-full border hairline ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_QUESTIONS}
      aria-valuenow={answers.length}
      aria-label={`${answers.length} of ${TOTAL_QUESTIONS} answered`}
      style={{ background: 'color-mix(in oklab, var(--fg) 5%, transparent)' }}
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
          const a = answers[i];
          return (
            <div key={i} className="relative h-full flex-1 overflow-hidden border-r last:border-r-0" style={{ borderColor: 'color-mix(in oklab, var(--fg) 8%, transparent)' }}>
              {a && (
                <motion.div
                  key={`${i}-${a}`}
                  className="absolute inset-0"
                  style={{ background: OUTCOMES[a].hex }}
                  initial={reduce ? { y: 0 } : { y: '-110%', scaleY: 1.3 }}
                  animate={{ y: 0, scaleY: 1 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 22, mass: 0.6 }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.42), rgba(255,255,255,0))' }} />
    </div>
  );
}
