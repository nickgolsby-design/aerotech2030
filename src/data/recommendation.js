// Content for the recommendation form and the outcome engine.
// `quality` and `exposure` values are hidden from students.
import riskData from "./risks.json" with { type: "json" };

export const STAY_PLATFORM = "Stay with CATIA V5";

export const strategies = [
  {
    id: "bigbang",
    label: "Big-bang cut-over",
    description: "Move all teams and data to the new platform on a single date."
  },
  {
    id: "phased",
    label: "Phased by programme",
    description:
      "New programmes start on the new platform; existing work migrates in waves."
  },
  {
    id: "hybrid",
    label: "Hybrid coexistence",
    description:
      "Run both platforms long-term with a data bridge; migrate only when needed."
  }
];

// How much each strategy amplifies transition disruption, and how it shifts
// platform fit over time (added to the 0–10 fit score).
export const strategyEffects = {
  bigbang: { disruption: 1.0, fitShift: { 1: -1.0, 3: 0.3, 5: 0.5 } },
  phased: { disruption: 0.6, fitShift: { 1: -0.3, 3: 0, 5: 0.3 } },
  hybrid: { disruption: 0.4, fitShift: { 1: 0, 3: -0.3, 5: -0.6 } }
};

export const changeApproaches = [
  {
    id: "mandate",
    label: "Mandate adoption; line managers handle resistance",
    quality: 0
  },
  {
    id: "sponsored",
    label:
      "Executive sponsor, change champions in each team, and staff involved in the pilot",
    quality: 1
  },
  {
    id: "communicate",
    label: "Announce the decision and provide vendor training",
    quality: 0.5
  }
];

// Risks live in risks.json: { id, label, category, exposure, strategyFactor?, mitigations[] }
//   exposure: base severity (0–3) per platform.
//   strategyFactor: multiplier per implementation strategy (default 1).
//   mitigations: { id, label, quality } — 1 = strong, 0.5 = partial, 0 = ineffective.
export const risks = riskData;

export const risksById = Object.fromEntries(risks.map((r) => [r.id, r]));

export const RISK_SLOTS = 3;
export const MIN_RATIONALE_LENGTH = 20;
