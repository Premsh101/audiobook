"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {books,type Book} from "@/lib/books";

function SearchIcon(){return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>}
function PlayIcon(){return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.3v13.4a1 1 0 0 0 1.53.85l9.92-6.7a1 1 0 0 0 0-1.7L9.53 4.45A1 1 0 0 0 8 5.3Z"/></svg>}
function PauseIcon(){return <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-13Z"/></svg>}
function MicIcon(){return <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="8.5" y="3.5" width="7" height="12" rx="3.5"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V21M9 21h6"/></svg>}
function Chevron(){return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 6 6 6-6 6"/></svg>}

function Header(){
 return <header className="container topbar"><Link className="brand" href="/">hush.</Link><nav className="nav"><a href="#discover">Explore</a><a href="#voice">Favourite Voice</a><a href="#how">How it works</a></nav><div className="actions"><button className="icon-btn" aria-label="Search"><SearchIcon/></button><Link className="primary" href="/voice">Try it free</Link></div></header>
}

function Cover({book}:{book:Book}){return <div className="cover" style={{"--cover":book.accent} as React.CSSProperties}><div className="cover-copy"><span className="cover-kicker">HUSH CLASSICS · {book.year}</span><span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span></div><span className="free-badge">FREE</span></div>}

function BookCard({book,onPlay}:{book:Book,onPlay:(book:Book)=>void}){
 return <article className="book-card"><Link href={"/?book="+book.id}><Cover book={book}/></Link><div className="book-info"><div className="book-title">{book.title}</div><div className="book-author">{book.author}</div><div className="meta"><span>{book.genre}</span><span>·</span><span>{book.minutes}</span><button className="mini-play" onClick={()=>onPlay(book)} aria-label={"Play "+book.title}><PlayIcon/></button></div></div></article>
}

function Player({book}:{book:Book|null}){const [playing,setPlaying]=useState(false);if(!book)return null;return <div className="player"><div className="player-inner"><div className="player-cover"><Cover book={book}/></div><div className="player-meta"><b>{book.title}</b><span>{book.author} · Free edition</span></div><div className="controls"><button className="control" aria-label="Back 15 seconds">↶</button><button className="control play" onClick={()=>setPlaying(v=>!v)} aria-label={playing?"Pause":"Play"}>{playing?<PauseIcon/>:<PlayIcon/>}</button><button className="control" aria-label="Forward 15 seconds">↷</button></div><div className="timeline"><div className="track"/><div className="fill"/></div><div className="player-time">08:42 / {book.minutes}</div></div></div>}

export default function Home(){
 const [selected,setSelected]=useState<Book|null>(null);
 const [search,setSearch]=useState("");
 const filtered=useMemo(()=>books.filter(b=>(b.title+" "+b.author+" "+b.genre).toLowerCase().includes(search.toLowerCase())),[search]);
 return <div className="shell">
  <Header/>
  <main className="container">
   <section className="hero">
    <div><span className="eyebrow"><i/> The new way to listen</span><h1>Stories, in a voice you already <em>love.</em></h1><p>Discover beautiful audiobooks. Or make a favourite story feel closer by hearing it in a voice that means something to you.</p><div className="hero-cta"><a className="primary" href="#discover">Browse free books</a><Link className="secondary" href="/voice"><MicIcon/> Try a favourite voice</Link></div><div className="hero-note">5 minutes free for your first personalised preview · no card required</div></div>
    <div className="hero-art"><div className="orb"/><div className="hero-book"><small>A story to remember</small><h2>Listen<br/>closer.</h2><span>hush. originals</span></div><div className="sound">{[1,2,3,4,5].map(x=><b key={x}/>)}</div></div>
   </section>

   <section className="section" id="discover">
    <div className="section-head"><div><h2>Free classics, beautifully heard.</h2><p>Ten timeless books to start your shelf.</p></div><span className="section-link">Free forever</span></div>
    <div className="search-shell"><SearchIcon/><input aria-label="Search books" placeholder="Search titles, authors or genres…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <div className="book-grid">{filtered.map(b=><BookCard key={b.id} book={b} onPlay={setSelected}/>)}</div>
   </section>

   <section className="section" id="voice">
    <div className="voice-band"><div><span className="eyebrow" style={{background:"rgba(255,255,255,.08)",color:"#d3cbc1"}}><i/> Favourite Voice</span><h2>What if your next story sounded like someone you love?</h2><p>Upload a clean recording, hear five minutes free, then use listening credits for longer personalised chapters.</p><div className="voice-actions"><Link className="primary light" href="/voice">Create a voice</Link><Link className="secondary" href="/voice" style={{color:"#fff",borderColor:"rgba(255,255,255,.18)",background:"rgba(255,255,255,.06)"}}>See the 3 steps <Chevron/></Link></div></div><div className="voice-card"><div><div className="avatar">M</div><h3>My favourite voice</h3><small>Private · consented · yours</small></div><div className="wave">{Array.from({length:16}).map((_,i)=><span key={i}/>)}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#bcb3a8"}}>Free preview · 05:00</span><span style={{fontSize:12,fontWeight:800}}>Ready when you are →</span></div></div></div>
   </section>

   <section className="section" id="how"><div className="section-head"><div><h2>Simple for listeners. Serious about sound.</h2><p>Inspired by the clean discovery and playback patterns people already love in audiobook apps, with one new personal layer. citeturn137320search4turn137320search12</p></div></div><div className="steps"><div className="step"><div className="step-no">01</div><h3>Pick a story</h3><p>Start with a free classic or explore the growing global library.</p></div><div className="step"><div className="step-no">02</div><h3>Choose a voice</h3><p>Use a narrator, or create a favourite-person voice with permission.</p></div><div className="step"><div className="step-no">03</div><h3>Press play</h3><p>Listen once, save it, and come back whenever the story calls.</p></div></div></section>
  </main>
  <footer className="container footer"><div className="footer-row"><small>hush. · Stories, closer.</small><small>Free seed catalog uses public-domain works; commercial rights are checked title-by-title.</small></div></footer>
  <Player book={selected}/>
 </div>
}
