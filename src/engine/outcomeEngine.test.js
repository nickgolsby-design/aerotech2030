import { describe, it, expect } from "vitest";
import {
  projectOutcomes,
  selectChallenges,
  getChallenge,
  platformFit,
  mitigationScore,
  diligenceScore,
  validateRecommendation,
  boardVerdict,
  defensiblePositions,
  assessArgument
} from "./outcomeEngine.js";
import { evidence, evidenceById } from "../data/evidence.js";
import { stakeholders } from "../data/stakeholders.js";
import { platforms } from "../data/platformProfiles.js";
import { dimensions, dimensionChallenges, judgementChallenges } from "../data/boardChallenges.js";
import { risks } from "../data/recommendation.js";

const ALL_EVIDENCE = evidence.map((e) => e.id);
const trustAll = (value) =>
  Object.fromEntries(stakeholders.map((s) => [s.id, value]));

// A team that consulted every stakeholder properly (one probing question each).
const CONSULT_ALL = stakeholders.map((s) => ({
  stakeholderId: s.id,
  questionId: s.questions.find((q) => q.depth === "probing").id,
  guarded: false
}));
const consult = (...ids) => CONSULT_ALL.filter((i) => ids.includes(i.stakeholderId));

// Strong team: defends its best-backed position with its best evidence.
const bestAnswer = (challengeId, state) => {
  const best = defensiblePositions(challengeId, state)[0];
  return { positionId: best.position.id, evidenceIds: best.relevant };
};
// Weak team: takes the weak position.
const worstAnswer = (challengeId, state) => {
  const weak = getChallenge(challengeId).positions.find((p) => p.kind === "weak");
  return { positionId: weak.id, evidenceIds: state.evidenceIds.slice(0, 1) };
};

const ALL_CHALLENGE_IDS = [
  ...Object.keys(dimensionChallenges).map((k) => `dimension:${k}`),
  ...Object.keys(judgementChallenges).map((k) => `judgement:${k}`)
];
const backingOf = (p) => p.support.flatMap((g) => g.evidence);

function play({ platform, strategy = "", risks: riskPairs, change, evidenceIds, trust, answer, interviews = [] }) {
  const recommendation = {
    platform,
    strategy,
    risks: riskPairs.map(([riskId, mitigationId]) => ({ riskId, mitigationId })),
    changeApproach: change,
    rationale: "Evidence-based rationale for the board."
  };
  const base = { recommendation, evidenceIds, trust, interviews };
  const challengeIds = selectChallenges(base);
  const state = { ...base, challengeIds };
  const challengeAnswers = Object.fromEntries(
    challengeIds.map((id) => [id, answer(id, state)])
  );
  return projectOutcomes({ ...state, challengeAnswers });
}

const GOOD_3DX_RISKS = [
  ["cost-overrun", "co-tco"],
  ["production-disruption", "pd-parallel"],
  ["skills-loss", "sl-pairing"]
];
const BAD_RISKS = [
  ["security", "sec-accept"],
  ["cae-breakage", "cae-later"],
  ["skills-loss", "sl-docs"]
];

describe("content integrity", () => {
  it("every challenge offers two defensible positions and one weak one", () => {
    const stakeholderIds = stakeholders.map((s) => s.id);
    expect(Object.keys(dimensionChallenges)).toEqual(Object.keys(dimensions));
    const weakIndexes = new Set();
    for (const id of ALL_CHALLENGE_IDS) {
      const c = getChallenge(id);
      expect(stakeholderIds).toContain(c.stakeholderId);
      expect(c.text).toBeTypeOf("string");
      expect(c.tradeOff).toBeTypeOf("string");
      expect(c.positions.map((p) => p.kind).sort(), id).toEqual(["defensible", "defensible", "weak"]);
      weakIndexes.add(c.positions.findIndex((p) => p.kind === "weak"));
      for (const p of c.positions) {
        expect(p.quality, "no hidden quality score").toBeUndefined();
        // Every position states what it accepts, so the weak one doesn't stand out.
        for (const field of ["stance", "argument", "accepts"]) expect(p[field]).toBeTypeOf("string");
        if (p.kind === "weak") {
          expect(p.weakness).toBeTypeOf("string");
          continue;
        }
        expect(p.support.length).toBeGreaterThan(0);
        for (const g of p.support) {
          expect(g.label).toBeTypeOf("string");
          for (const e of g.evidence) expect(evidenceById[e], e).toBeDefined();
        }
        for (const s of p.consult) expect(stakeholderIds).toContain(s);
        if (p.assumption) expect(evidenceById[p.assumption].classification).toBe("assumption");
        for (const platform of p.conflictsWith ?? []) expect(platforms).toContain(platform);
      }
    }
    // The weak position doesn't always sit in the same place.
    expect(weakIndexes.size).toBe(3);
  });

  it("every defensible position is the strongest for a team whose investigation backs it", () => {
    for (const id of ALL_CHALLENGE_IDS) {
      for (const p of getChallenge(id).positions.filter((x) => x.kind === "defensible")) {
        const platform = p.conflictsWith?.includes("3DEXPERIENCE") ? "Siemens NX" : "3DEXPERIENCE";
        const state = {
          recommendation: { platform },
          evidenceIds: [...backingOf(p), ...(p.assumption ? [p.assumption] : [])],
          interviews: consult(...p.consult)
        };
        const ranked = defensiblePositions(id, state);
        expect(ranked[0].position.id, `${id} / ${p.id}`).toBe(p.id);
        expect(ranked[0].rating).toBe("Convincing");
      }
    }
  });

  it("a weak position stays weak however much evidence is cited", () => {
    for (const id of ALL_CHALLENGE_IDS) {
      const weak = getChallenge(id).positions.find((p) => p.kind === "weak");
      const a = assessArgument(id, { positionId: weak.id, evidenceIds: ALL_EVIDENCE.slice(0, 2) }, {
        recommendation: { platform: "3DEXPERIENCE" },
        evidenceIds: ALL_EVIDENCE,
        interviews: CONSULT_ALL
      });
      expect(a.rating).toBe("Weak judgement");
      expect(a.delta).toBeLessThan(0);
    }
  });

  it("every risk has exposures for every platform", () => {
    for (const p of platforms) {
      for (const r of risks) expect(r.exposure[p]).toBeTypeOf("number");
    }
  });

  it("every risk has exactly one strong mitigation", () => {
    for (const r of risks) {
      expect(r.mitigations.filter((m) => m.quality === 1)).toHaveLength(1);
    }
  });
});

describe("platform fit", () => {
  it("CATIA V5 is strongest in year 1 but declines by year 5", () => {
    const v5 = "Stay with CATIA V5";
    expect(platformFit(v5, 1)).toBeGreaterThan(platformFit("3DEXPERIENCE", 1));
    expect(platformFit(v5, 5)).toBeLessThan(platformFit("3DEXPERIENCE", 5));
    expect(platformFit(v5, 5)).toBeLessThan(platformFit(v5, 1));
  });
});

describe("recommendation scoring", () => {
  it("rewards picking the most severe risks with strong mitigations", () => {
    const rec = (pairs) => ({
      risks: pairs.map(([riskId, mitigationId]) => ({ riskId, mitigationId }))
    });
    expect(mitigationScore(rec(GOOD_3DX_RISKS), "3DEXPERIENCE", "phased")).toBe(1);
    expect(mitigationScore(rec(BAD_RISKS), "3DEXPERIENCE", "phased")).toBe(0);
  });

  it("validates incomplete recommendations", () => {
    const problems = validateRecommendation({
      platform: "Siemens NX",
      strategy: "",
      risks: [
        { riskId: "security", mitigationId: "" },
        { riskId: "", mitigationId: "" },
        { riskId: "", mitigationId: "" }
      ],
      changeApproach: "",
      rationale: "short"
    });
    expect(problems).toHaveLength(5);
  });

  it("does not require a strategy when staying on V5", () => {
    const problems = validateRecommendation({
      platform: "Stay with CATIA V5",
      strategy: "",
      risks: BAD_RISKS.map(([riskId, mitigationId]) => ({ riskId, mitigationId })),
      changeApproach: "mandate",
      rationale: "A sufficiently long rationale."
    });
    expect(problems).toEqual([]);
  });
});

describe("board review", () => {
  it("probes the two thinnest dimensions, then asks one judgement question", () => {
    const rec = (platform) => ({ platform, strategy: "phased", risks: [] });
    // Everything except customer and operational evidence.
    const gaps = evidence
      .filter((e) => !["supplychain", "manufacturing"].includes(e.category))
      .map((e) => e.id);
    const ids = selectChallenges({ recommendation: rec("3DEXPERIENCE"), evidenceIds: gaps, interviews: CONSULT_ALL });
    expect(ids).toHaveLength(3);
    // Competitive positioning also leans on customer evidence, so it ties as thinnest.
    expect(ids.slice(0, 2)).toEqual(["dimension:competitive-positioning", "dimension:customer-requirements"]);
    expect(ids[2]).toMatch(/^judgement:/);

    // Staying on V5 is always asked why it defers.
    const stay = selectChallenges({ recommendation: rec("Stay with CATIA V5"), evidenceIds: gaps, interviews: [] });
    expect(stay[2]).toBe("judgement:defer");
  });

  it("the judgement question targets the weakest part of the reasoning", () => {
    const rec = { platform: "Siemens NX", strategy: "phased", risks: [] };
    const noAssumptions = ALL_EVIDENCE.filter((id) => evidenceById[id].classification !== "assumption");
    expect(selectChallenges({ recommendation: rec, evidenceIds: noAssumptions, interviews: CONSULT_ALL })[2])
      .toBe("judgement:assumptions");
    expect(selectChallenges({ recommendation: rec, evidenceIds: ALL_EVIDENCE, interviews: [] })[2])
      .toBe("judgement:dissent");
  });

  it("the same position is judged by the team's own investigation", () => {
    const id = "dimension:operational-continuity";
    const answer = { positionId: "manufacturing-last", evidenceIds: ["mfg-production-continuity", "supply-delivery-first"] };
    const thorough = assessArgument(id, answer, {
      recommendation: { platform: "Siemens NX" },
      evidenceIds: ["mfg-production-continuity", "supply-delivery-first", "assume-workflows"],
      interviews: consult("manufacturing-director")
    });
    expect(thorough.strength).toBe(1);
    expect(thorough.groups.map((g) => g.status)).toEqual(["cited", "cited"]);

    // Same argument, but no customer evidence, nobody consulted, assumption untested.
    const thin = assessArgument(id, { positionId: "manufacturing-last", evidenceIds: ["mfg-production-continuity"] }, {
      recommendation: { platform: "Siemens NX" },
      evidenceIds: ["mfg-production-continuity"],
      interviews: []
    });
    expect(thin.groups.map((g) => g.status)).toEqual(["cited", "missing"]);
    expect(thin.strength).toBe(0.25);
    expect(thin.notConsulted).toEqual(["manufacturing-director"]);
    expect(thin.assumptionTested).toBe(false);
  });

  it("evidence gathered but not cited counts for less than evidence put to the Board", () => {
    const id = "dimension:operational-continuity";
    const state = {
      recommendation: { platform: "Siemens NX" },
      evidenceIds: ["mfg-production-continuity", "supply-delivery-first"],
      interviews: []
    };
    const cited = assessArgument(id, { positionId: "manufacturing-last", evidenceIds: ["mfg-production-continuity", "supply-delivery-first"] }, state);
    const uncited = assessArgument(id, { positionId: "manufacturing-last", evidenceIds: ["mfg-production-continuity"] }, state);
    expect(uncited.groups[1].status).toBe("uncited");
    expect(uncited.strength).toBeLessThan(cited.strength);
  });

  it("off-topic evidence and generic questions don't make an argument", () => {
    const state = {
      recommendation: { platform: "3DEXPERIENCE" },
      evidenceIds: ["cyber-ageing", "wf-recruitment"],
      interviews: [{ stakeholderId: "manufacturing-director", questionId: "md-success", guarded: false }]
    };
    const a = assessArgument("dimension:operational-continuity", { positionId: "manufacturing-last", evidenceIds: ["cyber-ageing", "wf-recruitment"] }, state);
    expect(a.relevant).toEqual([]);
    expect(a.irrelevant).toHaveLength(2);
    expect(a.consulted).toEqual([]);
    expect(a.rating).toBe("Unconvincing");
  });

  it("an argument that contradicts the team's own recommendation loses force", () => {
    const answer = { positionId: "capability-priority", evidenceIds: ["supply-collaboration", "strategy-lost-bid"] };
    const state = (platform) => ({
      recommendation: { platform },
      evidenceIds: ["supply-collaboration", "strategy-lost-bid", "assume-customer-static"],
      interviews: consult("ceo", "airbus-representative")
    });
    const consistent = assessArgument("dimension:strategic-capability", answer, state("Siemens NX"));
    const conflicted = assessArgument("dimension:strategic-capability", answer, state("Stay with CATIA V5"));
    expect(consistent.conflict).toBe(false);
    expect(conflicted.conflict).toBe(true);
    expect(conflicted.strength).toBeLessThan(consistent.strength);
  });

  it("verdict thresholds", () => {
    expect(boardVerdict(75)).toBe("approved");
    expect(boardVerdict(50)).toBe("conditional");
    expect(boardVerdict(20)).toBe("rejected");
  });
});

describe("outcome projection", () => {
  it("golden path: thorough, well-mitigated 3DEXPERIENCE rollout succeeds", () => {
    const o = play({
      platform: "3DEXPERIENCE",
      strategy: "phased",
      risks: GOOD_3DX_RISKS,
      change: "sponsored",
      evidenceIds: ALL_EVIDENCE,
      trust: trustAll(70),
      answer: bestAnswer,
      interviews: CONSULT_ALL
    });
    expect(o.verdict).toBe("approved");
    expect(o.platform).toBe("3DEXPERIENCE");
    expect(o.years[2].overall).toBeGreaterThanOrEqual(75);
    expect(o.years[2].overall).toBeGreaterThan(o.years[0].overall);
  });

  it("worst path: no evidence, poor answers, board rejects and AeroTech stays on V5", () => {
    const o = play({
      platform: "Siemens NX",
      strategy: "bigbang",
      risks: BAD_RISKS,
      change: "mandate",
      evidenceIds: [],
      trust: trustAll(20),
      answer: worstAnswer
    });
    expect(o.verdict).toBe("rejected");
    expect(o.platform).toBe("Stay with CATIA V5");
    expect(o.years[2].overall).toBeLessThan(50);
    expect(o.years[0].events.some((e) => e.text.includes("deferred"))).toBe(true);
  });

  it("right platform with poor change management struggles in year 1 then recovers", () => {
    const o = play({
      platform: "3DEXPERIENCE",
      strategy: "bigbang",
      risks: BAD_RISKS,
      change: "mandate",
      evidenceIds: ALL_EVIDENCE,
      trust: trustAll(60),
      answer: bestAnswer,
      interviews: CONSULT_ALL
    });
    expect(o.years[0].overall).toBeLessThan(60);
    expect(o.years[2].overall).toBeGreaterThan(o.years[0].overall + 10);
  });

  it("staying on V5 looks good in year 1 and declines by year 5", () => {
    const o = play({
      platform: "Stay with CATIA V5",
      risks: [
        ["security", "sec-roadmap"],
        ["customer-misalignment", "cm-align"],
        ["skills-loss", "sl-pairing"]
      ],
      change: "sponsored",
      evidenceIds: ALL_EVIDENCE,
      trust: trustAll(70),
      answer: bestAnswer,
      interviews: CONSULT_ALL
    });
    expect(o.years[0].overall).toBeGreaterThan(o.years[2].overall);
  });

  it("skipping the investigation stops a team being fully approved", () => {
    expect(diligenceScore([])).toBe(0);
    const o = play({
      platform: "3DEXPERIENCE",
      strategy: "phased",
      risks: GOOD_3DX_RISKS,
      change: "sponsored",
      evidenceIds: [],
      trust: Object.fromEntries(stakeholders.map((s) => [s.id, s.initialTrust])),
      answer: bestAnswer
    });
    expect(o.verdict).not.toBe("approved");
  });
});
