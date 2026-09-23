"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Book={id:string;title:string;author:string;durationLabel:string;genre:string};
type Job={id:string;type:string;status:string;book:{slug:string;title:string};outputUrl?:string|null;createdAt:string};
type Profile={id:string;displayName:string;relationship?:string|null;language:string;consentStatus:string;status:string;jobs:Job[]};
type Package={id:string;code:string;amount:number;currency:string;durationSeconds:number};
type Viewer={name?:string|null;email?:string|null;mobile?:string|null};

function Mic(){return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="8.4" y="3.2" width="7.2" height="12.4" rx="3.6"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V21M9 21h6"/></svg>}
function Arrow(){return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>}

export default function VoicePage(){
  const [viewer,setViewer]=useState<Viewer|null>(null);
  const [books,setBooks]=useState<Book[]>([]);
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [packages,setPackages]=useState<Package[]>([]);
  const [displayName,setDisplayName]=useState("");
  const [relationship,setRelationship]=useState("");
  const [language,setLanguage]=useState("en");
  const [bookId,setBookId]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [consent,setConsent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    const [me, catalog, voice, products]=await Promise.all([
      fetch("/api/auth/me",{cache:"no-store"}).then(r=>r.json()),
      fetch("/api/books",{cache:"no-store"}).then(r=>r.ok?r.json():[]).catch(()=>[]),
      fetch("/api/voice",{cache:"no-store"}),
      fetch("/api/wallet/products?country=US",{cache:"no-store"}).then(r=>r.ok?r.json():[]).catch(()=>[])
    ]);
    setViewer(me.user??null);
    setBooks(catalog);
    setPackages(products);
    if(voice.ok){
      const data=await voice.json();
      setProfiles(data.profiles??[]);
    }
  }

  useEffect(()=>{void load()},[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);setError("");setMessage("");
    if(!viewer){window.location.href="/login";return;}
    if(!file||!bookId||!consent){
      setError("Choose a recording, pick a story and confirm permission.");
      setBusy(false);return;
    }
    const form=new FormData();
    form.set("displayName",displayName);
    form.set("relationship",relationship);
    form.set("language",language);
    form.set("bookId",bookId);
    form.set("consent","true");
    form.set("file",file);

    try{
      const res=await fetch("/api/voice",{method:"POST",body:form});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Could not create the voice.");
      setMessage("Your voice profile is queued. The five-minute preview will appear here when the TTS worker completes it.");
      setFile(null);setConsent(false);setDisplayName("");setRelationship("");
      await load();
    }catch(err){
      setError(err instanceof Error?err.message:"Could not create the voice.");
    }finally{setBusy(false);}
  }

  const selectedBook=books.find(book=>book.id===bookId);
  const formatMinutes=(seconds:number)=>Math.max(1,Math.floor(seconds/60));
  const activeProfile=profiles[0];

  return <div className="site">
    <header className="topbar"><div className="nav-wrap">
      <Link href="/" className="brand">hush<span>.</span></Link>
      <nav><a href="/#discover">Discover</a><a href="/#classics">Library</a><a href="/#voice">Favourite Voice</a><a href="/#plans">Plans</a></nav>
      <div className="nav-actions">{viewer?<Link className="nav-ghost" href="/account">Account</Link>:<Link className="nav-ghost" href="/login">Sign in</Link>}</div>
    </div></header>

    <main>
      <section className="container hero voice-page-hero">
        <div className="hero-copy">
          <span className="eyebrow"><i/> Favourite Voice</span>
          <h1>Give a story a voice that feels <em>familiar.</em></h1>
          <p>Use a clean recording from someone you have permission to clone. Pick a story, create the voice, and we queue a five-minute preview.</p>
          <div className="trust-row"><span><b>5 min</b> free preview</span><span><b>Private</b> voice sample</span><span><b>Credit-based</b> longer listening</span></div>
        </div>

        <form className="voice-demo voice-builder" onSubmit={submit}>
          <div className="demo-top"><div className="demo-avatar">{displayName?displayName[0].toUpperCase():"+"}</div><div><span>NEW VOICE</span><strong>{displayName||"Favourite person"}</strong></div><span className="demo-private">{busy?"QUEUING":"STEP 1 / 3"}</span></div>

          <div className="voice-form-grid">
            <label className="voice-field">VOICE NAME<input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Mum, Dad, Grandma…"/></label>
            <label className="voice-field">RELATIONSHIP<input value={relationship} onChange={e=>setRelationship(e.target.value)} placeholder="Optional"/></label>
          </div>

          <label className="voice-field">STORY
            <select value={bookId} onChange={e=>setBookId(e.target.value)}>
              <option value="">Choose a story for your free preview</option>
              {books.map(book=><option key={book.id} value={book.id}>{book.title} — {book.author}</option>)}
            </select>
          </label>

          <label className="upload-box"><input type="file" accept=".mp3,.m4a,.wav,audio/*" onChange={(e:ChangeEvent<HTMLInputElement>)=>setFile(e.target.files?.[0]??null)}/><span className="upload-icon"><Mic/></span><strong>{file?file.name:"Choose an audio recording"}</strong><small>MP3, M4A or WAV · up to 30 MB · a quiet recording works best</small></label>

          <label className="consent-line"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I confirm I have permission from the speaker to create and use this voice.</span></label>

          {error&&<div className="voice-alert error">{error}</div>}
          {message&&<div className="voice-alert success">{message}</div>}

          <button className="button-dark full" disabled={busy||!viewer}>{busy?"Creating your preview…":viewer?<><Mic/> Create my free 5-minute preview</>:<>Sign in to start <Arrow/></>}</button>
          {selectedBook&&<div className="voice-selection">Preview story: <strong>{selectedBook.title}</strong> · {selectedBook.durationLabel}</div>}
        </form>
      </section>

      <section className="container voice-dashboard">
        <div className="dashboard-title"><div><span className="section-eyebrow">YOUR VOICES</span><h2>What you have created</h2></div><span>{activeProfile?profiles.length+" profile"+(profiles.length===1?"":"s"):"No profiles yet"}</span></div>
        {!viewer?<div className="voice-empty">Sign in to create and manage your Favourite Voice profiles.</div>:
        profiles.length===0?<div className="voice-empty">Your first voice profile will appear here after you create a preview.</div>:
        <div className="voice-profile-grid">{profiles.map(profile=><article className="voice-profile-card" key={profile.id}><div className="profile-top"><div className="demo-avatar">{profile.displayName[0]?.toUpperCase()??"V"}</div><div><strong>{profile.displayName}</strong><span>{profile.relationship||"Favourite voice"} · {profile.language.toUpperCase()}</span></div><em>{profile.status}</em></div>{profile.jobs.length>0&&<div className="job-list">{profile.jobs.map(job=><div className="job-line" key={job.id}><span>{job.type}</span><strong>{job.book.title}</strong><em>{job.status}</em></div>)}</div>}</article>)}</div>}
      </section>

      <section className="container voice-steps">
        <div className="plan-copy"><span className="section-eyebrow">CREDIT PACKS</span><h2>Pay for listening time.</h2><p>Your generated chapters can be replayed without generating them again. Payments will be connected to these database-backed packs next.</p></div>
        <div className="credit-grid">{packages.map(pkg=><article className="credit-card" key={pkg.id}><span>{pkg.currency}</span><strong>{pkg.amount}</strong><p>{formatMinutes(pkg.durationSeconds)} minutes</p><button type="button" disabled>Payment setup next <Arrow/></button></article>)}{packages.length===0&&<div className="voice-empty">No credit packages are configured for this market yet.</div>}</div>
      </section>
    </main>

    <footer className="container footer"><div className="footer-main"><Link href="/" className="brand">hush<span>.</span></Link><span>Voice cloning requires permission from the speaker.</span></div><div className="footer-links"><a href="/">Home</a><a href="/#classics">Library</a><a href="/account">Account</a></div></footer>
  </div>;
}
