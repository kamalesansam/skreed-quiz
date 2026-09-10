/**
 * Real dependencies for the lead handler: the Supabase writer and the in-memory rate limiter.
 * Server only. The service role key must never reach the browser.
 */

import { createClient } from '@supabase/supabase-js';
import type { LeadRow } from './handle';

export type LeadStore = { upsert(row: LeadRow): Promise<void> };

/**
 * Creates a writer for public.quiz_leads using the service role. Throws when the
 * environment is not configured, so call it lazily and let the handler turn that into a 500.
 */
export function createLeadStore(): LeadStore {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Lead store is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  const client = createClient(url, key, { auth: { persistSession: false } });

  return {
    async upsert(row) {
      const { error } = await client.from('quiz_leads').upsert(row, { onConflict: 'contact_type,contact' });
      if (error) throw new Error(`quiz_leads upsert failed: ${error.message}`);
    },
  };
}

/**
 * Sliding-window limiter keyed by IP, held in memory. On Vercel this is per function
 * instance, so it is a soft limit; the unique index on the table is the hard guard.
 *
 * The returned function consumes one request and reports true when the request may
 * proceed, false when the IP has reached `limit` requests inside `windowMs`.
 */
export function createRateLimiter(
  limit = 5,
  windowMs = 600_000,
  now: () => number = Date.now,
): (ip: string) => boolean {
  const hits = new Map<string, number[]>();
  let lastSweep = now();

  function sweep(cutoff: number) {
    for (const [ip, times] of hits) {
      const fresh = times.filter((t) => t > cutoff);
      if (fresh.length === 0) hits.delete(ip);
      else hits.set(ip, fresh);
    }
  }

  return (ip) => {
    const at = now();
    const cutoff = at - windowMs;

    if (at - lastSweep >= windowMs) {
      sweep(cutoff);
      lastSweep = at;
    }

    const recent = (hits.get(ip) ?? []).filter((t) => t > cutoff);
    if (recent.length >= limit) {
      hits.set(ip, recent);
      return false;
    }
    recent.push(at);
    hits.set(ip, recent);
    return true;
  };
}
