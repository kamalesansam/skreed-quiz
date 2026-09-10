'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { COPY, GENS, type GenId } from '@/data/quiz';
import { DEVICE_GROUPS } from '@/data/devices';
import type { Profile } from '@/lib/storage';
import { sound } from '@/lib/sound';
import { Button } from '@/components/ui/button';

type Props = {
  initial: Profile;
  onSubmit: (p: Profile) => void;
};

const NAME_RE = /^[\p{L}\p{M}' .-]{2,30}$/u;

export function ProfileStep({ initial, onSubmit }: Props) {
  const [name, setName] = useState(initial.name);
  const [device, setDevice] = useState(initial.device);
  const [gen, setGen] = useState<GenId | null>(initial.gen);
  const [errors, setErrors] = useState<{ name?: string; device?: string }>({});
  const [shake, setShake] = useState(false);
  const reduce = useReducedMotion();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const clean = name.trim();
    if (!NAME_RE.test(clean)) next.name = clean.length < 2 ? 'Add your name so the result card can be yours.' : 'Use letters only, up to 30 characters.';
    if (!device) next.device = 'Pick your device so the link at the end goes to the right case.';
    setErrors(next);
    if (Object.keys(next).length) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    sound.step();
    onSubmit({ name: clean, device, gen });
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-16 pt-8 md:grid-cols-12 md:px-10 md:pt-16"
    >
      <div className="md:col-span-6">
        <h2 className="max-w-[14ch] text-4xl md:text-6xl">Before the first sample.</h2>
        <p className="mt-5 max-w-[42ch] text-lg" style={{ color: 'var(--muted)' }}>
          {COPY.instructions}
        </p>
      </div>

      <form onSubmit={submit} noValidate className={`md:col-span-6 md:pt-2 ${shake ? 'shake' : ''}`}>
        <fieldset className="mb-8 border-0 p-0">
          <legend className="mb-3 text-sm font-medium">Which gen are you? (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {GENS.map((g) => {
              const on = gen === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setGen(on ? null : g.id);
                    sound.tick();
                  }}
                  className="rounded-full border px-4 py-2 text-sm transition-colors"
                  style={{
                    borderColor: on ? 'var(--fg)' : 'var(--hair)',
                    background: on ? 'var(--fg)' : 'transparent',
                    color: on ? 'var(--ground)' : 'var(--fg)',
                  }}
                >
                  <span className="font-medium">{g.name}</span>
                  <span className="ml-2 opacity-70">{g.range}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Your name
          </label>
          <input
            id="name"
            name="name"
            className="field"
            autoComplete="given-name"
            placeholder="What should the result card say?"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : 'name-help'}
          />
          {errors.name ? (
            <p id="name-error" className="text-sm" style={{ color: '#c30117' }}>
              {errors.name}
            </p>
          ) : (
            <p id="name-help" className="text-sm" style={{ color: 'var(--muted)' }}>
              Goes on the personalised result card.
            </p>
          )}
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <label htmlFor="device" className="text-sm font-medium">
            Your device
          </label>
          <select
            id="device"
            name="device"
            className="field appearance-none"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            aria-invalid={!!errors.device}
            aria-describedby={errors.device ? 'device-error' : 'device-help'}
          >
            <option value="">Choose a device</option>
            {DEVICE_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.device ? (
            <p id="device-error" className="text-sm" style={{ color: '#c30117' }}>
              {errors.device}
            </p>
          ) : (
            <p id="device-help" className="text-sm" style={{ color: 'var(--muted)' }}>
              For the direct link to your recommended case.
            </p>
          )}
        </div>

        <Button type="submit" variant="primary">
          Start the first sample
        </Button>
      </form>
    </motion.section>
  );
}
