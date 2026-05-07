// stat-bar.jsx — XP and Mana bars, hero card, hint shop

function StatBar({ label, value, max, fill = "var(--gold)", icon }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{display: "flex", alignItems: "center", gap: 10}}>
      {icon ? <span style={{color: "var(--ink-70)", display: "flex"}}>{icon}</span> : null}
      <div style={{flex: 1}}>
        <div style={{display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "'IM Fell English', serif", color: "var(--ink-70)", marginBottom: 3, letterSpacing: ".05em"}}>
          <span>{label}</span><span>{value} / {max}</span>
        </div>
        <div style={{
          height: 9, background: "rgba(43,29,16,.12)",
          border: "1px solid rgba(43,29,16,.3)",
          borderRadius: 1, overflow: "hidden", position: "relative",
        }}>
          <div style={{
            width: pct + "%", height: "100%", background: fill,
            transition: "width .55s cubic-bezier(.2,.8,.2,1)",
            boxShadow: "inset 0 -2px 4px rgba(43,29,16,.25), inset 0 1px 0 rgba(255,255,255,.25)",
          }} />
        </div>
      </div>
    </div>
  );
}

function HeroCard({ state }) {
  const cls = state.className || "wanderer";
  const ClassIcon = cls === "mage" ? IconHat : cls === "warrior" ? IconShield : cls === "rogue" ? IconDagger : IconQuill;
  const title = cls === "mage" ? "Mage" : cls === "warrior" ? "Warrior" : cls === "rogue" ? "Rogue" : "Wanderer";
  const xpToNext = nextChapterXPRequirement(state);
  return (
    <ScrollCard style={{padding: "18px 18px"}}>
      <div style={{display: "flex", gap: 14, alignItems: "center", marginBottom: 14}}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          border: "1.5px solid var(--ink)", background: "var(--parchment-deep)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)",
        }}><ClassIcon size={26} sw={1.7} /></div>
        <div>
          <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 18, lineHeight: 1.1}}>{state.playerName || "Traveller"}</div>
          <div style={{fontSize: 12, fontFamily: "'IM Fell English', serif", color: "var(--ink-70)", letterSpacing: ".08em", textTransform: "uppercase"}}>{title}</div>
        </div>
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 12}}>
        <StatBar label="Experience" value={state.xp} max={Math.max(50, xpToNext)} fill="var(--gold)" icon={<IconStar size={16} />} />
        <StatBar label="Mana" value={state.mana} max={100} fill="var(--royal)" icon={<IconFlame size={16} />} />
      </div>
      <div style={{marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(43,29,16,.3)", display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "'Crimson Pro', serif", color: "var(--ink-70)"}}>
        <span>Quests solved</span><span style={{color: "var(--ink)"}}>{state.totalSolved}</span>
      </div>
    </ScrollCard>
  );
}

function nextChapterXPRequirement(state) {
  const idx = state.unlockedChapters; // 1-indexed; this is the NEXT one
  const lvls = window.PYQUEST_LEVELS;
  if (idx > lvls.length) return state.xp;
  // Calculate cumulative XP needed to have unlocked through `idx` chapters
  let req = 0;
  for (let i = 0; i < idx - 1; i++) req += lvls[i].xp;
  return Math.max(req, 50);
}

// Hint shop — 3 tiers
const HINT_TIERS = [
  { cost: 5, label: "A nudge", reveal: "hint" },
  { cost: 12, label: "A whisper", reveal: "code-glimpse" },
  { cost: 25, label: "The answer", reveal: "answer" },
];

function HintShop({ puzzle, state, spendMana, revealed, setRevealed }) {
  return (
    <div>
      <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 14, color: "var(--ink-70)", letterSpacing: ".08em", marginBottom: 8}}>HINT SHOP</div>
      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
        {HINT_TIERS.map((t, i) => {
          const have = !!revealed[t.reveal];
          const can = state.mana >= t.cost;
          return (
            <button
              key={t.reveal}
              disabled={have || !can}
              onClick={() => {
                if (!spendMana(t.cost)) return;
                setRevealed(prev => ({ ...prev, [t.reveal]: true }));
              }}
              style={{
                textAlign: "left",
                padding: "8px 10px",
                background: have ? "rgba(61,107,74,.15)" : "transparent",
                border: "1px solid rgba(43,29,16,.3)",
                cursor: have || !can ? "default" : "pointer",
                fontFamily: "'Crimson Pro', serif",
                color: have ? "var(--moss)" : "var(--ink)",
                opacity: !have && !can ? 0.4 : 1,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderRadius: 2,
              }}
            >
              <span>{t.label}</span>
              <span style={{display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--royal)"}}>
                {have ? <IconCheck size={14}/> : <><IconFlame size={13}/> {t.cost}</>}
              </span>
            </button>
          );
        })}
      </div>
      {revealed["hint"] && puzzle.hint ? (
        <div style={{marginTop: 10, padding: "10px 12px", background: "rgba(200,162,73,.18)", border: "1px solid rgba(200,162,73,.5)", fontFamily: "'Crimson Pro', serif", fontSize: 14, fontStyle: "italic", color: "var(--ink)"}}>
          "{puzzle.hint}"
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { StatBar, HeroCard, HintShop, nextChapterXPRequirement });
