// Loads the stakeholder dataset and derives lookups used across the game.
// The content itself lives in stakeholders.json.
//
// Stakeholder fields:
//   id, name, role       identity and description shown to students
//   influence (0–100)    weight in board buy-in; 85+ counts as high influence
//   initialTrust (0–100) starting trust in the consultants
//   category             evidence category this stakeholder mainly speaks for
//   questions[]          { id, text, trustDelta, response, evidence[] }
//
// `trustDelta` is hidden from students: open, well-framed questions build
// trust; probing questions cost a little; leading questions damage it.
// `evidence` lists evidence ids (see evidence.js) the answer reveals.
import stakeholderData from "./stakeholders.json" with { type: "json" };

export const stakeholders = stakeholderData;

export const stakeholdersById = Object.fromEntries(
  stakeholders.map((stakeholder) => [stakeholder.id, stakeholder])
);

// Which stakeholder can reveal each evidence item.
export const evidenceSource = Object.fromEntries(
  stakeholders.flatMap((stakeholder) =>
    stakeholder.questions.flatMap((question) =>
      question.evidence.map((evidenceId) => [evidenceId, stakeholder.name])
    )
  )
);

export const GUARDED_RESPONSE =
  "I'm not comfortable going into detail on that with you right now.";
