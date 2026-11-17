import { describe, it, expect } from "vitest";
import {
  loadState,
  saveState,
  clearState,
  SAVE_KEY,
  SAVE_VERSION
} from "./persistence.js";
import { gameReducer, initialGameState } from "./gameReducer.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k)
  };
}

describe("persistence", () => {
  it("round-trips a game in progress", () => {
    const storage = memoryStorage();
    const state = [
      { type: "START", teamName: "Team 2", now: 1 },
      { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" }
    ].reduce(gameReducer, initialGameState);

    saveState(state, storage);
    expect(loadState(initialGameState, storage)).toEqual(state);
  });

  it("returns null when nothing is saved", () => {
    expect(loadState(initialGameState, memoryStorage())).toBeNull();
  });

  it("ignores corrupt or outdated saves", () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, "{not json");
    expect(loadState(initialGameState, storage)).toBeNull();

    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: SAVE_VERSION + 1, state: { phase: "debrief" } })
    );
    expect(loadState(initialGameState, storage)).toBeNull();
  });

  it("drops unknown keys and fills missing ones from the initial state", () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        state: { phase: "investigation", teamName: "T", bogus: 1 }
      })
    );
    const loaded = loadState(initialGameState, storage);
    expect(loaded.bogus).toBeUndefined();
    expect(loaded.teamName).toBe("T");
    expect(loaded.questionsLeft).toBe(initialGameState.questionsLeft);
  });

  it("survives storage that throws, and clears saves", () => {
    const broken = {
      getItem() { throw new Error("blocked"); },
      setItem() { throw new Error("blocked"); },
      removeItem() { throw new Error("blocked"); }
    };
    expect(loadState(initialGameState, broken)).toBeNull();
    expect(() => saveState(initialGameState, broken)).not.toThrow();
    expect(() => clearState(broken)).not.toThrow();

    const storage = memoryStorage();
    saveState(initialGameState, storage);
    clearState(storage);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });
});
