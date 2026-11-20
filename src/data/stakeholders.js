// Loads the stakeholder dataset and derives lookups used across the game.
// The content itself lives in stakeholders.json.
//
// Stakeholder fields (STAKEHOLDER_INTELLIGENCE_FRAMEWORK_V1):
//   id, name, role        identity and description shown to students
//   shortName             label used on the stakeholder map
//   influence             "High" | "Medium" | "Low" as authored; the loader
//                         exposes it as `influenceLevel` and converts
//                         `influence` to a weight (gameConfig INFLUENCE_WEIGHT)
//   initialTrust (0–100)  starting relationship with the consultants
//   category              evidence category this stakeholder mainly speaks for
//   publicPosition        what they say openly (shown to students)
//   underlyingConcern     what really drives them (facilitator only)
//   blindSpot             what they consistently underestimate (facilitator only)
//   challengeQuestion     the question they put to the team (board review, P2)
//   questions[]           { id, text, depth, requires?, trustDelta, response, evidence[] }
//
// Question depth (hidden from students):
//   surface   generic question; gets the public position and no evidence
//   probing   consulting-style question; reveals evidence
//   deep      follow-up, available only after the question in `requires`;
//             reveals hidden evidence
// `trustDelta` is hidden and small; it reflects each stakeholder's
// sensitivities rather than a fixed pattern.
import stakeholderData from "./stakeholders.json" with { type: "json" };
import { INFLUENCE_WEIGHT } from "./gameConfig.js";

export const stakeholders = stakeholderData.map((s) => ({
  ...s,
  influenceLevel: s.influence,
  influence: INFLUENCE_WEIGHT[s.influence]
}));

export const stakeholdersById = Object.fromEntries(
  stakeholders.map((stakeholder) => [stakeholder.id, stakeholder])
);

/** Whether a question can be asked yet, given the questions already asked. */
export function isQuestionAvailable(question, askedIds) {
  return !question.requires || askedIds.has(question.requires);
}

export const GUARDED_RESPONSE =
  "I'm not comfortable going into detail on that with you right now.";
