'use client';

import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';

/**
 * One WebGL context for every 3D element drawn over the page (option tiles, the case).
 * Each <View> elsewhere in the tree renders into the rectangle of its own DOM element.
 */
export default function OverlayCanvas() {
  return (
    <Canvas
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 'var(--z-overlay-3d)',
        pointerEvents: 'none',
      }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6], fov: 30, near: 0.1, far: 50 }}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
    >
      <View.Port />
    </Canvas>
  );
}
