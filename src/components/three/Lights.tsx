'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Studio lighting without any network fetch: three soft panels baked into an environment map,
 * plus a key and a rim. Makes gloss finishes read as gloss.
 */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.55 * intensity} />
      <directionalLight position={[3, 5, 4]} intensity={1.6 * intensity} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7 * intensity} color="#dfe6ff" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} scale={[6, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, 3]} scale={[2, 5, 1]} target={[0, 0, 0]} color="#fff4e6" />
        <Lightformer form="rect" intensity={1.0} position={[5, 0, 3]} scale={[2, 5, 1]} target={[0, 0, 0]} color="#e8f0ff" />
      </Environment>
    </>
  );
}
