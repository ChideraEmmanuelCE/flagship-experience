"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import Scene from "@/scenes/Scene";

type Props = {
  progress: number;
  activeChapter: number;
};

export default function Experience({ progress, activeChapter }: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 1.6, 6], fov: 42, near: 0.1, far: 100 }}
      style={{ background: "#050508" }}
    >
      <color attach="background" args={["#050508"]} />
      <fog attach="fog" args={["#050508", 8, 28]} />
      <Suspense fallback={null}>
        <Scene progress={progress} activeChapter={activeChapter} />
        <Preload all />
      </Suspense>
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
