// map-scene.jsx — D3 Realm quest map (hand-drawn fantasy geography)

const mapStyles = {
  legendDot: (color) => ({
    width: 10, height: 10, borderRadius: "50%", background: color,
    border: "1px solid rgba(43,29,16,.5)",
  }),
};

// ---------- shared helpers ----------

function nodeFill(lvl, state) {
  if ((state.completed[lvl.id] || 0) > 0) return "var(--moss)";
  if (lvl.id <= state.unlockedChapters) return "var(--vellum)";
  return "rgba(43,29,16,.15)";
}
function nodeStroke(lvl, state) {
  if ((state.completed[lvl.id] || 0) > 0) return "var(--moss)";
  if (lvl.id === state.unlockedChapters) return "var(--gold)";
  return "var(--ink)";
}
function nodeStrokeW(lvl, state) {
  return lvl.id === state.unlockedChapters ? 3 : 1.5;
}
function numFill(lvl, state) {
  if ((state.completed[lvl.id] || 0) > 0) return "#fbf3df";
  return "var(--ink)";
}

// ---------- LAYOUT 1: REALM (hand-drawn geographic map) ----------
// A fictional kingdom with sea, coastline, forests, mountains, rivers.
// Chapter nodes are settlements along a winding road that crosses the realm.

// Hand-picked locations on a 1000x600 viewbox so the road traces a believable
// route: starts at a coastal port, climbs into hills, crosses river, threads
// mountains and forests, ends at an inland citadel.
const REALM_NODES = [
  { x: 110, y: 470, biome: "port" },        // 1 — coast
  { x: 200, y: 420, biome: "field" },       // 2
  { x: 290, y: 365, biome: "forest" },      // 3
  { x: 380, y: 405, biome: "river" },       // 4 — river crossing (bridge)
  { x: 460, y: 330, biome: "field" },       // 5
  { x: 540, y: 260, biome: "forest" },      // 6
  { x: 600, y: 180, biome: "mountain" },    // 7 — mountain pass
  { x: 690, y: 230, biome: "valley" },      // 8
  { x: 750, y: 320, biome: "forest" },      // 9
  { x: 820, y: 270, biome: "lake" },        // 10
  { x: 870, y: 200, biome: "mountain" },    // 11
  { x: 880, y: 110, biome: "tower" },       // 12
  { x: 800, y: 70,  biome: "citadel" },     // 13 — endpoint
];

function QuestMapRealm({ levels, state, onPickChapter }) {
  const ref = React.useRef(null);
  const miniRef = React.useRef(null);
  const zoomRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const W = 1000, H = 600;
  const [zoomLevel, setZoomLevel] = React.useState(1);

  React.useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    // Take only as many nodes as we have levels (handles future level changes)
    const positions = levels.map((_, i) => {
      const n = REALM_NODES[i] || REALM_NODES[REALM_NODES.length - 1];
      return { x: n.x, y: n.y, biome: n.biome };
    });

    // Outer clipping rect so panned content doesn't bleed
    svg.append("defs").append("clipPath").attr("id", "realm-clip")
      .append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H);

    // Background fill (outside the zoomed group, so it stays full-bleed)
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H)
      .attr("fill", "var(--vellum)");

    // The zoom-and-pan group: ALL world content goes here
    const world = svg.append("g")
      .attr("class", "world")
      .attr("clip-path", "url(#realm-clip)");
    // Inner wrapper that receives the zoom transform
    const root = world.append("g").attr("class", "zoom-root");

    // Subtle aged parchment grain (concentric speckle ovals)
    const grain = root.append("g").attr("opacity", 0.08);
    for (let i = 0; i < 60; i++) {
      const cx = (i * 137) % W;
      const cy = (i * 211) % H;
      grain.append("circle").attr("cx", cx).attr("cy", cy)
        .attr("r", 0.5 + (i % 3) * 0.4).attr("fill", "var(--ink)");
    }

    // ----- SEA (left edge + bottom-left) -----
    const seaGroup = root.append("g");
    seaGroup.append("path")
      .attr("d", "M0,400 Q80,520 0,600 L0,600 L160,600 Q120,540 80,500 Q40,460 0,400 Z")
      .attr("fill", "rgba(58,58,120,0.10)")
      .attr("stroke", "var(--ink)").attr("stroke-width", 1).attr("opacity", 0.6);
    // Wave hatching
    for (let i = 0; i < 6; i++) {
      seaGroup.append("path")
        .attr("d", `M${5 + i*10},${440 + i*20} q8,-4 16,0 q8,4 16,0`)
        .attr("fill", "none")
        .attr("stroke", "var(--ink)").attr("stroke-width", 0.6).attr("opacity", 0.4);
    }
    // Coastline
    root.append("path")
      .attr("d", "M0,400 Q60,440 100,460 Q140,475 180,500 Q200,520 160,600")
      .attr("fill", "none").attr("stroke", "var(--ink)")
      .attr("stroke-width", 1.4).attr("opacity", 0.7);

    // Compass rose (top-left)
    const compass = root.append("g").attr("transform", "translate(60, 70)").attr("opacity", 0.7);
    compass.append("circle").attr("r", 24).attr("fill", "none")
      .attr("stroke", "var(--ink)").attr("stroke-width", 1);
    compass.append("circle").attr("r", 18).attr("fill", "none")
      .attr("stroke", "var(--ink)").attr("stroke-width", 0.6).attr("stroke-dasharray", "2 2");
    compass.append("path").attr("d", "M0,-22 L4,0 L0,22 L-4,0 Z")
      .attr("fill", "var(--ink)").attr("opacity", 0.85);
    compass.append("path").attr("d", "M-22,0 L0,4 L22,0 L0,-4 Z")
      .attr("fill", "var(--ink)").attr("opacity", 0.45);
    compass.append("text").attr("y", -28).attr("text-anchor", "middle")
      .attr("font-family", "'IM Fell English SC', serif").attr("font-size", 11)
      .attr("fill", "var(--ink)").text("N");

    // Decorative title cartouche
    const cart = root.append("g").attr("transform", "translate(370, 40)");
    cart.append("path")
      .attr("d", "M0,0 q120,-14 240,0 q12,8 0,16 q-120,14 -240,0 q-12,-8 0,-16 Z")
      .attr("fill", "var(--parchment-deep)")
      .attr("stroke", "var(--ink)").attr("stroke-width", 1).attr("opacity", 0.9);
    cart.append("text").attr("x", 120).attr("y", 12).attr("text-anchor", "middle")
      .attr("font-family", "'IM Fell English SC', 'IM Fell English', serif")
      .attr("font-size", 14).attr("letter-spacing", "0.15em")
      .attr("fill", "var(--ink)").text("THE REALM OF PYTHIA");

    // ----- TERRAIN: forests, mountains, hills, river, lake -----
    const terrain = root.append("g").attr("opacity", 0.85);

    // Forest patches: clusters of small triangles
    function drawForest(cx, cy, count, spread) {
      for (let i = 0; i < count; i++) {
        const ang = (i * 137.5) * Math.PI / 180;
        const r = (i % 4) * spread * 0.5 + spread * 0.3;
        const x = cx + Math.cos(ang) * r + ((i*13)%9 - 4);
        const y = cy + Math.sin(ang) * r * 0.6 + ((i*7)%7 - 3);
        terrain.append("path")
          .attr("d", `M${x-4},${y+5} L${x},${y-5} L${x+4},${y+5} Z`)
          .attr("fill", "var(--moss)").attr("opacity", 0.55)
          .attr("stroke", "var(--ink)").attr("stroke-width", 0.5);
      }
    }
    drawForest(280, 360, 9, 18);   // chapter 3 forest
    drawForest(540, 250, 10, 22);  // chapter 6 forest
    drawForest(750, 340, 12, 24);  // chapter 9 forest
    drawForest(420, 470, 7, 16);   // small grove south

    // Mountain ranges: angular peaks
    function drawMountain(x, y, w, h) {
      const path = `M${x},${y} L${x+w*0.3},${y-h} L${x+w*0.5},${y-h*0.6} L${x+w*0.7},${y-h*1.1} L${x+w},${y} Z`;
      terrain.append("path").attr("d", path)
        .attr("fill", "var(--parchment-deep)").attr("stroke", "var(--ink)")
        .attr("stroke-width", 1).attr("opacity", 0.9);
      // shading hatches
      terrain.append("path")
        .attr("d", `M${x+w*0.3},${y-h} L${x+w*0.4},${y-h*0.5}`)
        .attr("stroke", "var(--ink)").attr("stroke-width", 0.6).attr("opacity", 0.4);
      terrain.append("path")
        .attr("d", `M${x+w*0.7},${y-h*1.1} L${x+w*0.78},${y-h*0.5}`)
        .attr("stroke", "var(--ink)").attr("stroke-width", 0.6).attr("opacity", 0.4);
    }
    drawMountain(560, 200, 90, 50);  // chapter 7 pass
    drawMountain(620, 220, 60, 35);
    drawMountain(840, 230, 80, 60);  // chapter 11
    drawMountain(900, 215, 60, 40);

    // Hills (gentle bumps)
    function drawHill(x, y, w) {
      terrain.append("path").attr("d", `M${x},${y} q${w/2},-${w*0.35} ${w},0`)
        .attr("fill", "none").attr("stroke", "var(--ink)")
        .attr("stroke-width", 0.9).attr("opacity", 0.55);
    }
    drawHill(170, 410, 50);
    drawHill(220, 405, 60);
    drawHill(440, 320, 55);
    drawHill(680, 250, 50);

    // River: meanders down through chapter 4 crossing
    root.append("path")
      .attr("d", "M340,100 Q360,200 380,290 Q395,370 380,420 Q370,470 400,540 Q420,580 440,600")
      .attr("fill", "none")
      .attr("stroke", "rgba(58,58,120,0.45)")
      .attr("stroke-width", 5).attr("opacity", 0.7);
    root.append("path")
      .attr("d", "M340,100 Q360,200 380,290 Q395,370 380,420 Q370,470 400,540 Q420,580 440,600")
      .attr("fill", "none")
      .attr("stroke", "var(--ink)")
      .attr("stroke-width", 0.7).attr("opacity", 0.5);

    // Lake (chapter 10)
    root.append("ellipse").attr("cx", 820).attr("cy", 300).attr("rx", 36).attr("ry", 18)
      .attr("fill", "rgba(58,58,120,0.20)")
      .attr("stroke", "var(--ink)").attr("stroke-width", 0.9).attr("opacity", 0.7);
    root.append("text").attr("x", 820).attr("y", 296).attr("text-anchor", "middle")
      .attr("font-family", "'Crimson Pro', serif").attr("font-style", "italic")
      .attr("font-size", 10).attr("fill", "var(--ink-70)").text("Mirror Lake");

    // Region labels (italic, sparse)
    function regionLabel(x, y, t, size = 12) {
      root.append("text").attr("x", x).attr("y", y).attr("text-anchor", "middle")
        .attr("font-family", "'IM Fell English SC', 'IM Fell English', serif")
        .attr("font-size", size).attr("letter-spacing", "0.18em")
        .attr("fill", "var(--ink-70)").attr("opacity", 0.7)
        .text(t);
    }
    regionLabel(70, 540, "THE WAKING SEA", 11);
    regionLabel(540, 145, "DRAGONSPINE PASS", 11);
    regionLabel(280, 290, "WHISPERING WOOD", 11);
    regionLabel(830, 380, "THE LATE WILDS", 11);

    // ----- ROAD: dotted full path + gold completed portion -----
    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.6))
      .x(d => d.x).y(d => d.y);
    const pathStr = line(positions);

    root.append("path").attr("d", pathStr).attr("fill", "none")
      .attr("stroke", "var(--ink)").attr("stroke-width", 1.6)
      .attr("stroke-dasharray", "1 5").attr("stroke-linecap", "round")
      .attr("opacity", 0.55);

    const completed = state.unlockedChapters - 1;
    if (completed > 0) {
      const progPath = root.append("path").attr("d", pathStr).attr("fill", "none")
        .attr("stroke", "var(--gold)").attr("stroke-width", 3.2).attr("opacity", 0.9)
        .attr("stroke-linecap", "round");
      const total = progPath.node().getTotalLength();
      const portion = Math.min(1, completed / (levels.length - 1));
      progPath.attr("stroke-dasharray", total).attr("stroke-dashoffset", total)
        .transition().duration(1400).attr("stroke-dashoffset", total * (1 - portion));
    }

    // Bridge marker on river crossing (chapter 4)
    if (positions[3]) {
      const b = positions[3];
      root.append("path")
        .attr("d", `M${b.x-12},${b.y-4} L${b.x+12},${b.y-4} M${b.x-12},${b.y+4} L${b.x+12},${b.y+4}`)
        .attr("stroke", "var(--ink)").attr("stroke-width", 1.4).attr("opacity", 0.85);
    }

    // ----- NODES (settlements) -----
    const nodes = root.selectAll("g.node").data(positions).enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("cursor", (d, i) => (i + 1) <= state.unlockedChapters ? "pointer" : "not-allowed")
      .on("click", (e, d) => {
        const i = positions.indexOf(d);
        const chapId = levels[i].id;
        if (chapId <= state.unlockedChapters) onPickChapter(chapId);
      });

    // Outer halo for current chapter
    nodes.filter((d, i) => levels[i].id === state.unlockedChapters)
      .append("circle").attr("r", 30).attr("fill", "var(--gold)").attr("opacity", 0.18);

    // Settlement disc
    nodes.append("circle").attr("r", 18)
      .attr("fill", (d, i) => nodeFill(levels[i], state))
      .attr("stroke", (d, i) => nodeStroke(levels[i], state))
      .attr("stroke-width", (d, i) => nodeStrokeW(levels[i], state));

    // Number / lock
    nodes.append("text").attr("text-anchor", "middle").attr("dy", 5)
      .attr("font-family", "'IM Fell English SC', 'IM Fell English', serif")
      .attr("font-size", 15)
      .attr("fill", (d, i) => numFill(levels[i], state))
      .text((d, i) => levels[i].id > state.unlockedChapters ? "" : String(levels[i].id));

    nodes.filter((d, i) => levels[i].id > state.unlockedChapters)
      .append("path")
      .attr("d", "M-4,-1.5 h8 v5 h-8 z M-2.5,-1.5 v-2.5 a2.5,2.5 0 0,1 5,0 v2.5")
      .attr("fill", "none").attr("stroke", "var(--ink)").attr("stroke-width", 1.2)
      .attr("transform", "translate(0, 1)");

    // Topic name beneath each node — alternating above/below to dodge collision
    nodes.append("text").attr("class", "lbl-topic")
      .attr("text-anchor", "middle")
      .attr("y", (d, i) => i % 2 === 0 ? -28 : 36)
      .attr("font-family", "'IM Fell English', serif")
      .attr("font-size", 14)
      .attr("fill", "var(--ink)")
      .attr("opacity", (d, i) => levels[i].id <= state.unlockedChapters ? 0.95 : 0.5)
      .text((d, i) => levels[i].topic);

    // Hover highlight
    nodes.on("mouseenter", function(e, d) {
      const i = positions.indexOf(d);
      if (levels[i].id > state.unlockedChapters) return;
      d3.select(this).select("circle:not(:first-child), circle").filter(function(_, idx, arr) {
        return idx === arr.length - 1; // ignore halo if any
      });
      d3.select(this).selectAll("circle").filter(function() {
        return +d3.select(this).attr("r") === 18;
      }).transition().duration(150).attr("r", 22);
    }).on("mouseleave", function() {
      d3.select(this).selectAll("circle").filter(function() {
        const r = +d3.select(this).attr("r");
        return r === 22 || r === 23;
      }).transition().duration(150).attr("r", 18);
    });

    // Sea-monster flourish (decorative) in bottom-left water
    const monster = root.append("g").attr("transform", "translate(70, 555)").attr("opacity", 0.55);
    monster.append("path")
      .attr("d", "M0,0 q6,-8 14,-2 q-2,6 4,8 q4,1 8,-3 q-2,7 -10,8 q-10,1 -16,-11")
      .attr("fill", "none").attr("stroke", "var(--ink)").attr("stroke-width", 1);
    monster.append("circle").attr("cx", 12).attr("cy", -3).attr("r", 0.7).attr("fill", "var(--ink)");

    // ----- ZOOM + PAN -----
    const minScale = 1, maxScale = 4;
    const zoom = d3.zoom()
      .scaleExtent([minScale, maxScale])
      .translateExtent([[0, 0], [W, H]])
      .extent([[0, 0], [W, H]])
      .filter((event) => {
        // allow drag-pan + wheel; ignore right-click and double-click handled separately
        if (event.type === "wheel") return true;
        if (event.type === "mousedown" || event.type === "touchstart" || event.type === "pointerdown") return true;
        return !event.ctrlKey && !event.button;
      })
      .on("zoom", (event) => {
        const t = event.transform;
        root.attr("transform", t);
        setZoomLevel(t.k);
        // Update minimap viewport rect
        if (miniRef.current) {
          const mini = d3.select(miniRef.current);
          const vw = W / t.k, vh = H / t.k;
          const vx = -t.x / t.k, vy = -t.y / t.k;
          mini.select("rect.viewport")
            .attr("x", vx).attr("y", vy)
            .attr("width", vw).attr("height", vh);
        }
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    // Initial transform: center on current chapter at scale 2.2
    const currentIdx = Math.max(0, Math.min(positions.length - 1, state.unlockedChapters - 1));
    const focus = positions[currentIdx];
    const initScale = 2.2;
    const tx = W/2 - focus.x * initScale;
    const ty = H/2 - focus.y * initScale;
    const initT = d3.zoomIdentity.translate(tx, ty).scale(initScale);
    svg.transition().duration(900).call(zoom.transform, initT);

    // ----- MINIMAP -----
    if (miniRef.current) {
      const mini = d3.select(miniRef.current);
      mini.selectAll("*").remove();
      mini.attr("viewBox", `0 0 ${W} ${H}`);
      // Background
      mini.append("rect").attr("x", 0).attr("y", 0).attr("width", W).attr("height", H)
        .attr("fill", "var(--vellum)").attr("stroke", "var(--ink)").attr("stroke-width", 4);
      // Sea silhouette
      mini.append("path")
        .attr("d", "M0,400 Q80,520 0,600 L0,600 L160,600 Q120,540 80,500 Q40,460 0,400 Z")
        .attr("fill", "rgba(58,58,120,0.20)");
      // Forest blobs
      const forests = [[280,360],[540,250],[750,340],[420,470]];
      forests.forEach(([x,y]) => {
        mini.append("circle").attr("cx", x).attr("cy", y).attr("r", 26)
          .attr("fill", "var(--moss)").attr("opacity", 0.45);
      });
      // Mountain blobs
      const mountains = [[600,200],[860,220]];
      mountains.forEach(([x,y]) => {
        mini.append("circle").attr("cx", x).attr("cy", y).attr("r", 30)
          .attr("fill", "var(--parchment-deep)").attr("stroke", "var(--ink)").attr("stroke-width", 2);
      });
      // River
      mini.append("path")
        .attr("d", "M340,100 Q360,200 380,290 Q395,370 380,420 Q370,470 400,540 Q420,580 440,600")
        .attr("fill", "none").attr("stroke", "rgba(58,58,120,0.5)").attr("stroke-width", 6);
      // Road as dotted
      mini.append("path").attr("d", line(positions)).attr("fill", "none")
        .attr("stroke", "var(--ink)").attr("stroke-width", 3)
        .attr("stroke-dasharray", "6 8").attr("opacity", 0.65);
      // Node dots
      positions.forEach((p, i) => {
        const lvl = levels[i];
        mini.append("circle").attr("cx", p.x).attr("cy", p.y).attr("r", 9)
          .attr("fill", nodeFill(lvl, state))
          .attr("stroke", nodeStroke(lvl, state))
          .attr("stroke-width", 2);
      });
      // Viewport rectangle (initial position based on initial transform)
      mini.append("rect").attr("class", "viewport")
        .attr("x", -tx / initScale).attr("y", -ty / initScale)
        .attr("width", W / initScale).attr("height", H / initScale)
        .attr("fill", "rgba(200,162,73,0.18)")
        .attr("stroke", "var(--gold)").attr("stroke-width", 6)
        .style("pointer-events", "none");

      // Click on minimap → recenter main map there
      mini.on("click", (event) => {
        const [mx, my] = d3.pointer(event, mini.node());
        const t = d3.zoomTransform(svg.node());
        const k = t.k;
        const newT = d3.zoomIdentity.translate(W/2 - mx * k, H/2 - my * k).scale(k);
        svg.transition().duration(400).call(zoom.transform, newT);
      }).style("cursor", "crosshair");
    }
  }, [levels, state.unlockedChapters, state.completed]);

  // Imperative zoom controls
  const doZoom = (factor) => {
    if (!ref.current || !zoomRef.current) return;
    const svg = d3.select(ref.current);
    svg.transition().duration(250).call(zoomRef.current.scaleBy, factor);
  };
  const recenter = () => {
    if (!ref.current || !zoomRef.current) return;
    const svg = d3.select(ref.current);
    const positions = levels.map((_, i) => REALM_NODES[i] || REALM_NODES[REALM_NODES.length - 1]);
    const currentIdx = Math.max(0, Math.min(positions.length - 1, state.unlockedChapters - 1));
    const focus = positions[currentIdx];
    const initScale = 2.2;
    const tx = W/2 - focus.x * initScale;
    const ty = H/2 - focus.y * initScale;
    const initT = d3.zoomIdentity.translate(tx, ty).scale(initScale);
    svg.transition().duration(500).call(zoomRef.current.transform, initT);
  };
  const reset = () => {
    if (!ref.current || !zoomRef.current) return;
    const svg = d3.select(ref.current);
    svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  const ctrlBtn = {
    width: 30, height: 30, padding: 0,
    background: "var(--vellum)", border: "1.5px solid var(--ink)",
    color: "var(--ink)", cursor: "pointer",
    fontFamily: "'IM Fell English', serif", fontSize: 16, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 2,
  };

  return (
    <div ref={containerRef} style={{position: "relative", width: "100%", aspectRatio: "1000 / 600"}}>
      <svg ref={ref} style={{
        width: "100%", height: "100%", display: "block",
        cursor: "grab", touchAction: "none",
      }} preserveAspectRatio="xMidYMid meet" />

      {/* Zoom controls */}
      <div style={{
        position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column",
        gap: 6, zIndex: 5,
      }}>
        <button style={ctrlBtn} onClick={() => doZoom(1.4)} title="Zoom in">+</button>
        <button style={ctrlBtn} onClick={() => doZoom(1/1.4)} title="Zoom out">−</button>
        <button style={{...ctrlBtn, fontSize: 11}} onClick={recenter} title="Center on current chapter">◎</button>
        <button style={{...ctrlBtn, fontSize: 11}} onClick={reset} title="Show whole realm">▣</button>
        <div style={{
          fontFamily: "'Crimson Pro', serif", fontSize: 11, color: "var(--ink-70)",
          textAlign: "center", marginTop: 2, fontStyle: "italic",
        }}>{Math.round(zoomLevel * 100) / 100}×</div>
      </div>

      {/* Minimap */}
      <div style={{position: "absolute", bottom: 12, right: 12, width: 160, height: 96,
        border: "1.5px solid var(--ink)", background: "var(--vellum)",
        boxShadow: "0 2px 8px rgba(43,29,16,0.25)", zIndex: 5, borderRadius: 2,
        overflow: "hidden",
      }} className="pq-map-minimap">
        <svg ref={miniRef} style={{width: "100%", height: "100%", display: "block"}}
          preserveAspectRatio="xMidYMid meet" />
        <div style={{
          position: "absolute", top: 2, left: 4,
          fontFamily: "'IM Fell English SC', serif", fontSize: 9,
          color: "var(--ink-70)", letterSpacing: "0.1em", pointerEvents: "none",
        }}>THE REALM</div>
      </div>
    </div>
  );
}

function QuestMap({ levels, state, onPickChapter }) {
  return <QuestMapRealm levels={levels} state={state} onPickChapter={onPickChapter} />;
}

// ---------- Why learn the Python tongue? — narrative scroll under the map ----------

const PROPHECIES = [
  {
    title: "The Tongue of Familiars",
    body: "Among all coding tongues, Python is the most welcoming. Its syntax reads like sentences — variables and verbs, conditions and consequences. Where other languages demand armour and ceremony, Python asks only that you mean what you write. Master it here, and the rest of the coding realms will open their gates without protest.",
    sigil: "scroll",
  },
  {
    title: "The Path to the Thinking Engines",
    body: "Beyond these chapters lies a stranger country: the realm of artificial minds. Almost every great Thinking Engine of our age — the language oracles, the vision-seers, the agents who reason and plan — is summoned, trained, and bound through Python. PyTorch, TensorFlow, JAX, scikit-learn, Hugging Face — these are the workshops, and Python is the lingua franca spoken in each.",
    sigil: "flame",
  },
  {
    title: "What You Will Be Able to Do",
    body: "Once your scrolls are filled, you will speak directly to the great models — fine-tune them upon your own data, chain their thoughts into agents, build retrieval-augmented oracles that reason across libraries of text. You will train classifiers that read images and graphs that learn. The puzzles in this quest — comprehensions, generators, decorators, async — are the very tools the AI loremasters use every day.",
    sigil: "tome",
  },
  {
    title: "Why Begin Now",
    body: "The thinking engines grow stronger with each turning of the moon, and those who can speak Python will shape what they become. Every chapter you unfurl here — from a humble variable to async tides — is a rune in a far larger spell. Walk the road. The Realm of Thinking Engines waits at its end.",
    sigil: "tower",
  },
];

function ProphecySigil({ kind, size = 22 }) {
  const sw = 1.4;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "flame") {
    return (
      <svg {...common}>
        <path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4-.5 2 .5 3 2 3 0-2-1-4 0-7Z"/>
      </svg>
    );
  }
  if (kind === "tome") {
    return (
      <svg {...common}>
        <path d="M5 5h10a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3Z"/>
        <path d="M5 5v11"/>
        <path d="M9 9h6M9 12h6"/>
      </svg>
    );
  }
  if (kind === "tower") {
    return (
      <svg {...common}>
        <path d="M8 21V9l4-4 4 4v12"/>
        <path d="M5 21h14"/>
        <path d="M11 21v-5h2v5"/>
        <path d="M10 9h4"/>
      </svg>
    );
  }
  // scroll
  return (
    <svg {...common}>
      <path d="M6 5h10a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2Z"/>
      <path d="M6 5a2 2 0 0 0-2 2v10"/>
      <path d="M9 9h6M9 12h4"/>
    </svg>
  );
}

function WhyPythonScroll() {
  return (
    <ScrollCard style={{padding: "22px 26px"}}>
      <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4}}>
        <div style={{
          fontFamily: "'IM Fell English SC', 'IM Fell English', serif",
          fontSize: 26, lineHeight: 1.1, color: "var(--ink)",
        }}>
          Why Learn the Python Tongue?
        </div>
        <div style={{
          fontFamily: "'IM Fell English', serif", fontSize: 12,
          color: "var(--ink-70)", letterSpacing: ".12em",
        }}>
          A PROPHECY · TO THE TRAVELLER
        </div>
      </div>
      <div style={{
        height: 1, background: "rgba(43,29,16,.25)",
        backgroundImage: "repeating-linear-gradient(90deg, var(--ink) 0 4px, transparent 4px 9px)",
        opacity: .55, marginBottom: 16,
      }}/>

      <div style={{
        fontFamily: "'Crimson Pro', serif", fontSize: 16, lineHeight: 1.65,
        color: "var(--ink)", fontStyle: "italic", marginBottom: 18,
      }}>
        Hark, traveller. Before you press onward through the Realm, hear why the
        masters of every tower and academy bid their apprentices learn this tongue
        first — and why your road from these chapters leads, at its end, to the
        very forges of the <span style={{fontStyle: "normal", color: "var(--royal)"}}>Thinking Engines</span>.
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 18,
      }}>
        {PROPHECIES.map((p, i) => (
          <div key={i} style={{display: "flex", gap: 12, alignItems: "flex-start"}}>
            <div style={{
              flexShrink: 0, width: 38, height: 38,
              border: "1.4px solid var(--ink)",
              background: "var(--parchment-deep)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--ink)", borderRadius: 2,
            }}>
              <ProphecySigil kind={p.sigil} size={22}/>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{
                fontFamily: "'IM Fell English SC', 'IM Fell English', serif",
                fontSize: 16, lineHeight: 1.2, color: "var(--ink)", marginBottom: 4,
              }}>{p.title}</div>
              <div style={{
                fontFamily: "'Crimson Pro', serif", fontSize: 14.5, lineHeight: 1.55,
                color: "var(--ink-70)",
              }}>{p.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20, paddingTop: 14,
        borderTop: "1px dashed rgba(43,29,16,.35)",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{
          fontFamily: "'Crimson Pro', serif", fontStyle: "italic",
          fontSize: 14, color: "var(--ink-70)",
        }}>
          "Speak Python well, and the engines that think will answer you."
        </div>
        <div style={{
          fontFamily: "'IM Fell English', serif", fontSize: 12,
          color: "var(--ink-50)", letterSpacing: ".1em",
        }}>
          — TRANSCRIBED BY THE LOREKEEPER
        </div>
      </div>
    </ScrollCard>
  );
}

function MapScene({ state, onPickChapter, onResetClass, headerActions }) {
  const levels = window.PYQUEST_LEVELS;
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  return (
    <div className="pq-page">
      {confirmOpen ? (
        <ResetConfirmModal
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => { setConfirmOpen(false); if (onResetClass) onResetClass(); }}
        />
      ) : null}
      <div className="pq-header">
        <div>
          <div className="pq-title-big" style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 36, lineHeight: 1, color: "var(--ink)"}}>The Quest Map</div>
          <div style={{fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: "var(--ink-70)", marginTop: 4}}>
            Chapter {Math.min(state.unlockedChapters, levels.length)} of {levels.length} unfurled. Choose your path.
          </div>
        </div>
        <div className="pq-header-actions" style={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10}}>
          <div style={{display: "flex", gap: 8}}>
            {headerActions || null}
            <button
              onClick={() => setConfirmOpen(true)}
              title="Begin a new tale (erases all progress)"
              style={{
                fontFamily: "'IM Fell English', serif",
                fontSize: 13, letterSpacing: ".05em",
                padding: "6px 12px",
                background: "transparent",
                color: "var(--wax)",
                border: "1px solid var(--wax)",
                cursor: "pointer",
                borderRadius: 2,
              }}
            >Begin Anew</button>
          </div>
          <div style={{display: "flex", gap: 18, fontSize: 12, fontFamily: "'IM Fell English', serif", color: "var(--ink-70)", letterSpacing: ".06em"}}>
            <div style={{display: "flex", alignItems: "center", gap: 6}}><div style={mapStyles.legendDot("var(--moss)")}/>SOLVED</div>
            <div style={{display: "flex", alignItems: "center", gap: 6}}><div style={mapStyles.legendDot("var(--gold)")}/>NEXT</div>
            <div style={{display: "flex", alignItems: "center", gap: 6}}><div style={mapStyles.legendDot("rgba(43,29,16,.15)")}/>LOCKED</div>
          </div>
        </div>
      </div>

      <div className="pq-twocol">
        <div style={{display: "flex", flexDirection: "column", gap: 16, minWidth: 0}}>
          <ScrollCard style={{padding: 12, overflow: "hidden"}}>
            <QuestMap levels={levels} state={state} onPickChapter={onPickChapter} />
          </ScrollCard>
          <WhyPythonScroll />
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          <HeroCard state={state} />
          <ScrollCard style={{padding: 16}}>
            <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 18, marginBottom: 8, color: "var(--ink)"}}>The Quest Log</div>
            <div style={{display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto"}}>
              {levels.map((lvl) => {
                const unlocked = lvl.id <= state.unlockedChapters;
                const solved = (state.completed[lvl.id] || 0);
                const pool = lvl.puzzles.length;
                const seen = (state.seen[lvl.id] || []).length;
                const Sigil = SIGILS[lvl.sigil] || SigilScroll;
                const mastered = seen >= pool;
                return (
                  <button
                    key={lvl.id}
                    disabled={!unlocked}
                    onClick={() => onPickChapter(lvl.id)}
                    style={{
                      textAlign: "left", padding: "8px 10px",
                      background: !unlocked ? "rgba(43,29,16,.04)" : solved ? "rgba(61,107,74,.1)" : "transparent",
                      border: "1px solid rgba(43,29,16,.25)",
                      cursor: unlocked ? "pointer" : "not-allowed",
                      opacity: unlocked ? 1 : 0.5,
                      display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "'Crimson Pro', serif", fontSize: 14,
                      color: "var(--ink)", borderRadius: 2,
                    }}
                  >
                    <span style={{color: solved ? "var(--moss)" : "var(--ink-70)", display: "flex"}}>
                      {!unlocked ? <IconLock size={16}/> : <Sigil size={18} sw={1.4} />}
                    </span>
                    <span style={{flex: 1}}>
                      <span style={{display: "block", fontFamily: "'IM Fell English', serif", fontSize: 14}}>{lvl.id}. {lvl.topic}</span>
                      <span style={{display: "block", fontSize: 11, color: "var(--ink-70)", fontStyle: "italic"}}>
                        {!unlocked ? `Locked` : mastered ? "Mastered ✦" : `${seen}/${pool} solved`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollCard>
        </div>
      </div>
    </div>
  );
}

window.MapScene = MapScene;
window.QuestMap = QuestMap;

// ── Reset confirmation modal ────────────────────────────────────────────────
function ResetConfirmModal({ onCancel, onConfirm }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel, onConfirm]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(20, 16, 10, 0.55)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        style={{
          maxWidth: 460, width: "100%",
          background: "var(--vellum)",
          border: "1px solid var(--ink)",
          padding: "28px 28px 22px",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,.6)",
          fontFamily: "'Crimson Pro', serif",
          color: "var(--ink)",
          position: "relative",
        }}
      >
        {/* Wax seal accent */}
        <div style={{
          position: "absolute", top: -14, left: 28,
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--wax)",
          border: "2px solid var(--ink)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'IM Fell English SC', serif",
          color: "var(--vellum)", fontSize: 14,
        }}>!</div>

        <div
          id="reset-modal-title"
          style={{
            fontFamily: "'IM Fell English SC', 'IM Fell English', serif",
            fontSize: 24, lineHeight: 1.1, marginBottom: 10, color: "var(--ink)",
          }}
        >Begin the tale anew?</div>

        <div style={{fontStyle: "italic", color: "var(--ink-70)", fontSize: 15, lineHeight: 1.55, marginBottom: 18}}>
          Burning the scroll erases your name, your chosen order, every quest you have solved,
          and all earned XP and mana. There is no undoing it.
        </div>

        <div style={{display: "flex", gap: 10, justifyContent: "flex-end"}}>
          <button
            onClick={onCancel}
            autoFocus
            style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: 14, letterSpacing: ".05em",
              padding: "8px 16px",
              background: "transparent",
              color: "var(--ink)",
              border: "1px solid var(--ink-30)",
              cursor: "pointer",
              borderRadius: 2,
            }}
          >Keep my tale</button>
          <button
            onClick={onConfirm}
            style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: 14, letterSpacing: ".05em",
              padding: "8px 16px",
              background: "var(--wax)",
              color: "var(--vellum)",
              border: "1px solid var(--wax)",
              cursor: "pointer",
              borderRadius: 2,
            }}
          >Burn the scroll</button>
        </div>
      </div>
    </div>
  );
}

window.ResetConfirmModal = ResetConfirmModal;
