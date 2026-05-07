// icons.jsx — inline SVG sigils, ink-on-parchment style (single thin stroke)

const Icon = ({ d, size = 22, fill = "none", stroke = "currentColor", sw = 1.6, children, vb = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children || (d ? <path d={d} /> : null)}
  </svg>
);

const SigilScroll = (p) => <Icon {...p}><path d="M5 5h11a3 3 0 0 1 3 3v9a2 2 0 0 0 2 2H8a3 3 0 0 1-3-3V5z"/><path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2"/><path d="M9 9h7M9 13h7"/></Icon>;
const SigilFork = (p) => <Icon {...p}><path d="M12 4v8"/><path d="M12 12L7 19"/><path d="M12 12l5 7"/><circle cx="12" cy="4" r="1.2"/></Icon>;
const SigilStair = (p) => <Icon {...p}><path d="M3 20h4v-4h4v-4h4V8h4V4"/></Icon>;
const SigilChest = (p) => <Icon {...p}><rect x="4" y="9" width="16" height="11" rx="1.2"/><path d="M4 13h16"/><path d="M4 9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4"/><rect x="11" y="12" width="2" height="3"/></Icon>;
const SigilTome = (p) => <Icon {...p}><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z"/><path d="M5 4v14"/><path d="M9 8h5M9 12h5"/></Icon>;
const SigilFlask = (p) => <Icon {...p}><path d="M10 3h4"/><path d="M10 3v5L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3"/><path d="M7.5 14h9"/></Icon>;
const SigilTusk = (p) => <Icon {...p}><circle cx="12" cy="12" r="5"/><path d="M9 16c-1 3-3 4-5 4"/><path d="M15 16c1 3 3 4 5 4"/><circle cx="10" cy="11" r=".6" fill="currentColor"/><circle cx="14" cy="11" r=".6" fill="currentColor"/></Icon>;
const SigilRune = (p) => <Icon {...p}><circle cx="12" cy="12" r="8"/><path d="M12 5v14M7 8l10 8M7 16l10-8"/></Icon>;
const SigilLoom = (p) => <Icon {...p}><path d="M4 5h16M4 19h16"/><path d="M7 5v14M12 5v14M17 5v14"/><path d="M4 12h16"/></Icon>;
const SigilAnvil = (p) => <Icon {...p}><path d="M3 9h13a3 3 0 0 1 3 3v1H8a4 4 0 0 1-4-4z"/><path d="M9 13v3h6v-3"/><path d="M6 19h12"/></Icon>;
const SigilTree = (p) => <Icon {...p}><circle cx="12" cy="5" r="2"/><circle cx="6" cy="13" r="2"/><circle cx="18" cy="13" r="2"/><circle cx="9" cy="20" r="1.5"/><circle cx="15" cy="20" r="1.5"/><path d="M12 7v3M10.5 11.5L8 11.5M13.5 11.5L16 11.5M7 14.5l1.5 4M17 14.5l-1.5 4"/></Icon>;
const SigilWreath = (p) => <Icon {...p}><circle cx="12" cy="12" r="7"/><path d="M5 12c0-2 1-3 2-4M19 12c0-2-1-3-2-4M12 5c-1.5 1.5-2 3-2 4M12 5c1.5 1.5 2 3 2 4"/></Icon>;
const SigilTide = (p) => <Icon {...p}><path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></Icon>;

const SIGILS = {
  scroll: SigilScroll, fork: SigilFork, stair: SigilStair, chest: SigilChest,
  tome: SigilTome, flask: SigilFlask, tusk: SigilTusk, rune: SigilRune,
  loom: SigilLoom, anvil: SigilAnvil, tree: SigilTree, wreath: SigilWreath, tide: SigilTide,
};

// UI icons
const IconLock = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M5 12l4 4 10-10"/></Icon>;
const IconX = (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>;
const IconStar = (p) => <Icon {...p} fill="currentColor" stroke="none"><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9z"/></Icon>;
const IconQuill = (p) => <Icon {...p}><path d="M3 21l8-8M11 13l5-5a3 3 0 0 1 4 4l-5 5"/><path d="M14 6l4 4"/></Icon>;
const IconFlame = (p) => <Icon {...p}><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></Icon>;
const IconHourglass = (p) => <Icon {...p}><path d="M7 3h10M7 21h10"/><path d="M7 3c0 5 5 5 5 9s-5 4-5 9"/><path d="M17 3c0 5-5 5-5 9s5 4 5 9"/></Icon>;
const IconArrow = (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>;
const IconHeart = (p) => <Icon {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 3l8 3v5c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z"/></Icon>;
const IconDagger = (p) => <Icon {...p}><path d="M12 3v12"/><path d="M9 15h6l-3 5z"/><path d="M9 6h6"/></Icon>;
const IconHat = (p) => <Icon {...p}><path d="M3 18s4-1 9-1 9 1 9 1"/><path d="M6 18l3-12 3 4 3-4 3 12"/></Icon>;

Object.assign(window, {
  SIGILS, SigilScroll, IconLock, IconCheck, IconX, IconStar, IconQuill,
  IconFlame, IconHourglass, IconArrow, IconHeart, IconShield, IconDagger, IconHat,
});
