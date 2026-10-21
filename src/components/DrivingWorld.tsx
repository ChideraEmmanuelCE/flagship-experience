"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { routes, type RouteId, type Telemetry } from "@/lib/drive";

export type DrivingTelemetry = Telemetry;
type Props = { active: boolean; still: boolean; targetLane: number; route: RouteId; view: "cabin" | "driver"; telemetry: RefObject<Telemetry> };

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

export default memo(function DrivingWorld({ active, still, targetLane, route, view, telemetry }: Props) {
  const motion = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  const roadTexture = useMemo(createRoadTexture, []);
  const { camera, invalidate } = useThree();
  useEffect(() => () => roadTexture.dispose(), [roadTexture]);
  useEffect(() => { camera.lookAt(0, view === "driver" ? -9 : -20, -80); invalidate(); }, [camera, view, route, still, invalidate]);
  useFrame((_, delta) => {
    if (!active || still) return;
    const distance = telemetry.current.distance;
    if (motion.current) motion.current.position.z = distance % 28;
    if (world.current) world.current.position.x = THREE.MathUtils.damp(world.current.position.x, -targetLane * 2.9, .75, Math.min(delta, .06));
    roadTexture.offset.y = -distance / 280;
  });
  const fog = routes.find(r => r.id === route)!.color;
  return <>
    <fog attach="fog" args={[fog, 90, 230]} />
    <hemisphereLight args={["#eff9ff", "#879779", 2.7]} /><directionalLight position={[-30, 40, -60]} intensity={2.5} color="#fff1d7" />
    <group ref={world}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -125]}><planeGeometry args={[13, 310]} /><meshStandardMaterial map={roadTexture} roughness={.96} color={route === "city" ? "#b7bec9" : "#c0c4c5"} /></mesh>
      {[-1, 1].map(side => <group key={side}><mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * 6.06, .015, -125]}><planeGeometry args={[.13, 310]} /><meshStandardMaterial color="#f8f5df" /></mesh><mesh position={[side * 7.4, route === "city" ? .12 : .65, -125]}><boxGeometry args={[route === "city" ? .45 : .11, .23, 310]} /><meshStandardMaterial color={route === "city" ? "#c9c6ba" : "#b6c5c4"} metalness={route === "city" ? .05 : .75} roughness={.5} /></mesh></group>)}
      <group ref={motion}>{Array.from({ length: 44 }, (_, i) => <group key={i} position={[0, 0, -i * 7]}><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .02, 0]}><planeGeometry args={[.13, 3.7]} /><meshStandardMaterial color="#fff8d8" /></mesh>{route !== "city" && [-1, 1].map(side => <group key={side} position={[side * 7.45, 0, 0]}><mesh position={[0, .35, 0]}><boxGeometry args={[.13, .7, .12]} /><meshStandardMaterial color="#dde4df" metalness={.4} roughness={.5} /></mesh><mesh position={[side * -.05, .83, 0]}><boxGeometry args={[.14, .08, .2]} /><meshBasicMaterial color="#f5d49d" /></mesh></group>)}</group>)}</group>
    </group>
  </>;
});
