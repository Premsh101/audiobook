"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

function Arrow(){return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>}

export default function LoginPage(){
  const [mode,setMode]=useState<"login"|"signup">("login");
  const [identifier,setIdentifier]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true); setError("");
    try{
      const res=await fetch(mode==="login"?"/api/auth/login":"/api/auth/signup",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({identifier,password,name})
      });
      const data=await res.json();
      if(!res.ok) throw new Error(data.error || "Something went wrong");
      window.location.href="/";
    }catch(err){
      setError(err instanceof Error ? err.message : "Something went wrong");
    }finally{setBusy(false);}
  }

  return <div className="auth-shell">
    <header className="topbar"><div className="nav-wrap">
      <Link href="/" className="brand">hush<span>.</span></Link>
      <div className="nav-actions"><Link className="nav-ghost" href="/">← Home</Link></div>
    </div></header>
    <main className="auth-main">
      <section className="auth-intro">
        <span className="eyebrow"><i/> Your listening home</span>
        <h1>Keep your stories <em>close.</em></h1>
        <p>Sign in to save your place, build a personal library and prepare for Favourite Voice.</p>
        <div className="auth-notes"><span>Simple sign in</span><span>Email or mobile</span><span>Playback sync</span></div>
      </section>
      <section className="auth-card">
        <div className="auth-tabs">
          <button className={mode==="login"?"active":""} onClick={()=>{setMode("login");setError("");}}>Sign in</button>
          <button className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setError("");}}>Create account</button>
        </div>
        <form onSubmit={submit}>
          {mode==="signup" && <label>NAME <input value={name} onChange={e=>setName(e.target.value)} placeholder="What should we call you?"/></label>}
          <label>EMAIL OR MOBILE <input autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="you@example.com or +91 98765 43210"/></label>
          <label>PASSWORD <input type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 4 characters"/></label>
          {error && <div className="auth-error">{error}</div>}
          <button className="button-dark full" disabled={busy}>{busy ? "Please wait…" : mode==="login" ? <>Sign in <Arrow/></> : <>Create account <Arrow/></>}</button>
        </form>
        <p className="auth-foot">No OTP or complicated setup for now. Use your email or mobile and a simple password.</p>
      </section>
    </main>
  </div>;
}
