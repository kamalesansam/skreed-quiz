import type { Outcome } from '@/data/quiz';
import { readableOn, shadeHex } from '@/data/shades';
import { LOGOMARK_PATHS, LOGOMARK_VIEWBOX } from './logo';

/**
 * Renders the 1080 x 1920 story card (Instagram Story / WhatsApp status) on a canvas.
 * Returns a PNG blob. Fonts come from the next/font CSS variables already on the page.
 */
export async function renderStoryCard(opts: {
  name: string;
  outcome: Outcome;
  url: string;
}): Promise<Blob> {
  const { name, outcome, url } = opts;
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const css = getComputedStyle(document.documentElement);
  const heading = css.getPropertyValue('--font-poppins').trim() || 'Poppins, sans-serif';
  const body = css.getPropertyValue('--font-inter').trim() || 'Inter, sans-serif';
  const mono = css.getPropertyValue('--font-jbmono').trim() || 'ui-monospace, monospace';
  try {
    await Promise.all([
      document.fonts.load(`700 120px ${heading}`),
      document.fonts.load(`500 40px ${body}`),
      document.fonts.load(`400 30px ${mono}`),
    ]);
  } catch {
    /* fall back to whatever is available */
  }

  const ink = readableOn(outcome.hex);
  const faint = ink === '#171717' ? 'rgba(23,23,23,0.55)' : 'rgba(247,246,243,0.62)';
  const hair = ink === '#171717' ? 'rgba(23,23,23,0.18)' : 'rgba(247,246,243,0.22)';

  // Background: the shade, with a soft vignette and a subtle darker band at the bottom.
  ctx.fillStyle = outcome.hex;
  ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W * 0.5, H * 0.38, 120, W * 0.5, H * 0.38, H * 0.9);
  vg.addColorStop(0, 'rgba(255,255,255,0.10)');
  vg.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Logomark top-left (white or black only over colour, per brand rules)
  const logoW = 96;
  const s = logoW / LOGOMARK_VIEWBOX.w;
  ctx.save();
  ctx.translate(96, 96);
  ctx.scale(s, s);
  ctx.fillStyle = ink;
  for (const d of LOGOMARK_PATHS) ctx.fill(new Path2D(d));
  ctx.restore();

  // Header mono
  ctx.fillStyle = faint;
  ctx.font = `400 28px ${mono}`;
  ctx.textBaseline = 'top';
  ctx.fillText('THE SHADE DIAGNOSIS', 96 + logoW + 32, 118);
  ctx.fillText(`CONFIDENCE ${outcome.confidence}%  ·  TOP ${outcome.rarity}%`, 96 + logoW + 32, 158);

  // Hairline
  ctx.fillStyle = hair;
  ctx.fillRect(96, 300, W - 192, 2);

  // Name
  ctx.fillStyle = faint;
  ctx.font = `500 40px ${body}`;
  ctx.fillText(name ? `${name}, you are` : 'You are', 96, 360);

  // Outcome title, wrapped
  ctx.fillStyle = ink;
  ctx.font = `700 132px ${heading}`;
  wrap(ctx, outcome.name, 96, 430, W - 192, 128);

  // Big swatch circle
  const cx = W / 2;
  const cy = 1090;
  const r = 250;
  const sg = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
  sg.addColorStop(0, lighten(outcome.hex, 0.35));
  sg.addColorStop(0.6, outcome.hex);
  sg.addColorStop(1, darken(outcome.hex, 0.25));
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = sg;
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = hair;
  ctx.stroke();

  // Shade name and hex
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = `700 64px ${heading}`;
  ctx.fillText(outcome.shade, cx, cy + r + 56);
  ctx.fillStyle = faint;
  ctx.font = `400 30px ${mono}`;
  ctx.fillText(`${outcome.hex.toUpperCase()}  ·  ${outcome.family}  ·  ${outcome.finish}`, cx, cy + r + 140);

  // Compatible dots
  const dots = outcome.compatible.map((n) => shadeHex(n));
  const dw = 60;
  const gap = 28;
  const totalW = dots.length * dw + (dots.length - 1) * gap;
  let x = cx - totalW / 2 + dw / 2;
  for (const h of dots) {
    ctx.beginPath();
    ctx.arc(x, cy + r + 250, dw / 2, 0, Math.PI * 2);
    ctx.fillStyle = h;
    ctx.fill();
    ctx.strokeStyle = hair;
    ctx.stroke();
    x += dw + gap;
  }
  ctx.fillStyle = faint;
  ctx.font = `500 26px ${body}`;
  ctx.fillText('Also compatible with', cx, cy + r + 310);

  // Closing line
  ctx.fillStyle = ink;
  ctx.font = `700 44px ${heading}`;
  ctx.fillText('There are 240 personalities.', cx, 1660);
  ctx.fillText('This is yours.', cx, 1716);

  ctx.fillStyle = faint;
  ctx.font = `400 28px ${mono}`;
  ctx.fillText(url.replace(/^https?:\/\//, ''), cx, 1800);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export image'))), 'image/png');
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

function mix(hex: string, target: [number, number, number], t: number): string {
  const c = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
  const out = rgb.map((v, i) => Math.round(v + (target[i] - v) * t));
  return `rgb(${out[0]},${out[1]},${out[2]})`;
}
function lighten(hex: string, t: number) {
  return mix(hex, [255, 255, 255], t);
}
function darken(hex: string, t: number) {
  return mix(hex, [0, 0, 0], t);
}
