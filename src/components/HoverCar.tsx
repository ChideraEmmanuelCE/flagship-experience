"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: number;
  controlStrength: number;
  activeChapter: number;
};

/**
 * Futuristic mind-control supercar.
 * Responds only to thought intensity — no physical contact.
 */
export default function HoverCar({ progress, controlStrength }: Props) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Mesh>(null);

  const mats = useMemo(() => {
    return {
      chassis: new THREE.MeshStandardMaterial({
        color: "#08080f",
        roughness: 0.18,
        metalness: 0.92,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: "#0a0a18",
        roughness: 0.05,
        metalness: 0.95,
        transparent: true,
        opacity: 0.65,
      }),
      energy: new THREE.MeshStandardMaterial({
        color: "#00f0ff",
        emissive: "#00f0ff",
        emissiveIntensity: 1.6,
        roughness: 0.15,
        metalness: 0.4,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: "#ff2d6a",
        emissive: "#ff2d6a",
        emissiveIntensity: 1.0,
        roughness: 0.25,
        metalness: 0.5,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#05050a",
        roughness: 0.4,
        metalness: 0.7,
      }),
    };
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;

    const hoverY = 0.58 + Math.sin(t * 1.9) * 0.07;
    const orbitR = 2.3 + controlStrength * 1.8;
    const speed = 0.32 + controlStrength * 1.1;
    const angle = t * speed + progress * Math.PI * 2.2;

    const tx = Math.cos(angle) * orbitR;
    const tz = Math.sin(angle) * orbitR * 0.65 - progress * 1.35;
    const ty = hoverY + Math.sin(t * 2.6 + progress * 5) * 0.14 * controlStrength;

    group.current.position.x += (tx - group.current.position.x) * 0.055;
    group.current.position.y += (ty - group.current.position.y) * 0.08;
    group.current.position.z += (tz - group.current.position.z) * 0.055;

    group.current.rotation.y = -angle + Math.PI * 0.5;
    group.current.rotation.z = Math.sin(t * 1.7) * 0.1 * controlStrength;
    group.current.rotation.x = Math.sin(t * 1.3) * 0.06 * controlStrength;

    if (glow.current) {
      const m = glow.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.7 + controlStrength * 2.2 + Math.sin(t * 6) * 0.25;
    }
    if (trail.current) {
      const m = trail.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.15 + controlStrength * 0.55;
    }
  });

  return (
    <group ref={group} position={[2.6, 0.6, 0]}>
      <mesh position={[0, 0.14, 0]} material={mats.chassis}>
        <boxGeometry args={[2.05, 0.26, 0.9]} />
      </mesh>

      <mesh position={[0, 0.02, 0.1]} material={mats.dark}>
        <boxGeometry args={[1.85, 0.12, 0.75]} />
      </mesh>

      <mesh position={[0, 0.36, -0.08]} material={mats.glass}>
        <boxGeometry args={[1.15, 0.3, 0.62]} />
      </mesh>

      <mesh position={[0, 0.1, 0.58]} material={mats.chassis}>
        <boxGeometry args={[1.35, 0.16, 0.38]} />
      </mesh>

      <mesh position={[0, 0.22, -0.58]} material={mats.chassis}>
        <boxGeometry args={[1.55, 0.18, 0.28]} />
      </mesh>
      <mesh position={[0, 0.38, -0.62]} material={mats.dark}>
        <boxGeometry args={[1.4, 0.06, 0.12]} />
      </mesh>

      <mesh position={[-0.98, 0.12, 0]} material={mats.accent}>
        <boxGeometry args={[0.06, 0.08, 1.5]} />
      </mesh>
      <mesh position={[0.98, 0.12, 0]} material={mats.accent}>
        <boxGeometry args={[0.06, 0.08, 1.5]} />
      </mesh>

      <mesh position={[0, 0.14, 0.76]} material={mats.energy}>
        <boxGeometry args={[1.15, 0.035, 0.05]} />
      </mesh>

      <mesh
        ref={glow}
        position={[0, -0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={mats.energy}
      >
        <planeGeometry args={[1.8, 0.75]} />
      </mesh>

      <mesh
        ref={trail}
        position={[0, 0.05, -1.1]}
        material={
          new THREE.MeshStandardMaterial({
            color: "#00f0ff",
            emissive: "#00f0ff",
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
          })
        }
      >
        <boxGeometry args={[0.6, 0.04, 0.9]} />
      </mesh>
    </group>
  );
}
