'use client';

import { useEffect, useState } from 'react';
import type { Outcome } from '@/data/quiz';
import { deviceById, shopUrl } from '@/data/devices';
import { readableOn } from '@/data/shades';
import { track } from '@/lib/analytics';

type Props = {
  outcome: Outcome;
  deviceId?: string;
  mode: 'live' | 'shared';
};

type VariantStatus = 'ok' | 'not_in_india' | 'shade_not_matched' | 'error';

type VariantResponse = {
  status: VariantStatus;
  title?: string;
  caseType?: string;
  price?: string;
  available?: boolean;
  url: string;
  magtough?: { price: string; url: string };
};

// The slip is always paper with ink, whatever the shade behind it.
const INK = '#171717';
const MUTED = 'rgba(23,23,23,0.56)';

const STATUSES: readonly VariantStatus[] = ['ok', 'not_in_india', 'shade_not_matched', 'error'];

function parseVariant(data: unknown): VariantResponse | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.url !== 'string' || typeof d.status !== 'string') return null;
  if (!STATUSES.includes(d.status as VariantStatus)) return null;
  const mag = d.magtough;
  const magtough =
    mag && typeof mag === 'object' && typeof (mag as Record<string, unknown>).price === 'string' && typeof (mag as Record<string, unknown>).url === 'string'
      ? { price: (mag as { price: string }).price, url: (mag as { url: string }).url }
      : undefined;
  return {
    status: d.status as VariantStatus,
    title: typeof d.title === 'string' ? d.title : undefined,
    caseType: typeof d.caseType === 'string' ? d.caseType : undefined,
    price: typeof d.price === 'string' ? d.price : undefined,
    available: typeof d.available === 'boolean' ? d.available : undefined,
    url: d.url,
    magtough,
  };
}

/** "Tough - Gloss" plus "₹2,450" becomes "Tough, Gloss finish. ₹2,450". */
function priceLine(caseType: string | undefined, price: string): string {
  if (!caseType) return price;
  const parts = caseType.split(/\s+-\s+/);
  if (parts.length >= 2) return `${parts[0]}, ${parts.slice(1).join(' ')} finish. ${price}`;
  return `${caseType}. ${price}`;
}

/**
 * The case for this diagnosis, priced live from the en-in storefront through /api/variant.
 * The button always has somewhere to go: the family page first, the exact variant once known.
 */
export function ProductPanel({ outcome, deviceId, mode }: Props) {
  const device = deviceById(deviceId);
  const fetching = mode === 'live' && device !== null;
  const key = `${outcome.id}:${device?.id ?? ''}`;
  const [result, setResult] = useState<{ key: string; data: VariantResponse } | null>(null);
  const data = result && result.key === key ? result.data : null;

  const buttonInk = readableOn(outcome.hex);
  const hasModel = device !== null && device.series !== 'other';
  const localTitle = hasModel ? `${outcome.shade} on ${device.label}` : `${outcome.shade} cases`;
  const fallbackUrl = fetching ? shopUrl(outcome.familySlug, outcome.family, device.series) : shopUrl(outcome.familySlug, outcome.family, 'iphone17');

  useEffect(() => {
    if (!fetching) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      family: outcome.familySlug,
      device: device.id,
      shade: outcome.shade,
      finish: outcome.finish,
      outcome: outcome.id,
    });
    const failed: VariantResponse = { status: 'error', url: fallbackUrl };
    fetch(`/api/variant?${params.toString()}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`variant ${res.status}`))))
      .then((json: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ key, data: parseVariant(json) ?? failed });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setResult({ key, data: failed });
      });
    return () => controller.abort();
  }, [fetching, key, device, outcome, fallbackUrl]);

  const loading = fetching && data === null;
  const status = data?.status ?? (fetching ? 'loading' : 'shared');
  const url = data?.url ?? fallbackUrl;
  const title = data?.status === 'ok' && data.title ? data.title : localTitle;
  const showPrice = data?.status === 'ok' && typeof data.price === 'string';
  const notInIndia = data?.status === 'not_in_india';
  const outOfStock = data?.status === 'ok' && data.available === false;
  const magtough = data?.status === 'ok' ? data.magtough : undefined;
  const label = notInIndia ? `See ${outcome.family} cases` : 'View this case on skreed.com';

  const click = (variant: 'tough' | 'magtough') =>
    track('product_view_click', { outcome: outcome.id, device: deviceId ?? 'none', status, ...(variant === 'magtough' ? { variant } : {}) });

  return (
    <div className="mt-6" style={{ color: INK, ['--fg' as string]: INK }}>
      {loading ? (
        <div aria-busy="true" aria-label="Loading the case details">
          <div className="skeleton h-5 w-4/5" />
          <div className="skeleton mt-2 h-4 w-3/5" />
        </div>
      ) : (
        <div>
          <p className="font-medium leading-snug">{title}</p>
          {showPrice && data?.price && (
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              {priceLine(data.caseType, data.price)}
            </p>
          )}
          {outOfStock && (
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              Out of stock right now on skreed.com
            </p>
          )}
          {notInIndia && (
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              Skreed AirPods cases are not in the India store yet. See the {outcome.family} family instead.
            </p>
          )}
        </div>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => click('tough')}
        className="btn mt-4 w-full whitespace-normal text-center leading-tight"
        style={{ background: outcome.hex, color: buttonInk }}
      >
        {label}
      </a>
      {magtough && (
        <p className="mt-3 text-sm" style={{ color: MUTED }}>
          <a href={magtough.url} target="_blank" rel="noopener noreferrer" onClick={() => click('magtough')} className="underline underline-offset-4">
            MagSafe compatible MagTough, {magtough.price}
          </a>
        </p>
      )}
    </div>
  );
}
