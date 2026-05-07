// game-state.jsx — central state + localStorage persistence

const STORAGE_KEY = "pyquest:v1";

const DEFAULT_STATE = {
  className: null, // 'mage' | 'warrior' | 'rogue'
  playerName: "",
  xp: 0,
  mana: 0,
  unlockedChapters: 1, // how many chapters available
  completed: {}, // { chapterId: count }
  seen: {}, // { chapterId: [puzzleId, ...] }
  lastChapter: null,
  totalSolved: 0,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}

function useGameState() {
  const [state, setStateInner] = React.useState(loadState);

  const setState = React.useCallback((updater) => {
    setStateInner(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveState(next);
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    saveState(DEFAULT_STATE);
    setStateInner({ ...DEFAULT_STATE });
  }, []);

  const pickClass = React.useCallback((className, playerName) => {
    setState({ className, playerName: playerName || "Wanderer" });
  }, [setState]);

  const awardXP = React.useCallback((amount) => {
    setState(prev => ({ ...prev, xp: prev.xp + amount }));
  }, [setState]);

  const awardMana = React.useCallback((amount) => {
    setState(prev => ({ ...prev, mana: prev.mana + amount }));
  }, [setState]);

  const spendMana = React.useCallback((amount) => {
    let ok = false;
    setState(prev => {
      if (prev.mana >= amount) { ok = true; return { ...prev, mana: prev.mana - amount }; }
      return prev;
    });
    return ok;
  }, [setState]);

  const recordSolve = React.useCallback((chapterId, puzzleId, xpReward, manaReward) => {
    if (window.PyQuestFeedback) window.PyQuestFeedback.flash({ xp: xpReward, mana: manaReward });
    setState(prev => {
      const seen = { ...prev.seen, [chapterId]: [...(prev.seen[chapterId] || []), puzzleId] };
      const completed = { ...prev.completed, [chapterId]: (prev.completed[chapterId] || 0) + 1 };
      // unlock next chapter if not yet
      const nextUnlock = Math.max(prev.unlockedChapters, chapterId + 1);
      return {
        ...prev,
        seen,
        completed,
        unlockedChapters: nextUnlock,
        xp: prev.xp + xpReward,
        mana: prev.mana + manaReward,
        totalSolved: prev.totalSolved + 1,
        lastChapter: chapterId,
      };
    });
  }, [setState]);

  // Wrong-answer penalty. Returns the actual amounts deducted (clamped to current
  // balance) so the UI can show "you lost X xp / Y mana" honestly.
  const recordMiss = React.useCallback((xpPenalty, manaPenalty) => {
    let actual = { xp: 0, mana: 0 };
    setState(prev => {
      const xpLost = Math.min(prev.xp, Math.max(0, xpPenalty | 0));
      const manaLost = Math.min(prev.mana, Math.max(0, manaPenalty | 0));
      actual = { xp: xpLost, mana: manaLost };
      return { ...prev, xp: prev.xp - xpLost, mana: prev.mana - manaLost };
    });
    if (window.PyQuestFeedback && (actual.xp > 0 || actual.mana > 0)) {
      window.PyQuestFeedback.flash({ xp: -actual.xp, mana: -actual.mana });
    } else if (window.PyQuestFeedback) {
      // Always play the loss sound so missing-with-empty-coffers still has bite
      window.PyQuestFeedback.playLoss();
    }
    return actual;
  }, [setState]);

  const hasSeen = (chapterId, puzzleId) => (state.seen[chapterId] || []).includes(puzzleId);

  return { state, setState, reset, pickClass, awardXP, awardMana, spendMana, recordSolve, recordMiss, hasSeen };
}

window.useGameState = useGameState;
window.PYQUEST_DEFAULT_STATE = DEFAULT_STATE;
