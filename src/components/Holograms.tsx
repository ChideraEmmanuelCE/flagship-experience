"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: number;
  activeChapter: number;
};

const PROJECTS = [
  { label: "Neural OS", offset: 0 },
  { label: "Agency Core", offset: 1 },
  { label: "Vision Engine", offset: 2 },
  { label: "Future Stack", offset: 3 },
];

export default function Holograms({ progress, activeChapter }: Props) {
  const group = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    return PROJECTS.map((p, i) => {
      const angle = (i / PROJECTS.length) * Math.PI * 2;
      return {
        ...p,
        x: Math.cos(angle) * 3.8,
        z: Math.sin(angle) * 3.2 - 1.5,
        y: 1.4 + (i % 2) * 0.5,
        phase: i * 1.2,
      };
    });
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const item = items[i];
      if (!item) return;
      child.position.y = item.y + Math.sin(t * 1.1 + item.phase) * 0.12;
      child.rotation.y = t * 0.25 + item.phase;
    });
  });

  const visibility = Math.max(0, Math.min(1, (progress - 0.25) * 2.2));
  if (visibility < 0.05) return null;

  return (
    <group ref={group} visible={visibility > 0.05}>
      {items.map((item) => (
        <group key={item.label} position={[item.x, item.y, item.z]}>
          <mesh>
            <planeGeometry args={[1.1, 0.7]} />
            <meshStandardMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={0.4 + visibility * 0.6}
              transparent
              opacity={0.15 + visibility * 0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.18, 0.78]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.08 + visibility * 0.12}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ff2d6a"
              emissive="#ff2d6a"
              emissiveIntensity={0.9 + visibility}
              transparent
              opacity={0.7 + visibility * 0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
