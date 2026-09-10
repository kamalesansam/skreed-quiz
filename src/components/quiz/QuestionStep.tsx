'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { OptionTile } from './OptionTile';
import { OUTCOMES, TOTAL_QUESTIONS, type Option, type Question } from '@/data/quiz';
import { burst } from '@/lib/burst';
import { sound } from '@/lib/sound';
import { pad2, seededShuffle } from '@/lib/utils';

type Props = {
  question: Question;
  index: number;
  seed: number;
  webgl: boolean;
  onAnswer: (option: Option) => void;
  onBack?: () => void;
};

export function QuestionStep({ question, index, seed, webgl, onAnswer, onBack }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<number | null>(null);

  const options = useMemo(
    () => (question.id === 'q1' ? question.options : seededShuffle(question.options, seed + index * 7919)),
    [question, seed, index],
  );

  useEffect(() => {
    const t = timer;
    return () => {
      if (t.current) window.clearTimeout(t.current);
    };
  }, []);

  const pick = (option: Option, e: React.MouseEvent<HTMLButtonElement>) => {
    if (picked) return;
    setPicked(option.id);
    sound.select();
    const rect = e.currentTarget.getBoundingClientRect();
    const o = OUTCOMES[option.outcome];
    burst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      colors: [o.hex, ...(option.palette ?? [])],
      count: 30,
    });
    const wait = reduce ? 200 : 620;
    timer.current = window.setTimeout(() => {
      setLeaving(true);
      onAnswer(option);
    }, wait);
  };

  const visual = question.kind === 'visual';

  return (
    <motion.section
      key={question.id}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24, transition: { duration: 0.28 } }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 md:px-10 md:pt-10"
      aria-labelledby={`${question.id}-prompt`}
    >
      <div className="mb-6 flex items-center gap-4 md:mb-10">
        {onBack ? (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm hairline transition-colors hover:border-current" aria-label="Previous question">
            <ArrowLeft size={14} weight="bold" />
            Back
          </button>
        ) : null}
        <span className="mono text-sm" style={{ color: 'var(--muted)' }}>
          Sample {pad2(index + 1)} of {TOTAL_QUESTIONS}
        </span>
      </div>

      <h2 id={`${question.id}-prompt`} className="max-w-[18ch] text-3xl md:text-5xl lg:text-6xl" aria-live="polite">
        {question.prompt}
      </h2>

      <div className={visual ? 'mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-12 md:grid-cols-5 md:gap-4' : 'mt-8 grid grid-cols-1 gap-3 md:mt-12 md:grid-cols-2 md:gap-4'}>
        {options.map((opt, i) => (
          <OptionTile
            key={opt.id}
            option={opt}
            index={i}
            kind={question.kind}
            selected={picked === opt.id}
            dimmed={!!picked && picked !== opt.id}
            leaving={leaving}
            webgl={webgl}
            onPick={pick}
          />
        ))}
      </div>
    </motion.section>
  );
}
