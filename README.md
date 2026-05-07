# PyQuest

A cozy fantasy Python tutorial styled as a parchment-and-quill role-playing game. Choose a class, traverse 13 quest chapters from variables to async, solve mixed-format puzzles, and earn XP + mana as you master Python.

## Running

PyQuest is a single-page browser app — no build step.

1. Serve the project root over any static HTTP server (the React + Babel setup needs `http://`, not `file://`):
   ```
   python3 -m http.server 8000
   ```
2. Open <http://localhost:8000/PyQuest.html>.

## What's inside

- **13 quest chapters** spanning variables, conditionals, loops, lists/dicts, functions, comprehensions, the walrus operator, lambdas, generators, OOP, inheritance, decorators, and async/await.
- **Six puzzle types** — multiple choice, fill-the-blank, predict-the-output, fix-the-bug, drag-to-assemble, and live D3 visualizations.
- **Hand-drawn Realm map** rendered in D3 — a fictional kingdom with sea, forests, mountains, and a winding road of settlements (one per chapter). Pan, zoom, minimap, gold trail of completed chapters.
- **Class flavor** — Mage / Warrior / Rogue change the narrator's voice; mechanics are identical.
- **Mana hint shop** — spend mana on three tiers of help (nudge → reveal a line → full solution).
- **Replay pool** — each chapter has 3–5 puzzles; replays serve unseen ones first, then stamp the chapter "Mastered."
- **Floating XP/mana feedback** — gold/blue toasts and gentle WebAudio cues on every gain or loss.
- **Persistent progress** — game state saved to `localStorage` under `pyquest:v1`; theme saved under `pyquest:theme`.

## Theme: the candle toggle

A small candle in the bottom-right corner toggles the theme. **Unlit** candle = Forest (light parchment). **Lit** candle (with flame and warm glow) = Midnight (dark parchment). The choice persists across sessions.

## Configuration

All tunable variables live in **`src/config.jsx`** as `window.PYQUEST_CONFIG`. There is no in-game settings panel — edit this file (or have the backend rewrite it before serving) to change defaults.

```js
window.PYQUEST_CONFIG = {
  difficulty: 1.0,         // XP & mana multiplier
  fontScale: 1.0,          // body-text scale (0.85 – 1.25)
  ambient: {
    dustMotes: true,
    candleFlicker: true,
    parchmentFibers: false,
    starsFireflies: false,
    illuminatedBorders: false,
  },
  music: { enabled: true, volume: 0.35 },
  defaultTheme: "forest",  // "forest" | "midnight"
};
```

## Background music

Drop a music file at `assets/music/background.mp3` (or change `MUSIC_SRC` in `src/components/music.jsx`). Looped, low-volume by default; the floating note button at the bottom-left toggles play/mute. Browsers block audio until first interaction, so playback arms on the first click or keypress. The same volume setting also gates the XP/mana sound cues.

## Responsive layout

- **Default**: 1280-max two-column layout (main + 320 px sidebar).
- **≤1000 px**: single column; sidebar drops below the main scroll.
- **≤640 px**: titles shrink, minimap hides, the title-screen class picker and victory-deeds grids stack vertically. Usable down to ~360 px wide without horizontal scroll.

## File layout

```
PyQuest.html              ← root; loads React/Babel/D3 + all .jsx
assets/music/             ← drop background.mp3 here
src/
  app.jsx                 ← root <App>; routes scenes; theme + candle toggle
  config.jsx              ← PYQUEST_CONFIG — production tunables
  game-state.jsx          ← useGameState hook + localStorage persistence
  levels.jsx              ← chapter metadata + puzzle pools
  components/
    ambience.jsx          ← parchment ambience layers
    candle-toggle.jsx     ← bottom-right candle (theme toggle)
    feedback.jsx          ← floating XP/mana toasts + sound cues
    icons.jsx             ← inline SVG sigils
    music.jsx             ← <BackgroundMusic> player
    scroll-card.jsx       ← parchment frame
    stat-bar.jsx          ← XP / mana / hero card
  puzzles/
    puzzle-types.jsx      ← MCQ, FillBlank, Predict, FixBug, DragAssemble
    d3-puzzle.jsx         ← embedded D3 puzzle component
  scenes/
    title-scene.jsx       ← class picker + intro
    map-scene.jsx         ← D3 Realm quest map
    chapter-scene.jsx     ← lesson + puzzle + sidebar + live mini-map
    victory-scene.jsx     ← end card
  visualizers/
    list-tracer.jsx       ← list/dict mutation animation
    loop-tracer.jsx       ← step-through variable state
    class-tree.jsx        ← OOP hierarchy diagram
```

## Visual system

| Token | Forest (default) | Midnight |
|---|---|---|
| `--parchment` | `#e6e8da` | `#1a1822` |
| `--ink` | `#1f2a20` | `#f0e5d3` |
| `--wax` | `#9d4034` | `#d96f5b` |
| `--moss` | `#365e3f` | `#74b88a` |
| `--royal` | `#384c6b` | `#9aa5ff` |
| `--gold` | `#b59238` | `#e3c46d` |

**Type:** IM Fell English (display & headings), Crimson Pro (body), JetBrains Mono (code) — all Google Fonts.

## Tech stack

- React 18.3.1 + Babel 7.29.0 standalone (pinned, integrity-checked) — JSX transpiled in the browser.
- D3 v7 for the realm map and all visualizers.
- WebAudio for sound cues (no audio files required).
- No bundler, no package manager, no build step.

## Conventions

- Each `.jsx` file gets its own uniquely-named style object (e.g. `mapStyles`, `puzzleStyles`) — never a global `styles`.
- Shared components export to `window` at the end of each file so other Babel scripts can pick them up.
- Files kept under ~600 lines; split aggressively.
- No emoji, no gradient slop. Iconography is inline SVG drawn ink-on-parchment style.
