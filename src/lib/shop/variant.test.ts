import { describe, expect, it } from 'vitest';
import { normalizeModel, STORE } from '@/data/devices';
import pixel from './__fixtures__/blissful-blue-case-google-pixel-10-series.json';
import samsung from './__fixtures__/blissful-blue-case-samsung-galaxy-s25-series.json';
import iphone16 from './__fixtures__/blissful-blue-iphone-16-series.json';
import iphone17 from './__fixtures__/mellow-yellow-case-iphone-17-series.json';
import {
  buildResult,
  fallbackResult,
  findVariant,
  formatInr,
  type ResolveContext,
  type StorefrontProduct,
  type StorefrontVariant,
} from './variant';

const UTMS = ['utm_source=shade-diagnosis', 'utm_medium=quiz', 'utm_campaign=india-launch'];

function variantId(product: StorefrontProduct, model: string, color: string, caseType: string): number {
  const hit = product.variants.find((v) => v.option1 === model && v.option2 === color && v.option3 === caseType);
  if (!hit) throw new Error(`Fixture has no ${model} / ${color} / ${caseType}`);
  return hit.id;
}

function expectUtms(url: string, outcome: string) {
  for (const utm of UTMS) expect(url).toContain(utm);
  expect(url).toContain(`utm_content=${outcome}`);
}

const spark: ResolveContext = {
  handle: 'mellow-yellow-case-iphone-17-series',
  familyName: 'Mellow Yellow',
  model: 'iPhone 17 Pro Max',
  shade: 'Sunflower',
  finish: 'Gloss',
  outcome: 'spark',
};

const strategist = (over: Partial<ResolveContext>): ResolveContext => ({
  handle: 'blissful-blue-case-samsung-galaxy-s25-series',
  familyName: 'Blissful Blue',
  model: 'Galaxy S25+',
  shade: 'Navy Blue',
  finish: 'Matte',
  outcome: 'strategist',
  ...over,
});

describe('iPhone 17 (four case types)', () => {
  it('picks the Tough variant for the requested finish and reports MagTough with its price', () => {
    const result = buildResult(iphone17, spark);
    if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`);

    const toughId = variantId(iphone17, 'iPhone 17 Pro Max', 'Sunflower', 'Tough - Gloss');
    const magId = variantId(iphone17, 'iPhone 17 Pro Max', 'Sunflower', 'MagTough - Gloss');

    expect(result.title).toBe('Sunflower on iPhone 17 Pro Max');
    expect(result.caseType).toBe('Tough - Gloss');
    expect(result.price).toBe('₹2,450');
    expect(result.available).toBe(true);
    expect(result.url).toBe(
      `${STORE}/products/mellow-yellow-case-iphone-17-series?variant=${toughId}&utm_source=shade-diagnosis&utm_medium=quiz&utm_campaign=india-launch&utm_content=spark`,
    );
    expectUtms(result.url, 'spark');

    expect(result.magtough).toBeDefined();
    expect(result.magtough?.price).toBe('₹2,950');
    expect(result.magtough?.url).toContain(`variant=${magId}`);
    expectUtms(result.magtough?.url ?? '', 'spark');
  });

  it('follows the finish for both lines when Matte is requested', () => {
    const result = buildResult(iphone17, { ...spark, finish: 'Matte' });
    if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`);
    expect(result.caseType).toBe('Tough - Matte');
    expect(result.url).toContain(`variant=${variantId(iphone17, 'iPhone 17 Pro Max', 'Sunflower', 'Tough - Matte')}`);
    expect(result.magtough?.url).toContain(`variant=${variantId(iphone17, 'iPhone 17 Pro Max', 'Sunflower', 'MagTough - Matte')}`);
  });

  it('falls back to any MagTough case when the requested finish has none', () => {
    // The iPhone 16 Navy Blue Pro Max only lists MagTough - Matte.
    const match = findVariant(iphone16, { model: 'iPhone 16 Pro Max', shade: 'Navy Blue', finish: 'Gloss' });
    if (match.status !== 'ok') throw new Error(`expected ok, got ${match.status}`);
    expect(match.variant.option3).toBe('Tough - Gloss');
    expect(match.magtough?.option3).toBe('MagTough - Matte');
  });
});

describe('Samsung and Pixel (brand prefix, two case types)', () => {
  it('matches "Galaxy S25+" to "Samsung Galaxy S25+" and has no MagTough line', () => {
    const result = buildResult(samsung, strategist({}));
    if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`);
    expect(result.title).toBe('Navy Blue on Galaxy S25+');
    expect(result.caseType).toBe('Tough - Matte');
    expect(result.url).toContain(`variant=${variantId(samsung, 'Samsung Galaxy S25+', 'Navy Blue', 'Tough - Matte')}`);
    expect(result.magtough).toBeUndefined();
    expect('magtough' in result).toBe(false);
  });

  it('matches "Pixel 10 Pro XL" to "Google Pixel 10 Pro XL"', () => {
    const result = buildResult(pixel, strategist({ handle: 'blissful-blue-case-google-pixel-10-series', model: 'Pixel 10 Pro XL' }));
    if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`);
    expect(result.url).toContain(`variant=${variantId(pixel, 'Google Pixel 10 Pro XL', 'Navy Blue', 'Tough - Matte')}`);
    expect(result.magtough).toBeUndefined();
  });
});

describe('model normalisation', () => {
  it('treats "+" and "Plus" spellings as the same model', () => {
    expect(normalizeModel('Galaxy S25+')).toBe(normalizeModel('Samsung Galaxy S25+'));
    expect(normalizeModel('Galaxy S26+')).toBe(normalizeModel('Samsung Galaxy S26 Plus'));
    expect(normalizeModel('Galaxy S26+')).toBe('galaxy s26 plus');
    expect(normalizeModel('Google  Pixel 10 Pro XL')).toBe('pixel 10 pro xl');
    expect(normalizeModel('Apple iPhone 17 Pro Max')).toBe('iphone 17 pro max');
  });

  it('matches an "S26+" label against a product that spells it "Plus"', () => {
    const product: StorefrontProduct = {
      options: [
        { name: 'Model', values: ['Samsung Galaxy S26 Plus'] },
        { name: 'Color', values: ['Navy Blue'] },
        { name: 'Case Type', values: ['Tough - Matte'] },
      ],
      variants: [
        { id: 1, title: 'Samsung Galaxy S26 Plus / Navy Blue / Tough - Matte', option1: 'Samsung Galaxy S26 Plus', option2: 'Navy Blue', option3: 'Tough - Matte', price: 245000, available: true },
      ],
    };
    const match = findVariant(product, { model: 'Galaxy S26+', shade: 'Navy Blue', finish: 'Matte' });
    expect(match.status).toBe('ok');
  });
});

describe('fallbacks', () => {
  it('returns shade_not_matched with a family URL carrying UTMs and no variant when the shade is missing', () => {
    const result = buildResult(pixel, strategist({ handle: 'blissful-blue-case-google-pixel-10-series', model: 'Pixel 10', shade: 'Sunflower' }));
    expect(result.status).toBe('shade_not_matched');
    expect(result.title).toBe('Sunflower on Pixel 10');
    expect(result.url.startsWith(`${STORE}/products/blissful-blue-case-google-pixel-10-series?`)).toBe(true);
    expect(result.url).not.toContain('variant=');
    expectUtms(result.url, 'strategist');
    expect('price' in result).toBe(false);
  });

  it('returns not_in_india with the search URL for a 404 product', () => {
    const result = buildResult(null, strategist({ handle: 'blissful-blue-airpods-pro-3-case', model: 'AirPods Pro 3' }));
    expect(result.status).toBe('not_in_india');
    expect(result.title).toBe('Navy Blue on AirPods Pro 3');
    expect(result.url).toBe(
      `${STORE}/search?q=Blissful+Blue&utm_source=shade-diagnosis&utm_medium=quiz&utm_campaign=india-launch&utm_content=strategist`,
    );
    expect('price' in result).toBe(false);
  });

  it('returns error with the family page when the model is not on the product', () => {
    const result = buildResult(iphone17, { ...spark, model: 'iPhone 17 Air' });
    expect(result.status).toBe('error');
    expect(result.url).toContain('/products/mellow-yellow-case-iphone-17-series?utm_source=');
    expect(result.url).not.toContain('variant=');
  });

  it('uses the search URL for an error when no handle exists', () => {
    const result = fallbackResult('error', strategist({ handle: null, model: 'Something else' }));
    expect(result.status).toBe('error');
    expect(result.url.startsWith(`${STORE}/search?q=Blissful+Blue&`)).toBe(true);
  });
});

describe('matcher details', () => {
  const base: StorefrontVariant = {
    id: 0,
    title: '',
    option1: 'iPhone 17 Pro',
    option2: 'Navy Blue',
    option3: 'Tough - Matte',
    price: 245000,
    available: true,
  };
  const product = (variants: StorefrontVariant[], colors = ['Navy Blue', 'Sky Blue']): StorefrontProduct => ({
    options: [
      { name: 'Model', values: ['iPhone 17 Pro'] },
      { name: 'Color', values: colors },
      { name: 'Case Type', values: ['Tough - Matte', 'Tough - Gloss', 'MagTough - Gloss'] },
    ],
    variants,
  });

  it('prefers Tough - {finish}, then Tough - Gloss, then Tough - Matte', () => {
    const matteOnly = product([{ ...base, id: 1 }]);
    const m1 = findVariant(matteOnly, { model: 'iPhone 17 Pro', shade: 'Navy Blue', finish: 'Gloss' });
    expect(m1.status === 'ok' && m1.variant.id).toBe(1);

    const both = product([{ ...base, id: 1 }, { ...base, id: 2, option3: 'Tough - Gloss' }]);
    const m2 = findVariant(both, { model: 'iPhone 17 Pro', shade: 'Navy Blue', finish: 'Gloss' });
    expect(m2.status === 'ok' && m2.variant.id).toBe(2);
    const m3 = findVariant(both, { model: 'iPhone 17 Pro', shade: 'Navy Blue', finish: 'Matte' });
    expect(m3.status === 'ok' && m3.variant.id).toBe(1);
  });

  it('matches the shade case-insensitively, then by startsWith, then by includes', () => {
    const p = product([{ ...base, id: 1 }, { ...base, id: 2, option2: 'Sky Blue' }]);
    const exact = findVariant(p, { model: 'iPhone 17 Pro', shade: 'navy blue', finish: 'Matte' });
    expect(exact.status === 'ok' && exact.variant.id).toBe(1);
    const starts = findVariant(p, { model: 'iPhone 17 Pro', shade: 'Sky', finish: 'Matte' });
    expect(starts.status === 'ok' && starts.variant.id).toBe(2);
    const includes = findVariant(p, { model: 'iPhone 17 Pro', shade: 'Blue', finish: 'Matte' });
    expect(includes.status === 'ok' && includes.variant.id).toBe(1);
  });

  it('keeps the price and link for an out-of-stock variant', () => {
    const p = product([{ ...base, id: 7, available: false }]);
    const result = buildResult(p, { ...spark, model: 'iPhone 17 Pro', shade: 'Navy Blue', finish: 'Matte' });
    if (result.status !== 'ok') throw new Error(`expected ok, got ${result.status}`);
    expect(result.available).toBe(false);
    expect(result.price).toBe('₹2,450');
    expect(result.url).toContain('variant=7');
  });

  it('returns error when the product lacks the three options', () => {
    const match = findVariant({ options: [{ name: 'Title', values: ['Default'] }], variants: [] }, { model: 'x', shade: 'y', finish: 'Gloss' });
    expect(match.status).toBe('error');
  });
});

describe('formatInr', () => {
  it('formats paise as rupees with en-IN grouping and no decimals', () => {
    expect(formatInr(245000)).toBe('₹2,450');
    expect(formatInr(295000)).toBe('₹2,950');
    expect(formatInr(12345600)).toBe('₹1,23,456');
    expect(formatInr(0)).toBe('₹0');
  });
});
