"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  progress: number;
  controlStrength: number;
  activeChapter: number;
};

export default function ThoughtSystem({ progress, controlStrength }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const particleCount = 180;

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.8;
      positions[i3 + 1] = 1.2 + Math.random() * 1.2;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.6;
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.015;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      const mix = Math.random();
      colors[i3] = mix;
      colors[i3 + 1] = 0.7 - mix * 0.5;
      colors[i3 + 2] = 1.0;
    }
    return { positions, velocities, colors };
  }, []);

  const linePositions = useMemo(() => {
    const count = 24;
    const arr = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      arr[i6] = 0;
      arr[i6 + 1] = 1.25;
      arr[i6 + 2] = 0.2;
      const a = (i / count) * Math.PI * 2;
      const r = 1.2 + Math.random() * 1.8;
      arr[i6 + 3] = Math.cos(a) * r;
      arr[i6 + 4] = 1.0 + Math.sin(a * 2) * 0.6;
      arr[i6 + 5] = Math.sin(a) * r * 0.6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const strength = 0.3 + controlStrength * 1.4;
        pos[i3] += velocities[i3] * strength + Math.sin(t + i) * 0.002;
        pos[i3 + 1] += velocities[i3 + 1] * strength;
        pos[i3 + 2] += velocities[i3 + 2] * strength;
        const dist = Math.sqrt(pos[i3] ** 2 + (pos[i3 + 1] - 1.5) ** 2 + pos[i3 + 2] ** 2);
        if (dist > 4.5 || pos[i3 + 1] > 4) {
          pos[i3] = (Math.random() - 0.5) * 0.6;
          pos[i3 + 1] = 1.3 + Math.random() * 0.8;
          pos[i3 + 2] = (Math.random() - 0.5) * 0.5;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.05;
    }
    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.15 + controlStrength * 0.45 + Math.sin(t * 3) * 0.05;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
