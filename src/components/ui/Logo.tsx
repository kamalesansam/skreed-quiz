import { cn } from '@/lib/utils';

/**
 * Brand logos rendered as CSS masks over currentColor.
 * Rules: over imagery use white or black only; never stretch; logomark min 60px wide on screen.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Skreed"
      className={cn('logo-mask aspect-[1207/1313]', className)}
      style={{ ['--src' as string]: 'url(/logo/logomark-black.svg)' }}
    />
  );
}

export function Logotype({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Skreed"
      className={cn('logo-mask aspect-[1325/321]', className)}
      style={{ ['--src' as string]: 'url(/logo/logotype-black.svg)' }}
    />
  );
}
