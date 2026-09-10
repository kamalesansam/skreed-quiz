'use client';

import { Suspense, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, PerspectiveCamera, View } from '@react-three/drei';
import type { MotionValue } from 'motion/react';
import * as THREE from 'three';
import { CaseModel } from './CaseModel';
import { StudioLights } from './Lights';
import type { Finish } from '@/data/quiz';
import { cn } from '@/lib/utils';

type Props = {
  hex: string;
  finish?: Finish;
  /** 0..1 scroll progress. One full turn across the range. */
  progress?: MotionValue<number>;
  /** Follow the pointer (hero). */
  follow?: boolean;
  float?: boolean;
  scale?: number;
  className?: string;
  visible?: boolean;
};

function Rig({ progress, follow, children }: { progress?: MotionValue<number>; follow?: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.0005, dt);
    let ry = 0;
    let rx = 0;
    if (progress) {
      const p = progress.get();
      ry = -0.35 + p * Math.PI * 2;
      rx = Math.sin(p * Math.PI) * 0.3;
    }
    if (follow) {
      ry += pointer.x * 0.45;
      rx += -pointer.y * 0.25;
    }
    g.rotation.y += (ry - g.rotation.y) * k;
    g.rotation.x += (rx - g.rotation.x) * k;
  });
  return <group ref={group}>{children}</group>;
}

/** A DOM-sized window that renders the case in the shared overlay canvas. */
export function CaseView({ hex, finish, progress, follow, float = true, scale = 1.05, className, visible = true }: Props) {
  return (
    <View className={cn('absolute inset-0', className)} visible={visible}>
      <PerspectiveCamera makeDefault position={[0, 0, 6.2]} fov={30} />
      <Suspense fallback={null}>
        <StudioLights />
        <Rig progress={progress} follow={follow}>
          <Float speed={float ? 1.4 : 0} rotationIntensity={float ? 0.35 : 0} floatIntensity={float ? 0.8 : 0}>
            <CaseModel hex={hex} finish={finish} scale={scale} rotation={[0.1, 0, 0]} />
          </Float>
        </Rig>
      </Suspense>
    </View>
  );
}
