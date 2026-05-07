// loop-tracer.jsx — D3 visualizer that ticks through a simple for-loop
// Hand-interprets `total = 0; for i in range(N): total += i` style code.

function parseLoopScript(code) {
  // Match: total = 0\nfor i in range(N): total += i  (operations supported: +=, *=, ++, -= )
  const initMatch = code.match(/^(\w+)\s*=\s*(-?\d+)/m);
  const forMatch = code.match(/for\s+(\w+)\s+in\s+range\((\d+)(?:,\s*(\d+))?\)/);
  const opMatch = code.match(/^\s*(\w+)\s*([+\-*/]?)=\s*(.+)$/m);

  if (!initMatch || !forMatch) return null;
  const accVar = initMatch[1];
  const accInit = parseInt(initMatch[2]);
  const iterVar = forMatch[1];
  const start = forMatch[3] != null ? parseInt(forMatch[2]) : 0;
  const end = forMatch[3] != null ? parseInt(forMatch[3]) : parseInt(forMatch[2]);

  const steps = [{ i: null, total: accInit, label: `${accVar} = ${accInit}` }];
  let acc = accInit;
  for (let i = start; i < end; i++) {
    // simulate `total += i`
    if (opMatch) {
      const op = opMatch[2];
      const expr = opMatch[3].trim();
      const operand = expr === iterVar ? i : parseInt(expr);
      if (op === "+") acc += operand;
      else if (op === "-") acc -= operand;
      else if (op === "*") acc *= operand;
      else if (op === "") acc = operand;
    }
    steps.push({ i, total: acc, label: `${iterVar}=${i}, ${accVar}=${acc}` });
  }
  return { accVar, iterVar, steps, end };
}

function LoopTracer({ puzzle }) {
  const data = React.useMemo(() => parseLoopScript(puzzle.code), [puzzle.code]);
  const [stepIdx, setStepIdx] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!playing || !data) return;
    if (stepIdx >= data.steps.length - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setStepIdx(i => i + 1), 600);
    return () => clearTimeout(id);
  }, [playing, stepIdx, data]);

  React.useEffect(() => {
    if (!ref.current || !data) return;
    const w = 520, h = 100;
    const slotW = Math.min(50, (w - 60) / data.end);
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    // Iterations row
    const xs = d3.range(data.end).map(i => 30 + i * (slotW + 6));
    svg.selectAll("g.iter").data(d3.range(data.end)).enter().append("g")
      .attr("class", "iter")
      .attr("transform", (d, i) => `translate(${xs[i]}, 12)`)
      .each(function(d) {
        const g = d3.select(this);
        g.append("rect")
          .attr("width", slotW).attr("height", 36)
          .attr("fill", "var(--vellum)")
          .attr("stroke", "var(--ink)").attr("stroke-width", 1.2)
          .attr("rx", 2);
        g.append("text")
          .attr("x", slotW/2).attr("y", 22)
          .attr("text-anchor", "middle")
          .attr("font-family", "'JetBrains Mono', monospace")
          .attr("font-size", 13).attr("fill", "var(--ink)")
          .text(d);
      });

    // Pointer (current iter)
    const cur = data.steps[stepIdx];
    if (cur.i != null) {
      svg.append("path")
        .attr("d", `M${xs[cur.i] + slotW/2},58 l-6,8 l12,0 z`)
        .attr("fill", "var(--wax)");
      svg.selectAll("g.iter").filter((d, i) => i === cur.i)
        .select("rect").attr("stroke", "var(--wax)").attr("stroke-width", 2.4);
    }

    // Accumulator pill
    svg.append("rect")
      .attr("x", 30).attr("y", 72).attr("width", w - 60).attr("height", 22)
      .attr("fill", "rgba(58,58,120,.08)").attr("stroke", "var(--royal)").attr("stroke-width", 1.2).attr("rx", 2);
    svg.append("text")
      .attr("x", 38).attr("y", 88)
      .attr("font-family", "'JetBrains Mono', monospace").attr("font-size", 13)
      .attr("fill", "var(--royal)")
      .text(`${data.accVar} = ${cur.total}`);
  }, [stepIdx, data]);

  if (!data) {
    return <div style={{padding: 12, fontStyle: "italic", color: "var(--ink-70)"}}>(tracer not available)</div>;
  }

  const reset = () => { setStepIdx(0); setPlaying(false); };
  return (
    <div style={{background: "rgba(43,29,16,.04)", border: "1px solid rgba(43,29,16,.2)", padding: 14, marginBottom: 14}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8}}>
        <div style={{fontFamily: "'IM Fell English', serif", fontSize: 13, color: "var(--ink-70)", letterSpacing: ".08em"}}>
          ITER {stepIdx} / {data.steps.length - 1}
        </div>
        <div style={{display: "flex", gap: 6}}>
          <QuietButton onClick={reset} style={{padding: "4px 10px", fontSize: 13}}>↺</QuietButton>
          <QuietButton onClick={() => setStepIdx(i => Math.max(i - 1, 0))} style={{padding: "4px 10px", fontSize: 13}}>‹</QuietButton>
          <QuietButton onClick={() => setPlaying(p => !p)} style={{padding: "4px 10px", fontSize: 13}}>{playing ? "❚❚" : "▶"}</QuietButton>
          <QuietButton onClick={() => setStepIdx(i => Math.min(i + 1, data.steps.length - 1))} style={{padding: "4px 10px", fontSize: 13}}>›</QuietButton>
        </div>
      </div>
      <svg ref={ref} style={{width: "100%", height: 110, display: "block"}} />
    </div>
  );
}

window.LoopTracer = LoopTracer;
