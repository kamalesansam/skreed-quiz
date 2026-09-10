'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Outcome } from '@/data/quiz';
import { resultUrl } from '@/lib/share';
import { track } from '@/lib/analytics';

type Props = {
  outcome: Outcome;
  name: string;
  deviceId?: string;
  gen: string | null;
};

// The slip is always paper with ink, whatever the shade behind it.
const INK = '#171717';
const PAPER = '#F7F6F3';
const MUTED = 'rgba(23,23,23,0.56)';
const HAIR = 'rgba(23,23,23,0.14)';
const ERROR = '#c30117';

const CONSENT_TEXT = 'Skreed can message me about the India launch.';

const MSG = {
  empty: 'Add an email address or a WhatsApp number.',
  unrecognised: 'Enter an email address or a WhatsApp number with country code.',
  consent: "Tick the box so we're allowed to message you.",
  rate_limit: 'Too many tries. Give it a minute.',
  server: "Couldn't save that. Try again in a moment.",
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mirrors the server's contact rule so the round trip is only for saving. */
function contactProblem(raw: string): 'empty' | 'unrecognised' | null {
  const value = raw.trim();
  if (!value) return 'empty';
  if (value.includes('@')) return EMAIL_RE.test(value.toLowerCase()) ? null : 'unrecognised';
  const digits = value.replace(/[\s\-()[\]]/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) return null;
  if (/^\+\d{8,15}$/.test(digits)) return null;
  return 'unrecognised';
}

type LeadError = 'contact' | 'consent' | 'outcome' | 'rate_limit' | 'server';

function messageFor(error: LeadError): string {
  if (error === 'contact') return MSG.unrecognised;
  if (error === 'consent') return MSG.consent;
  if (error === 'rate_limit') return MSG.rate_limit;
  return MSG.server;
}

/**
 * Optional contact capture under the product panel. Nothing is stored unless the person
 * ticks the box and presses the button. Validation runs here first, then on the server.
 */
export function LeadCapture({ outcome, name, deviceId, gen }: Props) {
  const reduce = useReducedMotion();
  const id = useId();
  const inputId = `${id}-contact`;
  const consentId = `${id}-consent`;
  const messageId = `${id}-message`;

  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [field, setField] = useState<'contact' | 'consent' | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    track('lead_submit', { outcome: outcome.id });

    const problem = contactProblem(contact);
    if (problem) {
      setField('contact');
      setMessage(MSG[problem]);
      track('lead_error', { reason: 'contact' });
      return;
    }
    if (!consent) {
      setField('consent');
      setMessage(MSG.consent);
      track('lead_error', { reason: 'consent' });
      return;
    }

    const trimmed = contact.trim();
    setBusy(true);
    setField(null);
    setMessage(null);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: trimmed,
          name: name.trim().slice(0, 40),
          outcome: outcome.id,
          device: deviceId ?? '',
          gen,
          consent: true,
          resultUrl: resultUrl(outcome, name),
          company,
        }),
      });
      if (res.status === 201) {
        track('lead_success', { outcome: outcome.id, contact_type: trimmed.includes('@') ? 'email' : 'whatsapp' });
        setSaved(trimmed);
        return;
      }
      let error: LeadError = 'server';
      try {
        const json: unknown = await res.json();
        const code = json && typeof json === 'object' ? (json as { error?: unknown }).error : undefined;
        if (code === 'contact' || code === 'consent' || code === 'outcome' || code === 'rate_limit' || code === 'server') error = code;
      } catch {
        /* no JSON body: keep the server message */
      }
      if (error === 'server' && res.status === 429) error = 'rate_limit';
      setField(error === 'contact' ? 'contact' : error === 'consent' ? 'consent' : null);
      setMessage(messageFor(error));
      track('lead_error', { reason: error });
    } catch {
      setMessage(MSG.server);
      track('lead_error', { reason: 'network' });
    } finally {
      setBusy(false);
    }
  };

  const fade = reduce ? { duration: 0 } : { duration: 0.3 };

  return (
    <div
      className="mt-8"
      style={{
        color: INK,
        ['--ground' as string]: PAPER,
        ['--fg' as string]: INK,
        ['--muted' as string]: MUTED,
        ['--hair' as string]: HAIR,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {saved ? (
          <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} role="status" className="text-base">
            Done. You&apos;ll hear from Skreed at {saved}.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            onSubmit={submit}
            noValidate
            className="relative"
          >
            <p className="text-base font-medium">Keep me posted</p>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              Launch news and your shade, by email or WhatsApp.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor={inputId} className="text-sm font-medium">
                Email or WhatsApp number
              </label>
              <input
                id={inputId}
                name="contact"
                className="field"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com or +91 98765 43210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                aria-invalid={field === 'contact'}
                aria-describedby={message ? messageId : undefined}
                disabled={busy}
              />
              <p id={messageId} aria-live="polite" className="min-h-[1.25rem] text-sm" style={{ color: ERROR }}>
                {message}
              </p>
            </div>

            {/* Honeypot. People never see it; a bot that fills it gets a silent success. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
            />

            <label htmlFor={consentId} className="mt-3 flex items-start gap-3 text-sm">
              <input
                id={consentId}
                name="consent"
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0"
                style={{ accentColor: INK }}
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={field === 'consent'}
                aria-describedby={field === 'consent' ? messageId : undefined}
                disabled={busy}
              />
              <span>{CONSENT_TEXT}</span>
            </label>

            <button type="submit" className="btn btn-primary mt-5 w-full" style={{ background: INK, color: PAPER }} disabled={busy} aria-busy={busy}>
              {busy ? 'Saving' : 'Keep me posted'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
