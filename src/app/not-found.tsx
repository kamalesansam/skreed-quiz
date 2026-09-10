import Link from 'next/link';
import { Logotype } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-start justify-center px-6 md:px-12 max-w-[1400px] mx-auto">
      <Logotype className="h-5 mb-10" />
      <h1 className="text-4xl md:text-6xl max-w-[16ch]">That page doesn&apos;t exist.</h1>
      <p className="mt-5 max-w-[46ch] text-lg" style={{ color: 'var(--muted)' }}>
        The diagnosis you are looking for was not found. Take the five-minute test and get your own.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Start the diagnosis
      </Link>
    </main>
  );
}
