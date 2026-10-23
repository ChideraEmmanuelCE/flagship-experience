import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "LocHire | Selected work by Chidera Emmanuel",
  description: "LocHire, a local hiring platform in Nigeria. Product direction, development and the next questions to test.",
};

export default function CaseStudy() {
  return <>
    <header className="site-header wrap"><Link className="identity" href="/" aria-label="Chidera Emmanuel home"><span className="identity-mark">ce<span><Icon name="dot" size="1em" /></span></span><span>CHIDERA EMMANUEL<small>SELECTED WORK / PRODUCT & DEVELOPMENT</small></span></Link><nav aria-label="Case study navigation"><a href="#lochire">LocHire</a><Link className="nav-contact" href="/services.html">Work with me <Icon name="arrow-up-right" /></Link></nav></header>
    <main className="case-study wrap">
      <section className="case-hero"><p className="eyebrow">SELECTED WORK</p><h1>Making local work<br /><em>easier to find.</em></h1><p>LocHire connects workers and hirers through a clearer digital journey.</p><div className="case-tags"><span>Product direction</span><span>Web development</span><span>AI-assisted development</span></div></section>
      <article id="lochire" className="case-project lochire-case"><div className="case-project-header"><div><p className="eyebrow">01 / LOCHIRE</p><h2>Good work starts<br /><em>close to home.</em></h2></div><span className="case-status"><span className="status-dot"/> Live platform</span></div><p className="case-lead">A local hiring platform connecting people who need help with workers nearby in Nigeria. Workers can present their skills and area; hirers can look for help with cleaning, cooking, repairs and other local work.</p><div className="lochire-flow" aria-label="LocHire public product journey"><div><span>01</span><h3>Find a person or job.</h3><p>Discover work and help nearby.</p></div><Icon name="arrow-right" size={24}/><div><span>02</span><h3>Talk and agree.</h3><p>Discuss pay and the work dates.</p></div><Icon name="arrow-right" size={24}/><div><span>03</span><h3>Finish and review.</h3><p>Reviews open after the job ends.</p></div></div><div className="case-columns"><section><p className="eyebrow">MY ROLE</p><h3>Turn local hiring into a clearer journey.</h3><p>I lead LocHire’s product direction and development, shaping the worker and hirer flows through repeated build-and-review cycles with AI assistance.</p><p>The public experience introduces nearby work discovery, profiles, agreements and post-job reviews. The live homepage was reviewed on 21 October 2026.</p></section><section><p className="eyebrow">NEXT EVIDENCE TO GATHER</p><h3>Follow real hiring outcomes.</h3><p>The next validation goal is to observe workers creating profiles and hirers moving from discovery to an agreement. Track where they need help and whether a working relationship follows.</p><p>No user totals, completed hires, revenue or payment-activation claims are included in this showcase.</p></section></div><div className="case-actions"><a className="primary-link" href="https://lochire.ng" target="_blank" rel="noreferrer">Visit LocHire <Icon name="arrow-up-right"/></a></div></article>
      <section className="case-closing"><p className="eyebrow">CHIDERA EMMANUEL / INDEPENDENT BUILDER</p><h2>Have a business<br /><em>idea in mind?</em></h2><p>Explore my website and prototype services, then tell me what you need.</p><Link className="primary-link" href="/services.html">Services and pricing <Icon name="arrow-up-right"/></Link></section>
    </main>
    <footer className="site-footer wrap"><Link className="footer-signature" href="/">Chidera Emmanuel<span>© 2026</span></Link><span>SELECTED WORK / LOCHIRE</span><Link href="/services.html">View services <Icon name="arrow-up-right" size={14}/></Link></footer>
  </>;
}
