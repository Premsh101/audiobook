"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { books as seedBooks, type Book } from "@/lib/books";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "search") return <svg viewBox="0 0 24 24" {...common}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>;
  if (name === "play") return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M8 5.2v13.6a1 1 0 0 0 1.53.84l10-6.8a1 1 0 0 0 0-1.68l-10-6.8A1 1 0 0 0 8 5.2Z"/></svg>;
  if (name === "pause") return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><rect x="6.5" y="5" width="4.2" height="14" rx="1.5"/><rect x="13.3" y="5" width="4.2" height="14" rx="1.5"/></svg>;
  if (name === "mic") return <svg viewBox="0 0 24 24" {...common}><rect x="8.4" y="3.2" width="7.2" height="12.4" rx="3.6"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V21M9 21h6"/></svg>;
  if (name === "arrow") return <svg viewBox="0 0 24 24" {...common}><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>;
  if (name === "clock") return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3.2 1.9"/></svg>;
  if (name === "x") return <svg viewBox="0 0 24 24" {...common}><path d="m7 7 10 10M17 7 7 17"/></svg>;
  return null;
}

function Cover({ book, large = false }: { book: Book; large?: boolean }) {
  return (
    <div className={large ? "cover cover-large" : "cover"} style={{ "--cover": book.cover, "--ink": book.coverInk } as CSSProperties}>
      <span className="cover-grain" />
      <div className="cover-border" />
      <div className="cover-topline">HUSH CLASSICS · {book.year}</div>
      <div className="cover-copy">
        <div className="cover-title">{book.title}</div>
        <div className="cover-author">{book.author}</div>
      </div>
      <span className="cover-free">FREE</span>
      <div className="cover-mark">{book.mark}</div>
    </div>
  );
}

function BookCard({ book, onSelect }: { book: Book; onSelect: (book: Book) => void }) {
  return (
    <article className="book-card">
      <button className="cover-button" onClick={() => { window.location.href = "/book/" + book.id; }} aria-label={"Open " + book.title}>
        <Cover book={book} />
        <span className="cover-hover"><span><Icon name="play" size={15}/></span>Preview</span>
      </button>
      <div className="book-copy-row">
        <div className="book-copy">
          <strong>{book.title}</strong>
          <span>{book.author}</span>
        </div>
        <button className="round-mini" onClick={() => onSelect(book)} aria-label={"Play " + book.title}><Icon name="play" size={13}/></button>
      </div>
      <div className="book-meta"><span>{book.genre}</span><span>·</span><span>{book.durationLabel}</span></div>
    </article>
  );
}

function Shelf({ title, eyebrow, items, onSelect }: { title: string; eyebrow?: string; items: Book[]; onSelect: (book: Book) => void }) {
  return (
    <section className="shelf-section">
      <div className="section-heading">
        <div>
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        <button className="see-all">See all <Icon name="arrow" size={15}/></button>
      </div>
      <div className="book-row">
        {items.map((book) => <BookCard key={book.id} book={book} onSelect={onSelect}/>)}
      </div>
    </section>
  );
}

function AudioPlayer({ book, onClose }: { book: Book; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(book.previewSeconds);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaying(false);
    setCurrent(0);
    setDuration(book.previewSeconds);
    setError(false);
    audio.src = book.previewUrl;
    audio.load();

    const metadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const progress = () => setCurrent(audio.currentTime);
    const ended = () => setPlaying(false);
    const failed = () => setError(true);

    audio.addEventListener("loadedmetadata", metadata);
    audio.addEventListener("timeupdate", progress);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", failed);
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", metadata);
      audio.removeEventListener("timeupdate", progress);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", failed);
    };
  }, [book]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setError(true);
    }
  };

  const skip = (amount: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || duration, audio.currentTime + amount));
  };

  const percent = duration ? Math.min(100, (current / duration) * 100) : 0;
  const time = (value: number) => {
    const min = Math.floor(value / 60);
    const sec = Math.floor(value % 60).toString().padStart(2, "0");
    return min + ":" + sec;
  };

  return (
    <div className="player-shell">
      <audio ref={audioRef} preload="metadata"/>
      <div className="player">
        <div className="player-book"><Cover book={book}/></div>
        <div className="player-main">
          <div className="player-title-line">
            <div><strong>{book.title}</strong><span>{book.author} · free preview from LibriVox</span></div>
            <button className="close-player" onClick={onClose} aria-label="Close player"><Icon name="x" size={18}/></button>
          </div>
          <div className="player-controls">
            <button className="skip" onClick={() => skip(-15)} aria-label="Back 15 seconds">−15</button>
            <button className="play-main" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Icon name="pause" size={17}/> : <Icon name="play" size={17}/>}</button>
            <button className="skip" onClick={() => skip(15)} aria-label="Forward 15 seconds">+15</button>
          </div>
          <div className="progress-wrap">
            <input type="range" min="0" max={duration || 1} value={current} onChange={(e) => { const value = Number(e.target.value); setCurrent(value); if (audioRef.current) audioRef.current.currentTime = value; }} aria-label="Audio progress" style={{"--progress": percent + "%"} as CSSProperties}/>
            <div className="progress-meta"><span>{time(current)}</span><span>{error ? "Source unavailable — open LibriVox" : "Preview · " + time(duration)}</span></div>
          </div>
        </div>
        <a className="source-link" href={book.sourceUrl} target="_blank" rel="noreferrer">Full free recording <Icon name="arrow" size={14}/></a>
      </div>
    </div>
  );
}

export default function Home() {
  const [catalog, setCatalog] = useState<Book[]>(seedBooks);
  const [selected, setSelected] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("/api/books", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("catalog unavailable"))))
      .then((data: Book[]) => setCatalog(data))
      .catch(() => {
        // Keep the bundled public-domain seed catalog available when the DB is not configured locally.
      });
  }, []);

  const categories = ["All", "Fiction", "Fantasy", "Mystery", "Romance", "Gothic", "Adventure"];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalog.filter((book) => {
      const matchesCategory = category === "All" || book.genre === category;
      const haystack = [book.title, book.author, book.genre, ...book.tags].join(" ").toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }, [category, search]);

  return (
    <div className="site">
      <header className="topbar"><div className="nav-wrap">
        <Link href="/" className="brand">hush<span>.</span></Link>
        <nav><a href="#discover">Discover</a><a href="#classics">Library</a><a href="#voice">Favourite Voice</a><a href="#plans">Plans</a></nav>
        <div className="nav-actions"><button className="search-trigger"><Icon name="search" size={17}/><span>Search</span></button><Link className="nav-ghost" href="/login">Sign in</Link><Link className="nav-cta" href="/voice">Try Favourite Voice <Icon name="arrow" size={14}/></Link></div>
      </div></header>

      <main>
        <section className="hero container" id="discover">
          <div className="hero-copy">
            <span className="eyebrow"><i/> A new way to hear stories</span>
            <h1>The story is the same.<br/><em>The voice can be yours.</em></h1>
            <p>Discover a beautiful audiobook library. Then turn a favourite story into something personal with a voice you know and love.</p>
            <div className="hero-actions"><a className="button-dark" href="#classics">Explore free catalog <Icon name="arrow" size={16}/></a><Link className="button-light" href="/voice"><Icon name="mic" size={17}/> Hear a favourite voice</Link></div>
            <div className="trust-row"><span><b>10</b> free classics</span><span><b>5 min</b> voice preview</span><span><b>Global</b> by design</span></div>
          </div>
          <div className="hero-stage">
            <div className="stage-glow"/>
            <div className="stage-note note-one">LISTEN CLOSER</div>
            <div className="stage-note note-two">FREE CLASSICS · 01</div>
            <div className="hero-stack back"><Cover book={catalog[2]} large/></div>
            <div className="hero-stack front"><Cover book={catalog[0]} large/></div>
            <div className="hero-player-chip"><div className="chip-cover"><Cover book={catalog[1]}/></div><div><span>Now previewing</span><strong>Alice in Wonderland</strong></div><button onClick={() => setSelected(catalog[1])}><Icon name="play" size={14}/></button></div>
          </div>
        </section>

        <section className="container intro-strip"><div><span className="section-eyebrow">THE DIFFERENCE</span><strong>One library. One personal layer.</strong></div><p>Familiar audiobook discovery, with a new reason to press play: hearing stories in a voice that already means something.</p></section>

        <section className="container library-shell" id="classics">
          <div className="library-toolbar"><div><span className="section-eyebrow">FREE LIBRARY</span><h2>Start with something everyone knows.</h2></div><div className="search-box"><Icon name="search" size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search catalog or authors…" aria-label="Search catalog"/></div></div>
          <div className="category-row">{categories.map((item) => <button key={item} className={category === item ? "category active" : "category"} onClick={() => setCategory(item)}>{item}</button>)}</div>
          {filtered.length ? <div className="book-grid">{filtered.map((book) => <BookCard key={book.id} book={book} onSelect={setSelected}/>)}</div> : <div className="empty">No classics match that search yet.</div>}
        </section>

        <section className="container"><Shelf title="For slow mornings" eyebrow="EDITOR'S SHELF" items={catalog.slice(0,5)} onSelect={setSelected}/><Shelf title="When you want a little mystery" eyebrow="AFTER DARK" items={[catalog[2],catalog[3],catalog[4],catalog[9],catalog[7]]} onSelect={setSelected}/></section>

        <section className="container voice-cta" id="voice">
          <div className="voice-copy"><span className="section-eyebrow">FAVOURITE VOICE</span><h2>Imagine hearing a familiar voice tell your favourite story.</h2><p>Upload a clean recording from someone you have permission to clone. Listen to a five-minute sample free. Buy minutes only when you want more.</p><div className="voice-buttons"><Link className="button-cream" href="/voice"><Icon name="mic" size={17}/> Create a Favourite Voice</Link><span>5 minutes free · no card required</span></div></div>
          <div className="voice-demo"><div className="demo-top"><div className="demo-avatar">M</div><div><span>Favourite Voice</span><strong>Mom's voice</strong></div><span className="demo-private">PRIVATE</span></div><div className="waveform">{[14,32,20,45,28,62,38,19,52,31,66,40,21,47,25,58,35,22,50,29].map((h,i)=><i key={i} style={{height:h+"px"}}/>)}</div><div className="demo-status"><span>00:00 → 05:00</span><strong>Free preview</strong></div><div className="demo-foot"><span>Natural pacing</span><span>Expressive delivery</span><span>Consent-first</span></div></div>
        </section>

        <section className="container plan-section" id="plans">
          <div className="plan-copy"><span className="section-eyebrow">SIMPLE PLANS</span><h2>Pay for access.<br/>Pay extra only for the magic.</h2><p>The everyday library stays affordable. Personalised voice is metered with credits so the product can stay generous without hiding generation costs.</p></div>
          <div className="plan-cards"><div className="plan-card"><span>LIBRARY</span><strong>From $2.99</strong><p>Monthly access to the free-to-you catalog and new titles as the library grows.</p><button>View library plans <Icon name="arrow" size={15}/></button></div><div className="plan-card featured"><span>FAVOURITE VOICE</span><strong>5 min free</strong><p>Then buy listening-minute credits when you want a longer personalised story.</p><Link href="/voice">Try the free preview <Icon name="arrow" size={15}/></Link></div></div>
        </section>

        <section className="container source-note"><Icon name="clock" size={15}/><span>Prototype seed catalog uses free LibriVox recordings for public-domain works in the U.S.; distribution rights should be verified territory-by-territory before commercial launch.</span></section>
      </main>

      <footer className="container footer"><div className="footer-main"><Link href="/" className="brand">hush<span>.</span></Link><span>Stories, closer.</span></div><div className="footer-links"><a href="#classics">Library</a><a href="#voice">Favourite Voice</a><a href="#plans">Plans</a><a href={catalog[0].sourceUrl} target="_blank" rel="noreferrer">Open source</a></div></footer>

      {selected && <AudioPlayer book={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}