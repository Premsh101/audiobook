"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";

type Chapter = {
  id: string;
  title: string;
  sequence: number;
  sourceTextUrl?: string | null;
  audioUrl?: string | null;
  durationSeconds?: number | null;
};

type BookDetail = {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  durationLabel: string;
  previewSeconds: number;
  description: string;
  cover: string;
  coverInk: string;
  mark: string;
  tags: string[];
  previewUrl?: string | null;
  sourceUrl?: string | null;
  rightsType?: string;
  chapters: Chapter[];
};

function Icon({name,size=18}:{name:string;size?:number}){
  const common={width:size,height:size,fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  if(name==="play")return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M8 5.2v13.6a1 1 0 0 0 1.53.84l10-6.8a1 1 0 0 0 0-1.68l-10-6.8A1 1 0 0 0 8 5.2Z"/></svg>;
  if(name==="pause")return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><rect x="6.5" y="5" width="4.2" height="14" rx="1.5"/><rect x="13.3" y="5" width="4.2" height="14" rx="1.5"/></svg>;
  if(name==="arrow")return <svg viewBox="0 0 24 24" {...common}><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>;
  if(name==="back")return <svg viewBox="0 0 24 24" {...common}><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>;
  return null;
}

function Cover({book}:{book:BookDetail}){
  return <div className="cover detail-cover" style={{"--cover":book.cover,"--ink":book.coverInk} as CSSProperties}>
    <div className="cover-border"/><span className="cover-topline">HUSH CLASSICS · {book.year}</span>
    <div className="cover-copy"><div className="cover-title">{book.title}</div><div className="cover-author">{book.author}</div></div>
    <span className="cover-free">FREE</span><div className="cover-mark">{book.mark}</div>
  </div>;
}

export default function BookPage({params}:{params:Promise<{slug:string}>}){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const [book,setBook]=useState<BookDetail|null>(null);
  const [chapter,setChapter]=useState<Chapter|null>(null);
  const [playing,setPlaying]=useState(false);
  const [current,setCurrent]=useState(0);
  const [duration,setDuration]=useState(0);
  const [loading,setLoading]=useState(true);
  const [signedIn,setSignedIn]=useState(false);

  const loadProgress=useCallback(async(slug:string,chapterId:string|null)=>{
    try{
      const query=chapterId?`?chapterId=${encodeURIComponent(chapterId)}`:"";
      const res=await fetch(`/api/playback/${slug}${query}`,{cache:"no-store"});
      if(res.ok){
        const data=await res.json();
        setSignedIn(true);
        return Number(data.progress?.positionSeconds??0);
      }
    }catch{}
    setSignedIn(false);
    return 0;
  },[]);

  useEffect(()=>{
    let active=true;
    params.then(({slug})=>{
      fetch(`/api/books/${slug}`,{cache:"no-store"})
        .then(r=>r.ok?r.json():Promise.reject(new Error("not found")))
        .then(async(data:BookDetail)=>{
          if(!active)return;
          setBook(data);
          const next=data.chapters?.[0]??null;
          setChapter(next);
          const saved=await loadProgress(data.slug,next?.id??null);
          if(active){setCurrent(saved);setLoading(false);}
        })
        .catch(()=>{if(active)setLoading(false);});
    });
    return()=>{active=false};
  },[params,loadProgress]);

  const savePosition=useCallback(async(completed=false)=>{
    if(!book||!chapter||!signedIn)return;
    await fetch(`/api/playback/${book.slug}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        chapterId:chapter.id,
        positionSeconds:Math.floor(audioRef.current?.currentTime??current),
        completed
      })
    });
  },[book,chapter,signedIn,current]);

  const source=chapter?.audioUrl||book?.previewUrl||"";

  useEffect(()=>{
    const audio=audioRef.current;
    if(!audio||!source)return;
    audio.src=source;
    audio.load();
    setPlaying(false);
    setDuration(chapter?.durationSeconds??book?.previewSeconds??0);

    const metadata=()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)setDuration(audio.duration);};
    const time=()=>setCurrent(audio.currentTime);
    const ended=()=>{setPlaying(false);void savePosition(true);};

    audio.addEventListener("loadedmetadata",metadata);
    audio.addEventListener("timeupdate",time);
    audio.addEventListener("ended",ended);
    return()=>{audio.pause();audio.removeEventListener("loadedmetadata",metadata);audio.removeEventListener("timeupdate",time);audio.removeEventListener("ended",ended);};
  },[source,chapter,book,savePosition]);

  useEffect(()=>{
    if(!playing||!signedIn)return;
    const id=window.setInterval(()=>{void savePosition(false)},10000);
    return()=>window.clearInterval(id);
  },[playing,signedIn,savePosition]);

  const selectChapter=async(next:Chapter)=>{
    if(!book)return;
    await savePosition(false);
    setChapter(next);
    setCurrent(await loadProgress(book.slug,next.id));
  };

  const toggle=async()=>{
    const audio=audioRef.current;
    if(!audio)return;
    try{
      if(audio.paused){await audio.play();setPlaying(true);}
      else{audio.pause();setPlaying(false);await savePosition(false);}
    }catch{}
  };

  const percent=duration?Math.min(100,(current/duration)*100):0;
  const time=(v:number)=>`${Math.floor(v/60)}:${Math.floor(v%60).toString().padStart(2,"0")}`;
  const tagLine=useMemo(()=>book?.tags?.join(" · ")??"",[book]);

  if(loading)return <div className="site"><main className="container detail-loading">Opening your story…</main></div>;
  if(!book)return <div className="site"><main className="container detail-loading"><h1>Story not found</h1><Link href="/">Back to library</Link></main></div>;

  return <div className="site">
    <header className="topbar"><div className="nav-wrap">
      <Link href="/" className="brand">hush<span>.</span></Link>
      <nav><a href="/#discover">Discover</a><a href="/#classics">Library</a><a href="/#voice">Favourite Voice</a><a href="/#plans">Plans</a></nav>
      <div className="nav-actions"><Link className="nav-ghost" href={signedIn?"/":"/login"}>{signedIn?"Library":"Sign in"}</Link></div>
    </div></header>

    <main>
      <section className="container detail-hero">
        <div><Link className="back-link" href="/"><Icon name="back" size={15}/> Library</Link><Cover book={book}/></div>
        <div className="detail-copy">
          <span className="section-eyebrow">{book.genre} · {book.year}</span>
          <h1>{book.title}</h1><p className="detail-author">{book.author}</p>
          <p className="detail-description">{book.description}</p>
          <div className="detail-meta"><span>{book.durationLabel}</span><span>Free preview</span><span>{book.rightsType==="PUBLIC_DOMAIN"?"Public domain":"Licensed"}</span></div>
          <div className="detail-actions"><button className="button-dark" onClick={toggle}>{playing?<Icon name="pause" size={16}/>:<Icon name="play" size={16}/>} {playing?"Pause":"Play preview"}</button>{book.sourceUrl&&<a className="button-light" href={book.sourceUrl} target="_blank" rel="noreferrer">Open source</a>}</div>
          <p className="detail-sync">{signedIn?"Your playback position syncs automatically.":<>Sign in to sync your playback across devices. <Link href="/login">Sign in →</Link></>}</p>
          <div className="detail-tags">{tagLine}</div>
        </div>
      </section>

      <section className="container chapter-section">
        <div className="chapter-head"><div><span className="section-eyebrow">CHAPTERS</span><h2>Continue listening</h2></div><span>{book.chapters.length} available</span></div>
        <div className="chapter-list">
          {book.chapters.map((item,index)=><button key={item.id} className={chapter?.id===item.id?"chapter-row active":"chapter-row"} onClick={()=>void selectChapter(item)}>
            <span className="chapter-num">{String(index+1).padStart(2,"0")}</span><span className="chapter-title"><strong>{item.title}</strong><small>{item.durationSeconds?time(item.durationSeconds):"Preview"}</small></span><span className="chapter-play"><Icon name={chapter?.id===item.id&&playing?"pause":"play"} size={13}/></span>
          </button>)}
        </div>
      </section>

      <section className="container detail-player">
        <audio ref={audioRef} preload="metadata"/>
        <div className="detail-player-top"><span>{chapter?.title??"Free preview"}</span><strong>{signedIn?"Synced":"Preview mode"}</strong></div>
        <input className="detail-progress" type="range" min="0" max={duration||1} value={current} onChange={e=>{const v=Number(e.target.value);setCurrent(v);if(audioRef.current)audioRef.current.currentTime=v;}}/>
        <div className="detail-player-bottom"><span>{time(current)}</span><div className="detail-player-buttons"><button onClick={()=>{if(audioRef.current)audioRef.current.currentTime=Math.max(0,current-15)}}>−15</button><button className="detail-play" onClick={toggle}>{playing?<Icon name="pause" size={16}/>:<Icon name="play" size={16}/>}</button><button onClick={()=>{if(audioRef.current)audioRef.current.currentTime=Math.min(duration,current+15)}}>+15</button></div><span>{time(duration)}</span></div>
      </section>
    </main>
  </div>;
}
