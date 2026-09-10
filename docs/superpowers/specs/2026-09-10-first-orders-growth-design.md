# First orders from the result: design

Date: 10 September 2026. Status: approved in conversation, pending spec review.

## Goal

The result screen of the Shade Diagnosis has to produce first orders for the India launch, without a discount, and may capture an optional contact for follow-up. Success is measured in Shopify: orders whose landing carried `utm_source=shade-diagnosis`, plus the count of leads in the new table.

## Constraints

- No coupon or discount of any kind.
- No invented numbers. Prices come from the live en-in storefront at request time, never from the codebase.
- Store links use the en-in market path.
- Leads go to Supabase, not Shopify. Product truth comes from Shopify's storefront.
- The quiz stays stateless for people who do not opt in. Nothing about a person is stored unless they submit the contact form with consent.
- The Daily Edit's Supabase project is a separate brand and must not be touched.

## Scope

In: the variant resolver route, the product panel on the result (live and shared pages), the lead capture form and its API, the `quiz_leads` table, analytics events and UTM tagging, tests.

Out: discounts, live tallies, referral loops, sending any message to leads (a later job that reads the table), changes to the twelve samples.

## Architecture

Two server routes inside the existing Next.js app. The browser never holds a Shopify or Supabase key.

```
Result screen
  ├─ ProductPanel ── GET /api/variant?family&device&shade&finish ── fetch skreed.com/en-in/products/{handle}.js (cached 10 min)
  └─ LeadCapture  ── POST /api/lead ─────────────────────────────── Supabase (service role, server only)
```

## Variant resolver: `GET /api/variant`

Query: `family` (family slug from `src/data/devices.ts`), `device` (device id), `shade` (recommended shade name), `finish` (`Gloss` or `Matte`).

Steps:

1. Map `family` and the device's series to a product handle with the existing `HANDLES` table. Unknown series or `other` returns the search fallback immediately.
2. Fetch `https://www.skreed.com/en-in/products/{handle}.js` server-side with `next: { revalidate: 600 }`. A 404 (the AirPods pages today) returns `{ status: 'not_in_india' }`.
3. Match a variant. Options on every phone product are `Model`, `Color`, `Case Type`.
   - Model: normalise both sides (lowercase, strip the words `samsung`, `google`, `apple`, replace `+` with ` plus`, collapse spaces) and compare equal.
   - Color: exact match on the recommended shade name (case-insensitive). If no exact match, try `startsWith`, then `includes`. If still nothing, return the family page link without a `variant` parameter and `status: 'shade_not_matched'`.
   - Case Type: prefer `Tough - {finish}`; if absent, `Tough - Gloss`, then `Tough - Matte`. Also look up `MagTough - {finish}` for the secondary line.
4. Respond with:

```json
{
  "status": "ok",
  "title": "Sunflower on iPhone 17 Pro Max",
  "caseType": "Tough - Gloss",
  "price": "₹2,450",
  "available": true,
  "url": "https://www.skreed.com/en-in/products/mellow-yellow-case-iphone-17-series?variant=448...&utm_source=shade-diagnosis&utm_medium=quiz&utm_campaign=india-launch&utm_content=spark",
  "magtough": { "price": "₹2,950", "url": "...?variant=448...&utm_..." }
}
```

`price` is formatted from the JSON's minor units with `en-IN` grouping. `magtough` is omitted when the product has no MagTough case type. Every URL carries the four UTM parameters; `utm_content` is the outcome id. The response sets `Cache-Control: s-maxage=600, stale-while-revalidate=3600`.

Fallback statuses and what the panel does with them: `not_in_india` (link to `/en-in/search?q={family}`), `shade_not_matched` (family page, no variant, no price), `error` (family page, no price). No status ever removes the link.

## Product panel

Replaces the shop button inside the paper lab slip. Layout, top to bottom: a line naming the case ("Sunflower on iPhone 17 Pro Max"), a line with the case type and price ("Tough, Gloss finish. ₹2,450"), the button, and when present one quiet text link ("MagSafe compatible MagTough, ₹2,950").

Button label: "View this case on skreed.com". It opens in a new tab and fires `product_view_click`.

States:
- Loading: two skeleton lines where the title and price go; the button shows immediately, pointing at the family page, and swaps to the variant URL when the response lands.
- Out of stock (`available: false`): price shown, line "Out of stock right now on skreed.com", button unchanged.
- `not_in_india`: "Skreed AirPods cases are not in the India store yet. See the {family} family instead." Button label "See {family} cases".
- `shade_not_matched` or `error`: title line still renders from local data, no price line, button to the family page.
- Shared result page (no device known): title "Sunflower cases", button to the family's iPhone 17 page, since that is the launch device.

## Lead capture

Sits under the product panel inside the slip, separated by spacing only.

- Heading (Inter medium, not a headline): "Keep me posted"
- Helper line: "Launch news and your shade, by email or WhatsApp."
- One input, label "Email or WhatsApp number", placeholder "you@example.com or +91 98765 43210".
- Checkbox, unchecked by default, label: "Skreed can message me about the India launch." Required.
- Button: "Keep me posted". While sending: "Saving". After success the form is replaced by: "Done. You'll hear from Skreed at {contact}."
- Hidden honeypot text field named `company`, visually hidden and excluded from the tab order; any value rejects the submission silently as a success.

Validation, inline under the field, in this voice:
- Empty: "Add an email address or a WhatsApp number."
- Unrecognised: "Enter an email address or a WhatsApp number with country code."
- Consent unchecked: "Tick the box so we're allowed to message you."
- Rate limited: "Too many tries. Give it a minute."
- Server error: "Couldn't save that. Try again in a moment."

Contact normalisation (`src/lib/leads/contact.ts`): trim; if it contains `@`, lowercase and check `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, type `email`. Otherwise strip spaces, dashes and brackets; a 10-digit number starting 6 to 9 becomes `+91` plus the digits; a `+` followed by 8 to 15 digits is kept; anything else is unrecognised; type `whatsapp`.

## Lead API: `POST /api/lead`

Body: `{ contact, name, outcome, device, gen, consent, resultUrl, company }`.

1. Honeypot: if `company` is non-empty, return `201` with no write.
2. Validate: contact normalises, `consent === true`, `outcome` is one of the ten ids, `name` at most 40 characters, `device` is a known id or empty.
3. Rate limit: in-memory bucket per client IP, 5 requests per 10 minutes per function instance. Return `429` when exceeded. This is per instance on Vercel and is documented as a soft limit; the unique index is the hard guard against duplicates.
4. Upsert into `quiz_leads` on `(contact_type, contact)`: update `name`, `outcome`, `device`, `gen`, `result_url`, `updated_at`; keep the original `created_at`.
5. Store `ip_hash` as SHA-256 of the IP plus `LEAD_IP_SALT`, and the user agent truncated to 200 characters.
6. Responses: `201 { ok: true }`, `400 { error: 'contact' | 'consent' | 'outcome' }`, `429 { error: 'rate_limit' }`, `500 { error: 'server' }`.

## Data

Supabase project: Skreed Sales Analytics, id `mfpidomroimlszxmxcke`, region ap-northeast-1. New table only; existing tables are not touched.

```sql
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
```

No policies are created. Only the service role, used from the server route, can read or write. `consent_text` stores the exact sentence shown at submission time so consent is auditable if the wording changes.

Environment variables (server only, added to `.env.example`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LEAD_IP_SALT`. The service role key is pasted by Sam from the Supabase dashboard into Vercel; it is never committed.

Retention: rows stay until Sam deletes them; the table is small (thousands of rows at most) and this is documented in the README.

## Measurement

Events pushed to `dataLayer` (existing `track` helper): `product_view_click { outcome, device, status }`, `lead_submit { outcome }`, `lead_success { outcome, contact_type }`, `lead_error { reason }`. The existing `quiz_shop_click` is renamed to `product_view_click`.

Orders: every product link carries `utm_source=shade-diagnosis`, `utm_medium=quiz`, `utm_campaign=india-launch`, `utm_content={outcome}`. Shopify's marketing attribution report groups orders by these, so "first orders from the quiz" and "orders by personality" need no extra code.

Leads: read from the `quiz_leads` table in the Supabase dashboard or through the Sales Analytics project's existing tooling.

## Error handling summary

| Failure | Behaviour |
|---|---|
| Storefront JSON 404 | `not_in_india`; panel explains and links to family search |
| Storefront timeout or 5xx | `error`; family link without price, logged server-side |
| Shade name not on product | `shade_not_matched`; family link, no price |
| Variant out of stock | price shown, out-of-stock line, link unchanged |
| Supabase down | `500`; inline "Couldn't save that" message, form stays filled |
| Duplicate contact | upsert, treated as success |
| Bot fills honeypot | silent success, no write |
| Offline | existing offline banner; the product link still opens when back online |

## Testing

- Vitest is added as a dev dependency with an `npm test` script.
- `src/lib/shop/variant.test.ts` runs the matcher against saved product JSON fixtures: iPhone 17 (four case types), Samsung S25 (two case types, `Samsung` prefix), Pixel 10 (`Google` prefix), a product missing the shade, and a 404 case. Assertions cover the chosen variant id, price formatting in `en-IN`, the MagTough secondary, and every fallback status.
- `src/lib/leads/contact.test.ts` covers emails, 10-digit Indian numbers, `+` numbers, spaces and dashes, and rejects.
- `src/app/api/lead` handler test with a mocked Supabase client: honeypot, consent missing, rate limit, upsert payload shape.
- Playwright on the running app: the result shows a title, a rupee price, and a button whose `href` contains `variant=` and `utm_source=shade-diagnosis`; the lead form shows each validation message and the success state.
- Manual: open the variant link in a browser and confirm the storefront preselects the shade, model and case type.

## Files

Add: `src/lib/shop/variant.ts`, `src/lib/shop/product.ts`, `src/app/api/variant/route.ts`, `src/lib/leads/contact.ts`, `src/lib/leads/store.ts`, `src/app/api/lead/route.ts`, `src/components/quiz/ProductPanel.tsx`, `src/components/quiz/LeadCapture.tsx`, `supabase/migrations/20260910_quiz_leads.sql`, fixtures under `src/lib/shop/__fixtures__/`, the three test files, `vitest.config.ts`.

Change: `src/components/quiz/ResultView.tsx` (use the two components), `src/data/devices.ts` (export the model normaliser and a `modelLabel` per device), `src/lib/analytics.ts` (no change to the helper, new event names used), `.env.example`, `README.md`.

## Decisions Sam still owns

1. Paste the Supabase service role key and a random `LEAD_IP_SALT` into Vercel and `.env.local`.
2. Publish the AirPods products to the India market, or accept the "not in the India store yet" line until then.
3. Confirm the consent sentence with whoever handles legal, since it is stored verbatim.
4. Confirm Tough as the default case type on the panel, with MagTough as the secondary line.
