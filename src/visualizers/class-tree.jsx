// class-tree.jsx — D3 hierarchy diagram of a small class hierarchy

function ClassTree({ puzzle, highlightId }) {
  const ref = React.useRef(null);
  const nodes = puzzle.nodes;

  React.useEffect(() => {
    if (!ref.current) return;
    const w = 520, h = 220;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    // Build d3 hierarchy
    const rootData = {};
    const map = new Map(nodes.map(n => [n.id, { ...n, children: [] }]));
    let root = null;
    for (const n of nodes) {
      if (n.parent == null) root = map.get(n.id);
      else map.get(n.parent).children.push(map.get(n.id));
    }
    if (!root) return;

    const hierarchy = d3.hierarchy(root);
    const layout = d3.tree().size([w - 80, h - 80]);
    layout(hierarchy);

    // Edges
    svg.append("g").selectAll("path")
      .data(hierarchy.links())
      .enter().append("path")
      .attr("d", d => {
        const sx = d.source.x + 40, sy = d.source.y + 40;
        const tx = d.target.x + 40, ty = d.target.y + 40;
        return `M${sx},${sy} C${sx},${(sy+ty)/2} ${tx},${(sy+ty)/2} ${tx},${ty}`;
      })
      .attr("fill", "none")
      .attr("stroke", "var(--ink)")
      .attr("stroke-width", 1.2)
      .attr("opacity", 0.7);

    // Nodes
    const nodeG = svg.append("g").selectAll("g")
      .data(hierarchy.descendants())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x + 40}, ${d.y + 40})`);

    nodeG.append("rect")
      .attr("x", d => -Math.max(40, d.data.id.length * 5))
      .attr("y", -22)
      .attr("width", d => Math.max(40, d.data.id.length * 5) * 2)
      .attr("height", 44)
      .attr("rx", 2)
      .attr("fill", d => d.data.id === highlightId ? "rgba(200,162,73,.25)" : "var(--vellum)")
      .attr("stroke", d => d.data.id === highlightId ? "var(--gold)" : "var(--ink)")
      .attr("stroke-width", 1.5);

    nodeG.append("text")
      .attr("y", -4)
      .attr("text-anchor", "middle")
      .attr("font-family", "'IM Fell English SC', 'IM Fell English', serif")
      .attr("font-size", 14)
      .attr("fill", "var(--ink)")
      .text(d => d.data.id);

    nodeG.append("text")
      .attr("y", 12)
      .attr("text-anchor", "middle")
      .attr("font-family", "'JetBrains Mono', monospace")
      .attr("font-size", 9.5)
      .attr("fill", "var(--ink-70)")
      .text(d => (d.data.methods && d.data.methods.length) ? d.data.methods.join(" · ") : "—");
  }, [nodes, highlightId]);

  return (
    <div style={{background: "rgba(43,29,16,.04)", border: "1px solid rgba(43,29,16,.2)", padding: 14, marginBottom: 14}}>
      <svg ref={ref} style={{width: "100%", height: 220, display: "block"}} />
    </div>
  );
}

window.ClassTree = ClassTree;
