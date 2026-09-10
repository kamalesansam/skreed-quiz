import type { WallpaperStyle } from '@/data/quiz';

/** Ten lock-screen wallpapers drawn in CSS and SVG, one per option, inside a phone-shaped tile. */
export function WallpaperArt({ style, palette }: { style: WallpaperStyle; palette: string[] }) {
  const [a, b, c = b, d = a] = palette;
  let inner: React.ReactNode = null;
  let bg: string = a;
  switch (style) {
    case 'graphic':
      bg = `repeating-linear-gradient(135deg, ${a} 0 14px, ${b} 14px 28px)`;
      break;
    case 'gradient':
      bg = `linear-gradient(180deg, ${a}, ${b})`;
      break;
    case 'chaos':
      bg = `radial-gradient(circle at 20% 25%, ${a} 0 18%, transparent 19%), radial-gradient(circle at 75% 30%, ${b} 0 22%, transparent 23%), radial-gradient(circle at 35% 75%, ${c} 0 20%, transparent 21%), radial-gradient(circle at 80% 80%, ${d} 0 16%, transparent 17%), ${b}`;
      break;
    case 'sunset':
      bg = `linear-gradient(180deg, ${c} 0%, ${b} 45%, ${a} 100%)`;
      inner = <div className="absolute left-1/2 top-[38%] h-[34%] w-[34%] -translate-x-1/2 rounded-full" style={{ background: a, boxShadow: `0 0 30px ${a}` }} />;
      break;
    case 'nature':
      bg = `linear-gradient(180deg, ${c} 0 55%, ${a} 55% 78%, ${b} 78%)`;
      inner = <div className="absolute inset-x-[-20%] top-[45%] h-[30%] rounded-[50%]" style={{ background: a }} />;
      break;
    case 'hearts':
      bg = b;
      inner = (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 200" aria-hidden>
          <defs>
            <pattern id={`h-${a.slice(1)}`} width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M14 22 L4 12 A5 5 0 0 1 14 6 A5 5 0 0 1 24 12 Z" fill={a} />
            </pattern>
          </defs>
          <rect width="100" height="200" fill={`url(#h-${a.slice(1)})`} />
        </svg>
      );
      break;
    case 'abstract':
      bg = `conic-gradient(from 210deg at 40% 60%, ${a}, ${b}, ${c}, ${a})`;
      inner = <div className="absolute right-[10%] top-[15%] h-[28%] w-[45%] rounded-full" style={{ background: c, mixBlendMode: 'multiply' }} />;
      break;
    case 'line':
      bg = a;
      inner = (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 200" fill="none" aria-hidden>
          <path d="M18 150 C 30 90, 60 90, 55 120 S 40 170, 82 60" stroke={b} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
      break;
    case 'botanical':
      bg = b;
      inner = (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 200" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d="M0 0 C 12 -14, 26 -8, 30 6 C 18 12, 6 10, 0 0 Z"
              fill={i % 2 ? a : c}
              transform={`translate(${15 + (i % 3) * 30} ${40 + Math.floor(i / 3) * 80}) rotate(${i * 55})`}
            />
          ))}
        </svg>
      );
      break;
    case 'clock':
      bg = a;
      inner = (
        <div className="absolute inset-x-0 top-[14%] text-center" style={{ color: b }}>
          <div className="text-[9px] leading-none opacity-80">Sunday 14 September</div>
          <div className="mt-1 font-heading text-[26px] font-semibold leading-none tracking-tight">9:41</div>
        </div>
      );
      break;
  }
  return (
    <div className="relative mx-auto h-full w-[56%] overflow-hidden rounded-[18px] border border-black/15 shadow-[0_10px_30px_rgba(0,0,0,0.12)]" style={{ background: bg }}>
      {inner}
      <div className="absolute left-1/2 top-2 h-1.5 w-[36%] -translate-x-1/2 rounded-full bg-black/25" />
    </div>
  );
}
