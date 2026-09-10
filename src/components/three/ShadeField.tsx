'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADES } from '@/data/shades';

export type FieldMode = 'idle' | 'converge' | 'bloom';

type Props = {
  mode: FieldMode;
  /** the leading shade; used as a soft light colour */
  mood: string;
  ground: 'paper' | 'ink' | 'shade';
  opacity?: number;
};

const COUNT = SHADES.length;
const dummy = new THREE.Object3D();

function Field({ mode, mood, ground }: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const { pointer } = useThree();
  const state = useRef({ spread: 1, target: 1, rot: 0, speed: 0.06, boost: 0 });

  const homes = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const R = 4.2;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      out.push(new THREE.Vector3(Math.cos(theta) * r * R, y * R * 0.85, Math.sin(theta) * r * R));
    }
    return out;
  }, []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      c.set(SHADES[i].h);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  useEffect(() => {
    const s = state.current;
    if (mode === 'converge') {
      s.target = 0.08;
      s.speed = 0.9;
    } else if (mode === 'bloom') {
      s.target = 1;
      s.spread = 2.6;
      s.boost = 1;
      s.speed = 0.12;
    } else {
      s.target = 1;
      s.speed = 0.06;
    }
  }, [mode]);

  const moodColor = useMemo(() => new THREE.Color(mood), [mood]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const s = state.current;
    const k = 1 - Math.pow(0.02, dt);
    s.spread += (s.target - s.spread) * k * (mode === 'converge' ? 0.55 : 0.35);
    s.rot += dt * s.speed;
    const px = pointer.x * 0.35;
    const py = pointer.y * 0.25;
    const t = performance.now() * 0.001;
    for (let i = 0; i < COUNT; i++) {
      const h = homes[i];
      const wob = Math.sin(t * 0.8 + i * 0.37) * 0.12;
      dummy.position.set(h.x * s.spread * 1.15, h.y * s.spread + wob, h.z * s.spread - 3.2);
      dummy.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), s.rot + px);
      dummy.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), py * 0.6);
      const size = 0.085 + (i % 5) * 0.01;
      dummy.scale.setScalar(size * (mode === 'converge' ? 0.7 : 1));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (light.current) light.current.color.lerp(moodColor, k);
  });

  return (
    <>
      <ambientLight intensity={ground === 'ink' ? 0.5 : 0.9} />
      <directionalLight position={[4, 6, 5]} intensity={ground === 'ink' ? 1.2 : 1.6} />
      <pointLight ref={light} position={[0, 0, 3]} intensity={ground === 'ink' ? 40 : 18} distance={14} />
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhysicalMaterial roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} metalness={0} />
      </instancedMesh>
    </>
  );
}

/** Background layer: all 240 shades as glossy beads on a slowly turning shell. Its own canvas, behind the page. */
export default function ShadeField(props: Props) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 transition-opacity duration-700"
      style={{ zIndex: 'var(--z-bg)', opacity: props.opacity ?? 1 }}
    >
      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 10], fov: 38 }}>
        <Field {...props} />
      </Canvas>
    </div>
  );
}
