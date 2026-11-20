// Loads the evidence dataset and derives lookups used across the game.
// The content itself lives in evidence.json.
//
// categories[]       { id, label }
//   Evidence categories. They also group the platform comparison criteria
//   (see platformProfiles.js) and drive the coverage dashboard.
//
// classifications[]  { id, label, meaning }
//   The seven evidence types from SIMULATION_REDESIGN_V1. Students classify
//   evidence with these labels; each item also carries the expert view.
//
// evidence[]         { id, category, classification, supports[], critical, text }
//   `supports` lists the decision criteria (platformProfiles.js criteria ids)
//   the item informs. `classification` and `critical` are hidden from
//   students; `critical` drives diligence scoring, board challenges and the
//   debrief. Items of class "assumption" feed the assumption mechanic (see
//   design/BOARD_DECISION_FRAMEWORK.md). Interview questions and documents
//   reveal evidence by id; see sources.js for every route to an item.
import evidenceData from "./evidence.json" with { type: "json" };

export const categories = evidenceData.categories;

export const classifications = evidenceData.classifications;

export const classificationsById = Object.fromEntries(
  classifications.map((c) => [c.id, c])
);

// Labels offered to students when they classify evidence.
export const EVIDENCE_TAGS = classifications.map((c) => c.label);

export const evidence = evidenceData.evidence;

export const evidenceById = Object.fromEntries(
  evidence.map((item) => [item.id, item])
);
