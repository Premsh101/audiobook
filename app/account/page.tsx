"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User={name?:string|null;email?:string|null;mobile?:string|null;balanceSeconds:number;currency:string};

export default function AccountPage(){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    fetch("/api/auth/me",{cache:"no-store"})
      .then(r=>r.json())
      .then(data=>setUser(data.user))
      .finally(()=>setLoading(false));
  },[]);

  async function logout(){
    setBusy(true);
    await fetch("/api/auth/logout",{method:"POST"});
    window.location.href="/";
  }

  const hours=user?Math.floor(user.balanceSeconds/3600):0;
  const minutes=user?Math.floor((user.balanceSeconds%3600)/60):0;

  if(loading)return <div className="site"><main className="container detail-loading">Opening your account…</main></div>;

  return <div className="site">
    <header className="topbar"><div className="nav-wrap"><Link href="/" className="brand">hush<span>.</span></Link><nav><a href="/#discover">Discover</a><a href="/#classics">Library</a><a href="/#voice">Favourite Voice</a><a href="/#plans">Plans</a></nav><div className="nav-actions"><Link className="nav-ghost" href="/">← Library</Link></div></div></header>
    <main className="container account-main">
      {!user?<section className="account-card"><span className="section-eyebrow">ACCOUNT</span><h1>Sign in to Hush.</h1><p>Your account keeps playback in sync and will hold your Favourite Voice credits later.</p><Link className="button-dark" href="/login">Sign in</Link></section>:
      <>
        <section className="account-head"><div><span className="eyebrow"><i/> Your Hush account</span><h1>{user.name||"Good to have you here."}</h1><p>{user.email||user.mobile}</p></div><button className="nav-ghost account-logout" disabled={busy} onClick={logout}>{busy?"Signing out…":"Sign out"}</button></section>
        <div className="account-grid">
          <div className="account-card"><span className="section-eyebrow">PLAYBACK</span><h2>Pick up anywhere.</h2><p>Your book position is saved to your account while you listen.</p><Link href="/" className="account-link">Browse the library →</Link></div>
          <div className="account-card dark"><span className="section-eyebrow">FAVOURITE VOICE</span><h2>Make a story familiar.</h2><p>Upload a permitted voice sample and keep the generated experience tied to your account.</p><Link href="/voice" className="account-link">Open Favourite Voice →</Link></div>
          <div className="account-card"><span className="section-eyebrow">LISTENING CREDITS</span><h2>{hours?hours+"h ":""}{minutes}m</h2><p>Current Favourite Voice credit balance. Purchases will be connected next.</p><span className="account-muted">{user.currency}</span></div>
        </div>
      </>}
    </main>
  </div>;
}
