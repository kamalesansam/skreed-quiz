'use client';

import { useMemo } from 'react';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Finish } from '@/data/quiz';

export const CASE_MODEL = '/models/skreed-case.glb';

export function preloadCase() {
  useGLTF.preload(CASE_MODEL, false, true);
}

type Props = ThreeElements['group'] & {
  hex: string;
  finish?: Finish;
};

/**
 * The Skreed case (skreed-ultra-case.glb, meshopt compressed). The shell material is replaced with
 * a physical material whose colour and finish ease toward the requested shade every frame.
 */
export function CaseModel({ hex, finish = 'Gloss', ...group }: Props) {
  const { scene } = useGLTF(CASE_MODEL, false, true);

  const { model, shell, accent } = useMemo(() => {
    const root = scene.clone(true);
    const shell = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex),
      roughness: 0.2,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.1,
    });
    const accent = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex).offsetHSL(0, 0, -0.14),
      roughness: 0.35,
      metalness: 0.1,
    });
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.Material;
      const name = mat?.name ?? '';
      if (name === 'shellBlue') m.material = shell;
      else if (name === 'accentBlue') m.material = accent;
      else if (mat) m.material = mat.clone();
      m.frustumCulled = false;
    });
    // Normalise so the case is 2 units tall and centred.
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = 2 / Math.max(size.y, 0.0001);
    root.position.sub(center).multiplyScalar(s);
    root.scale.setScalar(s);
    const wrapper = new THREE.Group();
    wrapper.add(root);
    return { model: wrapper, shell, accent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const target = useMemo(() => new THREE.Color(hex), [hex]);
  const targetAccent = useMemo(() => new THREE.Color(hex).offsetHSL(0, 0, -0.14), [hex]);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    shell.color.lerp(target, k);
    accent.color.lerp(targetAccent, k);
    const r = finish === 'Gloss' ? 0.16 : 0.66;
    const cc = finish === 'Gloss' ? 1 : 0.1;
    shell.setValues({
      roughness: shell.roughness + (r - shell.roughness) * k,
      clearcoat: shell.clearcoat + (cc - shell.clearcoat) * k,
    });
  });

  return (
    <group {...group}>
      <primitive object={model} />
    </group>
  );
}
