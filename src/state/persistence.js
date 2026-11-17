// Saves the game to localStorage so a page refresh doesn't lose progress.
// Bump SAVE_VERSION whenever the state shape or content ids change, so
// old saves are discarded rather than loaded into an incompatible game.
export const SAVE_KEY = "aerotech2030:save";
export const SAVE_VERSION = 1;

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadState(initialState, storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved?.version !== SAVE_VERSION || typeof saved.state !== "object") {
      return null;
    }
    // Only accept keys the current game knows about.
    const merged = { ...initialState };
    for (const key of Object.keys(initialState)) {
      if (key in saved.state) merged[key] = saved.state[key];
    }
    return merged;
  } catch {
    return null;
  }
}

export function saveState(state, storage = defaultStorage()) {
  try {
    storage?.setItem(
      SAVE_KEY,
      JSON.stringify({ version: SAVE_VERSION, state })
    );
  } catch {
    // Storage full or blocked (e.g. private browsing): play continues unsaved.
  }
}

export function clearState(storage = defaultStorage()) {
  try {
    storage?.removeItem(SAVE_KEY);
  } catch {
    // Ignore.
  }
}
