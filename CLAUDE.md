# PyQuest — Cozy Fantasy Python RPG

A high-fidelity, fully interactive Python tutorial styled as a parchment-and-quill role-playing game. Players choose a class (Mage / Warrior / Rogue — flavor only), traverse 13 quest chapters from variables to async, solve mixed-format puzzles (MCQ, fill-blank, drag-assemble, predict-output, fix-bug, D3 visual), and earn **XP** (unlocks chapters) + **Mana** (spends on hints).

## File Structure

```
PyQuest.html              ← root; loads React/Babel/D3 + all .jsx
CLAUDE.md                 ← this file
README.md                 ← user-facing readme
assets/music/             ← drop background.mp3 here
src/
  app.jsx                 ← root <App>; routes scenes, theme, candle toggle
  config.jsx              ← PYQUEST_CONFIG — production tunables
  game-state.jsx          ← useGameState hook; localStorage persistence
  levels.jsx              ← LEVELS array; metadata + puzzle pools
  puzzles/
    puzzle-types.jsx      ← MCQ, FillBlank, Predict, FixBug, DragAssemble
    d3-puzzle.jsx         ← embedded D3 puzzle component
  scenes/
    title-scene.jsx       ← class picker + intro
    map-scene.jsx         ← D3 Realm quest map (winding road)
    chapter-scene.jsx     ← active scroll: puzzle + sidebar + mini-map
    victory-scene.jsx     ← end card
  visualizers/
    list-tracer.jsx       ← D3 mutation animation for list/dict puzzles
    loop-tracer.jsx       ← step-through variable state for loops
    class-tree.jsx        ← OOP hierarchy diagram
  components/
    ambience.jsx          ← parchment ambience (dust, candles, fibers…)
    candle-toggle.jsx     ← bottom-right candle: lit = midnight mode
    feedback.jsx          ← floating XP/mana toasts + WebAudio cues
    music.jsx             ← <BackgroundMusic> looped player
    scroll-card.jsx       ← parchment frame
    stat-bar.jsx          ← XP / mana / hero card
    icons.jsx             ← inline SVG sigils (sword, scroll, flask…)
```

## Visual System

| Token | Forest (default) | Midnight |
|---|---|---|
| `--parchment` | `#e6e8da` | `#1a1822` |
| `--parchment-deep` | `#d3d8c0` | `#23202c` |
| `--vellum` | `#f0f2e3` | `#2b2735` |
| `--ink` | `#1f2a20` | `#f0e5d3` |
| `--wax` | `#9d4034` | `#d96f5b` |
| `--moss` | `#365e3f` | `#74b88a` |
| `--royal` | `#384c6b` | `#9aa5ff` |
| `--gold` | `#b59238` | `#e3c46d` |

**Type:** IM Fell English (display, headings), Crimson Pro (body), JetBrains Mono (code). All Google Fonts.

**Motion:** ink-bleed transitions (300–500ms ease-out), page-flip on chapter change, parchment unfurl on level load. Floating `+N XP` / `+N MANA` toasts on every gain or loss, paired with WebAudio sparkle / thud cues gated by the music volume.

## Game Mechanics

- **XP:** earned on correct answers; gates chapter unlocks (each chapter costs cumulatively more XP).
- **Mana:** earned per chapter completion; spent on hints (3 tiers: 5 mana = nudge, 10 = reveal a line, 20 = solution).
- **Replay:** each chapter has a pool of 3–5 puzzles. The state tracks `seen[chapterId]: Set<puzzleId>`. Replays serve unseen first; once pool is exhausted, replays are disabled with a "Mastered" stamp.
- **Class:** Mage / Warrior / Rogue — affects only flavor copy (the narrator voice) and avatar sigil. No mechanical difference.
- **Persistence:** game state in `localStorage` under `pyquest:v1`. Theme (candle lit/unlit) under `pyquest:theme`.
- **Auto-scroll:** loading any chapter smoothly scrolls the page to top so mobile users land on the puzzle.

## Chapter Roster (13 total)

1. Variables & Types — *The Naming of Things*
2. Conditionals — *The Crossroads*
3. Loops — *The Endless Stair*
4. Lists & Dicts — *The Hoarder's Vault*
5. Functions — *The Spell Tome*
6. List Comprehensions — *The Alchemist's Press*
7. Walrus Operator `:=` — *The Tusked Sage*
8. Lambdas — *The Whispering Sigil*
9. Generators / `yield` — *The Yielding Loom*
10. Classes & OOP — *The Forge of Forms*
11. Inheritance & Polymorphism — *The Bloodlines*
12. Decorators — *The Wreathed Glyph*
13. Async / Await — *The Time-Tides*

## Puzzle Types

| Type | Component | Notes |
|---|---|---|
| `mcq` | `<MCQ>` | 4 options, one correct |
| `fill` | `<FillBlank>` | code with `___` slots; type answers |
| `predict` | `<Predict>` | snippet + free-text expected output |
| `bug` | `<FixBug>` | code with one wrong line; click the bad line |
| `drag` | `<DragAssemble>` | shuffled lines, drag into order |
| `d3` | `<D3Puzzle>` | inline visualizer + question |

## Production configuration (`src/config.jsx`)

All formerly-tweakable variables are exposed on `window.PYQUEST_CONFIG`. Edit `src/config.jsx` (or have the backend rewrite it before serving) to change behavior — there is no in-game settings panel.

```js
window.PYQUEST_CONFIG = {
  difficulty: 1.0,         // XP & mana multiplier
  fontScale: 1.0,          // body text scale (0.85 – 1.25)
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

The candle button (bottom-right) lets players override `defaultTheme` at runtime; choice persists in `localStorage` under `pyquest:theme`.

## Responsive layout

- **Default**: 1280-max two-column layout (main + 320px sidebar).
- **≤1000 px**: collapses to single column; sidebar drops below main content.
- **≤640 px**: titles shrink, minimap hides, title-screen class picker and victory-deeds grids stack vertically. Usable down to ~360 px wide.

## Coding rules

- **No global `styles` object name** — every component's style object is uniquely named (e.g. `mapStyles`, `puzzleStyles`).
- All shared components export to `window` at the end of each .jsx file.
- React 18.3.1 + Babel 7.29.0 (pinned, integrity-checked) + D3 v7.
- Keep files under ~600 lines; split aggressively.
- No emoji. No gradient slop. Iconography is inline SVG drawn in ink-on-parchment style (thin, single-weight strokes).
- The Tweaks panel and `tweaks-panel.jsx` have been removed for production. Do not reintroduce without explicit ask.
