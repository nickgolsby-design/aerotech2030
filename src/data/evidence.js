// Loads the evidence dataset and derives lookups used across the game.
// The content itself lives in evidence.json.
//
// categories[]  { id, label }
//   Evidence categories. They also group the platform comparison criteria
//   (see platformProfiles.js) and drive the coverage dashboard.
//
// evidence[]    { id, category, critical, text }
//   `critical` is hidden from students; it drives diligence scoring, board
//   challenges and the debrief. Stakeholder questions reveal evidence by id
//   (see stakeholders.json).
import evidenceData from "./evidence.json" with { type: "json" };

export const categories = evidenceData.categories;

export const evidence = evidenceData.evidence;

export const evidenceById = Object.fromEntries(
  evidence.map((item) => [item.id, item])
);
