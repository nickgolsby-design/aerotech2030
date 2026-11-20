// Loads the documents students can review during the investigation. The
// content lives in documents.json.
//
// documents[]  { id, title, type, owner, summary, points[], evidence[] }
//   Reviewing a document costs one investigation action, like a question.
//   `evidence` lists the evidence ids it reveals. Documents give alternative
//   routes to evidence that interviews can also reveal (Investigation
//   Pathways in STAKEHOLDER_INTELLIGENCE_FRAMEWORK_V1).
import documentData from "./documents.json" with { type: "json" };

export const documents = documentData;

export const documentsById = Object.fromEntries(
  documents.map((doc) => [doc.id, doc])
);
