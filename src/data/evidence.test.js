import { describe, it, expect } from "vitest";
import { categories, evidence, evidenceById } from "./evidence.js";
import { criteria } from "./platformProfiles.js";

// Guards the JSON dataset so editing it can't silently break the game.
describe("evidence.json", () => {
  it("has unique category and evidence ids", () => {
    const categoryIds = categories.map((c) => c.id);
    const evidenceIds = evidence.map((e) => e.id);
    expect(new Set(categoryIds).size).toBe(categoryIds.length);
    expect(new Set(evidenceIds).size).toBe(evidenceIds.length);
    expect(Object.keys(evidenceById)).toHaveLength(evidenceIds.length);
  });

  it("every evidence item is complete and belongs to a real category", () => {
    const categoryIds = categories.map((c) => c.id);
    for (const item of evidence) {
      expect(categoryIds).toContain(item.category);
      expect(item.critical).toBeTypeOf("boolean");
      expect(item.text).toBeTypeOf("string");
      expect(item.text.length).toBeGreaterThan(0);
    }
  });

  it("every category has evidence, a critical item and a comparison criterion", () => {
    for (const category of categories) {
      const items = evidence.filter((e) => e.category === category.id);
      expect(items.length).toBeGreaterThan(0);
      expect(items.some((e) => e.critical)).toBe(true);
      expect(criteria.some((c) => c.category === category.id)).toBe(true);
    }
  });
});
