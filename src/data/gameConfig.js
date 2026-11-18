export const QUESTION_BUDGET = 15;

// Trust bands (0–100). Below GUARDED_THRESHOLD a stakeholder withholds
// evidence; at OPEN_THRESHOLD and above they are open with the team.
export const GUARDED_THRESHOLD = 30;
export const OPEN_THRESHOLD = 60;

// Influence tiers (0–100). High-influence stakeholders weigh most in board
// buy-in and are expected to be interviewed (see the debrief).
export const HIGH_INFLUENCE = 85;
export const MEDIUM_INFLUENCE = 70;

export const DEFAULT_CRITERION_WEIGHT = 3;
export const MAX_CRITERION_WEIGHT = 5;

export const EVIDENCE_TAGS = ["Requirement", "Risk", "Constraint"];

export function trustLabel(trust) {
  if (trust >= OPEN_THRESHOLD) return "Open";
  if (trust >= GUARDED_THRESHOLD) return "Cautious";
  return "Guarded";
}

export function influenceTier(influence) {
  if (influence >= HIGH_INFLUENCE) return "High";
  if (influence >= MEDIUM_INFLUENCE) return "Medium";
  return "Low";
}
