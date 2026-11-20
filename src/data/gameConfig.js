// Investigation actions: each interview question or document review costs one.
export const ACTION_BUDGET = 12;

// Trust is tracked 0–100 but students only see a relationship label:
// Open, Neutral or Cautious. Below GUARDED_THRESHOLD (Cautious) a
// stakeholder withholds evidence; at OPEN_THRESHOLD and above they are Open.
// Facilitators can see the number.
export const GUARDED_THRESHOLD = 30;
export const OPEN_THRESHOLD = 60;

// Stakeholder influence is authored as Low / Medium / High (see
// stakeholders.json) and converted to a weight for board buy-in.
export const INFLUENCE_WEIGHT = { High: 90, Medium: 70, Low: 50 };
export const HIGH_INFLUENCE = 85;

export const DEFAULT_CRITERION_WEIGHT = 3;
export const MAX_CRITERION_WEIGHT = 5;

export function trustLabel(trust) {
  if (trust >= OPEN_THRESHOLD) return "Open";
  if (trust >= GUARDED_THRESHOLD) return "Neutral";
  return "Cautious";
}
