// Pure scoring functions. No React, no side effects, so they're unit-testable.
import { criteria, platformProfiles } from "../data/platformProfiles.js";
import { evidence, categories } from "../data/evidence.js";
import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import { GUARDED_THRESHOLD } from "../data/gameConfig.js";
import {
  STAY_PLATFORM,
  strategyEffects,
  changeApproaches,
  risks,
  risksById,
  RISK_SLOTS,
  MIN_RATIONALE_LENGTH
} from "../data/recommendation.js";
import {
  categoryChallenges,
  platformChallenges,
  CATEGORY_CHALLENGE_COUNT
} from "../data/boardChallenges.js";

export const YEARS = [1, 3, 5];

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

// ---------------------------------------------------------------------------
// Platform fit
// ---------------------------------------------------------------------------

// What actually matters to AeroTech at each horizon (hidden "true" weights).
// Short-term success is about cost, continuity and staff; long-term success
// is about strategy, customers and security.
export const horizonWeights = {
  1: { cost: 5, manufacturing: 5, simulation: 1, future: 1, compliance: 3, supplychain: 1, security: 1, change: 5 },
  3: { cost: 3, manufacturing: 5, simulation: 3, future: 4, compliance: 4, supplychain: 5, security: 4, change: 3 },
  5: { cost: 2, manufacturing: 3, simulation: 3, future: 5, compliance: 3, supplychain: 5, security: 5, change: 1 }
};

/** Platform fit (0–10) against AeroTech's true needs at a given year. */
export function platformFit(platform, year) {
  const weights = horizonWeights[year];
  const profile = platformProfiles[platform];
  let sum = 0;
  let total = 0;
  for (const c of criteria) {
    sum += weights[c.id] * profile[c.id];
    total += weights[c.id];
  }
  return sum / total;
}

// ---------------------------------------------------------------------------
// Investigation quality
// ---------------------------------------------------------------------------

/** Share of critical evidence discovered (0–1). */
export function diligenceScore(evidenceIds) {
  const critical = evidence.filter((e) => e.critical);
  const found = critical.filter((e) => evidenceIds.includes(e.id));
  return found.length / critical.length;
}

/** Share of critical evidence discovered in one category (0–1). */
export function categoryCoverage(evidenceIds, categoryId) {
  const critical = evidence.filter(
    (e) => e.critical && e.category === categoryId
  );
  if (critical.length === 0) return 1;
  const found = critical.filter((e) => evidenceIds.includes(e.id));
  return found.length / critical.length;
}

const criterionByCategory = Object.fromEntries(
  criteria.map((c) => [c.category, c.id])
);

/**
 * How each stakeholder reacts to the recommended platform (0–1), blending
 * their trust in the consultants with how well the platform serves their
 * own area.
 */
export function stakeholderStance(stakeholder, platform, trust) {
  const criterionId = criterionByCategory[stakeholder.category];
  const platformScore = platformProfiles[platform][criterionId] / 10;
  return 0.5 * (trust[stakeholder.id] / 100) + 0.5 * platformScore;
}

export function stanceLabel(stance) {
  if (stance >= 0.6) return "Supportive";
  if (stance < 0.45) return "Opposed";
  return "Neutral";
}

/** Influence-weighted stakeholder support for the platform (0–1). */
export function buyInScore(platform, trust) {
  let sum = 0;
  let total = 0;
  for (const s of stakeholders) {
    sum += s.influence * stakeholderStance(s, platform, trust);
    total += s.influence;
  }
  return sum / total;
}

// ---------------------------------------------------------------------------
// Recommendation quality
// ---------------------------------------------------------------------------

export function validateRecommendation(rec) {
  const problems = [];
  if (!rec.platform) problems.push("Choose a platform.");
  if (rec.platform && rec.platform !== STAY_PLATFORM && !rec.strategy) {
    problems.push("Choose an implementation strategy.");
  }
  const chosen = rec.risks.filter((r) => r.riskId);
  if (chosen.length < RISK_SLOTS) {
    problems.push(`Identify ${RISK_SLOTS} key risks.`);
  }
  if (new Set(chosen.map((r) => r.riskId)).size !== chosen.length) {
    problems.push("Each risk must be different.");
  }
  if (chosen.some((r) => !r.mitigationId)) {
    problems.push("Choose a mitigation for each risk.");
  }
  if (!rec.changeApproach) problems.push("Choose a change-management approach.");
  if (rec.rationale.trim().length < MIN_RATIONALE_LENGTH) {
    problems.push(
      `Write a rationale of at least ${MIN_RATIONALE_LENGTH} characters.`
    );
  }
  return problems;
}

/** Severity of a risk for a platform and strategy (0 = not applicable). */
export function riskSeverity(risk, platform, strategy) {
  const base = risk.exposure[platform] ?? 0;
  const factor = strategy ? risk.strategyFactor?.[strategy] ?? 1 : 1;
  return base * factor;
}

/** Mitigation quality (0, 0.5, 1) the team applied to a risk. */
export function mitigationQuality(rec, riskId) {
  const slot = rec.risks.find((r) => r.riskId === riskId);
  if (!slot) return 0;
  const option = risksById[riskId].mitigations.find(
    (m) => m.id === slot.mitigationId
  );
  return option?.quality ?? 0;
}

/**
 * How well the chosen risks and mitigations cover the most severe risks
 * for this platform and strategy (0–1). The best achievable score comes
 * from picking the three most severe risks and strong mitigations.
 */
export function mitigationScore(rec, platform, strategy) {
  const severities = risks
    .map((r) => riskSeverity(r, platform, strategy))
    .sort((a, b) => b - a);
  const best = severities.slice(0, RISK_SLOTS).reduce((a, b) => a + b, 0);
  if (best === 0) return 1;

  const achieved = rec.risks
    .filter((r) => r.riskId)
    .reduce(
      (sum, slot) =>
        sum +
        riskSeverity(risksById[slot.riskId], platform, strategy) *
          mitigationQuality(rec, slot.riskId),
      0
    );
  return Math.min(1, achieved / best);
}

export function changeScore(rec) {
  return changeApproaches.find((c) => c.id === rec.changeApproach)?.quality ?? 0;
}

// ---------------------------------------------------------------------------
// Board review
// ---------------------------------------------------------------------------

/**
 * Pick the board's challenges: the least-investigated categories, plus one
 * challenge specific to the recommended platform. Returns challenge ids.
 */
export function selectChallenges(platform, evidenceIds) {
  const platformChallenge = platformChallenges[platform];
  const ranked = categories
    .map((c) => c.id)
    .filter((id) => id !== platformChallenge.category)
    .map((id) => ({
      id,
      coverage: categoryCoverage(evidenceIds, id),
      influence:
        stakeholdersById[categoryChallenges[id].stakeholderId].influence
    }))
    .sort((a, b) => a.coverage - b.coverage || b.influence - a.influence)
    .slice(0, CATEGORY_CHALLENGE_COUNT)
    .map((c) => `category:${c.id}`);

  return [...ranked, `platform:${platform}`];
}

/** Resolve a challenge id into its content plus the category it tests. */
export function getChallenge(challengeId) {
  const [kind, key] = challengeId.split(/:(.*)/s);
  if (kind === "platform") {
    return { id: challengeId, ...platformChallenges[key] };
  }
  return { id: challengeId, category: key, ...categoryChallenges[key] };
}

/**
 * Change in board confidence from one answer. Answers are more convincing
 * when the team has evidence in that area, and less so when the challenging
 * stakeholder distrusts them.
 */
export function challengeImpact(challengeId, optionId, evidenceIds, trust) {
  const challenge = getChallenge(challengeId);
  const option = challenge.options.find((o) => o.id === optionId);
  const backed = categoryCoverage(evidenceIds, challenge.category) > 0;
  const table = backed
    ? { 1: 12, 0.5: 4, 0: -10 }
    : { 1: 2, 0.5: -4, 0: -15 };
  let delta = table[option.quality];
  if (delta > 0 && trust[challenge.stakeholderId] < GUARDED_THRESHOLD) {
    delta /= 2;
  }
  return delta;
}

/**
 * Board confidence (0–100) after the review: starts from stakeholder support
 * and how thoroughly the team investigated, then moves with each answer.
 */
export function boardConfidence(state) {
  const { recommendation, challengeAnswers, evidenceIds, trust } = state;
  const base =
    25 +
    20 * buyInScore(recommendation.platform, trust) +
    20 * diligenceScore(evidenceIds);
  const answers = Object.entries(challengeAnswers).reduce(
    (sum, [challengeId, optionId]) =>
      sum + challengeImpact(challengeId, optionId, evidenceIds, trust),
    0
  );
  return clamp(base + answers);
}

export function boardVerdict(confidence) {
  if (confidence >= 60) return "approved";
  if (confidence >= 45) return "conditional";
  return "rejected";
}

export const verdictLabels = {
  approved: "Approved",
  conditional: "Approved with conditions",
  rejected: "Rejected: decision deferred"
};

// ---------------------------------------------------------------------------
// Year 1 / 3 / 5 projection
// ---------------------------------------------------------------------------

const FADE = { 1: 1, 3: 0.35, 5: 0.1 };

export const metricLabels = {
  delivery: "On-time delivery",
  cost: "Cost vs budget",
  workforce: "Workforce morale & skills",
  customer: "Customer position",
  board: "Board confidence"
};

/** Disruption caused by the transition itself (0–1) before fading. */
export function transitionLoad(platform, strategy) {
  if (platform === STAY_PLATFORM) return 0;
  const ease = platformProfiles[platform].change / 10;
  return (1 - ease) * strategyEffects[strategy].disruption;
}

function yearEvents(ctx, year) {
  const { platform, strategy, rec, verdict, fit, load, D } = ctx;
  const q = (riskId) => mitigationQuality(rec, riskId);
  const sev = (riskId) => riskSeverity(risksById[riskId], platform, strategy);
  const staying = platform === STAY_PLATFORM;
  const events = [];
  const add = (tone, text) => events.push({ tone, text });

  if (year === 1) {
    if (verdict === "rejected") {
      add("negative", "The board deferred the decision. CATIA V5 stays in place while a new review is commissioned.");
    }
    if (verdict === "conditional") {
      add("neutral", "The board released funding in smaller tranches, which slowed some mitigation work.");
    }
    if (!staying && load >= 0.4 && q("production-disruption") < 1) {
      add("negative", "Cut-over problems delayed NC programs and two customer deliveries slipped.");
    }
    if (!staying && sev("productivity-dip") >= 2 && q("productivity-dip") === 0) {
      add("negative", "Design output fell sharply during retraining and overtime costs rose.");
    }
    if (!staying && changeScore(rec) === 1) {
      add("positive", "Change champions helped teams adopt the new platform, and pilot feedback was positive.");
    }
    if (staying && verdict !== "rejected") {
      add("positive", "Operations ran smoothly with no transition disruption.");
    }
    if (D < 0.4) {
      add("negative", "Costs the investigation never uncovered started to surface.");
    }
  }

  if (year === 3) {
    if (staying) {
      add("negative", "Extended-support premiums rose, and new graduates arrived with no V5 experience.");
    }
    if (sev("customer-misalignment") >= 2 && q("customer-misalignment") < 1) {
      add("negative", "A key customer requested native 3DEXPERIENCE data, and translation overheads grew.");
    }
    if (sev("legacy-data") >= 2 && q("legacy-data") === 0) {
      add("negative", "A change to an in-service part needed a V5 model that couldn't be verified, and an audit finding was raised.");
    }
    if (sev("cost-overrun") >= 2 && q("cost-overrun") === 0) {
      add("negative", "Renewal prices rose after the year-one discount expired, and the budget was overspent.");
    }
    if (q("skills-loss") === 0) {
      add("negative", "Two senior engineers retired without a structured knowledge handover.");
    } else if (q("skills-loss") === 1) {
      add("positive", "The knowledge-capture programme kept critical expertise in the business.");
    }
  }

  if (year === 5) {
    if (staying && q("security") < 1) {
      add("negative", "A security advisory forced unsupported CAD workstations offline for three weeks.");
    }
    if (strategy === "hybrid") {
      add("neutral", "Running two CAD platforms still adds licence and support overhead.");
    }
    if (fit >= 8) {
      add("positive", "AeroTech won work on a new digitally-enabled programme, citing its model-based capability.");
    } else if (fit < 6) {
      add("negative", "AeroTech lost a new programme bid to a more digitally capable competitor.");
    }
  }

  return events;
}

/**
 * Full outcome projection for a completed game.
 * If the board rejects the recommendation, AeroTech stays on CATIA V5.
 */
export function projectOutcomes(state) {
  const rec = state.recommendation;
  const confidence = boardConfidence(state);
  const verdict = boardVerdict(confidence);

  const platform = verdict === "rejected" ? STAY_PLATFORM : rec.platform;
  const strategy = platform === STAY_PLATFORM ? null : rec.strategy;

  const D = diligenceScore(state.evidenceIds);
  const B = buyInScore(rec.platform, state.trust);
  const C = changeScore(rec);
  const rawM = mitigationScore(rec, platform, strategy);
  const M = verdict === "conditional" ? rawM * 0.85 : rawM;
  const L0 = transitionLoad(platform, strategy);

  const years = YEARS.map((year) => {
    const shift = strategy ? strategyEffects[strategy].fitShift[year] : 0;
    const fit = clamp(platformFit(platform, year) + shift, 0, 10);
    const load = L0 * FADE[year];

    const supportPremium =
      platform === STAY_PLATFORM ? { 1: 0, 3: 10, 5: 20 }[year] : 0;
    const hybridOverhead = strategy === "hybrid" && year > 1 ? 8 : 0;
    const skillsPenalty =
      year >= 3 && mitigationQuality(rec, "skills-loss") === 0 ? 10 : 0;
    // A deferred decision wastes a year of review effort and unsettles staff.
    const deferralPenalty = verdict === "rejected" && year === 1 ? 10 : 0;

    const metrics = {
      delivery: clamp(
        45 + 5 * fit - 10 * (1 - D) - 60 * load * (1 - 0.7 * M)
      ),
      cost: clamp(
        85 -
          50 * load * (1 - 0.6 * M) -
          15 * (1 - D) -
          supportPremium -
          hybridOverhead -
          deferralPenalty
      ),
      workforce: clamp(
        50 +
          20 * C +
          30 * (B - 0.5) -
          40 * load * (1 - 0.6 * C) -
          skillsPenalty -
          deferralPenalty
      ),
      customer: clamp(8 * fit + 15 * D - 10)
    };
    const operational =
      (metrics.delivery + metrics.cost + metrics.workforce + metrics.customer) / 4;
    metrics.board = clamp(0.5 * confidence + 0.5 * operational);

    for (const key of Object.keys(metrics)) {
      metrics[key] = Math.round(metrics[key]);
    }
    const overall = Math.round(
      Object.values(metrics).reduce((a, b) => a + b, 0) / 5
    );

    return {
      year,
      metrics,
      overall,
      events: yearEvents({ platform, strategy, rec, verdict, fit, load, D }, year)
    };
  });

  return {
    confidence: Math.round(confidence),
    verdict,
    platform,
    strategy,
    // Scores describe the team's recommendation as presented, even if the
    // board rejected it.
    scores: {
      diligence: D,
      buyIn: B,
      mitigation: mitigationScore(rec, rec.platform, rec.strategy || null),
      change: C
    },
    years
  };
}
