import { describe, it, expect } from "vitest";
import { platforms, criteria, platformProfiles } from "./platformProfiles.js";
import { categories } from "./evidence.js";

// Guards the JSON dataset so editing it can't silently break the game.
describe("platformProfiles.json", () => {
  it("has unique platforms and criteria", () => {
    expect(new Set(platforms).size).toBe(platforms.length);
    const ids = criteria.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has exactly one profile per platform", () => {
    expect(Object.keys(platformProfiles).sort()).toEqual([...platforms].sort());
  });

  it("scores every criterion 0–10 for every platform", () => {
    for (const platform of platforms) {
      for (const c of criteria) {
        const score = platformProfiles[platform][c.id];
        expect(score, `${platform} / ${c.id}`).toBeTypeOf("number");
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(10);
      }
    }
  });

  it("maps each criterion to a real evidence category", () => {
    const categoryIds = categories.map((c) => c.id);
    for (const c of criteria) {
      expect(c.label).toBeTypeOf("string");
      expect(categoryIds).toContain(c.category);
    }
  });
});
