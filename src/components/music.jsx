// music.jsx — background music player
//
// PLACEHOLDER: Drop your music file at the path below (or change MUSIC_SRC).
// Works with .mp3, .ogg, or .wav. Looped, low volume by default.
// Browsers block autoplay until the user interacts with the page, so the
// track is armed on mount and starts on the first click/keypress, OR the
// user can click the floating note button at the bottom-left.

const MUSIC_SRC = "assets/music/background.mp3"; // ← replace with your file

function BackgroundMusic({ enabled, volume }) {
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [missing, setMissing] = React.useState(false);

  // Build the <audio> element once.
  React.useEffect(() => {
    const a = new Audio(MUSIC_SRC);
    a.loop = true;
    a.preload = "auto";
    a.volume = Math.max(0, Math.min(1, volume ?? 0.35));
    a.addEventListener("error", () => setMissing(true));
    audioRef.current = a;
    return () => { a.pause(); a.src = ""; audioRef.current = null; };
  }, []);

  // Reflect volume changes live.
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume ?? 0.35));
    }
  }, [volume]);

  // Try to play whenever `enabled` flips on; pause when off.
  const tryPlay = React.useCallback(() => {
    const a = audioRef.current;
    if (!a || !enabled) return;
    const p = a.play();
    if (p && p.then) {
      p.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [enabled]);

  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (enabled) {
      tryPlay();
    } else {
      a.pause();
      setPlaying(false);
    }
  }, [enabled, tryPlay]);

  // Arm first-interaction autoplay unlock.
  React.useEffect(() => {
    if (!enabled || playing) return;
    const unlock = () => {
      tryPlay();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enabled, playing, tryPlay]);

  // Floating toggle — quill-and-ink note glyph.
  const onToggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) tryPlay();
    else { a.pause(); setPlaying(false); }
  };

  const btnStyle = {
    position: "fixed",
    left: 16,
    bottom: 16,
    zIndex: 50,
    width: 38, height: 38,
    borderRadius: "50%",
    border: "1px solid var(--ink-30)",
    background: "var(--vellum)",
    color: "var(--ink)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 6px 16px -10px rgba(0,0,0,.4)",
    opacity: missing ? 0.5 : 1,
    fontFamily: "'IM Fell English', serif",
  };

  const title = missing
    ? `Music file not found at ${MUSIC_SRC}`
    : (playing ? "Mute music" : "Play music");

  return (
    <button onClick={onToggle} style={btnStyle} title={title} aria-label={title}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* simple eighth-note glyph in ink */}
        <path d="M9 18V5l10-2v13"/>
        <circle cx="6.5" cy="18" r="2.5" fill={playing ? "currentColor" : "none"}/>
        <circle cx="16.5" cy="16" r="2.5" fill={playing ? "currentColor" : "none"}/>
        {!playing && <line x1="3" y1="21" x2="21" y2="3" stroke="var(--wax)" strokeWidth="1.4"/>}
      </svg>
    </button>
  );
}

window.BackgroundMusic = BackgroundMusic;
