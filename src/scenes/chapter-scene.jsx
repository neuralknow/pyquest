// chapter-scene.jsx — the active scroll: lesson + puzzle + sidebar

function pickPuzzle(chapter, state) {
  const seen = new Set(state.seen[chapter.id] || []);
  const unseen = chapter.puzzles.filter(p => !seen.has(p.id));
  const pool = unseen.length > 0 ? unseen : chapter.puzzles;
  return pool[Math.floor(Math.random() * pool.length)];
}

function ChapterScene({ chapter, state, onSolve, onMiss, onBack, onNext, onPickChapter, classFlavor, difficulty, headerActions }) {
  const [puzzle, setPuzzle] = React.useState(() => pickPuzzle(chapter, state));
  const [revealed, setRevealed] = React.useState({});
  const [solvedThisRound, setSolvedThisRound] = React.useState(false);
  const [feedback, setFeedback] = React.useState(null);
  const [tab, setTab] = React.useState("teach"); // teach | puzzle
  const [attempts, setAttempts] = React.useState(0);
  const [lastPenalty, setLastPenalty] = React.useState(null);
  const [totalLost, setTotalLost] = React.useState({ xp: 0, mana: 0 });

  // When chapter changes, fresh puzzle
  React.useEffect(() => {
    setPuzzle(pickPuzzle(chapter, state));
    setRevealed({});
    setSolvedThisRound(false);
    setFeedback(null);
    setAttempts(0);
    setLastPenalty(null);
    setTotalLost({ xp: 0, mana: 0 });
    setTab("teach");
    // Scroll to top on chapter load (mobile users land on the puzzle, not the map)
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [chapter.id]);

  const seenCount = (state.seen[chapter.id] || []).length;
  const poolSize = chapter.puzzles.length;
  const mastered = seenCount >= poolSize;

  const handleSolve = (correct) => {
    setAttempts(a => a + 1);
    if (!correct) {
      // Wrong-answer penalty: small XP + mana loss, scaled by difficulty,
      // clamped at 0. Skip if already locked-in correct (shouldn't happen).
      if (!solvedThisRound && onMiss) {
        const xpPenalty = Math.max(1, Math.round(3 * difficulty));
        const manaPenalty = Math.max(0, Math.round(1 * difficulty));
        const lost = onMiss(xpPenalty, manaPenalty) || { xp: 0, mana: 0 };
        setLastPenalty(lost);
        setTotalLost(t => ({ xp: t.xp + lost.xp, mana: t.mana + lost.mana }));
      }
      setFeedback("close");
      return;
    }
    if (solvedThisRound) return;
    setSolvedThisRound(true);
    setFeedback("win");
    // Apply hint penalty: each revealed tier reduces XP a bit
    const tiersUsed = Object.keys(revealed).length;
    const xpGain = Math.max(5, Math.round((chapter.xp - tiersUsed * 5) * difficulty));
    const manaGain = Math.max(2, Math.round(chapter.mana * difficulty));
    onSolve(chapter.id, puzzle.id, xpGain, manaGain);
  };

  const tryAnother = () => {
    setPuzzle(pickPuzzle({...chapter, puzzles: chapter.puzzles.filter(p => p.id !== puzzle.id)}, state));
    setRevealed({});
    setSolvedThisRound(false);
    setFeedback(null);
    setAttempts(0);
    setLastPenalty(null);
  };

  const Sigil = SIGILS[chapter.sigil] || SigilScroll;
  const PuzzleComp =
    puzzle.kind === "mcq" ? MCQ :
    puzzle.kind === "fill" ? FillBlank :
    puzzle.kind === "predict" ? Predict :
    puzzle.kind === "bug" ? FixBug :
    puzzle.kind === "drag" ? DragAssemble :
    puzzle.kind === "d3" ? D3Puzzle : MCQ;

  return (
    <div style={{minHeight: "100vh", padding: "26px 30px 60px"}} className="pq-page">
      <div style={{maxWidth: 1280, margin: "0 auto"}} className="pq-twocol">
        <div>
          {/* Top bar */}
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16}}>
            <button onClick={onBack} style={{
              background: "transparent", border: "none", color: "var(--ink)",
              fontFamily: "'IM Fell English', serif", fontSize: 15, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, padding: 4,
            }}>
              <span style={{transform: "rotate(180deg)", display: "inline-flex"}}><IconArrow size={14}/></span>
              Quest Map
            </button>
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
              <div style={{fontFamily: "'IM Fell English', serif", fontSize: 13, color: "var(--ink-70)", letterSpacing: ".06em"}}>
                CHAPTER {chapter.id} · {seenCount}/{poolSize} {mastered ? "MASTERED" : "SOLVED"}
              </div>
              {headerActions ? <div style={{display: "flex", gap: 8}}>{headerActions}</div> : null}
            </div>
          </div>

          {/* Title */}
          <ScrollCard>
            <div style={{display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20}}>
              <div style={{
                width: 56, height: 56, border: "1.5px solid var(--ink)",
                borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--parchment-deep)", color: "var(--ink)", flexShrink: 0,
              }}><Sigil size={32} sw={1.5}/></div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 13, fontFamily: "'IM Fell English', serif", color: "var(--ink-70)", letterSpacing: ".08em"}}>{chapter.topic.toUpperCase()}</div>
                <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 32, lineHeight: 1.1, color: "var(--ink)"}}>{chapter.title}</div>
              </div>
              <div style={{textAlign: "right", fontFamily: "'IM Fell English', serif", fontSize: 13, color: "var(--ink-70)"}}>
                <div style={{display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end"}}><IconStar size={13}/>+{Math.round(chapter.xp * difficulty)} XP</div>
                <div style={{display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2}}><IconFlame size={13}/>+{Math.round(chapter.mana * difficulty)} mana</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display: "flex", gap: 0, borderBottom: "1px solid rgba(43,29,16,.25)", marginBottom: 18}}>
              {[["teach", "Teaching"], ["puzzle", "The Puzzle"]].map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)} style={{
                  background: "transparent", border: "none",
                  padding: "10px 18px",
                  fontFamily: "'IM Fell English', serif", fontSize: 15,
                  letterSpacing: ".06em",
                  borderBottom: tab === k ? "2px solid var(--ink)" : "2px solid transparent",
                  color: tab === k ? "var(--ink)" : "var(--ink-70)",
                  cursor: "pointer", marginBottom: -1,
                }}>{label}</button>
              ))}
            </div>

            {tab === "teach" ? (
              <div>
                <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 17, lineHeight: 1.6, color: "var(--ink)", marginBottom: 16}}>
                  <div style={{fontStyle: "italic", color: "var(--ink-70)", marginBottom: 14}}>"{classFlavor}"</div>
                  <ul style={{paddingLeft: 18, margin: 0}}>
                    {chapter.teach.map((t, i) => <li key={i} style={{marginBottom: 8}}>{t}</li>)}
                  </ul>
                </div>
                <div style={{fontFamily: "'IM Fell English', serif", fontSize: 13, color: "var(--ink-70)", letterSpacing: ".06em", marginBottom: 6}}>EXAMPLE</div>
                <pre style={codeStyle}>{chapter.example}</pre>
                <div style={{marginTop: 18, display: "flex", justifyContent: "flex-end"}}>
                  <SealButton color="moss" onClick={() => setTab("puzzle")}>To the puzzle <IconArrow size={14} style={{marginLeft: 6, verticalAlign: "middle"}}/></SealButton>
                </div>
              </div>
            ) : (
              <div>
                <PuzzleComp puzzle={puzzle} onSolve={handleSolve} locked={solvedThisRound} />

                {feedback === "win" ? (
                  <div style={{marginTop: 20, padding: 14, background: "rgba(61,107,74,.12)", border: "1px solid var(--moss)", borderRadius: 2}}>
                    <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 18, color: "var(--moss)", marginBottom: 6}}>The seal glows green.</div>
                    <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "var(--ink)"}}>
                      You earned <strong>+{Math.max(5, Math.round((chapter.xp - Object.keys(revealed).length * 5) * difficulty))} XP</strong> and <strong>+{Math.round(chapter.mana * difficulty)} mana</strong>.
                      {attempts > 1 ? ` After ${attempts} attempts. ` : " "}
                    </div>
                    <div style={{marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap"}}>
                      {chapter.puzzles.length > 1 && !mastered ? (
                        <SealButton color="ink" onClick={tryAnother}>Try a fresh puzzle</SealButton>
                      ) : null}
                      {chapter.id < window.PYQUEST_LEVELS.length ? (
                        <SealButton color="moss" onClick={onNext}>To next chapter <IconArrow size={14} style={{marginLeft: 6, verticalAlign: "middle"}}/></SealButton>
                      ) : (
                        <SealButton color="gold" onClick={onNext}>Finish your quest</SealButton>
                      )}
                      <QuietButton onClick={onBack}>Back to map</QuietButton>
                    </div>
                  </div>
                ) : null}

                {feedback === "close" && !solvedThisRound ? (
                  <div style={{marginTop: 14, padding: "10px 14px", background: "rgba(162,58,42,.08)", border: "1px solid rgba(162,58,42,.4)", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "var(--wax)"}}>
                    <div style={{fontStyle: "italic"}}>The seal flickers red. The realm exacts its toll.</div>
                    {lastPenalty && (lastPenalty.xp > 0 || lastPenalty.mana > 0) ? (
                      <div style={{marginTop: 6, fontFamily: "'IM Fell English', serif", fontSize: 13, color: "var(--wax)", letterSpacing: ".04em"}}>
                        {lastPenalty.xp > 0 ? <span>−{lastPenalty.xp} XP</span> : null}
                        {lastPenalty.xp > 0 && lastPenalty.mana > 0 ? <span style={{margin: "0 8px", color: "var(--ink-50)"}}>·</span> : null}
                        {lastPenalty.mana > 0 ? <span>−{lastPenalty.mana} mana</span> : null}
                        {totalLost.xp + totalLost.mana > lastPenalty.xp + lastPenalty.mana ? (
                          <span style={{marginLeft: 10, color: "var(--ink-70)", fontStyle: "italic"}}>
                            (this puzzle: −{totalLost.xp} XP, −{totalLost.mana} mana)
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div style={{marginTop: 4, fontSize: 13, color: "var(--ink-70)", fontStyle: "italic"}}>
                        Your coffers are empty — no toll could be taken. Try again, or buy a hint.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </ScrollCard>

          {/* Live quest map below the puzzle — interactive, jumps to current chapter */}
          <ScrollCard style={{padding: 12, marginTop: 16, overflow: "hidden"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, padding: "0 4px"}}>
              <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 16, color: "var(--ink)"}}>The Quest Map</div>
              <div style={{fontFamily: "'Crimson Pro', serif", fontSize: 12, fontStyle: "italic", color: "var(--ink-70)"}}>
                Chapter {Math.min(state.unlockedChapters, window.PYQUEST_LEVELS.length)} of {window.PYQUEST_LEVELS.length}
              </div>
            </div>
            <QuestMap
              levels={window.PYQUEST_LEVELS}
              state={state}
              onPickChapter={(id) => { if (id !== chapter.id && onPickChapter) onPickChapter(id); }}
            />
          </ScrollCard>
        </div>

        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          <HeroCard state={state} />
          <ScrollCard style={{padding: 16}}>
            <HintShop puzzle={puzzle} state={state} spendMana={(amount) => {
              // deferred: parent handles state. Use direct localStorage mutation via prop in App.
              return window.__pyquestSpendMana(amount);
            }} revealed={revealed} setRevealed={setRevealed} />

            {revealed["code-glimpse"] && puzzle.code ? (
              <div style={{marginTop: 12, padding: 10, background: "rgba(58,58,120,.08)", border: "1px dashed var(--royal)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--ink)", maxHeight: 180, overflow: "auto"}}>
                <div style={{fontFamily: "'IM Fell English', serif", fontSize: 11, color: "var(--royal)", letterSpacing: ".08em", marginBottom: 4}}>STUDY THIS</div>
                <pre style={{margin: 0, whiteSpace: "pre-wrap"}}>{puzzle.code || chapter.example}</pre>
              </div>
            ) : null}

            {revealed["answer"] ? (
              <div style={{marginTop: 12, padding: 10, background: "rgba(200,162,73,.18)", border: "1px solid var(--gold)", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "var(--ink)"}}>
                <div style={{fontFamily: "'IM Fell English', serif", fontSize: 11, letterSpacing: ".08em", marginBottom: 4}}>THE TRUE ANSWER</div>
                <code style={{fontFamily: "'JetBrains Mono', monospace", fontSize: 13, whiteSpace: "pre-wrap"}}>
                  {puzzle.kind === "mcq" || (puzzle.kind === "d3" && puzzle.options) ? puzzle.options[puzzle.answer] :
                   puzzle.kind === "fill" ? puzzle.blanks.join(", ") :
                   puzzle.kind === "predict" || puzzle.kind === "d3" ? puzzle.answer :
                   puzzle.kind === "bug" ? `Line ${puzzle.badLine + 1}: ${puzzle.lines[puzzle.badLine]}` :
                   puzzle.kind === "drag" ? (puzzle.simpleOrdered || puzzle.ordered).join("\n") :
                   "—"}
                </code>
              </div>
            ) : null}
          </ScrollCard>
        </div>
      </div>
    </div>
  );
}

window.ChapterScene = ChapterScene;
window.pickPuzzle = pickPuzzle;
