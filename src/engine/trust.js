// Presentation helpers for trust and influence. Pure functions; they read the
// game state but never change gameplay.
import {
  GUARDED_THRESHOLD,
  OPEN_THRESHOLD,
  HIGH_INFLUENCE
} from "../data/gameConfig.js";

const clamp = (value) => Math.max(0, Math.min(100, value));

/**
 * Trust before and after each question asked to one stakeholder, rebuilt
 * from the interview log using the same clamping as the reducer.
 */
export function trustHistory(stakeholder, interviews) {
  let trust = stakeholder.initialTrust;
  return interviews
    .filter((entry) => entry.stakeholderId === stakeholder.id)
    .map((entry) => {
      const before = trust;
      trust = clamp(trust + entry.trustDelta);
      return { questionId: entry.questionId, before, after: trust, change: trust - before };
    });
}

/**
 * Where a stakeholder sits on the influence–trust grid, with the action a
 * consultant would usually take.
 */
export const QUADRANTS = {
  keyAlly: {
    label: "Key allies",
    advice: "High influence and open with you. Keep them closely involved."
  },
  keyRisk: {
    label: "Win over",
    advice: "High influence but not yet open. Build trust before you rely on them."
  },
  supporter: {
    label: "Supporters",
    advice: "Below the high-influence group, but open. Useful sources; keep them informed."
  },
  monitor: {
    label: "Monitor",
    advice: "Below the high-influence group and not yet open. Engage with care."
  }
};

export function quadrantFor(trust, influence) {
  const high = influence >= HIGH_INFLUENCE;
  const open = trust >= OPEN_THRESHOLD;
  if (high) return open ? "keyAlly" : "keyRisk";
  return open ? "supporter" : "monitor";
}

export const TRUST_BANDS = [
  {
    label: "Open",
    range: `${OPEN_THRESHOLD}–100`,
    meaning: "Shares information freely and is more likely to back your recommendation."
  },
  {
    label: "Cautious",
    range: `${GUARDED_THRESHOLD}–${OPEN_THRESHOLD - 1}`,
    meaning: "Still answers, but poorly framed questions will push them towards guarded."
  },
  {
    label: "Guarded",
    range: `0–${GUARDED_THRESHOLD - 1}`,
    meaning: "Withholds evidence: questions still use your budget but reveal nothing."
  }
];
