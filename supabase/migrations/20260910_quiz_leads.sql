-- Leads captured by the Shade Diagnosis result screen (spec: 2026-09-10-first-orders-growth-design).
-- Supabase project: Skreed Sales Analytics. New table only; nothing else is touched.

create table public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_type text not null check (contact_type in ('email', 'whatsapp')),
  contact text not null,
  name text,
  outcome text not null,
  device text,
  gen text,
  consent boolean not null default false,
  consent_text text not null,
  result_url text,
  source text not null default 'shade-diagnosis',
  ip_hash text,
  user_agent text,
  unique (contact_type, contact)
);

alter table public.quiz_leads enable row level security;

-- No policies on purpose. With row level security on and no policies, the anon and
-- authenticated roles can neither read nor write. Only the service role, used from the
-- server route POST /api/lead, reads and writes this table.
comment on table public.quiz_leads is
  'Shade Diagnosis leads. Row level security is on with no policies: only the service role, from the server route, reads or writes here.';
