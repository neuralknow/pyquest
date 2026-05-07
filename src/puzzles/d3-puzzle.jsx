// d3-puzzle.jsx — wraps a visualizer + a question (mcq or predict-style)

function D3Puzzle({ puzzle, onSolve, locked }) {
  const Visual = puzzle.visual === "list-tracer" ? window.ListTracer
                : puzzle.visual === "loop-tracer" ? window.LoopTracer
                : puzzle.visual === "class-tree" ? window.ClassTree
                : null;

  const [picked, setPicked] = React.useState(null);
  const [val, setVal] = React.useState("");
  const [committed, setCommitted] = React.useState(false);
  const [correct, setCorrect] = React.useState(false);

  const isMCQ = Array.isArray(puzzle.options);

  const check = () => {
    let ok;
    if (isMCQ) {
      ok = picked === puzzle.answer;
    } else {
      const accepts = puzzle.accept || [puzzle.answer];
      const norm = (s) => (s ?? "").toString().trim().toLowerCase().replace(/\s+/g, " ").replace(/[\"']/g, "");
      ok = accepts.some(a => norm(a) === norm(val));
    }
    setCorrect(ok); setCommitted(true); onSolve(ok);
  };

  return (
    <div>
      <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 18, marginBottom: 14}}>{puzzle.prompt}</div>
      {Visual ? <Visual puzzle={puzzle} highlightId={null} /> : null}
      {puzzle.code ? <pre style={codeStyle}>{puzzle.code}</pre> : null}

      {isMCQ ? (
        <div style={{display: "flex", flexDirection: "column", gap: 8, marginTop: 12}}>
          {puzzle.options.map((opt, i) => {
            const isPicked = picked === i;
            const showResult = committed && isPicked;
            const isCorrect = i === puzzle.answer;
            return (
              <button key={i} disabled={locked || committed}
                onClick={() => setPicked(i)}
                style={{
                  textAlign: "left", padding: "10px 14px",
                  background: isPicked ? "rgba(43,29,16,.08)" : "transparent",
                  border: `1.5px solid ${
                    showResult ? (isCorrect ? "var(--moss)" : "var(--wax)") :
                    isPicked ? "var(--ink)" : "rgba(43,29,16,.3)"
                  }`,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
                  color: "var(--ink)", cursor: committed ? "default" : "pointer",
                  borderRadius: 2, display: "flex", alignItems: "center", gap: 10,
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
      ) : (
        <div style={{marginTop: 14}}>
          <div style={{fontFamily: "'IM Fell English', serif", fontSize: 14, color: "var(--ink-70)", marginBottom: 4, letterSpacing: ".05em"}}>YOUR ANSWER</div>
          <input
            value={val}
            disabled={locked || committed}
            onChange={(e) => setVal(e.target.value)}
            style={{
              width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
              background: "var(--vellum)",
              border: `1.5px solid ${committed ? (correct ? "var(--moss)" : "var(--wax)") : "rgba(43,29,16,.4)"}`,
              padding: "8px 10px", color: "var(--ink)", borderRadius: 2,
              marginBottom: 12, outline: "none", boxSizing: "border-box",
            }}
            placeholder="…"
          />
        </div>
      )}

      <div style={{marginTop: 14}}>
        <SealButton
          color={committed ? (correct ? "moss" : "wax") : "ink"}
          disabled={(isMCQ && picked == null) || (!isMCQ && !val.trim()) || (committed && correct)}
          onClick={committed ? () => setCommitted(false) : check}
        >
          {committed ? (correct ? "Sealed" : "Try again") : "Seal answer"}
        </SealButton>
        {committed && !correct && !isMCQ ? (
          <span style={{marginLeft: 12, fontSize: 13, fontFamily: "'Crimson Pro', serif", color: "var(--wax)"}}>
            Expected: <code style={{background: "rgba(162,58,42,.15)", padding: "1px 6px"}}>{puzzle.answer}</code>
          </span>
        ) : null}
      </div>
    </div>
  );
}

window.D3Puzzle = D3Puzzle;
