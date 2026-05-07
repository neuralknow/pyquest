// puzzle-types.jsx — five non-D3 puzzle components
// Each exposes the same shape: ({ puzzle, onSolve, revealed }) => element
// onSolve(correct: bool) — fired exactly once when the player commits a final answer.

const codeStyle = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 14.5,
  background: "rgba(43,29,16,.06)",
  border: "1px solid rgba(43,29,16,.2)",
  borderRadius: 2,
  padding: "12px 14px",
  whiteSpace: "pre-wrap",
  color: "var(--ink)",
  lineHeight: 1.55,
};

function pStr(s) { return (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ").replace(/[\"']/g, ""); }

// ─────────── MCQ ───────────
function MCQ({ puzzle, onSolve, locked }) {
  const [picked, setPicked] = React.useState(null);
  const [committed, setCommitted] = React.useState(false);
  const correct = picked === puzzle.answer;

  return (
    <div>
      <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 18, marginBottom: 14}}>{puzzle.prompt}</div>
      {puzzle.code ? <pre style={{...codeStyle, marginBottom: 14}}>{puzzle.code}</pre> : null}
      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
        {puzzle.options.map((opt, i) => {
          const isPicked = picked === i;
          const showResult = committed && isPicked;
          const isCorrect = i === puzzle.answer;
          return (
            <button
              key={i}
              disabled={locked || committed}
              onClick={() => setPicked(i)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                background: isPicked ? "rgba(43,29,16,.08)" : "transparent",
                border: `1.5px solid ${
                  showResult ? (isCorrect ? "var(--moss)" : "var(--wax)") :
                  isPicked ? "var(--ink)" : "rgba(43,29,16,.3)"
                }`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: "var(--ink)",
                cursor: committed ? "default" : "pointer",
                borderRadius: 2,
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                border: "1px solid var(--ink)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontFamily: "'IM Fell English', serif", fontSize: 13,
              }}>{String.fromCharCode(65 + i)}</span>
              <span style={{flex: 1}}>{opt}</span>
              {showResult ? (isCorrect ? <IconCheck size={18}/> : <IconX size={18}/>) : null}
            </button>
          );
        })}
      </div>
      <div style={{marginTop: 16}}>
        <SealButton
          color={committed ? (correct ? "moss" : "wax") : "ink"}
          disabled={picked == null || committed}
          onClick={() => { setCommitted(true); onSolve(correct); }}
        >
          {committed ? (correct ? "Sealed" : "Try again") : "Seal answer"}
        </SealButton>
        {committed && !correct ? (
          <SealButton color="ink" style={{marginLeft: 10}} onClick={() => { setCommitted(false); setPicked(null); }}>Reset</SealButton>
        ) : null}
      </div>
    </div>
  );
}

// ─────────── FILL-IN-THE-BLANKS ───────────
function FillBlank({ puzzle, onSolve, locked }) {
  const [vals, setVals] = React.useState(() => puzzle.blanks.map(() => ""));
  const [committed, setCommitted] = React.useState(false);
  const [correct, setCorrect] = React.useState(false);

  const parts = puzzle.code.split("___");
  const check = () => {
    const ok = vals.every((v, i) => {
      const accepts = puzzle.accept[i] || [puzzle.blanks[i]];
      return accepts.some(a => pStr(a) === pStr(v));
    });
    setCorrect(ok); setCommitted(true); onSolve(ok);
  };

  return (
    <div>
      <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 18, marginBottom: 14}}>{puzzle.prompt}</div>
      <pre style={{...codeStyle, marginBottom: 14}}>
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {p}
            {i < parts.length - 1 ? (
              <input
                value={vals[i]}
                disabled={locked || committed}
                onChange={(e) => setVals(v => v.map((x, j) => j === i ? e.target.value : x))}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14.5,
                  padding: "2px 6px",
                  background: "var(--vellum)",
                  border: `1.5px solid ${committed ? (correct ? "var(--moss)" : "var(--wax)") : "var(--ink)"}`,
                  color: "var(--ink)",
                  width: Math.max(60, (vals[i] || "").length * 9 + 30) + "px",
                  outline: "none",
                  borderRadius: 2,
                }}
                placeholder="…"
              />
            ) : null}
          </React.Fragment>
        ))}
      </pre>
      <SealButton color={committed ? (correct ? "moss" : "wax") : "ink"} disabled={committed && correct} onClick={committed ? () => setCommitted(false) : check}>
        {committed ? (correct ? "Sealed" : "Try again") : "Seal answer"}
      </SealButton>
    </div>
  );
}

// ─────────── PREDICT-OUTPUT ───────────
function Predict({ puzzle, onSolve, locked }) {
  const [val, setVal] = React.useState("");
  const [committed, setCommitted] = React.useState(false);
  const [correct, setCorrect] = React.useState(false);

  const check = () => {
    const accepts = puzzle.accept || [puzzle.answer];
    const ok = accepts.some(a => pStr(a) === pStr(val));
    setCorrect(ok); setCommitted(true); onSolve(ok);
  };

  return (
    <div>
      <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 18, marginBottom: 14}}>{puzzle.prompt}</div>
      <pre style={{...codeStyle, marginBottom: 14}}>{puzzle.code}</pre>
      <div style={{fontFamily: "'IM Fell English', serif", fontSize: 14, color: "var(--ink-70)", marginBottom: 4, letterSpacing: ".05em"}}>YOUR PREDICTION</div>
      <textarea
        value={val}
        disabled={locked || committed}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        style={{
          width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
          background: "var(--vellum)",
          border: `1.5px solid ${committed ? (correct ? "var(--moss)" : "var(--wax)") : "rgba(43,29,16,.4)"}`,
          padding: "8px 10px", color: "var(--ink)", borderRadius: 2,
          marginBottom: 12, resize: "vertical", outline: "none",
        }}
        placeholder="What will print?"
      />
      <SealButton color={committed ? (correct ? "moss" : "wax") : "ink"} disabled={committed && correct} onClick={committed ? () => setCommitted(false) : check}>
        {committed ? (correct ? "Sealed" : "Try again") : "Seal answer"}
      </SealButton>
      {committed && !correct ? (
        <div style={{marginTop: 10, fontSize: 13, fontFamily: "'Crimson Pro', serif", color: "var(--wax)"}}>
          Expected: <code style={{background: "rgba(162,58,42,.15)", padding: "1px 6px"}}>{puzzle.answer}</code>
        </div>
      ) : null}
    </div>
  );
}

// ─────────── FIX-BUG ───────────
function FixBug({ puzzle, onSolve, locked }) {
  const [picked, setPicked] = React.useState(null);
  const [committed, setCommitted] = React.useState(false);
  const correct = picked === puzzle.badLine;

  return (
    <div>
      <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 18, marginBottom: 14}}>{puzzle.prompt}</div>
      <div style={{...codeStyle, padding: 0, overflow: "hidden"}}>
        {puzzle.lines.map((line, i) => {
          const isPicked = picked === i;
          const showResult = committed && isPicked;
          return (
            <button
              key={i}
              disabled={locked || committed}
              onClick={() => setPicked(i)}
              style={{
                width: "100%", textAlign: "left",
                padding: "6px 12px",
                background: showResult ? (correct ? "rgba(61,107,74,.2)" : "rgba(162,58,42,.18)") : isPicked ? "rgba(43,29,16,.1)" : "transparent",
                border: "none",
                borderTop: i === 0 ? "none" : "1px dashed rgba(43,29,16,.18)",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
                color: "var(--ink)", cursor: committed ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <span style={{color: "var(--ink-70)", fontSize: 12, minWidth: 22}}>{i+1}</span>
              <span style={{flex: 1, whiteSpace: "pre"}}>{line}</span>
              {showResult ? (correct ? <IconCheck size={16}/> : <IconX size={16}/>) : null}
            </button>
          );
        })}
      </div>
      <div style={{marginTop: 16}}>
        <SealButton
          color={committed ? (correct ? "moss" : "wax") : "ink"}
          disabled={picked == null || (committed && correct)}
          onClick={() => committed ? (setCommitted(false), setPicked(null)) : (setCommitted(true), onSolve(correct))}
        >
          {committed ? (correct ? "Sealed" : "Try again") : "Seal answer"}
        </SealButton>
      </div>
    </div>
  );
}

// ─────────── DRAG-ASSEMBLE ───────────
function DragAssemble({ puzzle, onSolve, locked }) {
  // We use HTML5 drag-and-drop on a list. Lines are reorderable.
  const [order, setOrder] = React.useState(() => {
    // start in shuffled order from puzzle
    return puzzle.shuffled.slice();
  });
  const [committed, setCommitted] = React.useState(false);
  const [correct, setCorrect] = React.useState(false);
  const dragIdx = React.useRef(null);

  const onDragStart = (i) => (e) => { dragIdx.current = i; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (i) => (e) => { e.preventDefault(); };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    const from = dragIdx.current;
    if (from == null || from === i) return;
    setOrder(prev => {
      const next = prev.slice();
      const [m] = next.splice(from, 1);
      next.splice(i, 0, m);
      return next;
    });
    dragIdx.current = null;
  };

  const check = () => {
    const expected = puzzle.simpleOrdered || puzzle.ordered;
    const ok = order.length === expected.length && order.every((l, i) => l === expected[i]);
    setCorrect(ok); setCommitted(true); onSolve(ok);
  };

  const shuffle = () => {
    setOrder(prev => prev.slice().sort(() => Math.random() - 0.5));
    setCommitted(false); setCorrect(false);
  };

  return (
    <div>
      <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 18, marginBottom: 6}}>{puzzle.prompt}</div>
      <div style={{fontSize: 12, color: "var(--ink-70)", marginBottom: 12, fontStyle: "italic"}}>Drag lines to reorder.</div>
      <div style={{display: "flex", flexDirection: "column", gap: 6, marginBottom: 14}}>
        {order.map((line, i) => (
          <div
            key={line + "_" + i}
            draggable={!locked && !committed}
            onDragStart={onDragStart(i)}
            onDragOver={onDragOver(i)}
            onDrop={onDrop(i)}
            style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5,
              background: "var(--vellum)",
              border: `1.5px solid ${committed ? (correct ? "var(--moss)" : "var(--wax)") : "rgba(43,29,16,.3)"}`,
              padding: "8px 12px",
              cursor: committed ? "default" : "grab",
              display: "flex", alignItems: "center", gap: 10,
              borderRadius: 2,
              whiteSpace: "pre",
            }}
          >
            <span style={{color: "var(--ink-50)", fontSize: 12}}>≡</span>
            <span style={{flex: 1}}>{line}</span>
            <span style={{fontSize: 11, color: "var(--ink-50)"}}>{i + 1}</span>
          </div>
        ))}
      </div>
      <div style={{display: "flex", gap: 8}}>
        <SealButton color={committed ? (correct ? "moss" : "wax") : "ink"} disabled={committed && correct} onClick={committed ? () => setCommitted(false) : check}>
          {committed ? (correct ? "Sealed" : "Try again") : "Seal answer"}
        </SealButton>
        <QuietButton onClick={shuffle}>Re-shuffle</QuietButton>
      </div>
    </div>
  );
}

Object.assign(window, { MCQ, FillBlank, Predict, FixBug, DragAssemble, codeStyle });
