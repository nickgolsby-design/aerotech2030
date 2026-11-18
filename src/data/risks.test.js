import { describe, it, expect } from "vitest";
import { risks, risksById, strategies } from "./recommendation.js";
import { categories } from "./evidence.js";
import { platforms } from "./platformProfiles.js";

// Guards the JSON dataset so editing it can't silently break the game.
describe("risks.json", () => {
  it("has unique risk and mitigation ids", () => {
    const ids = risks.map((r) => r.id);
    const mitigationIds = risks.flatMap((r) => r.mitigations.map((m) => m.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(mitigationIds).size).toBe(mitigationIds.length);
    expect(Object.keys(risksById)).toHaveLength(ids.length);
  });

  it("every risk has a label and a real evidence category", () => {
    const categoryIds = categories.map((c) => c.id);
    for (const risk of risks) {
      expect(risk.label).toBeTypeOf("string");
      expect(categoryIds).toContain(risk.category);
    }
  });

  it("every risk has an exposure of 0–3 for every platform", () => {
    for (const risk of risks) {
      expect(Object.keys(risk.exposure).sort()).toEqual([...platforms].sort());
      for (const value of Object.values(risk.exposure)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(3);
      }
    }
  });

  it("strategy factors only name real strategies and are positive", () => {
    const strategyIds = strategies.map((s) => s.id);
    for (const risk of risks.filter((r) => r.strategyFactor)) {
      for (const [strategy, factor] of Object.entries(risk.strategyFactor)) {
        expect(strategyIds).toContain(strategy);
        expect(factor).toBeGreaterThan(0);
      }
    }
  });

  it("mitigations are labelled with a quality of 0, 0.5 or 1, and exactly one is strong", () => {
    for (const risk of risks) {
      for (const m of risk.mitigations) {
        expect(m.label).toBeTypeOf("string");
        expect([0, 0.5, 1]).toContain(m.quality);
      }
      expect(risk.mitigations.filter((m) => m.quality === 1)).toHaveLength(1);
    }
  });
});
