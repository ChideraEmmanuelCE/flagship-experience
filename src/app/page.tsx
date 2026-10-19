"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CHAPTERS } from "@/lib/chapters";

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050508]">
      <div className="text-white/40 text-sm tracking-widest uppercase">
        Initializing
      </div>
    </div>
  ),
});

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      setProgress(p);
      const chapterIndex = Math.min(CHAPTERS.length - 1, Math.floor((scrollTop + window.innerHeight / 2) / window.innerHeight));
      setActiveChapter(chapterIndex);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0">
        <Experience progress={progress} activeChapter={activeChapter} />
      </div>
      <div className="scroll-track relative z-10" style={{ height: "700vh" }}>
        {CHAPTERS.map((chapter, i) => (
          <section key={chapter.id} className="h-[100vh] relative" aria-label={chapter.title}>
            <div
              className="chapter-overlay"
              style={{
                opacity: activeChapter === i ? 1 : Math.abs(activeChapter - i) === 1 ? 0.15 : 0,
                transition: "opacity 0.6s ease",
              }}
            >
              <p className="text-xs tracking-[0.35em] uppercase text-white/40 mb-4">
                {String(i + 1).padStart(2, "0")} — {chapter.stage}
              </p>
              <h1>{chapter.title}</h1>
              <p>{chapter.subtitle}</p>
            </div>
          </section>
        ))}
      </div>
      <div className="progress-rail" aria-hidden>
        <div className="progress-fill" style={{ height: `${progress * 100}%` }} />
      </div>
    </>
  );
}
