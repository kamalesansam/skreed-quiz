'use client';

import { AnimatePresence, motion } from 'motion/react';
import { WifiSlash } from '@phosphor-icons/react';
import { useOnline } from '@/lib/env';

export function OfflineBanner() {
  const online = useOnline();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed left-1/2 top-3 -translate-x-1/2 flex items-center gap-2 rounded-full bg-ink text-paper px-4 py-2 text-sm shadow-lg"
          style={{ zIndex: 'var(--z-toast)' }}
        >
          <WifiSlash size={16} weight="bold" />
          You are offline. Your answers are saved, keep going.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
