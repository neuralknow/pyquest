// victory-scene.jsx — endgame card

function VictoryScene({ state, onBack, onReset }) {
  const lvls = window.PYQUEST_LEVELS;
  return (
    <div style={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 30}}>
      <ScrollCard style={{maxWidth: 720, width: "100%"}}>
        <div style={{textAlign: "center", marginBottom: 18}}>
          <div style={{fontFamily: "'IM Fell English', serif", fontSize: 14, letterSpacing: ".15em", color: "var(--ink-70)"}}>FINIS</div>
          <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 52, lineHeight: 1.05, color: "var(--ink)", marginTop: 4}}>
            Mastery Attained
          </div>
          <div style={{fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: "var(--ink-70)", marginTop: 6}}>
            All thirteen scrolls bear your seal, {state.playerName || "Wanderer"}.
          </div>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, margin: "20px 0"}} className="pq-victory-stats">
          <Stat label="Total XP" value={state.xp} icon={<IconStar size={18}/>}/>
          <Stat label="Quests solved" value={state.totalSolved} icon={<IconQuill size={18}/>}/>
          <Stat label="Mana banked" value={state.mana} icon={<IconFlame size={18}/>}/>
        </div>

        <div style={{margin: "20px 0", paddingTop: 14, borderTop: "1px dashed rgba(43,29,16,.3)"}}>
          <div style={{fontFamily: "'IM Fell English', serif", fontSize: 13, letterSpacing: ".08em", color: "var(--ink-70)", marginBottom: 10}}>YOUR DEEDS</div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6}} className="pq-victory-deeds">
            {lvls.map(l => {
              const seen = (state.seen[l.id] || []).length;
              const mastered = seen >= l.puzzles.length;
              return (
                <div key={l.id} style={{display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: "'Crimson Pro', serif"}}>
                  <span style={{color: mastered ? "var(--gold)" : "var(--moss)"}}>{mastered ? "✦" : "✓"}</span>
                  <span>{l.id}. {l.topic} {mastered ? "(mastered)" : ""}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display: "flex", justifyContent: "space-between", marginTop: 22}}>
          <QuietButton onClick={onBack}>Back to map</QuietButton>
          <SealButton color="wax" onClick={onReset}>Begin again</SealButton>
        </div>
      </ScrollCard>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div style={{padding: 14, border: "1px solid rgba(43,29,16,.3)", borderRadius: 2, textAlign: "center", background: "var(--vellum)"}}>
      <div style={{display: "flex", justifyContent: "center", marginBottom: 4, color: "var(--gold)"}}>{icon}</div>
      <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 28, color: "var(--ink)"}}>{value}</div>
      <div style={{fontSize: 11, fontFamily: "'IM Fell English', serif", color: "var(--ink-70)", letterSpacing: ".08em"}}>{label.toUpperCase()}</div>
    </div>
  );
}

window.VictoryScene = VictoryScene;
