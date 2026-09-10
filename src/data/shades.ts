import raw from './shades.json';

export type Shade = { n: string; h: string };

/** All 240 Skreed shades, sorted by hue (neutrals last). Source: skreed_240_shades_cmyk.xlsx */
export const SHADES: Shade[] = raw as Shade[];

const byName = new Map(SHADES.map((s) => [s.n.toLowerCase(), s.h]));

export function shadeHex(name: string, fallback = '#888888'): string {
  return byName.get(name.toLowerCase()) ?? fallback;
}

/** Evenly spaced sample of the spectrum, used for scroll-driven colour sweeps. */
export function sampleShades(count: number): Shade[] {
  const out: Shade[] = [];
  for (let i = 0; i < count; i++) {
    out.push(SHADES[Math.floor((i / count) * SHADES.length)]);
  }
  return out;
}

/** Relative luminance (sRGB) for choosing readable text on a shade. */
export function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function readableOn(hex: string): '#171717' | '#F7F6F3' {
  return luminance(hex) > 0.42 ? '#171717' : '#F7F6F3';
}

export function isLight(hex: string): boolean {
  return luminance(hex) > 0.42;
}
