"use client";

import dynamic from "next/dynamic";

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => <div className="scene-loading"><span className="loading-orbit" /><p>Preparing your seat…</p></div>,
});

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Home() {
  return (
    <>
      <header className="site-header wrap">
        <a className="identity" href="#top" aria-label="Chidera Emmanuel home"><span className="identity-mark">ce<span>•</span></span><span>CHIDERA EMMANUEL<small>INDEPENDENT BUILDER & CREATIVE DEVELOPER</small></span></a>
        <nav aria-label="Main navigation"><a href="#experience">Experience</a><a href="#how-it-works">The thinking</a><a className="nav-contact" href="mailto:chideraemmanuelokpala@gmail.com">Let’s talk <Arrow diagonal /></a></nav>
      </header>
      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> EXPLORATIONS AT THE EDGE OF POSSIBLE</p><h1 id="hero-title">What if the next<br />move began<br />in your <em>mind?</em><span className="title-spark">✳</span></h1><p className="hero-description">An exploration of human intention, intelligent machines, and a more intuitive way to move through the world.</p><a className="primary-link" href="#experience">Step inside the experience <Arrow /></a></div>
          <div className="hero-aside">
            <div className="concept-orbit" aria-hidden="true"><div className="orbit o-one" /><div className="orbit o-two" /><div className="orbit o-three" /><svg className="brain-art" viewBox="0 0 250 250" fill="none"><path d="M122 177c-20 19-44 4-42-17-26 3-38-25-24-42-22-20-9-51 14-51-3-25 29-40 45-22 5-15 25-16 34-3 24-17 47 5 43 24 26 4 38 28 23 47 18 23 2 47-21 47 4 26-31 41-48 22-8 11-21 9-24-5Z" stroke="currentColor" strokeWidth="1.7"/><path d="M122 177V54m0 29-25-10-15 18m40 26-27-2-14 23m41 7-22 12m25-77 27-12 17 14m-44 33 31-3 20 19m-51 18 27 10m-77-56-13 15m113-13 9 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="97" cy="73" r="4" fill="currentColor"/><circle cx="155" cy="112" r="4" fill="currentColor"/><circle cx="100" cy="157" r="4" fill="currentColor"/><circle cx="169" cy="82" r="4" fill="currentColor"/></svg><span className="orbit-point point-one" /><span className="orbit-point point-two" /><span className="orbit-tag">INTENTION → MOTION</span><span className="orbit-coordinate">N / 001</span></div>
            <div className="hero-aside-note"><span className="small-cross">+</span><p>Hands at rest.<br /><strong>Possibility in motion.</strong></p><span className="study-number">A CONCEPT STUDY<br />BY CHIDERA EMMANUEL</span></div>
          </div>
          <div className="hero-bottom"><span>DESIGN × CODE × CURIOSITY</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>
        <section id="experience" className="experience-section" aria-labelledby="experience-title">
          <div className="wrap">
            <div className="section-heading"><div><p className="eyebrow">01 / THE EXPERIENCE</p><h2 id="experience-title">A different kind<br />of <em>drive.</em></h2></div><p>You’re in the back seat. The driver is up front, hands on his lap. Follow the glowing connection from his head to the dashboard. His intention sets the car in motion.</p></div>
            <Experience />
            <div className="experience-caption"><span><span className="status-dot" /> A WINDOW INTO A POSSIBLE FUTURE</span><p>A photoreal cockpit, a live 3D road, and an imagined neural connection. This is an interactive concept, not a working brain interface.</p></div>
          </div>
        </section>
        <section id="how-it-works" className="thinking-section wrap" aria-labelledby="thinking-title">
          <div className="thinking-intro"><p className="eyebrow">02 / THE THINKING BEHIND IT</p><h2 id="thinking-title">No hands.<br />Just <em>intention.</em></h2><p>The idea is simple: what if a car could respond to the action you intend to take, before your hands ever reach the wheel?</p><a href="https://www.ninds.nih.gov/current-research/focus-tools-topics/focus-neural-engineering-research" target="_blank" rel="noreferrer" className="text-link">Explore the science of neural interfaces <Arrow diagonal /></a></div>
          <div className="thinking-steps">
            <article><span className="step-number">01</span><div><h3>A signal begins.</h3><p>Brain–computer interfaces study patterns in brain activity to create commands for external devices. In this imagined drive, the headband represents that sensing stage.</p></div><span className="step-icon">⌁</span></article>
            <article><span className="step-number">02</span><div><h3>Intention becomes a command.</h3><p>The concept translates a selected intention into “cruise,” “change lane,” or “brake.” The blue pulse shows the signal travelling from the driver to the car.</p></div><span className="step-icon">↗</span></article>
            <article><span className="step-number">03</span><div><h3>The world moves forward.</h3><p>The road flows toward you, the speed display responds, and the view shifts gently with a lane change. The driver’s hands stay at rest.</p></div><span className="step-icon">→</span></article>
          </div>
        </section>
        <section className="about-section wrap" id="about"><div className="about-label"><p className="eyebrow">03 / THE BUILDER</p><span className="about-asterisk" aria-hidden="true">✳</span></div><div><h2>I build ideas you<br />can <em>step into.</em></h2><p>I’m Chidera Emmanuel. I explore the space between thoughtful design and working software, turning “what if” into something you can experience.</p><a className="primary-link" href="mailto:chideraemmanuelokpala@gmail.com">Have something in mind? <Arrow diagonal /></a></div></section>
      </main>
      <footer className="site-footer wrap"><a className="footer-signature" href="#top">Chidera Emmanuel<span>© {new Date().getFullYear()}</span></a><span>BUILT WITH INTENTION.</span><a href="#top">Back to top ↑</a></footer>
    </>
  );
}
