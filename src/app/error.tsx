'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Logotype } from '@/components/ui/Logo';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="min-h-[100dvh] flex flex-col items-start justify-center px-6 md:px-12 max-w-[1400px] mx-auto">
      <Logotype className="h-5 mb-10" />
      <h1 className="text-4xl md:text-6xl max-w-[16ch]">Something went wrong.</h1>
      <p className="mt-5 max-w-[46ch] text-lg" style={{ color: 'var(--muted)' }}>
        Your answers are saved on this device. Reload to pick up where you left off.
      </p>
      <div className="mt-8 flex gap-3">
        <button className="btn btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link className="btn btn-ghost" href="/">
          Start over
        </Link>
      </div>
    </main>
  );
}
