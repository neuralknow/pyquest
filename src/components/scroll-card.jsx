// scroll-card.jsx — parchment frame with deckled edges

const scrollStyles = {
  outer: {
    position: "relative",
    background: "var(--vellum)",
    border: "1px solid var(--ink-30)",
    borderRadius: "3px",
    boxShadow:
      "0 1px 0 rgba(43,29,16,.12), 0 12px 30px -16px rgba(43,29,16,.45), inset 0 0 60px rgba(168,134,80,.18)",
    padding: "28px 30px",
    color: "var(--ink)",
  },
  innerBorder: {
    position: "absolute",
    inset: "8px",
    border: "1px solid rgba(43,29,16,.18)",
    borderRadius: "2px",
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: "14px",
    height: "14px",
    border: "1px solid rgba(43,29,16,.35)",
    pointerEvents: "none",
  },
};

function ScrollCard({ children, style, className }) {
  return (
    <div style={{...scrollStyles.outer, ...style}} className={className}>
      <div style={scrollStyles.innerBorder} />
      <div style={{...scrollStyles.corner, top: 4, left: 4, borderRight: "none", borderBottom: "none"}} />
      <div style={{...scrollStyles.corner, top: 4, right: 4, borderLeft: "none", borderBottom: "none"}} />
      <div style={{...scrollStyles.corner, bottom: 4, left: 4, borderRight: "none", borderTop: "none"}} />
      <div style={{...scrollStyles.corner, bottom: 4, right: 4, borderLeft: "none", borderTop: "none"}} />
      <div style={{position: "relative"}}>{children}</div>
    </div>
  );
}

// Wax-seal button
function SealButton({ children, onClick, disabled, color = "wax", style, type = "button", title }) {
  const bg = color === "wax" ? "var(--wax)" : color === "moss" ? "var(--moss)" : color === "royal" ? "var(--royal)" : color === "ink" ? "var(--ink)" : color === "gold" ? "var(--gold)" : color;
  const fg = color === "gold" ? "var(--ink)" : "#fbf3df";
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg, color: fg,
        border: "1px solid rgba(43,29,16,.5)",
        padding: "10px 18px",
        fontFamily: "'IM Fell English', serif",
        fontSize: 17,
        letterSpacing: ".02em",
        borderRadius: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        boxShadow: "0 1px 0 rgba(255,255,255,.18) inset, 0 4px 10px -4px rgba(43,29,16,.5)",
        transition: "transform .15s ease, filter .15s ease",
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = "brightness(1.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "")}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "translateY(1px)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "")}
    >
      {children}
    </button>
  );
}

// Quiet (paper) button
function QuietButton({ children, onClick, disabled, style, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: "transparent",
        color: "var(--ink)",
        border: "1px solid rgba(43,29,16,.4)",
        padding: "8px 14px",
        fontFamily: "'IM Fell English', serif",
        fontSize: 15,
        borderRadius: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

Object.assign(window, { ScrollCard, SealButton, QuietButton });
