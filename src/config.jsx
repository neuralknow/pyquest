// config.jsx — production game configuration
//
// All tunable game variables live here. To change behavior in production,
// edit this file (or have the backend rewrite it before serving the page).
// These values used to live in the Tweaks panel; that panel is removed for
// the production build.
//
// A backend can replace this whole file with one that emits the same
// `window.PYQUEST_CONFIG` object — for example by templating user-specific
// preferences server-side, or A/B-testing difficulty.

window.PYQUEST_CONFIG = {
  // Difficulty scales XP and mana rewards/penalties. 1.0 = baseline.
  difficulty: 1.0,

  // Visual scale for body text (0.85 – 1.25).
  fontScale: 1.0,

  // Ambient parchment effects.
  ambient: {
    dustMotes: true,
    candleFlicker: true,
    parchmentFibers: false,
    starsFireflies: false,
    illuminatedBorders: false,
  },

  // Background music + sound cues.
  music: {
    enabled: true,
    volume: 0.35,
  },

  // Default theme on first load. Players can still toggle the candle in-game.
  // 'forest' = light parchment, 'midnight' = dark.
  defaultTheme: "forest",
};
