/**
 * Pure variant matching for the skreed.com en-in storefront product JSON.
 * No I/O here: the route fetches, this module decides. See docs/superpowers/specs/2026-09-10-first-orders-growth-design.md.
 */

import { normalizeModel, STORE } from '@/data/devices';
import type { Finish } from '@/data/quiz';

/** The subset of Shopify's `/products/{handle}.js` payload the matcher reads. */
export type StorefrontOption = { name: string; values: string[] };

export type StorefrontVariant = {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  /** Minor units (paise), as the storefront sends them. */
  price: number;
  available: boolean;
};

export type StorefrontProduct = {
  options: StorefrontOption[];
  variants: StorefrontVariant[];
};

export type VariantQuery = { model: string; shade: string; finish: Finish };

export type VariantMatch =
  | { status: 'ok'; variant: StorefrontVariant; magtough: StorefrontVariant | null }
  | { status: 'shade_not_matched' }
  | { status: 'error'; reason: string };

export type VariantStatus = 'ok' | 'not_in_india' | 'shade_not_matched' | 'error';

export type VariantResult =
  | {
      status: 'ok';
      title: string;
      caseType: string;
      price: string;
      available: boolean;
      url: string;
      magtough?: { price: string; url: string };
    }
  | {
      status: Exclude<VariantStatus, 'ok'>;
      title: string;
      url: string;
    };

/** Everything the response builder needs besides the product itself. */
export type ResolveContext = {
  /** Product handle for the family on this device series, or null when the store has no such page. */
  handle: string | null;
  /** Family display name, used for the search fallback. */
  familyName: string;
  /** Device label as shown in the quiz, for example "iPhone 17 Pro Max". */
  model: string;
  shade: string;
  finish: Finish;
  /** Outcome id, sent as utm_content. */
  outcome: string;
};

const UTM_SOURCE = 'shade-diagnosis';
const UTM_MEDIUM = 'quiz';
const UTM_CAMPAIGN = 'india-launch';

const fold = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();

function optionIndex(product: StorefrontProduct, name: string): number {
  const wanted = fold(name);
  return product.options.findIndex((o) => fold(o.name) === wanted);
}

function optionValue(variant: StorefrontVariant, index: number): string | null {
  if (index === 0) return variant.option1;
  if (index === 1) return variant.option2;
  if (index === 2) return variant.option3;
  return null;
}

/** Exact (case-insensitive), then startsWith, then includes, in the product's own option order. */
function matchShade(values: string[], shade: string): string | null {
  const wanted = fold(shade);
  if (!wanted) return null;
  const folded = values.map((v) => fold(v));
  const tests: Array<(v: string) => boolean> = [
    (v) => v === wanted,
    (v) => v.startsWith(wanted),
    (v) => v.includes(wanted),
  ];
  for (const test of tests) {
    const at = folded.findIndex(test);
    if (at >= 0) return values[at];
  }
  return null;
}

function findCaseType(variants: StorefrontVariant[], index: number, preferences: string[]): StorefrontVariant | null {
  for (const wanted of preferences.map(fold)) {
    const hit = variants.find((v) => fold(optionValue(v, index) ?? '') === wanted);
    if (hit) return hit;
  }
  return null;
}

export function findVariant(product: StorefrontProduct, query: VariantQuery): VariantMatch {
  const modelAt = optionIndex(product, 'Model');
  const colorAt = optionIndex(product, 'Color');
  const typeAt = optionIndex(product, 'Case Type');
  if (modelAt < 0 || colorAt < 0 || typeAt < 0) {
    return { status: 'error', reason: 'Product is missing one of the Model, Color or Case Type options' };
  }

  const colorValues = product.options[colorAt].values.length
    ? product.options[colorAt].values
    : Array.from(new Set(product.variants.map((v) => optionValue(v, colorAt) ?? '')));
  const shade = matchShade(colorValues, query.shade);
  if (!shade) return { status: 'shade_not_matched' };

  const model = normalizeModel(query.model);
  const candidates = product.variants.filter(
    (v) => normalizeModel(optionValue(v, modelAt) ?? '') === model && optionValue(v, colorAt) === shade,
  );
  if (candidates.length === 0) {
    return { status: 'error', reason: `No "${shade}" variant for model "${query.model}"` };
  }

  const variant = findCaseType(candidates, typeAt, [`Tough - ${query.finish}`, 'Tough - Gloss', 'Tough - Matte']);
  if (!variant) {
    return { status: 'error', reason: `No Tough case type for "${shade}" on "${query.model}"` };
  }

  const magtough =
    findCaseType(candidates, typeAt, [`MagTough - ${query.finish}`]) ??
    candidates.find((v) => fold(optionValue(v, typeAt) ?? '').startsWith('magtough')) ??
    null;

  return { status: 'ok', variant, magtough };
}

/** "₹2,450" from 245000 paise. en-IN grouping, no decimals. */
export function formatInr(minorUnits: number): string {
  const rupees = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(minorUnits / 100);
  return `₹${rupees}`;
}

function utm(outcome: string): Array<[string, string]> {
  return [
    ['utm_source', UTM_SOURCE],
    ['utm_medium', UTM_MEDIUM],
    ['utm_campaign', UTM_CAMPAIGN],
    ['utm_content', outcome],
  ];
}

function withQuery(base: string, entries: Array<[string, string]>): string {
  const params = new URLSearchParams(entries);
  return `${base}?${params.toString()}`;
}

/** Product page preselecting a variant, with the four UTM parameters. */
export function productUrl(handle: string, variantId: number, outcome: string): string {
  return withQuery(`${STORE}/products/${handle}`, [['variant', String(variantId)], ...utm(outcome)]);
}

/** The family's product page when the store has one for this series, otherwise a store search for the family. */
export function familyUrl(ctx: Pick<ResolveContext, 'handle' | 'familyName' | 'outcome'>): string {
  if (ctx.handle) return withQuery(`${STORE}/products/${ctx.handle}`, utm(ctx.outcome));
  return searchUrl(ctx);
}

export function searchUrl(ctx: Pick<ResolveContext, 'familyName' | 'outcome'>): string {
  if (!ctx.familyName.trim()) return withQuery(STORE, utm(ctx.outcome));
  return withQuery(`${STORE}/search`, [['q', ctx.familyName], ...utm(ctx.outcome)]);
}

/** "Sunflower on iPhone 17 Pro Max", or "Sunflower cases" when no device is known. */
export function titleFor(shade: string, model: string | null): string {
  if (!shade) return '';
  return model ? `${shade} on ${model}` : `${shade} cases`;
}

/** A response for any status other than ok. The link never goes away. */
export function fallbackResult(status: Exclude<VariantStatus, 'ok'>, ctx: ResolveContext): VariantResult {
  const url = status === 'not_in_india' ? searchUrl(ctx) : familyUrl(ctx);
  return { status, title: titleFor(ctx.shade, ctx.model || null), url };
}

/** Build the route's JSON. A null product means the storefront returned 404 for the handle. */
export function buildResult(product: StorefrontProduct | null, ctx: ResolveContext): VariantResult {
  if (!product) return fallbackResult('not_in_india', ctx);
  if (!ctx.handle) return fallbackResult('error', ctx);

  const match = findVariant(product, { model: ctx.model, shade: ctx.shade, finish: ctx.finish });
  if (match.status !== 'ok') return fallbackResult(match.status, ctx);

  const { variant, magtough } = match;
  const result: VariantResult = {
    status: 'ok',
    title: titleFor(ctx.shade, ctx.model),
    caseType: optionValue(variant, optionIndex(product, 'Case Type')) ?? variant.title,
    price: formatInr(variant.price),
    available: variant.available,
    url: productUrl(ctx.handle, variant.id, ctx.outcome),
  };
  if (magtough) {
    result.magtough = { price: formatInr(magtough.price), url: productUrl(ctx.handle, magtough.id, ctx.outcome) };
  }
  return result;
}
