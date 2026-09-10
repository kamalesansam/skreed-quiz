'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import CountUp from '@/components/CountUp';
import { CompatibleBeads } from './CompatibleBeads';
import { ShareBar } from './ShareBar';
import { Vial } from './Vial';
import { COPY, OUTCOME_LIST, type Outcome, type OutcomeId } from '@/data/quiz';
import { deviceById, shopUrl } from '@/data/devices';
import { readableOn } from '@/data/shades';
import { burst } from '@/lib/burst';
import { sound } from '@/lib/sound';
import { track } from '@/lib/analytics';
import { Logomark } from '@/components/ui/Logo';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const CaseView = dynamic(() => import('@/components/three/CaseView').then((m) => m.CaseView), { ssr: false });

type Props = {
  outcome: Outcome;
  name: string;
  deviceId?: string;
  answers?: OutcomeId[];
  webgl: boolean;
  mode: 'live' | 'shared';
  onRetake?: () => void;
};

export function ResultView({ outcome, name, deviceId, answers = [], webgl, mode, onRetake }: Props) {
  const reduce = useReducedMotion();
  const report = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: report, offset: ['start end', 'end start'] });
  const device = deviceById(deviceId);
  const shop = shopUrl(outcome.familySlug, outcome.family, device?.series);
  const ink = readableOn(outcome.hex);
  const faint = ink === '#171717' ? 'rgba(23,23,23,0.6)' : 'rgba(247,246,243,0.66)';
  // The lab slip is always paper with ink, whatever the shade behind it.
  const slipInk = '#171717';
  const slipMuted = 'rgba(23,23,23,0.56)';
  const slipHair = 'rgba(23,23,23,0.14)';

  useEffect(() => {
    if (mode !== 'live') return;
    sound.chime();
    const t = setTimeout(() => {
      burst({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.35, colors: [outcome.hex, '#F7F6F3', ...outcome.compatible.map(() => outcome.hex)], count: 70, power: 1.4 });
    }, 350);
    return () => clearTimeout(t);
  }, [mode, outcome]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
      style={{ color: ink }}
    >
      {/* Reveal */}
      <header className="mx-auto grid min-h-[100dvh] w-full max-w-[1400px] grid-cols-1 items-center gap-8 px-5 pb-10 pt-24 md:grid-cols-12 md:px-10 md:pt-28">
        <div className="md:col-span-7">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.35 }}
            className="text-xl md:text-2xl"
            style={{ color: faint }}
          >
            {name ? `${name}, you are` : 'You are'}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="mt-2 text-5xl md:text-7xl lg:text-8xl"
          >
            {outcome.name}
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.8 }}
            className="mt-6 max-w-[38ch] text-lg md:text-xl"
          >
            {outcome.tagline} Signature shade: {outcome.shade}.
          </motion.p>
          {answers.length > 0 && (
            <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 max-w-sm">
              <Vial answers={answers} />
              <p className="mt-3 text-sm" style={{ color: faint }}>
                Your twelve samples, in order.
              </p>
            </motion.div>
          )}
        </div>
        <div className="relative h-[52vh] md:col-span-5 md:h-[70vh]">
          {webgl && !reduce ? (
            <ErrorBoundary fallback={<BigSwatch hex={outcome.hex} />}>
              <CaseView hex={outcome.hex} finish={outcome.finish} progress={scrollYProgress} follow scale={1.1} />
            </ErrorBoundary>
          ) : (
            <BigSwatch hex={outcome.hex} />
          )}
        </div>
      </header>

      {/* Report */}
      <div ref={report} className="mx-auto w-full max-w-[1400px] px-5 pb-24 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <section>
              <h2 className="text-2xl md:text-3xl">Personality profile</h2>
              <p className="mt-4 max-w-[60ch] text-lg leading-relaxed">{outcome.personality}</p>
            </section>

            <section className="mt-14">
              <h2 className="text-2xl md:text-3xl">Colour profile</h2>
              <p className="mt-4 max-w-[60ch] text-lg leading-relaxed">{outcome.colour}</p>
            </section>

            <section className="mt-14">
              <h2 className="text-2xl md:text-3xl">Recommended shade</h2>
              <div className="mt-5 flex items-center gap-5">
                <span className="h-20 w-20 shrink-0 rounded-full border" style={{ background: outcome.hex, borderColor: 'var(--hair)', boxShadow: 'inset -8px -10px 18px rgba(0,0,0,0.18), inset 6px 8px 14px rgba(255,255,255,0.28)' }} />
                <div>
                  <p className="text-2xl font-heading font-semibold">{outcome.shade}</p>
                  <p className="mono mt-1 text-sm" style={{ color: faint }}>
                    {outcome.hex.toUpperCase()} from the {outcome.family} family
                  </p>
                  <p className="mt-1 text-sm" style={{ color: faint }}>
                    {outcome.finish} finish
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-2xl md:text-3xl">Also compatible with</h2>
              <p className="mt-2 text-sm" style={{ color: faint }}>
                Five shades from other families that sit well next to yours. Throw them around.
              </p>
              <div className="mt-5">
                <CompatibleBeads names={outcome.compatible} />
              </div>
            </section>
          </div>

          <aside className="min-w-0 md:col-span-5">
            <div className="sticky top-24 min-w-0 rounded-[16px] p-5 md:p-8" style={{ background: '#F7F6F3', color: slipInk, boxShadow: '0 30px 60px -30px rgba(0,0,0,0.35)' }}>
              <Logomark className="h-7" />
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm" style={{ color: slipMuted }}>
                    Confidence score
                  </p>
                  <p className="mono mt-1 text-3xl font-medium md:text-4xl">
                    <CountUp to={outcome.confidence} from={0} duration={1.6} startWhen />%
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: slipMuted }}>
                    Rarity
                  </p>
                  <p className="mono mt-1 text-3xl font-medium md:text-4xl">
                    Top <CountUp to={40} from={outcome.rarity} direction="down" duration={1.6} startWhen />%
                  </p>
                </div>
              </div>
              <p className="mt-8 font-heading text-xl font-semibold leading-snug">{COPY.closing}</p>
              <p className="mt-3 text-sm" style={{ color: slipMuted }}>
                {COPY.shop}
              </p>
              <a
                href={shop}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('quiz_shop_click', { outcome: outcome.id, device: device?.id ?? 'none' })}
                className="btn mt-6 w-full whitespace-normal text-center leading-tight"
                style={{ background: outcome.hex, color: ink }}
              >
                Shop {outcome.family} {device && device.series !== 'other' ? `for ${device.label}` : 'cases'}
              </a>
              <div className="mt-8" style={{ ['--hair' as string]: slipHair }}>
                <p className="mb-3 text-sm" style={{ color: slipMuted }}>
                  Share your diagnosis
                </p>
                <ShareBar outcome={outcome} name={name} />
              </div>
              {mode === 'live' && onRetake ? (
                <button type="button" onClick={onRetake} className="mt-6 text-sm underline-offset-4 hover:underline" style={{ color: slipMuted }}>
                  Retake the diagnosis
                </button>
              ) : (
                <Link href="/" className="btn btn-ghost mt-6 w-full" style={{ borderColor: slipHair, color: slipInk }}>
                  Start the diagnosis
                </Link>
              )}
            </div>
          </aside>
        </div>

        {/* Others */}
        <section className="mt-24">
          <h2 className="text-2xl md:text-3xl">The other nine</h2>
          <div className="no-scrollbar -mx-5 mt-6 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:-mx-10 md:px-10">
            {OUTCOME_LIST.filter((o) => o.id !== outcome.id).map((o) => (
              <div key={o.id} className="flex w-56 shrink-0 snap-start flex-col justify-between rounded-[16px] p-4" style={{ background: o.hex, color: readableOn(o.hex), minHeight: 160 }}>
                <span className="h-10 w-10 rounded-full" style={{ background: o.hex, boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.2), inset 5px 6px 10px rgba(255,255,255,0.3)' }} />
                <div>
                  <p className="font-heading text-lg font-semibold leading-tight">{o.name}</p>
                  <p className="mt-1 text-xs opacity-75">{o.shade}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.article>
  );
}

function BigSwatch({ hex }: { hex: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="aspect-[1/2] h-[80%] rounded-[2.4rem]" style={{ background: hex, boxShadow: 'inset -20px -30px 60px rgba(0,0,0,0.18), inset 16px 20px 40px rgba(255,255,255,0.2), 0 40px 80px -40px rgba(0,0,0,0.4)' }} />
    </div>
  );
}
