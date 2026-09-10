import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { CONSENT_TEXT, handleLead, type LeadDeps, type LeadRow } from './handle';
import { createRateLimiter } from './store';

const NOW = new Date('2026-09-10T12:00:00.000Z');
const IP = '203.0.113.7';
const UA = 'Mozilla/5.0 (test)';

function makeDeps(overrides: Partial<LeadDeps> = {}) {
  const upsert = vi.fn<(row: LeadRow) => Promise<void>>().mockResolvedValue(undefined);
  const deps: LeadDeps = {
    upsert,
    rateLimit: () => true,
    salt: 'pepper',
    now: () => NOW,
    ...overrides,
  };
  return { deps, upsert };
}

function input(body: unknown, extra: Partial<{ ip: string; userAgent: string }> = {}) {
  return { body, ip: IP, userAgent: UA, ...extra };
}

const VALID = {
  contact: 'Sam@Example.com',
  name: 'Sam',
  outcome: 'spark',
  device: 'ip17pro',
  gen: 'prism',
  consent: true,
  resultUrl: 'https://quiz.skreed.com/r/spark?n=Sam',
  company: '',
};

describe('handleLead', () => {
  describe('honeypot', () => {
    it('returns 201 and never writes when company is filled', async () => {
      const { deps, upsert } = makeDeps();
      const res = await handleLead(input({ ...VALID, company: 'Acme Ltd' }), deps);
      expect(res).toEqual({ status: 201, body: { ok: true } });
      expect(upsert).not.toHaveBeenCalled();
    });

    it('wins even when the rest of the body is invalid', async () => {
      const { deps, upsert } = makeDeps();
      const res = await handleLead(input({ company: 'bot' }), deps);
      expect(res).toEqual({ status: 201, body: { ok: true } });
      expect(upsert).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('400 contact when the contact is unrecognised', async () => {
      const { deps, upsert } = makeDeps();
      const res = await handleLead(input({ ...VALID, contact: 'hello' }), deps);
      expect(res).toEqual({ status: 400, body: { error: 'contact' } });
      expect(upsert).not.toHaveBeenCalled();
    });

    it('400 contact when the contact is missing or the body is not an object', async () => {
      const { deps } = makeDeps();
      expect(await handleLead(input({ ...VALID, contact: undefined }), deps)).toEqual({ status: 400, body: { error: 'contact' } });
      expect(await handleLead(input(null), deps)).toEqual({ status: 400, body: { error: 'contact' } });
      expect(await handleLead(input('nope'), deps)).toEqual({ status: 400, body: { error: 'contact' } });
      expect(await handleLead(input([VALID]), deps)).toEqual({ status: 400, body: { error: 'contact' } });
    });

    it('400 consent when consent is missing or not exactly true', async () => {
      const { deps, upsert } = makeDeps();
      expect(await handleLead(input({ ...VALID, consent: undefined }), deps)).toEqual({ status: 400, body: { error: 'consent' } });
      expect(await handleLead(input({ ...VALID, consent: false }), deps)).toEqual({ status: 400, body: { error: 'consent' } });
      expect(await handleLead(input({ ...VALID, consent: 'true' }), deps)).toEqual({ status: 400, body: { error: 'consent' } });
      expect(upsert).not.toHaveBeenCalled();
    });

    it('400 outcome when the outcome is not one of the ten ids', async () => {
      const { deps, upsert } = makeDeps();
      expect(await handleLead(input({ ...VALID, outcome: 'nope' }), deps)).toEqual({ status: 400, body: { error: 'outcome' } });
      expect(await handleLead(input({ ...VALID, outcome: undefined }), deps)).toEqual({ status: 400, body: { error: 'outcome' } });
      expect(upsert).not.toHaveBeenCalled();
    });

    it('checks contact before consent before outcome', async () => {
      const { deps } = makeDeps();
      const res = await handleLead(input({ contact: 'hello', consent: false, outcome: 'nope' }), deps);
      expect(res.body).toEqual({ error: 'contact' });
      const res2 = await handleLead(input({ contact: VALID.contact, consent: false, outcome: 'nope' }), deps);
      expect(res2.body).toEqual({ error: 'consent' });
    });
  });

  describe('rate limit', () => {
    it('429 when the limiter refuses, without writing', async () => {
      const { deps, upsert } = makeDeps({ rateLimit: () => false });
      const res = await handleLead(input(VALID), deps);
      expect(res).toEqual({ status: 429, body: { error: 'rate_limit' } });
      expect(upsert).not.toHaveBeenCalled();
    });

    it('is applied after validation so a bad request does not use a slot', async () => {
      const rateLimit = vi.fn(() => false);
      const { deps } = makeDeps({ rateLimit });
      const res = await handleLead(input({ ...VALID, contact: 'hello' }), deps);
      expect(res.status).toBe(400);
      expect(rateLimit).not.toHaveBeenCalled();
    });

    it('passes the client IP to the limiter', async () => {
      const rateLimit = vi.fn(() => true);
      const { deps } = makeDeps({ rateLimit });
      await handleLead(input(VALID), deps);
      expect(rateLimit).toHaveBeenCalledWith(IP);
    });
  });

  describe('valid email submission', () => {
    it('upserts once with the exact row shape', async () => {
      const { deps, upsert } = makeDeps();
      const res = await handleLead(input(VALID), deps);

      expect(res).toEqual({ status: 201, body: { ok: true } });
      expect(upsert).toHaveBeenCalledTimes(1);

      const row = upsert.mock.calls[0][0];
      expect(row).toEqual({
        contact_type: 'email',
        contact: 'sam@example.com',
        name: 'Sam',
        outcome: 'spark',
        device: 'ip17pro',
        gen: 'prism',
        consent: true,
        consent_text: 'Skreed can message me about the India launch.',
        result_url: 'https://quiz.skreed.com/r/spark?n=Sam',
        source: 'shade-diagnosis',
        ip_hash: expect.stringMatching(/^[0-9a-f]{64}$/),
        user_agent: UA,
        updated_at: '2026-09-10T12:00:00.000Z',
      });
      expect(row.consent_text).toBe(CONSENT_TEXT);
    });

    it('hashes ip plus salt with SHA-256', async () => {
      const { deps, upsert } = makeDeps({ salt: 'pepper' });
      await handleLead(input(VALID), deps);
      const expected = createHash('sha256').update(`${IP}pepper`).digest('hex');
      expect(upsert.mock.calls[0][0].ip_hash).toBe(expected);
    });

    it('truncates the user agent to 200 characters', async () => {
      const { deps, upsert } = makeDeps();
      const long = 'x'.repeat(350);
      await handleLead(input(VALID, { userAgent: long }), deps);
      expect(upsert.mock.calls[0][0].user_agent).toBe('x'.repeat(200));
    });

    it('trims the name and caps it at 40 characters', async () => {
      const { deps, upsert } = makeDeps();
      await handleLead(input({ ...VALID, name: `  ${'n'.repeat(60)}  ` }), deps);
      expect(upsert.mock.calls[0][0].name).toBe('n'.repeat(40));
    });

    it('stores an unknown device as empty, an unknown gen as null, and caps the result URL', async () => {
      const { deps, upsert } = makeDeps();
      await handleLead(input({ ...VALID, device: 'toaster', gen: 'neon', resultUrl: 'u'.repeat(400) }), deps);
      const row = upsert.mock.calls[0][0];
      expect(row.device).toBe('');
      expect(row.gen).toBeNull();
      expect(row.result_url).toBe('u'.repeat(300));
    });

    it('fills optional fields with empty values when absent', async () => {
      const { deps, upsert } = makeDeps();
      await handleLead(input({ contact: VALID.contact, consent: true, outcome: 'icon' }), deps);
      const row = upsert.mock.calls[0][0];
      expect(row.name).toBe('');
      expect(row.device).toBe('');
      expect(row.gen).toBeNull();
      expect(row.result_url).toBe('');
      expect(row.outcome).toBe('icon');
    });
  });

  describe('valid WhatsApp submission', () => {
    it('normalises a bare Indian number to +91', async () => {
      const { deps, upsert } = makeDeps();
      const res = await handleLead(input({ ...VALID, contact: '98765 43210', gen: 'patina' }), deps);
      expect(res).toEqual({ status: 201, body: { ok: true } });
      const row = upsert.mock.calls[0][0];
      expect(row.contact_type).toBe('whatsapp');
      expect(row.contact).toBe('+919876543210');
      expect(row.gen).toBe('patina');
    });
  });

  describe('server errors', () => {
    it('500 server when the upsert throws', async () => {
      const { deps } = makeDeps({ upsert: vi.fn().mockRejectedValue(new Error('supabase down')) });
      const res = await handleLead(input(VALID), deps);
      expect(res).toEqual({ status: 500, body: { error: 'server' } });
    });

    it('500 server when the store cannot even be built', async () => {
      const { deps } = makeDeps({
        upsert: () => {
          throw new Error('Lead store is not configured');
        },
      });
      const res = await handleLead(input(VALID), deps);
      expect(res).toEqual({ status: 500, body: { error: 'server' } });
    });
  });
});

describe('createRateLimiter', () => {
  it('allows up to the limit inside the window, then refuses', () => {
    let t = 1_000_000;
    const allow = createRateLimiter(2, 1000, () => t);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    t += 500;
    expect(allow('a')).toBe(false);
  });

  it('frees the slot once the oldest hit leaves the window', () => {
    let t = 1_000_000;
    const allow = createRateLimiter(2, 1000, () => t);
    allow('a');
    t += 400;
    allow('a');
    expect(allow('a')).toBe(false);
    t += 601;
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
  });

  it('tracks IPs independently', () => {
    const allow = createRateLimiter(1, 1000, () => 5);
    expect(allow('a')).toBe(true);
    expect(allow('b')).toBe(true);
    expect(allow('a')).toBe(false);
  });

  it('defaults to 5 per 10 minutes', () => {
    let t = 0;
    const allow = createRateLimiter(undefined, undefined, () => t);
    for (let i = 0; i < 5; i++) expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    t = 600_001;
    expect(allow('a')).toBe(true);
  });
});
