// title-scene.jsx — class picker / intro

const titleStyles = {
  page: {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 20px",
  },
  card: {
    maxWidth: 720, width: "100%",
  },
  title: {
    fontFamily: "'IM Fell English SC', 'IM Fell English', serif",
    fontSize: 56,
    lineHeight: 1.05,
    margin: "0 0 8px",
    color: "var(--ink)",
    letterSpacing: ".01em",
  },
  sub: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: 18,
    color: "var(--ink-70)",
    marginBottom: 28,
    fontStyle: "italic",
  },
  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 24,
  },
  classCard: (selected) => ({
    padding: "18px 16px",
    border: `1.5px solid ${selected ? "var(--ink)" : "rgba(43,29,16,.35)"}`,
    background: selected ? "rgba(43,29,16,.06)" : "transparent",
    cursor: "pointer", textAlign: "center", borderRadius: 2,
    transition: "all .2s",
  }),
  inputLabel: {
    fontFamily: "'IM Fell English', serif", fontSize: 14, letterSpacing: ".06em",
    color: "var(--ink-70)", marginBottom: 6, display: "block",
  },
  input: {
    width: "100%", padding: "10px 12px",
    fontFamily: "'Crimson Pro', serif", fontSize: 17,
    background: "var(--vellum)", color: "var(--ink)",
    border: "1.5px solid rgba(43,29,16,.4)", borderRadius: 2,
    outline: "none", boxSizing: "border-box",
  },
};

function TitleScene({ onBegin, hasSave, onContinue }) {
  const [cls, setCls] = React.useState("mage");
  const [name, setName] = React.useState("");

  const classes = [
    { id: "mage", label: "Mage", flavor: "Reads ancient docstrings", Icon: IconHat },
    { id: "warrior", label: "Warrior", flavor: "Crushes errors with for-loops", Icon: IconShield },
    { id: "rogue", label: "Rogue", flavor: "Lambdas in the shadows", Icon: IconDagger },
  ];

  return (
    <div style={titleStyles.page}>
      <ScrollCard style={titleStyles.card}>
        <h1 style={titleStyles.title}>PyQuest</h1>
        <div style={titleStyles.sub}>A Most Curious Tutorial of the Python Arts, in Thirteen Chapters</div>

        {hasSave ? (
          <div style={{marginBottom: 24, padding: 14, border: "1px dashed rgba(43,29,16,.35)", background: "rgba(200,162,73,.1)"}}>
            <div style={{fontFamily: "'IM Fell English', serif", fontSize: 16, marginBottom: 8}}>An old saved scroll was found.</div>
            <SealButton color="gold" onClick={onContinue}>Continue your quest</SealButton>
          </div>
        ) : null}

        <label style={titleStyles.inputLabel}>YOUR NAME, ADVENTURER</label>
        <input
          style={titleStyles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aria of the Tomes"
          maxLength={28}
        />

        <div style={{height: 22}} />
        <label style={titleStyles.inputLabel}>CHOOSE YOUR ORDER</label>
        <div style={titleStyles.classGrid} className="pq-title-classgrid">
          {classes.map(c => (
            <div key={c.id} style={titleStyles.classCard(cls === c.id)} onClick={() => setCls(c.id)}>
              <div style={{display: "flex", justifyContent: "center", marginBottom: 8, color: "var(--ink)"}}>
                <c.Icon size={36} sw={1.5} />
              </div>
              <div style={{fontFamily: "'IM Fell English SC', 'IM Fell English', serif", fontSize: 18, marginBottom: 2}}>{c.label}</div>
              <div style={{fontSize: 12, color: "var(--ink-70)", fontFamily: "'Crimson Pro', serif", fontStyle: "italic", lineHeight: 1.3}}>{c.flavor}</div>
            </div>
          ))}
        </div>

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12}}>
          <div style={{fontSize: 12, color: "var(--ink-50)", fontFamily: "'Crimson Pro', serif", fontStyle: "italic", maxWidth: 380}}>
            Class is flavor only — every adventurer learns the same Python.
          </div>
          <SealButton color="moss" onClick={() => onBegin(cls, name.trim() || "Wanderer")}>
            Begin the quest <IconArrow size={14} style={{marginLeft: 6, verticalAlign: "middle"}} />
          </SealButton>
        </div>
      </ScrollCard>
    </div>
  );
}

window.TitleScene = TitleScene;
