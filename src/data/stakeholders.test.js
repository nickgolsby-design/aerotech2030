import { describe, it, expect } from "vitest";
import { stakeholders, stakeholdersById, evidenceSource } from "./stakeholders.js";
import { evidence, categories } from "./evidence.js";

// Guards the JSON dataset so editing it can't silently break the game.
describe("stakeholders.json", () => {
  it("has unique stakeholder and question ids", () => {
    const ids = stakeholders.map((s) => s.id);
    const questionIds = stakeholders.flatMap((s) => s.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    expect(Object.keys(stakeholdersById)).toHaveLength(ids.length);
  });

  it("every stakeholder is complete and in range", () => {
    const categoryIds = categories.map((c) => c.id);
    for (const s of stakeholders) {
      expect(s.name).toBeTypeOf("string");
      expect(s.shortName).toBeTypeOf("string");
      expect(s.shortName.length).toBeLessThanOrEqual(4);
      expect(s.role).toBeTypeOf("string");
      expect(s.influence).toBeGreaterThanOrEqual(0);
      expect(s.influence).toBeLessThanOrEqual(100);
      expect(s.initialTrust).toBeGreaterThanOrEqual(0);
      expect(s.initialTrust).toBeLessThanOrEqual(100);
      expect(categoryIds).toContain(s.category);
      expect(s.questions.length).toBeGreaterThan(0);
      for (const q of s.questions) {
        expect(q.text).toBeTypeOf("string");
        expect(q.response).toBeTypeOf("string");
        expect(q.trustDelta).toBeTypeOf("number");
        expect(Array.isArray(q.evidence)).toBe(true);
      }
    }
  });

  it("references only real evidence, and every evidence item is reachable once", () => {
    const evidenceIds = evidence.map((e) => e.id);
    const referenced = stakeholders.flatMap((s) => s.questions.flatMap((q) => q.evidence));
    for (const id of referenced) expect(evidenceIds).toContain(id);
    expect(new Set(referenced).size).toBe(referenced.length);
    for (const id of evidenceIds) expect(evidenceSource[id]).toBeDefined();
  });
});
