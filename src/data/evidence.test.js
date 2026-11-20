import { describe, it, expect } from "vitest";
import {
  categories,
  classifications,
  evidence,
  evidenceById,
  EVIDENCE_TAGS
} from "./evidence.js";
import { documents } from "./documents.js";
import { criteria } from "./platformProfiles.js";

// Guards the JSON datasets so editing them can't silently break the game.
describe("evidence.json", () => {
  it("has unique category, classification and evidence ids", () => {
    for (const list of [categories, classifications, evidence]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(Object.keys(evidenceById)).toHaveLength(evidence.length);
  });

  it("uses the seven redesign classifications as student tags", () => {
    expect(EVIDENCE_TAGS).toEqual([
      "Strategic driver",
      "Customer requirement",
      "Constraint",
      "Risk",
      "Workforce issue",
      "Opportunity",
      "Assumption"
    ]);
  });

  it("every evidence item is complete and supports real decision criteria", () => {
    const categoryIds = categories.map((c) => c.id);
    const classificationIds = classifications.map((c) => c.id);
    const criterionIds = criteria.map((c) => c.id);
    for (const item of evidence) {
      expect(categoryIds).toContain(item.category);
      expect(classificationIds).toContain(item.classification);
      expect(item.critical).toBeTypeOf("boolean");
      expect(item.text.length).toBeGreaterThan(0);
      expect(item.supports.length, item.id).toBeGreaterThan(0);
      for (const id of item.supports) expect(criterionIds).toContain(id);
    }
  });

  it("every classification is used, with an assumption for each library entry", () => {
    for (const c of classifications) {
      expect(evidence.some((e) => e.classification === c.id), c.id).toBe(true);
    }
    // design/BOARD_DECISION_FRAMEWORK.md lists seven library assumptions.
    expect(evidence.filter((e) => e.classification === "assumption")).toHaveLength(7);
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

describe("documents.json", () => {
  it("documents are complete and reveal real evidence", () => {
    const ids = documents.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const doc of documents) {
      for (const field of ["title", "type", "owner", "summary"]) {
        expect(doc[field]).toBeTypeOf("string");
      }
      expect(doc.points.length).toBeGreaterThanOrEqual(3);
      expect(doc.points.length).toBeLessThanOrEqual(4);
      for (const id of doc.evidence) expect(evidenceById[id], id).toBeDefined();
    }
  });

  it("each document reveals exactly one critical item, so reading isn't a shortcut", () => {
    for (const doc of documents) {
      const critical = doc.evidence.filter((id) => evidenceById[id].critical);
      expect(critical, doc.id).toHaveLength(1);
    }
  });
});
