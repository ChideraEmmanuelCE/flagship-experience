"use client";

import { useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

export type DrivingTelemetry = { speed: number; distance: number };
type Props = { active: boolean; targetSpeed: number; targetLane: number; telemetry: RefObject<DrivingTelemetry> };

function createRoadTexture() {
  const canvas = document.createElement("canvas"); canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(128, 128);
  let seed = 23;
  for (let i = 0; i < image.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const shade = 87 + (seed % 22);
    image.data[i] = shade; image.data[i + 1] = shade + 4; image.data[i + 2] = shade + 5; image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(5, 70); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const DrivingWorld = memo(function DrivingWorld({ active, targetSpeed, targetLane, telemetry }: Props) {
  const motion = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  const speed = useRef(0);
  const distance = useRef(0);
  const roadTexture = useMemo(createRoadTexture, []);
  useEffect(() => () => roadTexture.dispose(), [roadTexture]);

  useFrame(({ camera }, rawDelta) => {
    camera.lookAt(0, -20, -80);
    if (!active) return;
    const dt = Math.min(rawDelta, 0.06);
    speed.current = THREE.MathUtils.damp(speed.current, targetSpeed, targetSpeed === 0 ? 1.5 : 0.75, dt);
    if (speed.current < 0.08) speed.current = 0;
    const moved = speed.current / 3.6 * dt;
    distance.current += moved;
    telemetry.current.speed = speed.current; telemetry.current.distance = distance.current;
    if (motion.current) motion.current.position.z = distance.current % 28;
    if (world.current) world.current.position.x = THREE.MathUtils.damp(world.current.position.x, -targetLane * 2.9, 0.75, dt);
    roadTexture.offset.y -= moved / 280;
  });

  return (
    <>
      <fog attach="fog" args={["#c9d3d1", 90, 230]} />
      <hemisphereLight args={["#eff9ff", "#879779", 2.7]} /><directionalLight position={[-30, 40, -60]} intensity={2.5} color="#fff1d7" />
      <group ref={world}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -125]}><planeGeometry args={[13, 310]} /><meshStandardMaterial map={roadTexture} roughness={0.96} color="#c0c4c5" /></mesh>
        {[-1, 1].map(side => <group key={side}><mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * 6.06, 0.015, -125]}><planeGeometry args={[0.13, 310]} /><meshStandardMaterial color="#f8f5df" /></mesh><mesh position={[side * 7.4, 0.65, -125]}><boxGeometry args={[0.11, 0.23, 310]} /><meshStandardMaterial color="#b6c5c4" metalness={0.75} roughness={0.4} /></mesh></group>)}
        <group ref={motion}>
          {Array.from({ length: 44 }, (_, i) => <group key={i} position={[0, 0, -i * 7]}><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[0.13, 3.7]} /><meshStandardMaterial color="#fff8d8" /></mesh>{[-1, 1].map(side => <group key={side} position={[side * 7.45, 0, 0]}><mesh position={[0, 0.35, 0]}><boxGeometry args={[0.13, 0.7, 0.12]} /><meshStandardMaterial color="#dde4df" metalness={0.4} roughness={0.5} /></mesh><mesh position={[side * -0.05, 0.83, 0]}><boxGeometry args={[0.14, 0.08, 0.2]} /><meshBasicMaterial color="#f5d49d" /></mesh></group>)}</group>)}
        </group>
      </group>
    </>
  );
});

export default DrivingWorld;
