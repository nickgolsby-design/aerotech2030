// Debrief: maps a completed game onto the brief's six learning outcomes.
// Pure functions only, so they're unit-testable.
import { evidence, categories } from "../data/evidence.js";
import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import { criteria, platforms } from "../data/platformProfiles.js";
import {
  STAY_PLATFORM,
  strategies,
  changeApproaches,
  risks,
  RISK_SLOTS
} from "../data/recommendation.js";
import {
  horizonWeights,
  platformFit,
  diligenceScore,
  mitigationScore,
  changeScore,
  riskSeverity,
  getChallenge,
  verdictLabels
} from "./outcomeEngine.js";

export const HIGH_INFLUENCE = 85;
const EXPERT_HORIZON = 3;

const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;

export function rating(score) {
  if (score >= 0.7) return "Strong";
  if (score >= 0.45) return "Developing";
  return "Needs work";
}

/** Pearson correlation; 0 when either side has no variation. */
export function correlation(xs, ys) {
  const mx = average(xs);
  const my = average(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

/** Long-term platform quality (0–1) relative to the other options. */
export function platformChoiceScore(platform) {
  const longTerm = (p) => (platformFit(p, 3) + platformFit(p, 5)) / 2;
  const values = platforms.map(longTerm);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return (longTerm(platform) - min) / (max - min);
}

const STRATEGY_SCORES = { phased: 1, hybrid: 0.6, bigbang: 0.3 };

/** The most severe risks for a platform and strategy, in order. */
export function topRisks(platform, strategy, count = RISK_SLOTS) {
  return risks
    .map((risk) => ({ risk, severity: riskSeverity(risk, platform, strategy) }))
    .filter((r) => r.severity > 0)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, count)
    .map((r) => r.risk);
}

export function expertRecommendation() {
  const platform = [...platforms].sort(
    (a, b) => platformChoiceScore(b) - platformChoiceScore(a)
  )[0];
  const strategy = "phased";
  return {
    platform,
    strategy: strategies.find((s) => s.id === strategy),
    changeApproach: changeApproaches.find((c) => c.quality === 1),
    risks: topRisks(platform, strategy).map((risk) => ({
      risk,
      mitigation: risk.mitigations.find((m) => m.quality === 1)
    }))
  };
}

/** Which question would have revealed each evidence item. */
const evidenceQuestion = Object.fromEntries(
  stakeholders.flatMap((s) =>
    s.questions.flatMap((q) =>
      q.evidence.map((id) => [id, { stakeholder: s, question: q }])
    )
  )
);

export function missedCriticalEvidence(evidenceIds) {
  return evidence
    .filter((e) => e.critical && !evidenceIds.includes(e.id))
    .map((e) => ({ ...e, ...evidenceQuestion[e.id] }));
}

// ---------------------------------------------------------------------------
// Learning outcomes
// ---------------------------------------------------------------------------

function stakeholderAnalysis(state) {
  const interviewedIds = new Set(state.interviews.map((i) => i.stakeholderId));
  const highInfluence = stakeholders.filter((s) => s.influence >= HIGH_INFLUENCE);
  const missedHigh = highInfluence.filter((s) => !interviewedIds.has(s.id));
  const leading = state.interviews.filter((i) => i.trustDelta <= -10);
  const guarded = state.interviews.filter((i) => i.guarded);
  const asked = state.interviews.length;

  const score =
    0.4 * (1 - missedHigh.length / highInfluence.length) +
    0.3 * (interviewedIds.size / stakeholders.length) +
    0.3 * (asked === 0 ? 0 : 1 - leading.length / asked);

  const observations = [
    `You interviewed ${interviewedIds.size} of ${stakeholders.length} stakeholders.`
  ];
  if (missedHigh.length > 0) {
    observations.push(
      `You didn't interview these high-influence stakeholders: ${missedHigh
        .map((s) => s.name)
        .join(", ")}.`
    );
  }
  if (leading.length > 0) {
    observations.push(
      `${leading.length} of your questions ${
        leading.length === 1 ? "was" : "were"
      } leading or dismissive, which damaged trust.`
    );
  }
  if (guarded.length > 0) {
    observations.push(
      `${guarded.length} ${
        guarded.length === 1 ? "answer was" : "answers were"
      } withheld because the stakeholder no longer trusted you.`
    );
  }

  return {
    id: "stakeholder-analysis",
    title: "Stakeholder analysis",
    score,
    observations,
    learningPoint:
      "Map stakeholders by influence and interest early. Open, well-framed questions build the trust you need before critical information is shared."
  };
}

function requirementsCapture(state) {
  const D = diligenceScore(state.evidenceIds);
  const found = state.evidenceIds.length;
  const coveredCategories = new Set(
    state.evidenceIds.map((id) => evidence.find((e) => e.id === id).category)
  );
  const tagged = state.evidenceIds.filter((id) => state.tags[id]).length;
  const criticalTotal = evidence.filter((e) => e.critical).length;
  const criticalFound = Math.round(D * criticalTotal);

  const score =
    0.5 * D +
    0.3 * (coveredCategories.size / categories.length) +
    0.2 * (found === 0 ? 0 : tagged / found);

  const observations = [
    `You found ${criticalFound} of ${criticalTotal} critical evidence items, covering ${coveredCategories.size} of ${categories.length} areas.`,
    found === 0
      ? "You gathered no evidence to classify."
      : `You classified ${tagged} of ${found} evidence items as requirements, risks or constraints.`
  ];

  return {
    id: "requirements-capture",
    title: "Requirements capture",
    score,
    observations,
    learningPoint:
      "Requirements are spread across every function. Probe beyond the obvious, and turn findings into explicit requirements, risks and constraints."
  };
}

function softwareEvaluation(state) {
  const expert = horizonWeights[EXPERT_HORIZON];
  const studentWeights = criteria.map((c) => state.weights[c.id]);
  const expertWeights = criteria.map((c) => expert[c.id]);
  const alignment = Math.max(0, correlation(studentWeights, expertWeights));

  const assessed = new Set(
    state.evidenceIds.map((id) => evidence.find((e) => e.id === id).category)
  );
  const criteriaAssessed = criteria.filter((c) => assessed.has(c.category)).length;
  const choice = platformChoiceScore(state.recommendation.platform);

  const score =
    0.4 * alignment + 0.3 * (criteriaAssessed / criteria.length) + 0.3 * choice;

  const observations = [
    `You had evidence for ${criteriaAssessed} of ${criteria.length} comparison criteria.`,
    alignment === 0
      ? "Your criterion weights didn't reflect AeroTech's priorities (or were left unchanged)."
      : `Your criterion weights ${
          alignment >= 0.6 ? "closely matched" : "partly matched"
        } AeroTech's real priorities.`,
    `${state.recommendation.platform} ranks ${
      choice >= 0.9 ? "best" : choice >= 0.6 ? "well" : "poorly"
    } on long-term fit for AeroTech.`
  ];

  return {
    id: "software-evaluation",
    title: "Engineering software evaluation",
    score,
    observations,
    learningPoint:
      "Weight criteria against the business's needs over the platform's whole life, not just year one, and don't score what you haven't investigated."
  };
}

function changeManagement(state) {
  const rec = state.recommendation;
  const C = changeScore(rec);
  const staying = rec.platform === STAY_PLATFORM;
  const strategyScore = staying ? 0.3 : STRATEGY_SCORES[rec.strategy];
  const approach = changeApproaches.find((c) => c.id === rec.changeApproach);
  const strategy = strategies.find((s) => s.id === rec.strategy);

  const observations = [`Change approach: “${approach.label}”.`];
  observations.push(
    staying
      ? "Staying on V5 postpones, rather than avoids, the change challenge."
      : `Implementation: ${strategy.label}.`
  );
  if (C < 1) {
    observations.push(
      "Announcing or mandating change rarely builds commitment. Visible sponsorship and staff involvement do."
    );
  }

  return {
    id: "change-management",
    title: "Change management",
    score: 0.6 * C + 0.4 * strategyScore,
    observations,
    learningPoint:
      "Technology change is people change. Sponsorship, change champions, involvement in the pilot and phased adoption reduce resistance and productivity loss."
  };
}

function riskMitigation(state) {
  const rec = state.recommendation;
  const strategy = rec.strategy || null;
  const score = mitigationScore(rec, rec.platform, strategy);
  const chosen = new Set(rec.risks.map((r) => r.riskId));
  // Only flag risks strictly more severe than the weakest one chosen, so
  // ties between equally severe risks aren't reported as mistakes.
  const severity = (risk) => riskSeverity(risk, rec.platform, strategy);
  const chosenSeverities = risks.filter((r) => chosen.has(r.id)).map(severity);
  const threshold = chosenSeverities.length ? Math.min(...chosenSeverities) : 0;
  const missed = topRisks(rec.platform, strategy, risks.length)
    .filter((r) => !chosen.has(r.id) && severity(r) > threshold)
    .slice(0, RISK_SLOTS);

  const observations = [
    `Your mitigations covered ${Math.round(score * 100)}% of the risk exposure for your chosen approach.`
  ];
  if (missed.length > 0) {
    observations.push(
      `Higher-priority risks you didn't address: ${missed
        .map((r) => r.label.toLowerCase())
        .join("; ")}.`
    );
  }

  return {
    id: "risk-mitigation",
    title: "Risk mitigation",
    score,
    observations,
    learningPoint:
      "Prioritise risks by severity for the option you're actually recommending, and pair each with a specific, credible mitigation."
  };
}

function strategicDecision(state, outcome) {
  const year5 = outcome.years.at(-1).overall;
  const year1 = outcome.years[0].overall;
  const score = 0.5 * (outcome.confidence / 100) + 0.5 * (year5 / 100);

  const observations = [
    `Board verdict: ${verdictLabels[outcome.verdict]} (confidence ${outcome.confidence}/100).`,
    `Overall performance moved from ${year1} in Year 1 to ${year5} in Year 5.`
  ];
  if (year5 < year1) {
    observations.push(
      "Performance declined over time. Short-term comfort came at the cost of long-term position."
    );
  }

  return {
    id: "strategic-decision",
    title: "Strategic decision making",
    score,
    observations,
    learningPoint:
      "Strong decisions balance short-term disruption against long-term position, and they have to be argued convincingly to the board."
  };
}

export function assessLearningOutcomes(state, outcome) {
  return [
    stakeholderAnalysis(state),
    requirementsCapture(state),
    softwareEvaluation(state),
    changeManagement(state),
    riskMitigation(state),
    strategicDecision(state, outcome)
  ].map((lo) => ({ ...lo, rating: rating(lo.score) }));
}

/** Each board challenge with the team's answer and the strongest answer. */
export function reviewChallengeAnswers(state) {
  return state.challengeIds.map((id) => {
    const challenge = getChallenge(id);
    const chosen = challenge.options.find(
      (o) => o.id === state.challengeAnswers[id]
    );
    const best = challenge.options.find((o) => o.quality === 1);
    return {
      id,
      stakeholder: stakeholdersById[challenge.stakeholderId].name,
      text: challenge.text,
      chosen,
      best,
      wasBest: chosen?.id === best.id
    };
  });
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export function buildResultsExport(state, outcome, assessment) {
  const rec = state.recommendation;
  const hasTimes = state.startedAt != null && state.finishedAt != null;
  const durationMinutes = hasTimes
    ? Math.round((state.finishedAt - state.startedAt) / 60000)
    : null;
  const iso = (ms) => (ms == null ? null : new Date(ms).toISOString());

  return {
    simulation: "AeroTech 2030",
    team: state.teamName,
    startedAt: iso(state.startedAt),
    finishedAt: iso(state.finishedAt),
    durationMinutes,
    investigation: {
      questionsUsed: state.interviews.length,
      stakeholdersInterviewed: new Set(state.interviews.map((i) => i.stakeholderId)).size,
      evidenceFound: state.evidenceIds.length,
      criticalEvidenceFound: Math.round(diligenceScore(state.evidenceIds) * 100) + "%",
      finalTrust: state.trust,
      criterionWeights: state.weights
    },
    recommendation: {
      platform: rec.platform,
      strategy: rec.strategy || null,
      risks: rec.risks.map((slot) => {
        const risk = risks.find((r) => r.id === slot.riskId);
        return {
          risk: risk.label,
          mitigation: risk.mitigations.find((m) => m.id === slot.mitigationId).label
        };
      }),
      changeApproach: changeApproaches.find((c) => c.id === rec.changeApproach).label,
      rationale: rec.rationale
    },
    boardReview: {
      verdict: verdictLabels[outcome.verdict],
      confidence: outcome.confidence,
      answers: reviewChallengeAnswers(state).map((a) => ({
        challenge: `${a.stakeholder}: ${a.text}`,
        answer: a.chosen.text,
        strongest: a.wasBest
      }))
    },
    outcomes: {
      implementedPlatform: outcome.platform,
      years: outcome.years.map((y) => ({
        year: y.year,
        overall: y.overall,
        ...y.metrics,
        events: y.events.map((e) => e.text)
      }))
    },
    learningOutcomes: assessment.map((lo) => ({
      outcome: lo.title,
      rating: lo.rating,
      score: Math.round(lo.score * 100),
      observations: lo.observations
    }))
  };
}
