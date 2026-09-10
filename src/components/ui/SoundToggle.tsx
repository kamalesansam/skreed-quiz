'use client';

import { useSyncExternalStore } from 'react';
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { sound } from '@/lib/sound';

const subscribe = (cb: () => void) => sound.subscribe(cb);
const get = () => sound.enabled;
const getServer = () => false;

export function SoundToggle({ className = '' }: { className?: string }) {
  const on = useSyncExternalStore(subscribe, get, getServer);
  return (
    <button
      type="button"
      onClick={() => {
        sound.toggle();
        sound.tick();
      }}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hairline transition-colors hover:border-current ${className}`}
    >
      {on ? <SpeakerHigh size={18} weight="bold" /> : <SpeakerSlash size={18} weight="bold" />}
      <span className="hidden sm:inline">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
