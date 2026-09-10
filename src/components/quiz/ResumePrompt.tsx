'use client';

import { motion } from 'motion/react';
import { TOTAL_QUESTIONS } from '@/data/quiz';
import type { Saved } from '@/lib/storage';
import { Button } from '@/components/ui/button';

export function ResumePrompt({ saved, onContinue, onRestart }: { saved: Saved; onContinue: () => void; onRestart: () => void }) {
  const done = saved.step === 'result';
  return (
    <motion.div
      role="dialog"
      aria-labelledby="resume-title"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed inset-x-4 bottom-4 mx-auto max-w-md rounded-[16px] border bg-paper p-5 text-ink shadow-2xl hairline md:inset-x-auto md:right-6 md:bottom-6"
      style={{ zIndex: 'var(--z-toast)' }}
    >
      <p id="resume-title" className="font-heading text-lg font-semibold leading-tight">
        Welcome back{saved.profile.name ? `, ${saved.profile.name}` : ''}.
      </p>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        {done ? 'Your diagnosis is ready to view again.' : `You were on sample ${Math.min(saved.answers.length + 1, TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}.`}
      </p>
      <div className="mt-4 flex gap-2">
        <Button onClick={onContinue} variant="primary" className="px-5 py-3 text-sm">
          {done ? 'See my result' : 'Continue'}
        </Button>
        <Button onClick={onRestart} variant="ghost" className="px-5 py-3 text-sm">
          Start over
        </Button>
      </div>
    </motion.div>
  );
}
