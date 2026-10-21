"use client";

import dynamic from "next/dynamic";
import Icon from "@/components/Icon";

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => <div className="scene-loading"><span className="loading-orbit" /><p>Preparing your seat…</p></div>,
});

export default function Home() {
  return (
    <>
      <header className="site-header wrap">
        <a className="identity" href="#top" aria-label="Chidera Emmanuel home"><span className="identity-mark">ce<span><Icon name="dot" size="1em" /></span></span><span>CHIDERA EMMANUEL<small>INDEPENDENT BUILDER & CREATIVE DEVELOPER</small></span></a>
        <nav aria-label="Main navigation"><a href="#experience">Experience</a><a href="/case-study">Selected work</a><a className="nav-contact" href="mailto:chideraemmanuelokpala@gmail.com">Let’s talk <Icon name="arrow-up-right" /></a></nav>
      </header>
      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> EXPLORATIONS AT THE EDGE OF POSSIBLE</p><h1 id="hero-title">What if the next<br />move began<br />in your <em>mind?</em><span className="title-spark" aria-hidden="true"><Icon name="asterisk" size="1em" /></span></h1><p className="hero-description">An accessible driving concept built around choice, comfort, and the feeling of going somewhere. Choose your controls. Find your own pace.</p><a className="primary-link" href="#experience">Step inside the experience <Icon name="arrow-right" /></a></div>
          <div className="hero-aside">
            <div className="concept-orbit" aria-hidden="true"><div className="orbit o-one" /><div className="orbit o-two" /><div className="orbit o-three" /><svg className="brain-art" viewBox="0 0 250 250" fill="none"><path d="M122 177c-20 19-44 4-42-17-26 3-38-25-24-42-22-20-9-51 14-51-3-25 29-40 45-22 5-15 25-16 34-3 24-17 47 5 43 24 26 4 38 28 23 47 18 23 2 47-21 47 4 26-31 41-48 22-8 11-21 9-24-5Z" stroke="currentColor" strokeWidth="1.7"/><path d="M122 177V54m0 29-25-10-15 18m40 26-27-2-14 23m41 7-22 12m25-77 27-12 17 14m-44 33 31-3 20 19m-51 18 27 10m-77-56-13 15m113-13 9 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="97" cy="73" r="4" fill="currentColor"/><circle cx="155" cy="112" r="4" fill="currentColor"/><circle cx="100" cy="157" r="4" fill="currentColor"/><circle cx="169" cy="82" r="4" fill="currentColor"/></svg><span className="orbit-point point-one" /><span className="orbit-point point-two" /><span className="orbit-tag">INTENTION <Icon name="arrow-right" size={9} /> MOTION</span><span className="orbit-coordinate">N / 001</span></div>
            <div className="hero-aside-note"><span className="small-cross"><Icon name="plus" size="1em" /></span><p>Hands at rest.<br /><strong>Possibility in motion.</strong></p><span className="study-number">A CONCEPT STUDY<br />BY CHIDERA EMMANUEL</span></div>
          </div>
          <div className="hero-bottom"><span>DESIGN <Icon name="cross" size={9} /> CODE <Icon name="cross" size={9} /> CURIOSITY</span><span>SCROLL TO EXPLORE <Icon name="arrow-down" size={10} /></span></div>
        </section>
        <section id="experience" className="experience-section" aria-labelledby="experience-title">
          <div className="wrap">
            <div className="section-heading"><div><p className="eyebrow">01 / THE EXPERIENCE</p><h2 id="experience-title">A different kind<br />of <em>drive.</em></h2></div><p>Choose a scenic escape, settle into the cabin, and make the next move yours. Designed with people with limited mobility in mind, with adaptable controls and a personal journey journal.</p></div>
            <Experience />
            <div className="experience-caption"><span><span className="status-dot" /> A WINDOW INTO A POSSIBLE FUTURE</span><p>A photoreal cockpit, a live 3D road, and an imagined neural connection. Choose cabin or driver’s-eye view. This simulator does not read thoughts or control a real car.</p></div>
          </div>
        </section>
        <section id="how-it-works" className="thinking-section wrap" aria-labelledby="thinking-title">
          <div className="thinking-intro"><p className="eyebrow">02 / THE THINKING BEHIND IT</p><h2 id="thinking-title">No hands.<br />Just <em>intention.</em></h2><p>The idea is simple: what if choosing a direction could be enough? This concept explores the feeling of driving through adaptable inputs, assisted movement, and time to choose.</p><a href="https://www.ninds.nih.gov/current-research/focus-tools-topics/focus-neural-engineering-research" target="_blank" rel="noreferrer" className="text-link">Explore the science of neural interfaces <Icon name="arrow-up-right" /></a></div>
          <div className="thinking-steps">
            <article><span className="step-number">01</span><div><h3>A signal begins.</h3><p>Brain–computer interfaces study patterns in brain activity to create commands for external devices. In this imagined drive, the headband represents that sensing stage.</p></div><span className="step-icon"><Icon name="signal" size="1em" /></span></article>
            <article><span className="step-number">02</span><div><h3>Intention becomes a command.</h3><p>The concept translates a selected intention into “cruise,” “change lane,” or “brake.” The blue pulse shows the signal travelling from the driver to the car.</p></div><span className="step-icon"><Icon name="arrow-up-right" size="1em" /></span></article>
            <article><span className="step-number">03</span><div><h3>The world moves forward.</h3><p>The road flows toward you and speed responds to your choices. Still scenery is available for comfort. Your virtual distance and active time become a daily journey journal.</p></div><span className="step-icon"><Icon name="arrow-right" size="1em" /></span></article>
          </div>
        </section>
        <section className="accessibility-note wrap" aria-labelledby="accessibility-title"><span><Icon name="heart" size={26} /></span><div><p className="eyebrow">BUILT AROUND THE PERSON</p><h3 id="accessibility-title">Different ways to choose. The same open road.</h3><p>Large controls, keyboard shortcuts, single-switch scanning, a gentle pace, and a steady-view option. Choose settings that suit you, without sharing a diagnosis. This is an early concept; feedback from disabled users should shape what comes next.</p></div></section>
        <section className="selected-work-home wrap" aria-labelledby="selected-work-title"><div><p className="eyebrow">SELECTED WORK</p><h2 id="selected-work-title">Access, in<br /><em>different forms.</em></h2><p>Explore the decisions behind Neural Drive and my local hiring platform, LocHire.</p><a className="text-link" href="/case-study">Read the case study <Icon name="arrow-right" size={17}/></a></div><a className="lochire-home-card" href="https://lochire.ng" target="_blank" rel="noreferrer"><span className="eyebrow">ALSO BUILDING / LIVE PLATFORM</span><strong>LocHire <Icon name="arrow-up-right" size={27}/></strong><p>Find local workers.<br />Find work near you.</p><span>Connecting workers and hirers nearby in Nigeria.</span></a></section>
        <section className="about-section wrap" id="about"><div className="about-label"><p className="eyebrow">03 / THE BUILDER</p><span className="about-asterisk" aria-hidden="true"><Icon name="asterisk" size="1em" /></span></div><div><h2>I build ideas you<br />can <em>step into.</em></h2><p>I’m Chidera Emmanuel. I explore the space between thoughtful design and working software, turning “what if” into something you can experience.</p><a className="primary-link" href="mailto:chideraemmanuelokpala@gmail.com">Have something in mind? <Icon name="arrow-up-right" /></a></div></section>
      </main>
      <footer className="site-footer wrap"><a className="footer-signature" href="#top">Chidera Emmanuel<span>© {new Date().getFullYear()}</span></a><span>BUILT WITH INTENTION.</span><a href="#top">Back to top <Icon name="arrow-up" size={11} /></a></footer>
    </>
  );
}
