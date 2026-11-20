import { describe, it, expect } from "vitest";
import { stakeholders, stakeholdersById } from "./stakeholders.js";
import { evidence, categories } from "./evidence.js";
import { evidenceSources } from "./sources.js";
import { INFLUENCE_WEIGHT } from "./gameConfig.js";

const DEPTHS = ["surface", "probing", "deep"];

// Guards the JSON dataset so editing it can't silently break the game.
describe("stakeholders.json", () => {
  it("uses the redesign roster", () => {
    expect(stakeholders.map((s) => s.name)).toEqual([
      "CEO",
      "Finance Director",
      "Chief Design Engineer",
      "Manufacturing Director",
      "Quality Manager",
      "HR Manager",
      "IT Manager",
      "Airbus Representative",
      "Senior CAD Engineer",
      "Graduate Engineer"
    ]);
  });

  it("has unique stakeholder and question ids", () => {
    const ids = stakeholders.map((s) => s.id);
    const questionIds = stakeholders.flatMap((s) => s.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    expect(Object.keys(stakeholdersById)).toHaveLength(ids.length);
  });

  it("every stakeholder has the full intelligence profile", () => {
    const categoryIds = categories.map((c) => c.id);
    for (const s of stakeholders) {
      for (const field of ["name", "role", "publicPosition", "underlyingConcern", "blindSpot", "challengeQuestion"]) {
        expect(s[field], `${s.id}.${field}`).toBeTypeOf("string");
        expect(s[field].length).toBeGreaterThan(0);
      }
      expect(s.shortName.length).toBeLessThanOrEqual(4);
      expect(Object.keys(INFLUENCE_WEIGHT)).toContain(s.influenceLevel);
      expect(s.influence).toBe(INFLUENCE_WEIGHT[s.influenceLevel]);
      expect(s.initialTrust).toBeGreaterThanOrEqual(0);
      expect(s.initialTrust).toBeLessThanOrEqual(100);
      expect(categoryIds).toContain(s.category);
    }
  });

  it("questions are well formed, and follow-ups follow a question from the same stakeholder", () => {
    for (const s of stakeholders) {
      const own = new Set(s.questions.map((q) => q.id));
      for (const q of s.questions) {
        expect(q.text).toBeTypeOf("string");
        expect(q.response).toBeTypeOf("string");
        expect(DEPTHS).toContain(q.depth);
        expect(Math.abs(q.trustDelta)).toBeLessThanOrEqual(5);
        if (q.depth === "deep") {
          expect(own.has(q.requires), `${q.id} requires ${q.requires}`).toBe(true);
          const parent = s.questions.find((p) => p.id === q.requires);
          expect(parent.requires).toBeUndefined();
        } else {
          expect(q.requires).toBeUndefined();
        }
        if (q.depth === "surface") expect(q.evidence).toEqual([]);
        else expect(q.evidence.length).toBeGreaterThan(0);
      }
    }
  });

  it("every stakeholder has a generic question and a follow-up", () => {
    for (const s of stakeholders) {
      expect(s.questions.some((q) => q.depth === "surface"), s.id).toBe(true);
      expect(s.questions.some((q) => q.depth === "deep"), s.id).toBe(true);
    }
  });

  it("references only real evidence, and every evidence item can be found", () => {
    const evidenceIds = evidence.map((e) => e.id);
    for (const s of stakeholders) {
      for (const q of s.questions) {
        for (const id of q.evidence) expect(evidenceIds).toContain(id);
      }
    }
    for (const id of evidenceIds) expect(evidenceSources[id], id).toBeDefined();
  });

  it("no single stakeholder owns most of the critical evidence", () => {
    const critical = evidence.filter((e) => e.critical);
    for (const s of stakeholders) {
      const owned = critical.filter((e) =>
        evidenceSources[e.id].some((r) => r.stakeholderId === s.id)
      );
      expect(owned.length, s.id).toBeLessThanOrEqual(critical.length / 4);
    }
  });
});
