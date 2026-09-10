'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { readableOn, shadeHex } from '@/data/shades';

/** Five compatible shades as beads you can throw around a tray. Drag has momentum and walls. */
export function CompatibleBeads({ names }: { names: string[] }) {
  const tray = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  return (
    <div ref={tray} className="relative h-44 w-full overflow-hidden rounded-[16px] border hairline md:h-52" style={{ background: 'color-mix(in oklab, var(--fg) 6%, transparent)' }}>
      {names.map((n, i) => {
        const hex = shadeHex(n);
        return (
          <motion.div
            key={n}
            drag={!reduce}
            dragConstraints={tray}
            dragElastic={0.18}
            dragMomentum
            dragTransition={{ power: 0.25, timeConstant: 180, bounceStiffness: 500, bounceDamping: 18 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92, cursor: 'grabbing' }}
            initial={reduce ? false : { y: -160, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.15 + i * 0.09 }}
            className="absolute flex h-[4.6rem] w-[4.6rem] cursor-grab select-none items-center justify-center rounded-full text-center text-[11px] font-medium leading-tight md:h-24 md:w-24 md:text-xs"
            style={{
              left: `${8 + i * 18}%`,
              top: `${18 + (i % 2) * 34}%`,
              background: hex,
              color: readableOn(hex),
              boxShadow: `inset -8px -10px 18px rgba(0,0,0,0.18), inset 6px 8px 14px rgba(255,255,255,0.28), 0 14px 26px -14px ${hex}`,
            }}
            aria-label={`${n}, compatible shade`}
          >
            {n}
          </motion.div>
        );
      })}
    </div>
  );
}
