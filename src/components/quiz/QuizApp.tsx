'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { OUTCOMES, QUESTIONS, TOTAL_QUESTIONS, type Option, type OutcomeId } from '@/data/quiz';
import { readableOn } from '@/data/shades';
import { diagnose } from '@/lib/tally';
import { clearSaved, loadSaved, save, type Profile, type Saved } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { useWebGL } from '@/lib/env';
import { preloadCase } from '@/components/three/CaseModel';
import { Preloader } from './Preloader';
import { Landing } from './Landing';
import { ProfileStep } from './ProfileStep';
import { QuestionStep } from './QuestionStep';
import { Analyzing } from './Analyzing';
import { ResultView } from './ResultView';
import { ResumePrompt } from './ResumePrompt';
import { Vial } from './Vial';
import { Logomark } from '@/components/ui/Logo';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { BurstLayer } from '@/components/ui/BurstLayer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const OverlayCanvas = dynamic(() => import('@/components/three/OverlayCanvas'), { ssr: false });
const ShadeField = dynamic(() => import('@/components/three/ShadeField'), { ssr: false });

type Step = 'landing' | 'profile' | 'quiz' | 'analyzing' | 'result';
const EMPTY_PROFILE: Profile = { name: '', device: '', gen: null };

/**
 * The state machine for the whole experience: preloader, landing, profile, twelve samples,
 * the read-out, the result. Progress is saved for 24 hours so a refresh never loses answers.
 */
export default function QuizApp() {
  const webgl = useWebGL();
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState<Step>('landing');
  // Read the saved session once, lazily, so the server pass and the first client render stay identical.
  const [savedRef] = useState<Saved | null>(() => (typeof window === 'undefined' ? null : loadSaved()));
  const resumable = !!savedRef && (savedRef.answers.length > 0 || savedRef.step === 'result');
  const [profile, setProfile] = useState<Profile>(() => (savedRef && !resumable ? savedRef.profile : EMPTY_PROFILE));
  const [answers, setAnswers] = useState<OutcomeId[]>([]);
  const [result, setResult] = useState<OutcomeId | null>(null);
  const [seed, setSeed] = useState(() => (savedRef && !resumable ? savedRef.seed : Math.floor(Math.random() * 1e9)));
  const [resume, setResume] = useState<Saved | null>(() => (resumable ? savedRef : null));
  const hydrated = useRef(false);

  // Assets: fonts and the case model, with a floor so the preloader never flashes.
  useEffect(() => {
    let alive = true;
    const min = new Promise((r) => setTimeout(r, 1500));
    const fonts = typeof document !== 'undefined' && 'fonts' in document ? document.fonts.ready : Promise.resolve();
    if (webgl) {
      try {
        preloadCase();
      } catch {
        /* the model is optional */
      }
    }
    Promise.all([min, fonts]).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [webgl]);

  // Mark hydration so the persist effect never writes during the server pass.
  useEffect(() => {
    hydrated.current = true;
  }, []);

  // Persist.
  useEffect(() => {
    if (!hydrated.current) return;
    if (step === 'landing' && answers.length === 0 && !profile.name) return;
    save({ step: step === 'analyzing' ? 'quiz' : step, profile, answers, result, seed });
  }, [step, profile, answers, result, seed]);

  const leading = useMemo(() => diagnose(answers), [answers]);
  const mood = result ? OUTCOMES[result].hex : leading ? OUTCOMES[leading].hex : '#171717';
  const ground = step === 'analyzing' ? 'ink' : step === 'result' ? 'shade' : 'paper';

  // Theme: the page tints toward the leading shade; ink for the read-out; the shade for the result.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--mood', mood);
    root.style.setProperty('--mood-ink', readableOn(mood));
    root.setAttribute('data-ground', ground);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', ground === 'paper' ? '#F7F6F3' : ground === 'ink' ? '#171717' : mood);
  }, [mood, ground]);

  // Scroll to top on step change.
  useEffect(() => {
    if (loaded) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [step, answers.length, loaded, reduce]);

  const startQuiz = useCallback(() => {
    track('quiz_start');
    setStep('profile');
  }, []);

  const submitProfile = useCallback((p: Profile) => {
    setProfile(p);
    track('quiz_profile', { device: p.device, gen: p.gen ?? 'none' });
    setStep('quiz');
  }, []);

  const answer = useCallback(
    (option: Option) => {
      setAnswers((prev) => {
        const next = [...prev, option.outcome];
        track('quiz_answer', { question: prev.length + 1, outcome: option.outcome });
        if (next.length >= TOTAL_QUESTIONS) {
          const r = diagnose(next);
          setResult(r);
          setStep('analyzing');
        }
        return next;
      });
    },
    [],
  );

  const back = useCallback(() => {
    setAnswers((prev) => prev.slice(0, -1));
  }, []);

  const finishAnalyzing = useCallback(() => {
    track('quiz_complete', { outcome: result ?? 'unknown' });
    setStep('result');
  }, [result]);

  const retake = useCallback(() => {
    clearSaved();
    setAnswers([]);
    setResult(null);
    setSeed(Math.floor(Math.random() * 1e9));
    track('quiz_retake');
    setStep('profile');
  }, []);

  const continueSaved = useCallback(() => {
    if (!resume) return;
    setProfile(resume.profile);
    setAnswers(resume.answers);
    setSeed(resume.seed);
    if (resume.step === 'result' && resume.result) {
      setResult(resume.result);
      setStep('result');
    } else {
      setStep('quiz');
    }
    setResume(null);
  }, [resume]);

  const restartSaved = useCallback(() => {
    clearSaved();
    setResume(null);
  }, []);

  const qIndex = Math.min(answers.length, TOTAL_QUESTIONS - 1);
  const question = QUESTIONS[qIndex];
  const outcome = result ? OUTCOMES[result] : null;
  const showField = loaded && webgl && !reduce && step !== 'landing';

  return (
    <ToastProvider>
      <div className="relative min-h-[100dvh]">
        {!loaded && <Preloader ready={ready} onDone={() => setLoaded(true)} />}

        {showField && (
          <ErrorBoundary>
            <ShadeField mode={step === 'analyzing' ? 'converge' : step === 'result' ? 'bloom' : 'idle'} mood={mood} ground={ground} opacity={step === 'result' ? 0.16 : step === 'analyzing' ? 1 : 0.24} />
          </ErrorBoundary>
        )}

        <main className="relative" style={{ zIndex: 'var(--z-content)' }}>
          <AnimatePresence mode="wait">
            {step === 'landing' && loaded && <Landing key="landing" onStart={startQuiz} webgl={webgl} />}

            {(step === 'profile' || step === 'quiz') && (
              <div key="test" className="min-h-[100dvh]">
                <QuizChrome answers={answers} />
                <AnimatePresence mode="wait">
                  {step === 'profile' ? (
                    <ProfileStep key="profile" initial={profile} onSubmit={submitProfile} />
                  ) : (
                    <QuestionStep key={question.id} question={question} index={qIndex} seed={seed} webgl={webgl} onAnswer={answer} onBack={answers.length > 0 ? back : undefined} />
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === 'analyzing' && <Analyzing key="analyzing" onDone={finishAnalyzing} />}

            {step === 'result' && outcome && (
              <ResultView key="result" outcome={outcome} name={profile.name} deviceId={profile.device} answers={answers} webgl={webgl} mode="live" onRetake={retake} />
            )}
          </AnimatePresence>
        </main>

        {loaded && webgl && (
          <ErrorBoundary>
            <OverlayCanvas />
          </ErrorBoundary>
        )}
        <BurstLayer />
        <OfflineBanner />
        <AnimatePresence>{loaded && resume && step === 'landing' && <ResumePrompt key="resume" saved={resume} onContinue={continueSaved} onRestart={restartSaved} />}</AnimatePresence>
        <div className="film" aria-hidden />
      </div>
    </ToastProvider>
  );
}

function QuizChrome({ answers }: { answers: OutcomeId[] }) {
  return (
    <div className="sticky top-0 backdrop-blur-md" style={{ zIndex: 'var(--z-chrome)', background: 'color-mix(in oklab, var(--ground) 82%, transparent)' }}>
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-5 py-3 md:px-10">
        <Logomark className="h-7 shrink-0 md:h-8" />
        <div className="flex-1">
          <Vial answers={answers} />
        </div>
        <SoundToggle />
      </div>
    </div>
  );
}
