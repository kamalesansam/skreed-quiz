import { deviceById, handleFor } from '@/data/devices';
import { OUTCOME_LIST, outcomeBySlug, type Finish } from '@/data/quiz';
import { fetchProduct } from '@/lib/shop/product';
import { buildResult, fallbackResult, familyUrl, titleFor, type ResolveContext, type VariantResult } from '@/lib/shop/variant';

export const runtime = 'nodejs';

const CACHE_CONTROL = 's-maxage=600, stale-while-revalidate=3600';

function respond(body: VariantResult, init: { status?: number; cache?: string } = {}): Response {
  return Response.json(body, {
    status: init.status ?? 200,
    headers: { 'Cache-Control': init.cache ?? CACHE_CONTROL },
  });
}

function familyNameFor(slug: string): string | null {
  return OUTCOME_LIST.find((o) => o.familySlug === slug)?.family ?? null;
}

function parseFinish(value: string | null): Finish | null {
  return value === 'Gloss' || value === 'Matte' ? value : null;
}

/**
 * GET /api/variant?family=mellow-yellow&device=ip17promax&shade=Sunflower&finish=Gloss&outcome=spark
 * Resolves the storefront variant for the recommended shade on the chosen device. Never throws to the client:
 * every response carries a link, and failures come back as `status: 'error'` with the family page.
 */
export async function GET(req: Request): Promise<Response> {
  const params = new URL(req.url).searchParams;
  const familySlug = (params.get('family') ?? '').trim();
  const device = deviceById(params.get('device'));
  const shade = (params.get('shade') ?? '').trim().slice(0, 60);
  const finish = parseFinish(params.get('finish'));
  const outcome = outcomeBySlug(params.get('outcome') ?? undefined);
  const familyName = familyNameFor(familySlug);

  if (!familyName || !device || !shade || !finish || !outcome) {
    const handle = familyName && device ? handleFor(familySlug, device.series) : null;
    const utmContent = outcome?.id ?? 'unknown';
    return respond(
      {
        status: 'error',
        title: titleFor(shade, device?.label ?? null),
        url: familyUrl({ handle, familyName: familyName ?? familySlug.replace(/-/g, ' '), outcome: utmContent }),
      },
      { status: 400 },
    );
  }

  const ctx: ResolveContext = {
    handle: handleFor(familySlug, device.series),
    familyName,
    model: device.label,
    shade,
    finish,
    outcome: outcome.id,
  };

  // Unknown series or "Something else": no product page exists, so send people to the family search.
  if (!ctx.handle) return respond(fallbackResult('error', ctx));

  try {
    const product = await fetchProduct(ctx.handle);
    return respond(buildResult(product, ctx));
  } catch (err) {
    console.error('[api/variant] storefront lookup failed', { handle: ctx.handle, device: device.id, shade }, err);
    // A transient failure must not be pinned at the CDN for ten minutes.
    return respond(fallbackResult('error', ctx), { cache: 'no-store' });
  }
}
