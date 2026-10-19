"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: number;
  activeChapter: number;
};

/**
 * Stylized founder character — geometric, cinematic silhouette.
 * Arcane / Spider-Verse inspired. Always present.
 */
export default function Character({ progress, activeChapter }: Props) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);

  const mats = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({
        color: "#12121c",
        roughness: 0.45,
        metalness: 0.35,
      }),
      suit: new THREE.MeshStandardMaterial({
        color: "#0c0c14",
        roughness: 0.3,
        metalness: 0.55,
      }),
      skin: new THREE.MeshStandardMaterial({
        color: "#c9a88a",
        roughness: 0.65,
        metalness: 0.05,
      }),
      neural: new THREE.MeshStandardMaterial({
        color: "#00f0ff",
        emissive: "#00f0ff",
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.7,
      }),
      energy: new THREE.MeshStandardMaterial({
        color: "#ff2d6a",
        emissive: "#ff2d6a",
        emissiveIntensity: 1.2,
        roughness: 0.25,
        metalness: 0.4,
      }),
    };
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    group.current.position.y = Math.sin(t * 1.35) * 0.028;
    group.current.position.x = Math.sin(progress * Math.PI) * 0.12;
    group.current.position.z = -progress * 0.55;

    if (head.current) {
      head.current.rotation.y =
        Math.sin(t * 0.55) * 0.14 + (activeChapter - 3) * 0.035;
      head.current.rotation.x = Math.sin(t * 0.7) * 0.045;
    }

    if (torso.current) {
      torso.current.rotation.x = -0.06 + Math.sin(t * 0.45) * 0.025;
    }

    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.7 + Math.sin(t * 4.5) * 0.35 + progress * 0.4;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[-0.17, 0.42, 0]} material={mats.suit}>
        <capsuleGeometry args={[0.11, 0.52, 8, 14]} />
      </mesh>
      <mesh position={[0.17, 0.42, 0]} material={mats.suit}>
        <capsuleGeometry args={[0.11, 0.52, 8, 14]} />
      </mesh>

      <mesh position={[-0.17, 0.08, 0.04]} material={mats.body}>
        <boxGeometry args={[0.2, 0.12, 0.28]} />
      </mesh>
      <mesh position={[0.17, 0.08, 0.04]} material={mats.body}>
        <boxGeometry args={[0.2, 0.12, 0.28]} />
      </mesh>

      <group ref={torso} position={[0, 1.12, 0]}>
        <mesh material={mats.suit}>
          <capsuleGeometry args={[0.26, 0.5, 8, 16]} />
        </mesh>
        <mesh position={[0, 0.05, 0.22]} material={mats.body}>
          <boxGeometry args={[0.38, 0.42, 0.08]} />
        </mesh>
        <mesh ref={core} position={[0, 0.08, 0.28]} material={mats.neural}>
          <sphereGeometry args={[0.055, 20, 20]} />
        </mesh>
      </group>

      <mesh position={[-0.38, 1.38, 0]} material={mats.suit}>
        <sphereGeometry args={[0.13, 16, 16]} />
      </mesh>
      <mesh position={[0.38, 1.38, 0]} material={mats.suit}>
        <sphereGeometry args={[0.13, 16, 16]} />
      </mesh>

      <mesh position={[-0.48, 1.05, 0]} rotation={[0.15, 0, 0.35]} material={mats.suit}>
        <capsuleGeometry args={[0.08, 0.42, 6, 12]} />
      </mesh>
      <mesh position={[0.48, 1.05, 0]} rotation={[0.15, 0, -0.35]} material={mats.suit}>
        <capsuleGeometry args={[0.08, 0.42, 6, 12]} />
      </mesh>

      <group ref={head} position={[0, 1.82, 0]}>
        <mesh material={mats.skin}>
          <sphereGeometry args={[0.21, 28, 28]} />
        </mesh>
        <mesh position={[0, 0.2, 0.01]} rotation={[Math.PI / 2, 0, 0]} material={mats.neural}>
          <torusGeometry args={[0.13, 0.016, 10, 36]} />
        </mesh>
        <mesh position={[-0.18, 0.05, 0.08]} material={mats.energy}>
          <sphereGeometry args={[0.025, 12, 12]} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.08]} material={mats.energy}>
          <sphereGeometry args={[0.025, 12, 12]} />
        </mesh>
      </group>
    </group>
  );
}
