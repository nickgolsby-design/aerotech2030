import { QUESTION_BUDGET } from "../data/gameConfig.js";

export const initialGameState = {
  started: false,
  selectedId: null,
  // Each entry: { stakeholderId, category, text }
  evidence: [],
  questionsLeft: QUESTION_BUDGET,
  decision: "",
  submitted: false
};

export function gameReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, started: true };

    case "CONSULT": {
      const { stakeholder } = action;
      const next = { ...state, selectedId: stakeholder.id };

      const alreadyCollected = state.evidence.some(
        (item) => item.stakeholderId === stakeholder.id
      );

      // First consultation of a stakeholder costs one question and
      // records their evidence; repeat visits are free.
      if (!alreadyCollected && state.questionsLeft > 0) {
        next.evidence = [
          ...state.evidence,
          {
            stakeholderId: stakeholder.id,
            category: stakeholder.category,
            text: stakeholder.evidence
          }
        ];
        next.questionsLeft = state.questionsLeft - 1;
      }

      return next;
    }

    case "SET_DECISION":
      return { ...state, decision: action.decision };

    case "SUBMIT":
      return { ...state, submitted: true };

    default:
      return state;
  }
}
