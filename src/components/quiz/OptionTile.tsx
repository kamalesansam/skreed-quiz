'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { TileView } from '@/components/three/TileView';
import { WallpaperArt } from './WallpaperArt';
import type { Option } from '@/data/quiz';
import { OUTCOMES } from '@/data/quiz';
import { readableOn } from '@/data/shades';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

type Props = {
  option: Option;
  index: number;
  kind: 'visual' | 'text';
  selected: boolean;
  dimmed: boolean;
  leaving: boolean;
  webgl: boolean;
  onPick: (option: Option, e: React.MouseEvent<HTMLButtonElement>) => void;
};

const LETTERS = 'ABCDEFGHIJ';

/**
 * One answer. Visual tiles carry a live 3D illustration (or a flat palette card when WebGL is off).
 * Text rows are quiet until picked, then fill with the outcome's shade.
 */
export function OptionTile({ option, index, kind, selected, dimmed, leaving, webgl, onPick }: Props) {
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const outcome = OUTCOMES[option.outcome];
  const palette = option.palette ?? [outcome.hex, outcome.hex, outcome.hex];
  const tint = `color-mix(in oklab, ${palette[0]} 16%, var(--ground))`;
  const spring = { type: 'spring', stiffness: 420, damping: 28 } as const;

  if (kind === 'text') {
    return (
      <motion.button
        type="button"
        onClick={(e) => onPick(option, e)}
        disabled={leaving}
        aria-pressed={selected}
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: dimmed ? 0.35 : 1, y: 0, scale: selected ? 1.02 : 1 }}
        transition={{ ...spring, delay: reduce ? 0 : index * 0.04 }}
        whileHover={reduce ? undefined : { x: 6 }}
        whileTap={{ scale: 0.98 }}
        className="group flex w-full items-center gap-4 rounded-[16px] border px-4 py-4 text-left transition-colors md:px-5"
        style={{
          borderColor: selected ? outcome.hex : 'var(--hair)',
          background: selected ? outcome.hex : 'transparent',
          color: selected ? readableOn(outcome.hex) : 'var(--fg)',
        }}
      >
        <span
          className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm"
          style={{ borderColor: selected ? 'transparent' : 'var(--hair)', background: selected ? 'rgba(255,255,255,0.22)' : 'transparent' }}
        >
          {LETTERS[index]}
        </span>
        <span className="text-[1.02rem] leading-snug md:text-lg">{option.label}</span>
      </motion.button>
    );
  }

  const artArea = option.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={option.image} alt="" className="absolute inset-0 h-full w-full object-contain p-3" draggable={false} />
  ) : option.wallpaper ? (
    <div className="absolute inset-0 p-3">
      <WallpaperArt style={option.wallpaper} palette={palette} />
    </div>
  ) : option.glyph && webgl && !reduce ? (
    <ErrorBoundary fallback={<FlatArt palette={palette} />}>
      <TileView glyph={option.glyph} palette={palette} deco={option.deco} hovered={hover} selected={selected} visible={!leaving} />
    </ErrorBoundary>
  ) : (
    <FlatArt palette={palette} />
  );

  return (
    <motion.button
      type="button"
      onClick={(e) => onPick(option, e)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      disabled={leaving}
      aria-pressed={selected}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: dimmed ? 0.3 : 1, y: 0, scale: selected ? 1.04 : 1 }}
      transition={{ ...spring, delay: reduce ? 0 : index * 0.045 }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={{ scale: 0.97 }}
      className="relative flex w-full flex-col overflow-hidden rounded-[16px] border text-left"
      style={{
        borderColor: selected ? outcome.hex : 'var(--hair)',
        background: selected ? outcome.hex : tint,
        color: selected ? readableOn(outcome.hex) : 'var(--fg)',
        boxShadow: selected ? `0 18px 40px -20px ${outcome.hex}` : hover ? '0 18px 40px -24px rgba(23,23,23,0.35)' : 'none',
      }}
    >
      <div className="relative aspect-[1/1] w-full">{artArea}</div>
      <div className="flex items-start gap-2 px-3 pb-3 pt-1 md:px-4 md:pb-4">
        <span className="text-[0.95rem] font-medium leading-snug md:text-base">{option.label}</span>
      </div>
    </motion.button>
  );
}

function FlatArt({ palette }: { palette: string[] }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="relative h-[72%] w-[72%]">
        <div className="absolute left-0 top-0 h-[70%] w-[70%] rounded-full" style={{ background: palette[0] }} />
        <div className="absolute bottom-0 right-0 h-[52%] w-[52%] rounded-full" style={{ background: palette[1] ?? palette[0] }} />
        <div className="absolute left-[55%] top-[8%] h-[30%] w-[30%] rounded-full" style={{ background: palette[2] ?? palette[0] }} />
      </div>
    </div>
  );
}
