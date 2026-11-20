import { describe, it, expect } from "vitest";
import {
  assessLearningOutcomes,
  expertRecommendation,
  missedCriticalEvidence,
  reviewChallengeAnswers,
  buildResultsExport,
  correlation,
  platformChoiceScore,
  rating
} from "./debrief.js";
import { projectOutcomes, defensiblePositions, horizonWeights } from "./outcomeEngine.js";
import { gameReducer, initialGameState } from "../state/gameReducer.js";
import { stakeholders } from "../data/stakeholders.js";
import { evidence } from "../data/evidence.js";
import { criteria } from "../data/platformProfiles.js";
import { risksById } from "../data/recommendation.js";

const run = (actions) => actions.reduce(gameReducer, initialGameState);

const recommend = (platform, strategy, riskPairs, change) => [
  { type: "SET_RECOMMENDATION", field: "platform", value: platform },
  ...(strategy ? [{ type: "SET_RECOMMENDATION", field: "strategy", value: strategy }] : []),
  ...riskPairs.flatMap(([riskId, mitigationId], index) => [
    { type: "SET_RISK", index, riskId },
    { type: "SET_MITIGATION", index, mitigationId }
  ]),
  { type: "SET_RECOMMENDATION", field: "changeApproach", value: change },
  { type: "SET_RECOMMENDATION", field: "rationale", value: "A considered rationale for the board." }
];

// "best": defend the best-backed position with the best evidence available.
// "worst": defend the least-backed position, citing off-topic evidence.
function finish(state, pick) {
  let s = gameReducer(state, { type: "SUBMIT" });
  for (const id of s.challengeIds) {
    const ranked = defensiblePositions(id, s);
    const chosen = pick === "best" ? ranked[0] : ranked.find((a) => a.kind === "weak");
    const backing = (chosen.position.support ?? []).flatMap((g) => g.evidence);
    const offTopic = s.evidenceIds.filter((e) => !backing.includes(e));
    const evidenceIds =
      pick === "best" && chosen.relevant.length > 0
        ? chosen.relevant
        : (offTopic.length ? offTopic : s.evidenceIds).slice(0, 1);
    s = gameReducer(s, {
      type: "ANSWER_CHALLENGE",
      challengeId: id,
      positionId: chosen.position.id,
      evidenceIds
    });
  }
  return gameReducer(s, { type: "SHOW_OUTCOMES", now: 25 * 60000 });
}

// A diligent team: specific questions across every High-influence
// stakeholder and most areas, plus two documents. 12 actions.
const goodQuestions = [
  ...[
    ["ceo", "ceo-problem"],
    ["finance-director", "fd-evaluate"],
    ["finance-director", "fd-underestimate"],
    ["manufacturing-director", "md-stop"],
    ["chief-design-engineer", "cde-dependencies"],
    ["chief-design-engineer", "cde-fail"],
    ["quality-manager", "qm-hidden"],
    ["hr-manager", "hr-recruits"],
    ["it-manager", "it-support"],
    ["airbus-representative", "ab-trends"]
  ].map(([stakeholderId, questionId]) => ({ type: "ASK", stakeholderId, questionId })),
  { type: "READ_DOCUMENT", documentId: "doc-competitors" },
  { type: "READ_DOCUMENT", documentId: "doc-workforce" }
];

const expertWeights = criteria.map((c) => ({
  type: "SET_WEIGHT",
  criterionId: c.id,
  weight: horizonWeights[3][c.id]
}));

function goodGame() {
  const s = run([
    { type: "START", teamName: "Diligent", now: 0 },
    ...goodQuestions,
    ...expertWeights,
    ...recommend("3DEXPERIENCE", "phased", [
      ["cost-overrun", "co-tco"],
      ["production-disruption", "pd-parallel"],
      ["skills-loss", "sl-pairing"]
    ], "sponsored")
  ]);
  return finish(s, "best");
}

function poorGame() {
  const s = run([
    { type: "START", teamName: "Hasty", now: 0 },
    { type: "ASK", stakeholderId: "quality-manager", questionId: "qm-role" },
    { type: "ASK", stakeholderId: "ceo", questionId: "ceo-concerns" },
    ...recommend("Siemens NX", "bigbang", [
      ["security", "sec-accept"],
      ["cae-breakage", "cae-later"],
      ["skills-loss", "sl-docs"]
    ], "mandate")
  ]);
  return finish(s, "worst");
}

describe("helpers", () => {
  it("correlation handles flat input and perfect agreement", () => {
    expect(correlation([3, 3, 3], [1, 2, 3])).toBe(0);
    expect(correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  });

  it("ratings", () => {
    expect(rating(0.8)).toBe("Strong");
    expect(rating(0.5)).toBe("Developing");
    expect(rating(0.2)).toBe("Needs work");
  });

  it("3DEXPERIENCE is the best long-term platform and the expert pick", () => {
    expect(platformChoiceScore("3DEXPERIENCE")).toBe(1);
    const expert = expertRecommendation();
    expect(expert.platform).toBe("3DEXPERIENCE");
    expect(expert.risks).toHaveLength(3);
    expect(expert.risks.every((r) => r.mitigation.quality === 1)).toBe(true);
  });
});

describe("learning outcome assessment", () => {
  it("a diligent team rates Strong on most outcomes", () => {
    const s = goodGame();
    const assessment = assessLearningOutcomes(s, projectOutcomes(s));
    expect(assessment).toHaveLength(6);
    const strong = assessment.filter((lo) => lo.rating === "Strong");
    // This team never tested an assumption, so the board presses it on
    // judgement: approved, but strategic decision making is only Developing.
    expect(strong.length).toBeGreaterThanOrEqual(4);
    expect(assessment.filter((lo) => lo.rating === "Needs work")).toEqual([]);
  });

  it("a hasty team rates Needs work on most outcomes, with specific feedback", () => {
    const s = poorGame();
    const assessment = assessLearningOutcomes(s, projectOutcomes(s));
    const weak = assessment.filter((lo) => lo.rating === "Needs work");
    expect(weak.length).toBeGreaterThanOrEqual(5);

    const stakeholder = assessment.find((lo) => lo.id === "stakeholder-analysis");
    expect(stakeholder.observations.join(" ")).toMatch(/generic/);
    expect(stakeholder.observations.join(" ")).toMatch(/Finance Director/);
  });

  it("lists missed critical evidence with every route that reveals it", () => {
    const missed = missedCriticalEvidence([]);
    expect(missed).toHaveLength(evidence.filter((e) => e.critical).length);
    for (const m of missed) {
      expect(m.routes.length).toBeGreaterThan(0);
      for (const r of m.routes) {
        if (r.kind === "interview") {
          const s = stakeholders.find((x) => x.id === r.stakeholderId);
          expect(s.questions.find((q) => q.id === r.questionId).evidence).toContain(m.id);
        } else {
          expect(r.kind).toBe("document");
        }
      }
    }
    const lostBid = missed.find((m) => m.id === "strategy-lost-bid");
    expect(lostBid.routes.map((r) => r.kind).sort()).toEqual(["document", "interview"]);
  });

  it("reviews each defended position and the alternatives, without a single right answer", () => {
    const good = reviewChallengeAnswers(goodGame());
    expect(good).toHaveLength(3);
    for (const a of good) {
      expect(a.alternatives).toHaveLength(2);
      expect(a.defended.strength).toBe(a.bestAvailable.strength);
    }
    expect(good.some((a) => a.defended.rating !== "Unconvincing")).toBe(true);
    const poor = reviewChallengeAnswers(poorGame());
    expect(poor.every((a) => a.defended.rating === "Weak judgement")).toBe(true);
    // The alternatives include the two defensible positions.
    expect(poor[0].alternatives.every((alt) => alt.kind === "defensible")).toBe(true);
  });
});

describe("results export", () => {
  it("contains the team, duration, recommendation, outcomes and assessment", () => {
    const s = goodGame();
    const outcome = projectOutcomes(s);
    const data = buildResultsExport(s, outcome, assessLearningOutcomes(s, outcome));

    expect(data.team).toBe("Diligent");
    expect(data.durationMinutes).toBe(25);
    expect(data.investigation.questionsUsed).toBe(10);
    expect(data.investigation.documentsReviewed).toEqual(["doc-competitors", "doc-workforce"]);
    expect(data.recommendation.platform).toBe("3DEXPERIENCE");
    expect(data.recommendation.risks).toHaveLength(3);
    expect(data.boardReview.answers).toHaveLength(3);
    expect(data.boardReview.answers[0].position).toBeTypeOf("string");
    expect(data.outcomes.years.map((y) => y.year)).toEqual([1, 3, 5]);
    expect(data.learningOutcomes).toHaveLength(6);
    // Serialisable as plain JSON.
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});

describe("risk feedback", () => {
  it("doesn't flag equally severe risks as missed, but flags more severe ones", () => {
    const base = [
      { type: "START", teamName: "T", now: 0 },
      { type: "SET_RECOMMENDATION", field: "platform", value: "3DEXPERIENCE" },
      { type: "SET_RECOMMENDATION", field: "strategy", value: "phased" },
      { type: "SET_RECOMMENDATION", field: "changeApproach", value: "sponsored" },
      { type: "SET_RECOMMENDATION", field: "rationale", value: "A considered rationale." }
    ];
    const withRisks = (ids) =>
      finish(
        run([
          ...base,
          ...ids.flatMap((riskId, index) => [
            { type: "SET_RISK", index, riskId },
            {
              type: "SET_MITIGATION",
              index,
              mitigationId: risksById[riskId].mitigations[0].id
            }
          ])
        ]),
        "best"
      );
    const riskFeedback = (s) =>
      assessLearningOutcomes(s, projectOutcomes(s))
        .find((lo) => lo.id === "risk-mitigation")
        .observations.join(" ");

    // cost-overrun (3) plus two severity-2 risks: nothing more severe missed.
    expect(riskFeedback(withRisks(["cost-overrun", "skills-loss", "certification"])))
      .not.toMatch(/didn't address/);
    // Three severity-2 risks: the severity-3 cost overrun was missed.
    expect(riskFeedback(withRisks(["skills-loss", "certification", "change-resistance"])))
      .toMatch(/programme cost overrun/);
  });
});
