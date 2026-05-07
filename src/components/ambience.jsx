// ambience.jsx — atmospheric background layers
// Five composable layers, all canvas/SVG based, all very subtle.
// Each respects an enable flag from props; layers render fixed/inset behind app content.

// ---------- Layer 1: Floating ink particles (dust motes) ----------
function DustMotes({ enabled, midnight }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const N = 60;
    const motes = Array.from({length: N}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -0.05 - Math.random() * 0.18,
      a: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
    }));

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      const ink = midnight ? "245,238,210" : "43,29,16";
      for (const m of motes) {
        m.x += m.vx + Math.sin((t / 1800) + m.phase) * 0.15;
        m.y += m.vy;
        if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink},${m.a})`;
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, midnight]);

  if (!enabled) return null;
  return <canvas ref={ref} style={{
    position: "fixed", inset: 0, width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: 1, opacity: 0.7,
  }}/>;
}

// ---------- Layer 2: Candle flicker vignette ----------
function CandleFlicker({ enabled, midnight }) {
  if (!enabled) return null;
  // breathing radial vignette via CSS animation
  const warm = midnight ? "rgba(20,16,40,0.55)" : "rgba(60,40,18,0.35)";
  return (
    <React.Fragment>
      <style>{`
        @keyframes candle-breathe {
          0%, 100% { opacity: .55; }
          25% { opacity: .68; }
          43% { opacity: .50; }
          57% { opacity: .72; }
          78% { opacity: .58; }
        }
        @keyframes candle-flicker-fast {
          0%, 100% { opacity: .9; }
          12% { opacity: .82; }
          35% { opacity: 1; }
          51% { opacity: .76; }
          72% { opacity: .95; }
        }
      `}</style>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2,
        background: `radial-gradient(ellipse 90% 70% at 50% 50%, transparent 50%, ${warm} 100%)`,
        animation: "candle-breathe 5.2s ease-in-out infinite",
      }}/>
      {/* warm-edge highlight */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2,
        background: midnight
          ? "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(200,162,73,0.08), transparent 60%)"
          : "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(200,162,73,0.10), transparent 60%)",
        animation: "candle-flicker-fast 3.8s ease-in-out infinite",
        mixBlendMode: "overlay",
      }}/>
    </React.Fragment>
  );
}

// ---------- Layer 3: Wind-blown parchment fibers ----------
function ParchmentFibers({ enabled, midnight }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const N = 18;
    const fibers = Array.from({length: N}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 60 + Math.random() * 220,
      angle: (Math.random() - 0.5) * 0.35,
      speed: 0.08 + Math.random() * 0.18,
      a: 0.04 + Math.random() * 0.07,
      width: 0.5 + Math.random() * 1.2,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const ink = midnight ? "245,238,210" : "43,29,16";
      for (const f of fibers) {
        f.x += f.speed;
        if (f.x - f.len > w) {
          f.x = -f.len;
          f.y = Math.random() * h;
        }
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);
        const grad = ctx.createLinearGradient(-f.len/2, 0, f.len/2, 0);
        grad.addColorStop(0, `rgba(${ink},0)`);
        grad.addColorStop(0.5, `rgba(${ink},${f.a})`);
        grad.addColorStop(1, `rgba(${ink},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = f.width;
        ctx.beginPath();
        ctx.moveTo(-f.len/2, 0);
        ctx.lineTo(f.len/2, 0);
        ctx.stroke();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, midnight]);

  if (!enabled) return null;
  return <canvas ref={ref} style={{
    position: "fixed", inset: 0, width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: 1, opacity: 0.85,
  }}/>;
}

// ---------- Layer 4: Drifting constellations / fireflies ----------
function Constellations({ enabled, midnight }) {
  const ref = React.useRef(null);
  const lastShoot = React.useRef(0);
  React.useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // In midnight mode → stars (top half, twinkly).
    // In light mode → fireflies (warm yellow, drifting, with glow).
    const N = midnight ? 80 : 28;
    const dots = Array.from({length: N}, () => ({
      x: Math.random() * w,
      y: midnight ? Math.random() * h * 0.65 : Math.random() * h,
      r: midnight ? (0.5 + Math.random() * 1.4) : (1.4 + Math.random() * 2.2),
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      vx: midnight ? 0 : (Math.random() - 0.5) * 0.18,
      vy: midnight ? 0 : (Math.random() - 0.5) * 0.12,
    }));

    let shoot = null; // {x,y,vx,vy,life}

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      const sec = t / 1000;

      for (const d of dots) {
        if (!midnight) {
          d.x += d.vx;
          d.y += d.vy + Math.sin(sec * 0.7 + d.twinkle) * 0.05;
          if (d.x < -10) d.x = w + 10;
          if (d.x > w + 10) d.x = -10;
          if (d.y < -10) d.y = h + 10;
          if (d.y > h + 10) d.y = -10;
        }
        const a = midnight
          ? 0.4 + 0.55 * (0.5 + 0.5 * Math.sin(sec * d.twinkleSpeed + d.twinkle))
          : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(sec * d.twinkleSpeed + d.twinkle));
        const color = midnight ? `rgba(251,243,223,${a})` : `rgba(220,170,80,${a})`;
        // glow
        const glow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        glow.addColorStop(0, color);
        glow.addColorStop(1, midnight ? "rgba(251,243,223,0)" : "rgba(220,170,80,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2);
        ctx.fill();
        // core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shooting star (midnight only) every 9-15s
      if (midnight) {
        if (!shoot && t - lastShoot.current > (9000 + Math.random() * 6000)) {
          shoot = {
            x: Math.random() * w * 0.4,
            y: Math.random() * h * 0.3,
            vx: 7 + Math.random() * 4,
            vy: 2.4 + Math.random() * 1.5,
            life: 1,
          };
          lastShoot.current = t;
        }
        if (shoot) {
          shoot.x += shoot.vx;
          shoot.y += shoot.vy;
          shoot.life -= 0.012;
          if (shoot.life <= 0 || shoot.x > w || shoot.y > h) {
            shoot = null;
          } else {
            const tailLen = 80;
            const grad = ctx.createLinearGradient(
              shoot.x, shoot.y,
              shoot.x - shoot.vx * tailLen / 8, shoot.y - shoot.vy * tailLen / 8
            );
            grad.addColorStop(0, `rgba(251,243,223,${0.9 * shoot.life})`);
            grad.addColorStop(1, "rgba(251,243,223,0)");
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(shoot.x, shoot.y);
            ctx.lineTo(shoot.x - shoot.vx * tailLen / 8, shoot.y - shoot.vy * tailLen / 8);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, midnight]);

  if (!enabled) return null;
  return <canvas ref={ref} style={{
    position: "fixed", inset: 0, width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: 1, opacity: 0.95,
  }}/>;
}

// ---------- Layer 5: Animated illuminated borders ----------
function IlluminatedBorders({ enabled }) {
  if (!enabled) return null;
  // Four corner SVG flourishes; vines slowly grow + sway.
  // Each is a stroke-dasharray-animated curl with a small leaf at the end.
  return (
    <React.Fragment>
      <style>{`
        @keyframes vine-grow {
          0% { stroke-dashoffset: 600; }
          80%,100% { stroke-dashoffset: 0; }
        }
        @keyframes vine-sway {
          0%,100% { transform: rotate(0deg); }
          50% { transform: rotate(1.2deg); }
        }
        @keyframes leaf-pulse {
          0%,100% { transform: scale(1); opacity: .7; }
          50% { transform: scale(1.08); opacity: .9; }
        }
        .ambience-vine path {
          stroke: var(--gold);
          stroke-width: 1.4;
          fill: none;
          stroke-dasharray: 600;
          animation: vine-grow 6s ease-out forwards, vine-sway 7s ease-in-out infinite;
          opacity: .65;
        }
        .ambience-vine .leaf {
          fill: var(--gold);
          opacity: .7;
          animation: leaf-pulse 4s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
      {/* TL */}
      <svg className="ambience-vine" style={{
        position: "fixed", top: 0, left: 0, width: 180, height: 180,
        pointerEvents: "none", zIndex: 3,
      }} viewBox="0 0 180 180">
        <path d="M0,12 Q30,12 60,30 T120,70 Q140,90 150,130"/>
        <path d="M30,30 Q42,28 50,40" opacity="0.5"/>
        <path d="M70,50 Q82,46 90,60" opacity="0.5"/>
        <ellipse className="leaf" cx="60" cy="30" rx="6" ry="3" transform="rotate(30 60 30)"/>
        <ellipse className="leaf" cx="120" cy="70" rx="7" ry="3.5" transform="rotate(60 120 70)"/>
      </svg>
      {/* TR */}
      <svg className="ambience-vine" style={{
        position: "fixed", top: 0, right: 0, width: 180, height: 180,
        pointerEvents: "none", zIndex: 3, transform: "scaleX(-1)",
      }} viewBox="0 0 180 180">
        <path d="M0,12 Q30,12 60,30 T120,70 Q140,90 150,130"/>
        <path d="M30,30 Q42,28 50,40" opacity="0.5"/>
        <path d="M70,50 Q82,46 90,60" opacity="0.5"/>
        <ellipse className="leaf" cx="60" cy="30" rx="6" ry="3" transform="rotate(30 60 30)"/>
        <ellipse className="leaf" cx="120" cy="70" rx="7" ry="3.5" transform="rotate(60 120 70)"/>
      </svg>
      {/* BL */}
      <svg className="ambience-vine" style={{
        position: "fixed", bottom: 0, left: 0, width: 180, height: 180,
        pointerEvents: "none", zIndex: 3, transform: "scaleY(-1)",
      }} viewBox="0 0 180 180">
        <path d="M0,12 Q30,12 60,30 T120,70 Q140,90 150,130"/>
        <path d="M30,30 Q42,28 50,40" opacity="0.5"/>
        <path d="M70,50 Q82,46 90,60" opacity="0.5"/>
        <ellipse className="leaf" cx="60" cy="30" rx="6" ry="3" transform="rotate(30 60 30)"/>
        <ellipse className="leaf" cx="120" cy="70" rx="7" ry="3.5" transform="rotate(60 120 70)"/>
      </svg>
      {/* BR */}
      <svg className="ambience-vine" style={{
        position: "fixed", bottom: 0, right: 0, width: 180, height: 180,
        pointerEvents: "none", zIndex: 3, transform: "scale(-1,-1)",
      }} viewBox="0 0 180 180">
        <path d="M0,12 Q30,12 60,30 T120,70 Q140,90 150,130"/>
        <path d="M30,30 Q42,28 50,40" opacity="0.5"/>
        <path d="M70,50 Q82,46 90,60" opacity="0.5"/>
        <ellipse className="leaf" cx="60" cy="30" rx="6" ry="3" transform="rotate(30 60 30)"/>
        <ellipse className="leaf" cx="120" cy="70" rx="7" ry="3.5" transform="rotate(60 120 70)"/>
      </svg>
    </React.Fragment>
  );
}

// ---------- Stack ----------
function Ambience({ tweaks, midnight }) {
  return (
    <div aria-hidden="true">
      <DustMotes enabled={tweaks.ambDust !== false} midnight={midnight}/>
      <ParchmentFibers enabled={tweaks.ambFibers === true} midnight={midnight}/>
      <Constellations enabled={tweaks.ambStars === true} midnight={midnight}/>
      <CandleFlicker enabled={tweaks.ambCandle !== false} midnight={midnight}/>
      <IlluminatedBorders enabled={tweaks.ambVines === true}/>
    </div>
  );
}

window.Ambience = Ambience;
