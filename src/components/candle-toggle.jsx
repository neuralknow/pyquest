// candle-toggle.jsx — small candle icon in the corner. Lit = midnight mode.

function CandleToggle({ lit, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={lit ? "Snuff the candle (light mode)" : "Light the candle (midnight mode)"}
      aria-label={lit ? "Switch to light mode" : "Switch to midnight mode"}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        width: 44, height: 56,
        background: "var(--vellum)",
        border: "1px solid var(--ink-30)",
        borderRadius: 4,
        cursor: "pointer",
        padding: 4,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 6px 16px -10px rgba(0,0,0,.4)",
      }}
    >
      <svg width="32" height="48" viewBox="0 0 32 48" fill="none"
           stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* flame, only when lit */}
        {lit ? (
          <g>
            <path d="M16 4 C19 8, 21 11, 21 14 C21 17.5, 19 20, 16 20 C13 20, 11 17.5, 11 14 C11 11, 13 8, 16 4 Z"
                  fill="#f6c14b" stroke="#a23a2a" strokeWidth="1"/>
            <path d="M16 8 C17.5 11, 18.5 13, 18.5 15 C18.5 17, 17.5 18, 16 18 C14.5 18, 13.5 17, 13.5 15 C13.5 13, 14.5 11, 16 8 Z"
                  fill="#fff3c4" stroke="none"/>
            {/* glow */}
            <circle cx="16" cy="14" r="11" fill="#f6c14b" opacity="0.18"/>
          </g>
        ) : null}
        {/* wick */}
        <line x1="16" y1={lit ? 20 : 18} x2="16" y2="24" stroke="var(--ink)" strokeWidth="1.2"/>
        {/* candle body */}
        <rect x="11" y="24" width="10" height="18" rx="1" fill="var(--parchment-deep)" stroke="var(--ink)"/>
        {/* drip */}
        <path d="M13 28 q-1 4 0 8" fill="none" stroke="var(--ink-50)" strokeWidth="0.9"/>
        {/* holder */}
        <path d="M8 42 h16 v3 h-16 z" fill="var(--parchment-deep)" stroke="var(--ink)"/>
        <path d="M10 45 h12 l-2 2 h-8 z" fill="var(--parchment-deep)" stroke="var(--ink)"/>
      </svg>
    </button>
  );
}

window.CandleToggle = CandleToggle;
