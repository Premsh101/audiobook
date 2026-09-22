"use client";
import {useState} from "react";
import Link from "next/link";
function Mic(){return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="8.5" y="3.5" width="7" height="12" rx="3.5"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V21M9 21h6"/></svg>}
export default function VoicePage(){
 const[file,setFile]=useState<File|null>(null);const[consent,setConsent]=useState(false);const[preview,setPreview]=useState(false);
 return <div className="shell"><header className="container topbar"><Link className="brand" href="/">hush.</Link><nav className="nav"><Link href="/">Explore</Link><Link href="/#voice">Favourite Voice</Link><Link href="/#how">How it works</Link></nav><div className="actions"><Link className="secondary" href="/">← Home</Link></div></header>
 <main className="container"><section className="hero" style={{paddingTop:38}}>
  <div><span className="eyebrow"><i/> Favourite Voice</span><h1 style={{fontSize:"clamp(51px,6.5vw,82px)"}}>Make a story sound <em>personal.</em></h1><p>Upload a clear recording from someone you have permission to clone. Hear five minutes free before you buy a minute pack.</p><div className="hero-note">Your recording stays private. Voice profiles can be removed at any time.</div></div>
  <div className="voice-card" style={{background:"#1c1b18",minHeight:430,color:"#fff",boxShadow:"var(--shadow)"}}>
   <div><div className="avatar">+</div><h3>New favourite voice</h3><small>Upload 1–10 minutes of natural speech</small></div>
   <label style={{display:"block",padding:"22px",border:"1px dashed rgba(255,255,255,.25)",borderRadius:18,marginTop:20,cursor:"pointer"}}><input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0]??null)} style={{display:"none"}}/><strong>{file?file.name:"Choose an audio file"}</strong><div style={{marginTop:6,color:"#aaa29a",fontSize:12}}>MP3, M4A or WAV · quiet room is best</div></label>
   <label style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:12,color:"#bfb7ae",marginTop:18}}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{marginTop:2}}/>I confirm I have permission from the speaker to create and use this voice.</label>
   <button className="primary light" disabled={!file||!consent} onClick={()=>setPreview(true)} style={{marginTop:18,width:"100%",opacity:(!file||!consent)?.42:1}}><Mic/>{preview?"Preview queued":"Create free 5-minute preview"}</button>
   {preview&&<div style={{marginTop:13,padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,.07)",fontSize:12,color:"#d5cdc4"}}>The UI flow is ready. The next build will connect this job to the real TTS worker and credit wallet.</div>}
  </div>
 </section>
 <section className="section"><div className="steps"><div className="step"><div className="step-no">01</div><h3>Upload</h3><p>Give us a clean recording with natural speech and minimal background noise.</p></div><div className="step"><div className="step-no">02</div><h3>Preview free</h3><p>Hear five minutes before spending a single credit.</p></div><div className="step"><div className="step-no">03</div><h3>Buy minutes</h3><p>Generate longer chapters only when you need them. Playback stays yours to revisit.</p></div></div></section>
 </main><footer className="container footer"><div className="footer-row"><small><Link href="/">hush. · Stories, closer.</Link></small><small>Voice cloning requires permission from the speaker.</small></div></footer></div>
}
