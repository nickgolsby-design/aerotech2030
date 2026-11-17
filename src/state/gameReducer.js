import {
  QUESTION_BUDGET,
  GUARDED_THRESHOLD,
  DEFAULT_CRITERION_WEIGHT
} from "../data/gameConfig.js";
import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import { criteria } from "../data/platformProfiles.js";

export const initialGameState = {
  started: false,
  selectedId: null,
  questionsLeft: QUESTION_BUDGET,
  trust: Object.fromEntries(stakeholders.map((s) => [s.id, s.initialTrust])),
  // Interview transcript: { stakeholderId, questionId, guarded, trustDelta }
  interviews: [],
  // Evidence ids in the order they were discovered.
  evidenceIds: [],
  // evidenceId -> "Requirement" | "Risk" | "Constraint"
  tags: {},
  // criterionId -> weight (0–5)
  weights: Object.fromEntries(
    criteria.map((c) => [c.id, DEFAULT_CRITERION_WEIGHT])
  ),
  decision: "",
  submitted: false
};

const clamp = (value) => Math.max(0, Math.min(100, value));

export function gameReducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, started: true };

    case "SELECT_STAKEHOLDER":
      return { ...state, selectedId: action.stakeholderId };

    case "ASK": {
      const stakeholder = stakeholdersById[action.stakeholderId];
      const question = stakeholder?.questions.find(
        (q) => q.id === action.questionId
      );
      const alreadyAsked = state.interviews.some(
        (entry) => entry.questionId === action.questionId
      );

      if (!question || alreadyAsked || state.questionsLeft <= 0) {
        return state;
      }

      const currentTrust = state.trust[stakeholder.id];
      const guarded = currentTrust < GUARDED_THRESHOLD;
      const newEvidence = guarded
        ? []
        : question.evidence.filter((id) => !state.evidenceIds.includes(id));

      return {
        ...state,
        selectedId: stakeholder.id,
        questionsLeft: state.questionsLeft - 1,
        trust: {
          ...state.trust,
          [stakeholder.id]: clamp(currentTrust + question.trustDelta)
        },
        interviews: [
          ...state.interviews,
          {
            stakeholderId: stakeholder.id,
            questionId: question.id,
            guarded,
            trustDelta: question.trustDelta
          }
        ],
        evidenceIds: [...state.evidenceIds, ...newEvidence]
      };
    }

    case "TAG_EVIDENCE": {
      const tags = { ...state.tags };
      if (action.tag) {
        tags[action.evidenceId] = action.tag;
      } else {
        delete tags[action.evidenceId];
      }
      return { ...state, tags };
    }

    case "SET_WEIGHT":
      return {
        ...state,
        weights: { ...state.weights, [action.criterionId]: action.weight }
      };

    case "SET_DECISION":
      return { ...state, decision: action.decision };

    case "SUBMIT":
      return { ...state, submitted: true };

    default:
      return state;
  }
}
