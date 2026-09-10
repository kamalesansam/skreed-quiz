import type { OutcomeId } from '@/data/quiz';

/**
 * Most-picked outcome wins. On a tie, the first answer (the direct shade pick) breaks it,
 * otherwise the earliest-picked outcome among the tied ones.
 */
export function diagnose(answers: OutcomeId[]): OutcomeId | null {
  if (answers.length === 0) return null;
  const counts = new Map<OutcomeId, number>();
  for (const a of answers) counts.set(a, (counts.get(a) ?? 0) + 1);
  let max = 0;
  counts.forEach((v) => {
    if (v > max) max = v;
  });
  const tied: OutcomeId[] = [];
  counts.forEach((v, k) => {
    if (v === max) tied.push(k);
  });
  if (tied.length === 1) return tied[0];
  if (tied.includes(answers[0])) return answers[0];
  for (const a of answers) if (tied.includes(a)) return a;
  return tied[0];
}

export function tallyCounts(answers: OutcomeId[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of answers) out[a] = (out[a] ?? 0) + 1;
  return out;
}
