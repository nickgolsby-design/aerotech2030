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
import { projectOutcomes, getChallenge, horizonWeights } from "./outcomeEngine.js";
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

function finish(state, pick) {
  let s = gameReducer(state, { type: "SUBMIT" });
  for (const id of s.challengeIds) {
    const options = getChallenge(id).options;
    const option = pick === "best"
      ? options.find((o) => o.quality === 1)
      : options.find((o) => o.quality === 0);
    s = gameReducer(s, { type: "ANSWER_CHALLENGE", challengeId: id, optionId: option.id });
  }
  return gameReducer(s, { type: "SHOW_OUTCOMES", now: 25 * 60000 });
}

// A diligent team: open + probing questions to the most useful stakeholders.
const goodQuestions = [
  ["ceo", "ceo-success"], ["ceo", "ceo-customers"],
  ["finance-director", "fd-investment-case"], ["finance-director", "fd-hidden-costs"],
  ["manufacturing-director", "mfg-data-flow"], ["manufacturing-director", "mfg-downtime"],
  ["chief-design-engineer", "cde-team"], ["chief-design-engineer", "cde-legacy"],
  ["it-manager", "it-support-end"],
  ["quality-manager", "qm-certification"], ["quality-manager", "qm-traceability"],
  ["cae-lead", "cae-tools"],
  ["hr-training-manager", "hr-readiness"], ["hr-training-manager", "hr-survey"],
  ["customer-programmes-director", "cpd-expectations"]
].map(([stakeholderId, questionId]) => ({ type: "ASK", stakeholderId, questionId }));

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
    { type: "ASK", stakeholderId: "quality-manager", questionId: "qm-leading" },
    { type: "ASK", stakeholderId: "ceo", questionId: "ceo-leading" },
    ...recommend("PTC Creo", "bigbang", [
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
    expect(strong.length).toBeGreaterThanOrEqual(5);
  });

  it("a hasty team rates Needs work on most outcomes, with specific feedback", () => {
    const s = poorGame();
    const assessment = assessLearningOutcomes(s, projectOutcomes(s));
    const weak = assessment.filter((lo) => lo.rating === "Needs work");
    expect(weak.length).toBeGreaterThanOrEqual(5);

    const stakeholder = assessment.find((lo) => lo.id === "stakeholder-analysis");
    expect(stakeholder.observations.join(" ")).toMatch(/leading/);
    expect(stakeholder.observations.join(" ")).toMatch(/Finance Director/);
  });

  it("lists missed critical evidence with the question that reveals it", () => {
    const missed = missedCriticalEvidence([]);
    expect(missed).toHaveLength(evidence.filter((e) => e.critical).length);
    for (const m of missed) {
      expect(stakeholders.map((s) => s.id)).toContain(m.stakeholder.id);
      expect(m.question.evidence).toContain(m.id);
    }
  });

  it("reviews board answers against the strongest answer", () => {
    expect(reviewChallengeAnswers(goodGame()).every((a) => a.wasBest)).toBe(true);
    expect(reviewChallengeAnswers(poorGame()).some((a) => a.wasBest)).toBe(false);
  });
});

describe("results export", () => {
  it("contains the team, duration, recommendation, outcomes and assessment", () => {
    const s = goodGame();
    const outcome = projectOutcomes(s);
    const data = buildResultsExport(s, outcome, assessLearningOutcomes(s, outcome));

    expect(data.team).toBe("Diligent");
    expect(data.durationMinutes).toBe(25);
    expect(data.investigation.questionsUsed).toBe(15);
    expect(data.recommendation.platform).toBe("3DEXPERIENCE");
    expect(data.recommendation.risks).toHaveLength(3);
    expect(data.boardReview.answers).toHaveLength(4);
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
