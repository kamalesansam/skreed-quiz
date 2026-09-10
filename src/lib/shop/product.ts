/**
 * Server-side fetch of a skreed.com en-in product as Shopify's `/products/{handle}.js` JSON.
 * Cached by Next's data cache for ten minutes. Returns null on 404, throws on anything else.
 */

import { STORE } from '@/data/devices';
import type { StorefrontProduct, StorefrontVariant } from './variant';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asVariant(value: unknown): StorefrontVariant | null {
  if (!isRecord(value)) return null;
  const { id, title, option1, option2, option3, price, available } = value;
  if (typeof id !== 'number' || typeof title !== 'string' || typeof price !== 'number') return null;
  const opt = (o: unknown): string | null => (typeof o === 'string' ? o : null);
  return { id, title, option1: opt(option1), option2: opt(option2), option3: opt(option3), price, available: available === true };
}

function parseProduct(json: unknown, handle: string): StorefrontProduct {
  if (!isRecord(json) || !Array.isArray(json.options) || !Array.isArray(json.variants)) {
    throw new Error(`Unexpected storefront JSON for ${handle}`);
  }
  const options = json.options.flatMap((o: unknown) => {
    if (!isRecord(o) || typeof o.name !== 'string' || !Array.isArray(o.values)) return [];
    return [{ name: o.name, values: o.values.filter((v: unknown): v is string => typeof v === 'string') }];
  });
  const variants = json.variants.flatMap((v: unknown) => {
    const parsed = asVariant(v);
    return parsed ? [parsed] : [];
  });
  return { options, variants };
}

export async function fetchProduct(handle: string): Promise<StorefrontProduct | null> {
  const url = `${STORE}/products/${encodeURIComponent(handle)}.js`;
  const res = await fetch(url, { next: { revalidate: 600 }, headers: { 'User-Agent': 'skreed-quiz' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Storefront returned ${res.status} for ${handle}`);
  const json: unknown = await res.json();
  return parseProduct(json, handle);
}
