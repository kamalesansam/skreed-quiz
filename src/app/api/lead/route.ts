import { NextResponse } from 'next/server';
import { handleLead, type LeadRow } from '@/lib/leads/handle';
import { createLeadStore, createRateLimiter, type LeadStore } from '@/lib/leads/store';

export const runtime = 'nodejs';

const rateLimit = createRateLimiter();

// Built on first use, not at import time, so a missing SUPABASE_* variable surfaces as a
// 500 on the request that needs it instead of taking the whole route down.
let store: LeadStore | null = null;

async function upsert(row: LeadRow): Promise<void> {
  try {
    store ??= createLeadStore();
    await store.upsert(row);
  } catch (err) {
    console.error('[api/lead] upsert failed', err);
    throw err;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'contact' }, { status: 400 });
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const userAgent = req.headers.get('user-agent') ?? '';

  const result = await handleLead(
    { body, ip, userAgent },
    { upsert, rateLimit, salt: process.env.LEAD_IP_SALT ?? '', now: () => new Date() },
  );
  return NextResponse.json(result.body, { status: result.status });
}
