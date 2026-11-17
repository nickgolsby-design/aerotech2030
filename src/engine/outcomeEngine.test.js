import { describe, it, expect } from "vitest";
import {
  projectOutcomes,
  selectChallenges,
  getChallenge,
  platformFit,
  mitigationScore,
  diligenceScore,
  validateRecommendation,
  boardVerdict
} from "./outcomeEngine.js";
import { evidence } from "../data/evidence.js";
import { stakeholders } from "../data/stakeholders.js";
import { platforms } from "../data/platformProfiles.js";
import { categoryChallenges, platformChallenges } from "../data/boardChallenges.js";
import { risks } from "../data/recommendation.js";

const ALL_EVIDENCE = evidence.map((e) => e.id);
const trustAll = (value) =>
  Object.fromEntries(stakeholders.map((s) => [s.id, value]));

const pickBy = (pick) => (challengeId) =>
  getChallenge(challengeId).options.reduce((a, b) => (pick(a, b) ? b : a)).id;
const bestAnswer = pickBy((a, b) => b.quality > a.quality);
const worstAnswer = pickBy((a, b) => b.quality < a.quality);

function play({ platform, strategy = "", risks: riskPairs, change, evidenceIds, trust, answer }) {
  const recommendation = {
    platform,
    strategy,
    risks: riskPairs.map(([riskId, mitigationId]) => ({ riskId, mitigationId })),
    changeApproach: change,
    rationale: "Evidence-based rationale for the board."
  };
  const challengeIds = selectChallenges(platform, evidenceIds);
  const challengeAnswers = Object.fromEntries(
    challengeIds.map((id) => [id, answer(id)])
  );
  return projectOutcomes({
    recommendation,
    evidenceIds,
    trust,
    challengeIds,
    challengeAnswers
  });
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
  it("every challenge has exactly one strong option", () => {
    const all = [
      ...Object.values(categoryChallenges),
      ...Object.values(platformChallenges)
    ];
    for (const c of all) {
      expect(c.options.filter((o) => o.quality === 1)).toHaveLength(1);
    }
  });

  it("every platform has a platform challenge and risk exposures", () => {
    for (const p of platforms) {
      expect(platformChallenges[p]).toBeDefined();
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
  it("challenges the least-investigated areas plus the platform", () => {
    const onlyCost = evidence
      .filter((e) => e.category !== "manufacturing")
      .map((e) => e.id);
    const ids = selectChallenges("3DEXPERIENCE", onlyCost);
    expect(ids).toHaveLength(4);
    expect(ids[0]).toBe("category:manufacturing");
    expect(ids.at(-1)).toBe("platform:3DEXPERIENCE");
    // The platform challenge's category is not asked twice.
    expect(ids).not.toContain("category:cost");
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
      answer: bestAnswer
    });
    expect(o.verdict).toBe("approved");
    expect(o.platform).toBe("3DEXPERIENCE");
    expect(o.years[2].overall).toBeGreaterThanOrEqual(75);
    expect(o.years[2].overall).toBeGreaterThan(o.years[0].overall);
  });

  it("worst path: no evidence, poor answers, board rejects and AeroTech stays on V5", () => {
    const o = play({
      platform: "PTC Creo",
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
      answer: bestAnswer
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
      answer: bestAnswer
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
