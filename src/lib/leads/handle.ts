/**
 * Pure handler for POST /api/lead. It knows nothing about HTTP or Supabase so it can be
 * tested with fake dependencies. The route in src/app/api/lead/route.ts wires the real ones.
 */

import { createHash } from 'node:crypto';
import { deviceById } from '@/data/devices';
import { OUTCOME_SLUGS, type OutcomeId } from '@/data/quiz';
import { normalizeContact, type ContactType } from './contact';

/** Stored verbatim on every row so consent stays auditable if the wording changes later. */
export const CONSENT_TEXT = 'Skreed can message me about the India launch.';
export const LEAD_SOURCE = 'shade-diagnosis';

const GENS = ['prism', 'pigment', 'patina'] as const;
export type Gen = (typeof GENS)[number];

const NAME_MAX = 40;
const RESULT_URL_MAX = 300;
const USER_AGENT_MAX = 200;

/** One row of public.quiz_leads as written by the upsert. */
export type LeadRow = {
  contact_type: ContactType;
  contact: string;
  name: string;
  outcome: OutcomeId;
  device: string;
  gen: Gen | null;
  consent: true;
  consent_text: string;
  result_url: string;
  source: typeof LEAD_SOURCE;
  ip_hash: string;
  user_agent: string;
  updated_at: string;
};

export type LeadInput = {
  /** The parsed JSON body, untrusted. */
  body: unknown;
  ip: string;
  userAgent: string;
};

export type LeadDeps = {
  upsert(row: LeadRow): Promise<void>;
  /**
   * Consumes one request for this IP. Returns true when the request may proceed and
   * false when the IP has used up its window, which the handler turns into a 429.
   */
  rateLimit(ip: string): boolean;
  /** LEAD_IP_SALT. Mixed into the IP before hashing. */
  salt: string;
  now(): Date;
};

export type LeadError = 'contact' | 'consent' | 'outcome' | 'rate_limit' | 'server';

export type LeadResult =
  | { status: 201; body: { ok: true } }
  | { status: 400 | 429 | 500; body: { error: LeadError } };

const OK: LeadResult = { status: 201, body: { ok: true } };

function fail(status: 400 | 429 | 500, error: LeadError): LeadResult {
  return { status, body: { error } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGen(value: string): value is Gen {
  return (GENS as readonly string[]).includes(value);
}

function isOutcome(value: string): value is OutcomeId {
  return (OUTCOME_SLUGS as readonly string[]).includes(value);
}

export function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(ip + salt).digest('hex');
}

export async function handleLead(input: LeadInput, deps: LeadDeps): Promise<LeadResult> {
  try {
    const body = isRecord(input.body) ? input.body : {};

    // 1. Honeypot. Bots fill every field; humans never see this one. Pretend it worked.
    const company = body.company;
    if (typeof company === 'string' && company.trim() !== '') return OK;

    // 2. Validate. Errors are reported in the order the form shows them.
    const contact = typeof body.contact === 'string' ? normalizeContact(body.contact) : null;
    if (!contact) return fail(400, 'contact');

    if (body.consent !== true) return fail(400, 'consent');

    const outcome = body.outcome;
    if (typeof outcome !== 'string' || !isOutcome(outcome)) return fail(400, 'outcome');

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, NAME_MAX) : '';
    const device = typeof body.device === 'string' && deviceById(body.device) ? body.device : '';
    const gen = typeof body.gen === 'string' && isGen(body.gen) ? body.gen : null;
    const resultUrl = typeof body.resultUrl === 'string' ? body.resultUrl.slice(0, RESULT_URL_MAX) : '';

    // 3. Rate limit, after validation so a bad request never burns a slot.
    if (!deps.rateLimit(input.ip)) return fail(429, 'rate_limit');

    // 4. Write.
    const row: LeadRow = {
      contact_type: contact.type,
      contact: contact.value,
      name,
      outcome,
      device,
      gen,
      consent: true,
      consent_text: CONSENT_TEXT,
      result_url: resultUrl,
      source: LEAD_SOURCE,
      ip_hash: hashIp(input.ip, deps.salt),
      user_agent: input.userAgent.slice(0, USER_AGENT_MAX),
      updated_at: deps.now().toISOString(),
    };
    await deps.upsert(row);
    return OK;
  } catch {
    return fail(500, 'server');
  }
}
