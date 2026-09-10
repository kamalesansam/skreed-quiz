'use client';

import { Suspense } from 'react';
import { View } from '@react-three/drei';
import { Glyph } from './Glyph';
import { StudioLights } from './Lights';
import type { CakeDeco, GlyphId } from '@/data/quiz';

type Props = {
  glyph: GlyphId;
  palette: string[];
  deco?: CakeDeco;
  hovered?: boolean;
  selected?: boolean;
  visible?: boolean;
};

/** A tile-sized window in the overlay canvas showing one 3D illustration. */
export function TileView({ glyph, palette, deco, hovered, selected, visible = true }: Props) {
  return (
    <View className="absolute inset-0" visible={visible}>
      <Suspense fallback={null}>
        <StudioLights intensity={0.9} />
        <Glyph id={glyph} palette={palette} deco={deco} hovered={hovered} selected={selected} />
      </Suspense>
    </View>
  );
}
