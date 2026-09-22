"use client";

import { useState } from "react";
import Link from "next/link";

function Mic(){return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="8.4" y="3.2" width="7.2" height="12.4" rx="3.6"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V21M9 21h6"/></svg>}
function Arrow(){return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>}

export default function VoicePage(){
  const [file,setFile]=useState<File|null>(null);
  const [consent,setConsent]=useState(false);
  const [preview,setPreview]=useState(false);

  return <div className="site">
    <header className="topbar"><div className="nav-wrap">
      <Link href="/" className="brand">hush<span>.</span></Link>
      <nav><a href="/#discover">Discover</a><a href="/#classics">Library</a><a href="/#voice">Favourite Voice</a><a href="/#plans">Plans</a></nav>
      <div className="nav-actions"><Link className="nav-ghost" href="/">← Home</Link></div>
    </div></header>

    <main>
      <section className="container hero voice-page-hero">
        <div className="hero-copy">
          <span className="eyebrow"><i/> Favourite Voice</span>
          <h1>Give a story a voice that feels <em>familiar.</em></h1>
          <p>Upload a clean recording from someone you have permission to clone. Hear a five-minute preview free, then use listening credits for longer chapters.</p>
          <div className="trust-row"><span><b>5 min</b> free preview</span><span><b>Private</b> voice profile</span><span><b>Global</b> pricing later</span></div>
        </div>
        <div className="voice-demo voice-builder">
          <div className="demo-top"><div className="demo-avatar">+</div><div><span>NEW VOICE</span><strong>{file ? file.name : "Favourite person"}</strong></div><span className="demo-private">STEP 1 / 3</span></div>
          <label className="upload-box"><input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0]??null)}/><span className="upload-icon"><Mic/></span><strong>{file ? "Recording ready" : "Choose an audio recording"}</strong><small>MP3, M4A or WAV · 1–10 minutes · quiet room is best</small></label>
          <label className="consent-line"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I confirm I have permission from the speaker to create and use this voice.</span></label>
          <button className="button-dark full" disabled={!file||!consent} onClick={()=>setPreview(true)}><Mic/>{preview ? "Preview job queued" : "Create my free 5-minute preview"}</button>
          {preview && <div className="queued">Prototype flow ready. The TTS worker and credit wallet will plug into this job next.</div>}
        </div>
      </section>

      <section className="container plan-section voice-steps">
        <div className="plan-copy"><span className="section-eyebrow">HOW IT WORKS</span><h2>Three steps.<br/>Nothing else.</h2><p>We keep the product focused: create a voice, preview a story, then spend credits only when you want more personalised listening.</p></div>
        <div className="steps-grid">
          <div><div>01</div><strong>Create the voice</strong><p>Upload clear speech and confirm permission.</p></div>
          <div><div>02</div><strong>Preview free</strong><p>Hear five minutes before you buy anything.</p></div>
          <div><div>03</div><strong>Buy minutes</strong><p>Generate longer chapters on demand and replay them without regenerating.</p></div>
        </div>
      </section>
    </main>

    <footer className="container footer"><div className="footer-main"><Link href="/" className="brand">hush<span>.</span></Link><span>Voice cloning requires permission from the speaker.</span></div><div className="footer-links"><a href="/">Home</a><a href="/#classics">Library</a></div></footer>
  </div>;
}
