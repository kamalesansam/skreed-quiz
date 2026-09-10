'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { COPY, OUTCOME_LIST } from '@/data/quiz';
import { SHADES, readableOn, sampleShades } from '@/data/shades';
import { sound } from '@/lib/sound';
import { Button } from '@/components/ui/button';
import { Logotype } from '@/components/ui/Logo';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import BlurText from '@/components/BlurText';

const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });
const CaseView = dynamic(() => import('@/components/three/CaseView').then((m) => m.CaseView), { ssr: false });

const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type Props = { onStart: () => void; webgl: boolean };

const BENCH_COLORS = SHADES.filter((_, i) => i % 3 === 0).map((s) => parseInt(s.h.slice(1), 16));
const SWEEP = sampleShades(40);

export function Landing({ onStart, webgl }: Props) {
  const reduce = useReducedMotion();
  const start = () => {
    sound.step();
    onStart();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }} transition={{ duration: 0.5 }}>
      <Header />
      <Hero onStart={start} webgl={webgl} reduce={!!reduce} />
      <Spectrum webgl={webgl} reduce={!!reduce} />
      <LockedStrip reduce={!!reduce} />
      <Closing onStart={start} />
    </motion.div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 flex h-16 items-center justify-between px-5 md:h-[72px] md:px-10" style={{ zIndex: 'var(--z-chrome)' }}>
      <a href="https://www.skreed.com/en-in" target="_blank" rel="noopener noreferrer" aria-label="Skreed store" className="text-ink">
        <Logotype className="h-4 md:h-[18px]" />
      </a>
      <SoundToggle />
    </header>
  );
}

function Hero({ onStart, webgl, reduce }: { onStart: () => void; webgl: boolean; reduce: boolean }) {
  return (
    <section className="mx-auto grid min-h-[100dvh] w-full max-w-[1400px] grid-cols-1 items-center gap-8 px-5 pb-12 pt-24 md:grid-cols-12 md:px-10 md:pt-24">
      <div className="md:col-span-7 lg:col-span-6">
        <p className="mb-6 text-sm font-medium" style={{ color: 'var(--muted)' }}>
          {COPY.eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          <BlurText text={COPY.title} delay={70} animateBy="words" direction="top" className="flex flex-wrap" />
        </h1>
        <p className="mt-6 max-w-[42ch] text-lg md:text-xl" style={{ color: 'var(--muted)' }}>
          {COPY.intro}
        </p>
        <div className="mt-8">
          <Button onClick={onStart} variant="primary" className="text-lg">
            {COPY.cta}
          </Button>
        </div>
      </div>
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden rounded-[16px] md:col-span-5 md:h-[76vh] lg:col-span-6" style={{ background: 'color-mix(in oklab, var(--fg) 5%, transparent)' }}>
        {webgl && !reduce ? (
          <ErrorBoundary fallback={<StaticBench />}>
            <Ballpit
              className="absolute inset-0"
              count={110}
              gravity={0.55}
              friction={0.9975}
              wallBounce={0.94}
              followCursor
              maxSize={1.05}
              minSize={0.45}
              size0={1.2}
              colors={BENCH_COLORS}
              ambientColor={0xf7f6f3}
              ambientIntensity={1.2}
              lightIntensity={160}
              materialParams={{ metalness: 0.1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }}
            />
          </ErrorBoundary>
        ) : (
          <StaticBench />
        )}
      </div>
    </section>
  );
}

function StaticBench() {
  return (
    <div className="grid h-full w-full grid-cols-12 gap-1.5 p-3">
      {SHADES.filter((_, i) => i % 2 === 0).map((s, i) => (
        <span key={`${s.n}-${i}`} className="aspect-square rounded-full" style={{ background: s.h }} />
      ))}
    </div>
  );
}

function Spectrum({ webgl, reduce }: { webgl: boolean; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const shadeName = useTransform(scrollYProgress, (p) => SWEEP[Math.min(SWEEP.length - 1, Math.floor(p * SWEEP.length))].n);
  const [hex, setHex] = useState(SWEEP[0].h);
  useEffect(() => scrollYProgress.on('change', (p) => setHex(SWEEP[Math.min(SWEEP.length - 1, Math.floor(p * SWEEP.length))].h)), [scrollYProgress]);

  const beats = [
    { text: 'Ten colour families.', range: [0, 0.34] as const },
    { text: 'Twenty-four shades in each.', range: [0.33, 0.67] as const },
    { text: '240 personalities. One of them is yours.', range: [0.66, 1] as const },
  ];

  if (reduce) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 md:px-10">
        <h2 className="max-w-[16ch] text-4xl md:text-6xl">240 personalities. One of them is yours.</h2>
        <div className="mt-10 flex flex-wrap gap-1">
          {SHADES.map((s, i) => (
            <span key={`${s.n}-${i}`} className="h-6 w-6 rounded-full" style={{ background: s.h }} title={s.n} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-6 px-5 md:grid-cols-12 md:px-10">
          <div className="relative min-h-[12rem] md:col-span-6 md:min-h-[20rem] lg:min-h-[24rem]">
            {beats.map((b) => (
              <Beat key={b.text} progress={scrollYProgress} range={b.range} text={b.text} />
            ))}
            <div className="absolute bottom-0 left-0 flex items-center gap-3">
              <span className="h-5 w-5 rounded-full border hairline transition-colors duration-300" style={{ background: hex }} />
              <motion.span className="mono text-sm" style={{ color: 'var(--muted)' }}>
                {shadeName}
              </motion.span>
            </div>
          </div>
          <div className="relative h-[52vh] md:col-span-6 md:h-[80vh]">
            {webgl ? (
              <ErrorBoundary fallback={<SwatchBlock hex={hex} />}>
                <CaseView hex={hex} progress={scrollYProgress} float={false} scale={1.15} />
              </ErrorBoundary>
            ) : (
              <SwatchBlock hex={hex} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Beat({ progress, range, text }: { progress: ReturnType<typeof useScroll>['scrollYProgress']; range: readonly [number, number]; text: string }) {
  const [a, b] = range;
  const span = b - a;
  const opacity = useTransform(progress, [a, a + span * 0.18, b - span * 0.18, b], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, a + span * 0.18, b - span * 0.18, b], [24, 0, 0, -24]);
  return (
    <motion.h2 style={{ opacity, y }} className="absolute inset-x-0 top-0 max-w-[16ch] text-4xl md:text-6xl lg:text-7xl">
      {text}
    </motion.h2>
  );
}

function SwatchBlock({ hex }: { hex: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="aspect-[1/2] h-[78%] rounded-[2.4rem] transition-colors duration-300" style={{ background: hex, boxShadow: 'inset -20px -30px 60px rgba(0,0,0,0.18), inset 16px 20px 40px rgba(255,255,255,0.2)' }} />
    </div>
  );
}

function LockedStrip({ reduce }: { reduce: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, (p) => -p * distance);

  useIsoLayout(() => {
    const measure = () => {
      const t = trackRef.current;
      if (!t) return;
      setDistance(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const cards = OUTCOME_LIST.map((o) => (
    <div key={o.id} className="flex h-[58vh] w-[74vw] shrink-0 flex-col justify-between rounded-[16px] p-5 md:h-[62vh] md:w-[26rem] md:p-7" style={{ background: o.hex, color: readableOn(o.hex) }}>
      <div className="flex items-center justify-between">
        <span className="h-16 w-16 rounded-full md:h-20 md:w-20" style={{ background: o.hex, boxShadow: 'inset -10px -14px 22px rgba(0,0,0,0.22), inset 8px 10px 16px rgba(255,255,255,0.32)' }} />
        <span className="mono text-xs opacity-75">{o.family}</span>
      </div>
      <div>
        <p className="font-heading text-3xl font-semibold leading-none blur-[7px] select-none md:text-4xl" aria-hidden>
          {o.name}
        </p>
        <p className="mt-3 text-sm opacity-80">Locked. Take the diagnosis to find out if this is you.</p>
      </div>
    </div>
  ));

  if (reduce) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-5 py-24 md:px-10">
        <h2 className="max-w-[16ch] text-4xl md:text-6xl">Ten diagnoses. Only one is yours.</h2>
        <div className="no-scrollbar -mx-5 mt-10 flex gap-4 overflow-x-auto px-5 md:-mx-10 md:px-10">{cards}</div>
      </section>
    );
  }

  return (
    <section ref={wrap} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden pt-16 md:pt-[72px]">
        <h2 className="mx-auto mb-8 w-full max-w-[1400px] px-5 text-4xl md:px-10 md:text-6xl">Ten diagnoses. Only one is yours.</h2>
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-4 px-5 md:px-10">
          {cards}
        </motion.div>
      </div>
    </section>
  );
}

function Closing({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col items-start px-5 py-24 md:px-10 md:py-40">
      <h2 className="max-w-[14ch] text-4xl md:text-7xl">Five minutes. Twelve samples. One shade that is actually yours.</h2>
      <div className="mt-10">
        <Button onClick={onStart} variant="primary" className="text-lg">
          {COPY.cta}
        </Button>
      </div>
      <footer className="mt-24 flex w-full flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm hairline" style={{ color: 'var(--muted)' }}>
        <Logotype className="h-3.5 text-ink" />
        <div className="flex gap-6">
          <a href="https://www.skreed.com/en-in" target="_blank" rel="noopener noreferrer" className="hover:underline">
            skreed.com/en-in
          </a>
          <a href="https://www.instagram.com/skreedofficial" target="_blank" rel="noopener noreferrer" className="hover:underline">
            @skreedofficial
          </a>
        </div>
      </footer>
    </section>
  );
}
