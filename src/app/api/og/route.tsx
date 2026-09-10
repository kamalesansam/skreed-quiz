import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { outcomeBySlug } from '@/data/quiz';
import { readableOn, shadeHex } from '@/data/shades';
import { LOGOMARK_PATHS, LOGOMARK_VIEWBOX } from '@/lib/logo';

export const runtime = 'nodejs';

let fontCache: { bold: ArrayBuffer; regular: ArrayBuffer } | null = null;

async function fonts() {
  if (fontCache) return fontCache;
  const dir = path.join(process.cwd(), 'src', 'assets', 'fonts');
  const [bold, regular] = await Promise.all([
    readFile(path.join(dir, 'Poppins-Bold.ttf')),
    readFile(path.join(dir, 'Poppins-Regular.ttf')),
  ]);
  fontCache = {
    bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength) as ArrayBuffer,
    regular: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength) as ArrayBuffer,
  };
  return fontCache;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const outcome = outcomeBySlug(searchParams.get('slug') || undefined);
  const name = (searchParams.get('n') || '').slice(0, 40);
  const f = await fonts();

  const bg = outcome ? outcome.hex : '#F7F6F3';
  const ink = readableOn(bg);
  const faint = ink === '#171717' ? 'rgba(23,23,23,0.6)' : 'rgba(247,246,243,0.66)';
  const s = 64 / LOGOMARK_VIEWBOX.w;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: bg,
          color: ink,
          padding: 64,
          fontFamily: 'Poppins',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width={64} height={64 * (LOGOMARK_VIEWBOX.h / LOGOMARK_VIEWBOX.w)} viewBox={`0 0 ${LOGOMARK_VIEWBOX.w} ${LOGOMARK_VIEWBOX.h}`}>
            {LOGOMARK_PATHS.map((d, i) => (
              <path key={i} d={d} fill={ink} transform={`scale(${(1 / s) * s})`} />
            ))}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 22, color: faint, fontWeight: 400 }}>
            <span>The Shade Diagnosis</span>
            <span>There are 240 personalities.</span>
          </div>
        </div>

        {outcome ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
              <div style={{ fontSize: 30, color: faint, fontWeight: 400, marginBottom: 12 }}>
                {name ? `${name}, you are` : 'You are'}
              </div>
              <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>{outcome.name}</div>
              <div style={{ fontSize: 30, fontWeight: 400, marginTop: 24, color: faint }}>
                {`Signature shade: ${outcome.shade} (${outcome.hex.toUpperCase()}), ${outcome.finish.toLowerCase()} finish`}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 999,
                  background: outcome.hex,
                  border: `3px solid ${ink === '#171717' ? 'rgba(23,23,23,0.2)' : 'rgba(247,246,243,0.35)'}`,
                  boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                {outcome.compatible.map((c) => (
                  <div key={c} style={{ width: 28, height: 28, borderRadius: 999, background: shadeHex(c) }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: -3, maxWidth: 900 }}>
              There are 240 personalities. Which one are you?
            </div>
            <div style={{ fontSize: 30, fontWeight: 400, marginTop: 24, color: faint }}>
              A five-minute diagnosis from Skreed. Answer instinctively.
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Poppins', data: f.bold, weight: 700, style: 'normal' },
        { name: 'Poppins', data: f.regular, weight: 400, style: 'normal' },
      ],
    },
  );
}
