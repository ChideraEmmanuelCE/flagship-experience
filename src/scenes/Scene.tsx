"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Character from "@/components/Character";
import HoverCar from "@/components/HoverCar";
import ThoughtSystem from "@/components/ThoughtSystem";
import Environment from "@/components/Environment";
import Holograms from "@/components/Holograms";
import { CHAPTERS } from "@/lib/chapters";

type Props = {
  progress: number;
  activeChapter: number;
};

export default function Scene({ progress, activeChapter }: Props) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    const t = progress;
    const camX = Math.sin(t * Math.PI * 1.5) * 1.8;
    const camY = 1.4 + Math.sin(t * Math.PI * 2) * 0.35;
    const camZ = 5.5 - t * 1.8;
    camera.position.x += (camX - camera.position.x) * 0.06;
    camera.position.y += (camY - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.06;
    const lookTarget = new THREE.Vector3(
      Math.sin(t * Math.PI) * 0.4,
      1.1 + Math.sin(t * 4) * 0.08,
      -t * 2
    );
    camera.lookAt(lookTarget);
  });

  const envType = CHAPTERS[activeChapter]?.environment ?? "void";
  const controlStrength = useMemo(() => {
    const peak = 0.45;
    return Math.min(1, Math.max(0, 1 - Math.abs(progress - peak) * 2.2));
  }, [progress]);

  return (
    <group ref={group}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 8, 3]} intensity={1.1} color="#e8f0ff" castShadow={false} />
      <pointLight position={[-3, 2, 2]} intensity={0.6} color="#00f0ff" distance={12} />
      <pointLight position={[3, 1, -2]} intensity={0.4} color="#ff2d6a" distance={10} />
      <Environment type={envType} progress={progress} />
      <Character progress={progress} activeChapter={activeChapter} />
      <HoverCar progress={progress} controlStrength={controlStrength} activeChapter={activeChapter} />
      <ThoughtSystem progress={progress} controlStrength={controlStrength} activeChapter={activeChapter} />
      <Holograms progress={progress} activeChapter={activeChapter} />
    </group>
  );
}
