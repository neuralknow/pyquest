// feedback.jsx — floating XP/mana toasts + WebAudio chime/thud cues.
//
// Usage:
//   <FeedbackLayer />                            // mount once near the root
//   window.PyQuestFeedback.flash({ xp: +10 });   // call from anywhere
//   window.PyQuestFeedback.flash({ mana: -2 });
//
// Sounds are generated on the fly with WebAudio, so no audio files are needed.
// Audio is gated by the same `musicOn`/`musicVolume` tweaks that drive the
// background music — toggling music off silences these cues too.

(() => {
  let audioCtx = null;
  function getCtx() {
    if (audioCtx) return audioCtx;
    try {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      audioCtx = new A();
    } catch (e) { audioCtx = null; }
    return audioCtx;
  }

  function playTone({ freq = 660, duration = 0.18, type = "sine", volume = 0.18, slideTo = null }) {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function feedbackVolume() {
    // Reuse the music tweak so users only have one knob.
    const raw = localStorage.getItem("__editmode_overrides__");
    let v = 0.35, on = true;
    try {
      if (raw) {
        const o = JSON.parse(raw);
        if (typeof o.musicVolume === "number") v = o.musicVolume;
        if (typeof o.musicOn === "boolean") on = o.musicOn;
      }
    } catch (e) {}
    return { on, v };
  }

  function chimeGain() {
    const { on, v } = feedbackVolume();
    if (!on) return 0;
    return Math.max(0, Math.min(0.4, v * 0.6));
  }

  function playGain() {
    const g = chimeGain(); if (g <= 0) return;
    // Two-note sparkle: E5 → B5
    playTone({ freq: 660, duration: 0.13, type: "triangle", volume: g });
    setTimeout(() => playTone({ freq: 988, duration: 0.18, type: "triangle", volume: g * 0.8 }), 70);
  }

  function playLoss() {
    const g = chimeGain(); if (g <= 0) return;
    // Low descending thud
    playTone({ freq: 240, slideTo: 110, duration: 0.32, type: "sawtooth", volume: g * 0.6 });
  }

  // -------- toast queue --------

  const listeners = new Set();
  function emit(t) { listeners.forEach(fn => fn(t)); }

  function flash({ xp = 0, mana = 0, label = null }) {
    if (!xp && !mana) return;
    const id = Math.random().toString(36).slice(2);
    if (xp) emit({ id: id + "-xp", kind: "xp", amount: xp, label });
    if (mana) emit({ id: id + "-mana", kind: "mana", amount: mana, label });
    if (xp > 0 || mana > 0) playGain();
    if (xp < 0 || mana < 0) playLoss();
  }

  window.PyQuestFeedback = { flash, playGain, playLoss };

  // -------- React component --------

  function FeedbackLayer() {
    const [toasts, setToasts] = React.useState([]);
    React.useEffect(() => {
      const onToast = (t) => {
        setToasts(curr => [...curr, { ...t, born: Date.now() }]);
        setTimeout(() => {
          setToasts(curr => curr.filter(x => x.id !== t.id));
        }, 1800);
      };
      listeners.add(onToast);
      return () => listeners.delete(onToast);
    }, []);

    return (
      <div style={{
        position: "fixed", top: 0, right: 0, width: 360, height: "100vh",
        pointerEvents: "none", zIndex: 60, overflow: "hidden",
      }}>
        {toasts.map((t, i) => {
          const positive = t.amount > 0;
          const color = t.kind === "xp"
            ? (positive ? "var(--gold)" : "var(--wax)")
            : (positive ? "var(--royal)" : "var(--wax)");
          // Stagger horizontally a bit so xp/mana don't overlap
          const right = 28 + (t.kind === "mana" ? 70 : 0);
          const top = 280 + (i % 4) * 6;
          return (
            <div key={t.id} style={{
              position: "absolute", right, top,
              fontFamily: "'IM Fell English SC', 'IM Fell English', serif",
              fontSize: 22,
              color, textShadow: "0 1px 0 rgba(255,255,255,.5), 0 2px 8px rgba(43,29,16,.25)",
              animation: "pyquest-toast 1.6s cubic-bezier(.2,.8,.2,1) forwards",
              whiteSpace: "nowrap",
              letterSpacing: ".04em",
              fontWeight: 600,
            }}>
              {positive ? "+" : ""}{t.amount} {t.kind === "xp" ? "XP" : "MANA"}
            </div>
          );
        })}
      </div>
    );
  }

  // Inject once
  if (!document.getElementById("pyquest-toast-style")) {
    const s = document.createElement("style");
    s.id = "pyquest-toast-style";
    s.textContent = `
      @keyframes pyquest-toast {
        0%   { opacity: 0; transform: translateY(8px) scale(.85); }
        15%  { opacity: 1; transform: translateY(0)   scale(1.05); }
        30%  { opacity: 1; transform: translateY(-6px) scale(1); }
        100% { opacity: 0; transform: translateY(-44px) scale(.95); }
      }
      @keyframes pyquest-statpulse-gain {
        0%, 100% { box-shadow: 0 0 0 0 rgba(200,162,73,0); }
        30%      { box-shadow: 0 0 0 6px rgba(200,162,73,.45); }
      }
      @keyframes pyquest-statpulse-loss {
        0%, 100% { box-shadow: 0 0 0 0 rgba(162,58,42,0); }
        30%      { box-shadow: 0 0 0 6px rgba(162,58,42,.45); }
      }
      .pyquest-pulse-gain { animation: pyquest-statpulse-gain .6s ease-out; }
      .pyquest-pulse-loss { animation: pyquest-statpulse-loss .6s ease-out; }
    `;
    document.head.appendChild(s);
  }

  window.FeedbackLayer = FeedbackLayer;
})();
