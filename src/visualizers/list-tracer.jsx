// list-tracer.jsx — D3 visualizer for list mutations (manual interpreter)
// Plays a scripted animation: append, pop(0), pop, etc.

function parseListScript(code) {
  // Very tiny interpreter: supports `inv = [..]`, `inv.append("x")`, `inv.pop(N)`, `inv.pop()`
  const lines = code.split("\n").map(l => l.trim()).filter(Boolean);
  const steps = [];
  let list = [];
  let varName = "inv";
  for (const line of lines) {
    let m;
    if ((m = line.match(/^(\w+)\s*=\s*\[(.*)\]$/))) {
      varName = m[1];
      list = m[2].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      steps.push({ kind: "init", label: `${varName} = [${list.map(x => `"${x}"`).join(", ")}]`, list: list.slice() });
    } else if ((m = line.match(/^(\w+)\.append\(\s*["']?(.+?)["']?\s*\)$/))) {
      const v = m[2].replace(/^["']|["']$/g, "");
      list = [...list, v];
      steps.push({ kind: "append", label: `${m[1]}.append("${v}")`, list: list.slice(), changed: list.length - 1 });
    } else if ((m = line.match(/^(\w+)\.pop\(\s*(\d+)?\s*\)$/))) {
      const idx = m[2] != null ? parseInt(m[2]) : list.length - 1;
      const v = list[idx];
      const before = list.slice();
      list = list.filter((_, i) => i !== idx);
      steps.push({ kind: "pop", label: `${m[1]}.pop(${m[2] ?? ""})`, removed: idx, removedVal: v, before, list: list.slice() });
    }
  }
  return steps;
}

function ListTracer({ puzzle }) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const steps = React.useMemo(() => parseListScript(puzzle.code), [puzzle.code]);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const w = 520, h = 90, slot = 70;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    const cur = steps[stepIdx];
    if (!cur) return;

    const xs = cur.list.map((_, i) => 20 + i * (slot + 10));

    const cells = svg.selectAll("g.cell").data(cur.list, (d, i) => d + "_" + i);
    const enter = cells.enter().append("g").attr("class", "cell")
      .attr("transform", (d, i) => `translate(${xs[i]}, 50) scale(0.6)`)
      .style("opacity", 0);

    enter.append("rect")
      .attr("width", slot).attr("height", 40)
      .attr("fill", "var(--vellum)")
      .attr("stroke", "var(--ink)").attr("stroke-width", 1.4)
      .attr("rx", 2);

    enter.append("text")
      .attr("x", slot/2).attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-family", "'JetBrains Mono', monospace")
      .attr("font-size", 13)
      .attr("fill", "var(--ink)")
      .text(d => d);

    enter.append("text")
      .attr("x", slot/2).attr("y", 56)
      .attr("text-anchor", "middle")
      .attr("font-family", "'IM Fell English', serif")
      .attr("font-size", 10)
      .attr("fill", "var(--ink-70)")
      .text((d, i) => `[${i}]`);

    enter.transition().duration(400)
      .attr("transform", (d, i) => `translate(${xs[i]}, 25) scale(1)`)
      .style("opacity", 1);

    cells.transition().duration(400)
      .attr("transform", (d, i) => `translate(${xs[i]}, 25) scale(1)`);

    cells.exit().transition().duration(300)
      .style("opacity", 0)
      .attr("transform", function() {
        const t = d3.select(this).attr("transform");
        return t + " scale(0.4)";
      })
      .remove();

    // Highlight changed
    if (cur.kind === "append" && cur.changed != null) {
      svg.selectAll("g.cell").filter((d, i) => i === cur.changed)
        .select("rect").attr("stroke", "var(--moss)").attr("stroke-width", 2.5);
    }
  }, [stepIdx, steps]);

  const next = () => setStepIdx(i => Math.min(i + 1, steps.length - 1));
  const prev = () => setStepIdx(i => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <div style={{background: "rgba(43,29,16,.04)", border: "1px solid rgba(43,29,16,.2)", padding: 14, marginBottom: 14}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8}}>
        <div style={{fontFamily: "'IM Fell English', serif", fontSize: 13, color: "var(--ink-70)", letterSpacing: ".08em"}}>
          STEP {stepIdx + 1} / {steps.length} —  <span style={{fontFamily: "'JetBrains Mono', monospace", color: "var(--ink)"}}>{steps[stepIdx]?.label}</span>
        </div>
        <div style={{display: "flex", gap: 6}}>
          <QuietButton onClick={reset} style={{padding: "4px 10px", fontSize: 13}}>↺</QuietButton>
          <QuietButton onClick={prev} disabled={stepIdx === 0} style={{padding: "4px 10px", fontSize: 13}}>‹</QuietButton>
          <QuietButton onClick={next} disabled={stepIdx === steps.length - 1} style={{padding: "4px 10px", fontSize: 13}}>›</QuietButton>
        </div>
      </div>
      <svg ref={ref} style={{width: "100%", height: 90, display: "block"}} />
    </div>
  );
}

window.ListTracer = ListTracer;
