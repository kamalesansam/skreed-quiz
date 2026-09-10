'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { CakeDeco, GlyphId } from '@/data/quiz';

/**
 * Procedural 3D illustrations for the visual questions. Every glyph is built from primitives and
 * tinted with the option's palette, so the whole set stays inside the 240 shades.
 * Replace any of them with a rendered PNG by setting `image` on the option.
 */

type Props = {
  id: GlyphId;
  palette: string[];
  deco?: CakeDeco;
  hovered?: boolean;
  selected?: boolean;
};

const gloss = (color: string) => (
  <meshPhysicalMaterial color={color} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} />
);
const matte = (color: string) => <meshStandardMaterial color={color} roughness={0.62} metalness={0.02} />;

function Bead({ palette }: { palette: string[] }) {
  return (
    <mesh>
      <sphereGeometry args={[1.05, 64, 64]} />
      {gloss(palette[0])}
    </mesh>
  );
}

function Beads({ palette }: { palette: string[] }) {
  const items = useMemo(
    () => [
      [0, 0.15, 0, 0.62],
      [-0.85, -0.4, 0.2, 0.45],
      [0.8, -0.35, 0.1, 0.5],
      [-0.35, 0.85, -0.3, 0.36],
      [0.55, 0.8, -0.2, 0.3],
      [0.05, -0.95, 0.35, 0.34],
      [-0.9, 0.5, 0.4, 0.26],
    ],
    [],
  );
  return (
    <group>
      {items.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 48, 48]} />
          {gloss(palette[i % palette.length])}
        </mesh>
      ))}
    </group>
  );
}

function Stage({ palette }: { palette: string[] }) {
  return (
    <group>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.18, 48]} />
        {matte(palette[1])}
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <sphereGeometry args={[0.42, 48, 48]} />
        {gloss(palette[0])}
      </mesh>
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.1]} rotation={[0, 0, x > 0 ? 0.55 : -0.55]}>
          <coneGeometry args={[0.42, 1.5, 32, 1, true]} />
          <meshStandardMaterial color={palette[2]} transparent opacity={0.55} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Frame({ palette }: { palette: string[] }) {
  const t = 0.12;
  return (
    <group>
      {[
        [0, 1, 2.2, t],
        [0, -1, 2.2, t],
        [-1.05, 0, t, 2.1],
        [1.05, 0, t, 2.1],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[w, h, 0.16]} />
          {matte(palette[2])}
        </mesh>
      ))}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.95, 1.85]} />
        {matte(palette[0])}
      </mesh>
      <mesh position={[0, 0.05, 0.12]}>
        <sphereGeometry args={[0.38, 48, 48]} />
        {gloss(palette[1])}
      </mesh>
    </group>
  );
}

function Sun({ palette }: { palette: string[] }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.72, 64, 64]} />
        {gloss(palette[0])}
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0.3]}>
        <torusGeometry args={[1.15, 0.07, 24, 96]} />
        {matte(palette[1])}
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 1.15, Math.sin(i * 2.1) * 0.5, Math.sin(i * 2.1) * 0.8]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          {gloss(palette[2])}
        </mesh>
      ))}
    </group>
  );
}

function Flame({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[1.05, 1.15, 0.22, 48]} />
        {matte(palette[2])}
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.7, 1.7, 48]} />
        {matte(palette[0])}
      </mesh>
      <mesh position={[0.18, 0.55, 0.2]}>
        <coneGeometry args={[0.38, 1.1, 48]} />
        {matte(palette[1])}
      </mesh>
    </group>
  );
}

function Mountain({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.4, 0]}>
      <mesh position={[-0.45, 0, 0]}>
        <coneGeometry args={[1.05, 1.9, 5]} />
        {matte(palette[0])}
      </mesh>
      <mesh position={[0.6, -0.2, 0.3]}>
        <coneGeometry args={[0.8, 1.4, 5]} />
        {matte(palette[2])}
      </mesh>
      <mesh position={[-0.45, 0.75, 0]}>
        <coneGeometry args={[0.32, 0.5, 5]} />
        {matte(palette[1])}
      </mesh>
      <mesh position={[0.95, 1.05, -0.4]}>
        <sphereGeometry args={[0.24, 32, 32]} />
        {gloss(palette[1])}
      </mesh>
    </group>
  );
}

function Car({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.2, 0]} rotation={[0.1, -0.6, 0]}>
      <RoundedBox args={[2.2, 0.7, 1.1]} radius={0.18} smoothness={4}>
        {gloss(palette[0])}
      </RoundedBox>
      <RoundedBox args={[1.2, 0.6, 1.0]} radius={0.18} smoothness={4} position={[-0.1, 0.6, 0]}>
        {gloss(palette[1])}
      </RoundedBox>
      {[
        [-0.7, -0.45, 0.55],
        [0.7, -0.45, 0.55],
        [-0.7, -0.45, -0.55],
        [0.7, -0.45, -0.55],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.2, 32]} />
          {matte(palette[2])}
        </mesh>
      ))}
    </group>
  );
}

function Book({ palette }: { palette: string[] }) {
  return (
    <group rotation={[0.35, -0.4, 0]}>
      {[0, 1, 2].map((i) => (
        <RoundedBox
          key={i}
          args={[1.7, 0.3, 1.25]}
          radius={0.06}
          smoothness={3}
          position={[i * 0.08 - 0.08, i * 0.33 - 0.35, 0]}
          rotation={[0, i * 0.22 - 0.2, 0]}
        >
          {matte(palette[i % palette.length])}
        </RoundedBox>
      ))}
    </group>
  );
}

function Flower({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.25, 0]}>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.6, 16]} />
        {matte(palette[0])}
      </mesh>
      <mesh position={[0.3, -0.7, 0]} rotation={[0, 0, -0.7]} scale={[1, 0.45, 0.3]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        {matte(palette[0])}
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.55, 0.45 + Math.sin((i / 5) * Math.PI * 2) * 0.55, 0]}>
          <sphereGeometry args={[0.34, 32, 32]} />
          {gloss(palette[1])}
        </mesh>
      ))}
      <mesh position={[0, 0.45, 0.2]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        {gloss(palette[2])}
      </mesh>
    </group>
  );
}

function Cup({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.1, 48]} />
        {matte(palette[1])}
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.62, 0.5, 1.2, 48]} />
        {gloss(palette[0])}
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.04, 48]} />
        {matte(palette[2])}
      </mesh>
      <mesh position={[0.75, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.09, 16, 48]} />
        {gloss(palette[0])}
      </mesh>
    </group>
  );
}

function Rain({ palette }: { palette: string[] }) {
  return (
    <group>
      {[
        [-0.5, 0.5, 0.45],
        [0.1, 0.72, 0.55],
        [0.7, 0.5, 0.42],
        [0.1, 0.35, 0.5],
      ].map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <sphereGeometry args={[r, 40, 40]} />
          {matte(palette[1])}
        </mesh>
      ))}
      {[-0.55, 0.05, 0.65].map((x, i) => (
        <mesh key={i} position={[x, -0.55 - (i % 2) * 0.35, 0]}>
          <capsuleGeometry args={[0.09, 0.3, 8, 16]} />
          {gloss(palette[2])}
        </mesh>
      ))}
    </group>
  );
}

function Pillars({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.1, 0]} scale={0.82}>
      {[
        [-0.8, 1.4],
        [0, 2.1],
        [0.8, 1.0],
      ].map(([x, h], i) => (
        <mesh key={i} position={[x, h / 2 - 1, 0]}>
          <cylinderGeometry args={[0.3, 0.3, h, 48]} />
          {matte(palette[i % palette.length])}
        </mesh>
      ))}
    </group>
  );
}

function Star({ palette }: { palette: string[] }) {
  return (
    <group>
      <mesh scale={[1, 1.5, 1]}>
        <octahedronGeometry args={[0.85, 0]} />
        {gloss(palette[0])}
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.6) * 1.2, Math.sin(i * 1.6) * 1.0, 0.3]}>
          <sphereGeometry args={[0.12 + (i % 2) * 0.06, 24, 24]} />
          {gloss(palette[1])}
        </mesh>
      ))}
    </group>
  );
}

function Heart({ palette }: { palette: string[] }) {
  return (
    <group rotation={[0, 0, Math.PI / 4]} position={[0, -0.1, 0]} scale={0.92}>
      <RoundedBox args={[1.3, 1.3, 0.8]} radius={0.12} smoothness={4} position={[0, 0, 0]}>
        {gloss(palette[0])}
      </RoundedBox>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.66, 48, 48]} />
        {gloss(palette[0])}
      </mesh>
      <mesh position={[-0.65, 0, 0]}>
        <sphereGeometry args={[0.66, 48, 48]} />
        {gloss(palette[0])}
      </mesh>
    </group>
  );
}

function Cake({ palette, deco = 'plain' }: { palette: string[]; deco?: CakeDeco }) {
  const layers = deco === 'plain' || deco === 'berries' ? 1 : deco === 'candles' || deco === 'ombre' || deco === 'matcha' ? 3 : 2;
  const rings = Array.from({ length: layers }, (_, i) => i);
  const sprinkles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 0.5) * 1.6,
        z: (Math.cos(i * 78.233) * 0.5) * 1.6,
        rot: i * 0.7,
      })),
    [],
  );
  const topY = -0.9 + layers * 0.5;
  return (
    <group position={[0, -0.15, 0]}>
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.08, 64]} />
        {matte(palette[2])}
      </mesh>
      {rings.map((i) => {
        const r = 1.1 - i * 0.22;
        const col = deco === 'ombre' ? [palette[2], palette[0], palette[1]][i] : deco === 'matcha' ? [palette[0], palette[1], palette[0]][i] : palette[0];
        return (
          <group key={i} position={[0, -0.9 + i * 0.5 + 0.25, 0]}>
            <mesh>
              <cylinderGeometry args={[r, r, 0.5, 64]} />
              {matte(col)}
            </mesh>
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[r + 0.02, r + 0.02, 0.06, 64]} />
              {gloss(deco === 'matcha' ? palette[1] : palette[1])}
            </mesh>
          </group>
        );
      })}
      {deco === 'candles' &&
        [-0.35, 0, 0.35].map((x, i) => (
          <group key={i} position={[x, topY + 0.28, i === 1 ? -0.15 : 0.15]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 12]} />
              {matte(palette[1])}
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <coneGeometry args={[0.09, 0.26, 12]} />
              <meshStandardMaterial color={palette[2]} emissive={palette[2]} emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      {deco === 'sprinkles' &&
        sprinkles.map((s, i) => (
          <mesh key={i} position={[s.x * 0.55, topY + 0.06, s.z * 0.55]} rotation={[0, s.rot, Math.PI / 2]}>
            <capsuleGeometry args={[0.03, 0.12, 4, 8]} />
            {gloss(palette[(i % 2) + 1])}
          </mesh>
        ))}
      {deco === 'drizzle' && (
        <mesh position={[0, topY + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.07, 12, 64]} />
          {gloss(palette[1])}
        </mesh>
      )}
      {deco === 'nuts' &&
        sprinkles.slice(0, 10).map((s, i) => (
          <mesh key={i} position={[s.x * 0.5, topY + 0.08, s.z * 0.5]} rotation={[s.rot, s.rot, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.12]} />
            {matte(palette[0])}
          </mesh>
        ))}
      {deco === 'flowers' &&
        [0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos(i * 1.26) * 0.5, topY + 0.1, Math.sin(i * 1.26) * 0.5]}>
            <sphereGeometry args={[0.14, 24, 24]} />
            {gloss(palette[(i % 2) + 1])}
          </mesh>
        ))}
      {deco === 'berries' &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => (
          <mesh key={i} position={[Math.cos(i * 0.9) * 0.6 * ((i % 3) / 3 + 0.4), topY + 0.1, Math.sin(i * 0.9) * 0.6 * ((i % 3) / 3 + 0.4)]}>
            <sphereGeometry args={[0.11, 24, 24]} />
            {gloss(palette[1])}
          </mesh>
        ))}
    </group>
  );
}

function Blob({ palette }: { palette: string[] }) {
  return (
    <mesh>
      <icosahedronGeometry args={[1.05, 32]} />
      <MeshDistortMaterial color={palette[0]} roughness={0.25} clearcoat={0.8} distort={0.32} speed={1.6} />
    </mesh>
  );
}

function Ring({ palette }: { palette: string[] }) {
  return (
    <mesh rotation={[0.6, 0.2, 0]}>
      <torusKnotGeometry args={[0.72, 0.24, 160, 24]} />
      <meshPhysicalMaterial color={palette[0]} roughness={0.2} metalness={0.7} clearcoat={1} />
    </mesh>
  );
}

function Cube({ palette }: { palette: string[] }) {
  return (
    <group rotation={[0.5, 0.7, 0]}>
      <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.16} smoothness={4}>
        {matte(palette[0])}
      </RoundedBox>
      <mesh position={[0.75, 0.75, 0.75]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        {gloss(palette[1])}
      </mesh>
    </group>
  );
}

function Wave({ palette }: { palette: string[] }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((c, i) => {
      c.position.y = Math.sin(t * 2 + i * 0.7) * 0.35;
    });
  });
  return (
    <group ref={group}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh key={i} position={[(i - 3) * 0.42, 0, 0]}>
          <sphereGeometry args={[0.24, 32, 32]} />
          {gloss(palette[i % palette.length])}
        </mesh>
      ))}
    </group>
  );
}

function Lamp({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.25, 0]}>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.14, 48]} />
        {matte(palette[1])}
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 16]} />
        {matte(palette[1])}
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.85, 0.75, 48, 1, true]} />
        <meshStandardMaterial color={palette[0]} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={palette[2]} emissive={palette[2]} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function Plant({ palette }: { palette: string[] }) {
  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.6, 0.45, 0.9, 48]} />
        {matte(palette[2])}
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.0, 12]} />
        {matte(palette[1])}
      </mesh>
      {[
        [-0.45, 0.45, 0.6],
        [0.5, 0.7, -0.6],
        [0, 1.05, 0.1],
      ].map(([x, y, r], i) => (
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, r]} scale={[1, 0.5, 0.35]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          {matte(palette[1])}
        </mesh>
      ))}
    </group>
  );
}

const GLYPHS: Record<GlyphId, (p: { palette: string[]; deco?: CakeDeco }) => React.ReactElement> = {
  bead: Bead,
  beads: Beads,
  stage: Stage,
  frame: Frame,
  sun: Sun,
  flame: Flame,
  mountain: Mountain,
  car: Car,
  book: Book,
  flower: Flower,
  cup: Cup,
  rain: Rain,
  pillars: Pillars,
  star: Star,
  heart: Heart,
  cake: Cake,
  blob: Blob,
  ring: Ring,
  cube: Cube,
  wave: Wave,
  lamp: Lamp,
  plant: Plant,
};

/** Glyphs with a clear front face sway instead of spinning so they never turn edge-on. */
const SWAY: Partial<Record<GlyphId, boolean>> = {
  frame: true,
  car: true,
  book: true,
  stage: true,
  cake: true,
  lamp: true,
  plant: true,
  cup: true,
  flame: true,
  mountain: true,
  wave: true,
  rain: true,
  pillars: true,
};

export function Glyph({ id, palette, deco, hovered, selected }: Props) {
  const group = useRef<THREE.Group>(null);
  const G = GLYPHS[id] ?? Bead;
  const sway = !!SWAY[id];
  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.001, dt);
    const targetScale = selected ? 1.12 : hovered ? 1.06 : 1;
    const s = g.scale.x + (targetScale - g.scale.x) * k;
    g.scale.setScalar(s);
    if (sway) {
      const t = clock.getElapsedTime();
      const target = Math.sin(t * (hovered ? 2.2 : 0.8)) * (hovered ? 0.7 : 0.4) - 0.2;
      g.rotation.y += (target - g.rotation.y) * k;
    } else {
      g.rotation.y += dt * (hovered ? 1.6 : 0.35);
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.5}>
      <group ref={group} scale={0.001}>
        <G palette={palette} deco={deco} />
      </group>
    </Float>
  );
}
