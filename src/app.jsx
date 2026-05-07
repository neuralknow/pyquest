// app.jsx — root <App>; production build (config-driven, no Tweaks panel)

const THEMES = {
  forest: {
    "--parchment": "#e6e8da",
    "--parchment-deep": "#d3d8c0",
    "--vellum": "#f0f2e3",
    "--ink": "#1f2a20",
    "--ink-70": "#465543",
    "--ink-50": "#728471",
    "--ink-30": "#a3b39e",
    "--wax": "#9d4034",
    "--moss": "#365e3f",
    "--royal": "#384c6b",
    "--gold": "#b59238",
  },
  midnight: {
    "--parchment": "#1a1822",
    "--parchment-deep": "#23202c",
    "--vellum": "#2b2735",
    "--ink": "#f0e5d3",
    "--ink-70": "#bfb097",
    "--ink-50": "#8a7e6a",
    "--ink-30": "#5e5544",
    "--wax": "#d96f5b",
    "--moss": "#74b88a",
    "--royal": "#9aa5ff",
    "--gold": "#e3c46d",
  },
};

const FLAVORS = {
  mage: "I read between the lines of every docstring; the runes do whisper.",
  warrior: "I crush errors with iron loops and unyielding indentation.",
  rogue: "I slip a lambda where none expect it, and vanish.",
  wanderer: "I have come from far roads to learn the Python tongue.",
};

function classFlavorFor(state) {
  return FLAVORS[state.className || "wanderer"];
}

const THEME_KEY = "pyquest:theme";

function App() {
  const cfg = window.PYQUEST_CONFIG;
  const game = useGameState();
  const { state } = game;
  const [scene, setScene] = React.useState(() => state.className ? "map" : "title");
  const [activeChapter, setActiveChapter] = React.useState(null);

  // Theme: persist user's candle choice across sessions, fall back to config default.
  const [midnight, setMidnight] = React.useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "midnight") return true;
      if (saved === "forest") return false;
    } catch (e) {}
    return cfg.defaultTheme === "midnight";
  });

  // Build the tweaks-shape object the rest of the app already expects, derived
  // from server config + the persisted theme toggle.
  const tweaks = React.useMemo(() => ({
    difficulty: cfg.difficulty,
    fontScale: cfg.fontScale,
    midnight,
    ambDust: cfg.ambient.dustMotes,
    ambCandle: cfg.ambient.candleFlicker,
    ambFibers: cfg.ambient.parchmentFibers,
    ambStars: cfg.ambient.starsFireflies,
    ambVines: cfg.ambient.illuminatedBorders,
    musicOn: cfg.music.enabled,
    musicVolume: cfg.music.volume,
  }), [midnight, cfg]);

  // Apply theme + font scale to the document root.
  React.useEffect(() => {
    const palette = midnight ? THEMES.midnight : THEMES.forest;
    Object.entries(palette).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.documentElement.style.setProperty("--font-scale", String(cfg.fontScale ?? 1));
  }, [midnight, cfg.fontScale]);

  React.useEffect(() => {
    window.__pyquestSpendMana = (amount) => game.spendMana(amount);
  }, [game]);

  const begin = (cls, name) => { game.pickClass(cls, name); setScene("map"); };
  const pickChapter = (chapId) => { setActiveChapter(chapId); setScene("chapter"); };
  const handleSolve = (chapterId, puzzleId, xp, mana) => game.recordSolve(chapterId, puzzleId, xp, mana);
  const handleMiss = (xpPenalty, manaPenalty) => game.recordMiss(xpPenalty, manaPenalty);
  const handleNext = () => {
    const lvls = window.PYQUEST_LEVELS;
    if (activeChapter >= lvls.length) setScene("victory");
    else { setActiveChapter(activeChapter + 1); setScene("chapter"); }
  };

  const toggleCandle = () => {
    setMidnight(m => {
      const next = !m;
      try { localStorage.setItem(THEME_KEY, next ? "midnight" : "forest"); } catch (e) {}
      return next;
    });
  };

  const lvls = window.PYQUEST_LEVELS;
  const chapter = activeChapter ? lvls.find(l => l.id === activeChapter) : null;
  const difficulty = tweaks.difficulty ?? 1;

  let body = null;
  if (scene === "title") {
    body = <TitleScene onBegin={begin} hasSave={!!state.className} onContinue={() => setScene("map")} />;
  } else if (scene === "map") {
    body = <MapScene
      state={state}
      onPickChapter={pickChapter}
      onResetClass={() => { game.reset(); setActiveChapter(null); setScene("title"); }}
    />;
  } else if (scene === "chapter" && chapter) {
    body = <ChapterScene
      chapter={chapter}
      state={state}
      onSolve={handleSolve}
      onMiss={handleMiss}
      onBack={() => setScene("map")}
      onNext={handleNext}
      onPickChapter={pickChapter}
      classFlavor={classFlavorFor(state)}
      difficulty={difficulty}
    />;
  } else if (scene === "victory") {
    body = <VictoryScene state={state} onBack={() => setScene("map")} onReset={() => { game.reset(); setScene("title"); setActiveChapter(null); }} />;
  }

  return (
    <div>
      <Ambience tweaks={tweaks} midnight={midnight}/>
      <BackgroundMusic enabled={!!tweaks.musicOn} volume={tweaks.musicVolume}/>
      {window.FeedbackLayer ? React.createElement(window.FeedbackLayer) : null}
      {body}
      <CandleToggle lit={midnight} onToggle={toggleCandle}/>
    </div>
  );
}

window.App = App;
