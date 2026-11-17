export const QUESTION_BUDGET = 15;

// Stakeholders below this trust level answer guardedly and reveal no evidence.
export const GUARDED_THRESHOLD = 30;

export const DEFAULT_CRITERION_WEIGHT = 3;
export const MAX_CRITERION_WEIGHT = 5;

export const EVIDENCE_TAGS = ["Requirement", "Risk", "Constraint"];

export function trustLabel(trust) {
  if (trust >= 60) return "Open";
  if (trust >= GUARDED_THRESHOLD) return "Cautious";
  return "Guarded";
}
