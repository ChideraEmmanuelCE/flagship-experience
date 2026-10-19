"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type EnvType = "void" | "workshop" | "lab" | "warroom" | "city" | "orbit" | "future";

type Props = {
  type: EnvType;
  progress: number;
};

export default function Environment({ type, progress }: Props) {
  const gridRef = useRef<THREE.GridHelper>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const floatingCount = 40;
  const floatPositions = useMemo(() => {
    const arr = new Float32Array(floatingCount * 3);
    for (let i = 0; i < floatingCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = Math.random() * 8 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (gridRef.current) {
      gridRef.current.position.z = ((t * 0.4) % 2) - 1;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.03;
    }
  });

  const envColor = useMemo(() => {
    switch (type) {
      case "void": return "#050508";
      case "workshop": return "#0a0a12";
      case "lab": return "#060a14";
      case "warroom": return "#0c0608";
      case "city": return "#070a12";
      case "orbit": return "#03050c";
      case "future": return "#050510";
      default: return "#050508";
    }
  }, [type]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={envColor} roughness={0.9} metalness={0.1} transparent opacity={0.9} />
      </mesh>
      <gridHelper ref={gridRef} args={[30, 40, "#1a1a2e", "#0f0f18"]} position={[0, 0.01, 0]} />
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={floatingCount} array={floatPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color={type === "failure" ? "#ff2d6a" : "#00f0ff"}
          transparent
          opacity={0.35 + progress * 0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh position={[0, 3, -12]}>
        <planeGeometry args={[24, 8]} />
        <meshBasicMaterial
          color={type === "breakthrough" || type === "future" ? "#00f0ff" : "#12122a"}
          transparent
          opacity={0.12 + progress * 0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
