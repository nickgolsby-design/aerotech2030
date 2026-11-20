import { describe, it, expect } from "vitest";
import { trustHistory, quadrantFor, TRUST_BANDS } from "./trust.js";
import { trustLabel } from "../data/gameConfig.js";
import { gameReducer, initialGameState } from "../state/gameReducer.js";
import { stakeholdersById } from "../data/stakeholders.js";
import { platforms } from "../data/platformProfiles.js";
import { platformInfo } from "../data/platformInfo.js";
import { glossary } from "../data/glossary.js";

const ask = (stakeholderId, questionId) => ({ type: "ASK", stakeholderId, questionId });

describe("trust history", () => {
  it("matches the trust the reducer records, question by question", () => {
    const s = [
      { type: "START", teamName: "T", now: 0 },
      ask("senior-cad-engineer", "sce-difficult"),
      ask("ceo", "ceo-problem"),
      ask("senior-cad-engineer", "sce-colleagues"),
      ask("senior-cad-engineer", "sce-like")
    ].reduce(gameReducer, initialGameState);

    const sce = stakeholdersById["senior-cad-engineer"];
    const history = trustHistory(sce, s.interviews);
    expect(history.map((h) => h.questionId)).toEqual([
      "sce-difficult",
      "sce-colleagues",
      "sce-like"
    ]);
    expect(history[0]).toMatchObject({ before: 45, after: 45, change: 0 });
    expect(history[1]).toMatchObject({ before: 45, after: 40, change: -5 });
    expect(history.at(-1).after).toBe(s.trust["senior-cad-engineer"]);
  });

  it("clamps at 0, like the reducer", () => {
    const stakeholder = { id: "x", initialTrust: 10 };
    const history = trustHistory(stakeholder, [
      { stakeholderId: "x", questionId: "a", trustDelta: -20 }
    ]);
    expect(history[0]).toMatchObject({ before: 10, after: 0, change: -10 });
  });
});

describe("trust and influence bands", () => {
  it("classifies quadrants by high influence and open trust", () => {
    expect(quadrantFor(70, 95)).toBe("keyAlly");
    expect(quadrantFor(45, 95)).toBe("keyRisk");
    expect(quadrantFor(60, 55)).toBe("supporter");
    expect(quadrantFor(20, 70)).toBe("monitor");
  });

  it("relationship labels line up with the legend", () => {
    expect(TRUST_BANDS.map((b) => b.label)).toEqual(["Open", "Neutral", "Cautious"]);
    expect(TRUST_BANDS.map((b) => b.label)).toEqual([
      trustLabel(100),
      trustLabel(45),
      trustLabel(0)
    ]);
  });
});

describe("reading content", () => {
  it("every platform has a description card", () => {
    for (const p of platforms) {
      const info = platformInfo[p];
      expect(info, p).toBeDefined();
      expect(info.summary).toBeTypeOf("string");
      expect(info.strengths.length).toBeGreaterThan(0);
      expect(info.concerns.length).toBeGreaterThan(0);
    }
  });

  it("glossary terms are unique and defined", () => {
    const terms = glossary.map((g) => g.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
    for (const g of glossary) expect(g.definition.length).toBeGreaterThan(10);
  });
});
