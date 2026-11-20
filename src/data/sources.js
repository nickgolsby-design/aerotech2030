// Every route to each evidence item: interview questions and documents.
// Used to show where evidence came from and, in the debrief, how missed
// evidence could have been found.
import { stakeholders } from "./stakeholders.js";
import { documents } from "./documents.js";

export const evidenceSources = {};

for (const s of stakeholders) {
  for (const q of s.questions) {
    for (const id of q.evidence) {
      (evidenceSources[id] ??= []).push({
        kind: "interview",
        stakeholderId: s.id,
        label: s.name,
        questionId: q.id,
        detail: q.text
      });
    }
  }
}

for (const doc of documents) {
  for (const id of doc.evidence) {
    (evidenceSources[id] ??= []).push({
      kind: "document",
      documentId: doc.id,
      label: doc.title,
      detail: doc.type
    });
  }
}

/**
 * Where the team actually found each discovered evidence item: the
 * stakeholder or document that first revealed it.
 */
export function foundVia(state) {
  const found = {};
  const record = (ids, label) => {
    for (const id of ids) found[id] ??= label;
  };
  for (const entry of state.interviews) {
    record(entry.found ?? [], stakeholders.find((s) => s.id === entry.stakeholderId).name);
  }
  for (const entry of state.documentsRead) {
    record(entry.found, documents.find((d) => d.id === entry.documentId).title);
  }
  return found;
}
