import {
  QUESTION_BUDGET,
  GUARDED_THRESHOLD,
  DEFAULT_CRITERION_WEIGHT
} from "../data/gameConfig.js";
import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import { criteria } from "../data/platformProfiles.js";
import { STAY_PLATFORM, RISK_SLOTS } from "../data/recommendation.js";
import {
  selectChallenges,
  validateRecommendation
} from "../engine/outcomeEngine.js";

// Phases: "briefing" -> "investigation" -> "boardReview" -> "outcomes"
//         <-> "debrief"
export const PHASES = [
  { id: "briefing", label: "Briefing" },
  { id: "investigation", label: "Investigation" },
  { id: "boardReview", label: "Board review" },
  { id: "outcomes", label: "Outcomes" },
  { id: "debrief", label: "Debrief" }
];

export const MAX_TEAM_NAME_LENGTH = 40;

export const initialGameState = {
  phase: "briefing",
  teamName: "",
  // Timestamps (ms) passed in with actions so the reducer stays pure.
  startedAt: null,
  finishedAt: null,
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
  recommendation: {
    platform: "",
    strategy: "",
    risks: Array.from({ length: RISK_SLOTS }, () => ({
      riskId: "",
      mitigationId: ""
    })),
    changeApproach: "",
    rationale: ""
  },
  // Board review: challenge ids chosen at submission, and answers given.
  challengeIds: [],
  challengeAnswers: {}
};

const clamp = (value) => Math.max(0, Math.min(100, value));

const RECOMMENDATION_FIELDS = new Set([
  "platform",
  "strategy",
  "changeApproach",
  "rationale"
]);

function updateRecommendation(state, changes) {
  return { ...state, recommendation: { ...state.recommendation, ...changes } };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "START": {
      if (state.phase !== "briefing") return state;
      const teamName = (action.teamName ?? "")
        .trim()
        .slice(0, MAX_TEAM_NAME_LENGTH);
      if (!teamName) return state;
      return {
        ...state,
        phase: "investigation",
        teamName,
        startedAt: action.now ?? null
      };
    }

    case "SELECT_STAKEHOLDER":
      return { ...state, selectedId: action.stakeholderId };

    case "ASK": {
      if (state.phase !== "investigation") return state;

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

    case "SET_RECOMMENDATION": {
      if (state.phase !== "investigation") return state;
      if (!RECOMMENDATION_FIELDS.has(action.field)) return state;

      const changes = { [action.field]: action.value };
      // Staying on V5 has no implementation strategy.
      if (action.field === "platform" && action.value === STAY_PLATFORM) {
        changes.strategy = "";
      }
      return updateRecommendation(state, changes);
    }

    case "SET_RISK": {
      if (state.phase !== "investigation") return state;
      const risks = state.recommendation.risks.map((slot, i) =>
        i === action.index ? { riskId: action.riskId, mitigationId: "" } : slot
      );
      return updateRecommendation(state, { risks });
    }

    case "SET_MITIGATION": {
      if (state.phase !== "investigation") return state;
      const risks = state.recommendation.risks.map((slot, i) =>
        i === action.index ? { ...slot, mitigationId: action.mitigationId } : slot
      );
      return updateRecommendation(state, { risks });
    }

    case "SUBMIT": {
      if (state.phase !== "investigation") return state;
      if (validateRecommendation(state.recommendation).length > 0) return state;

      return {
        ...state,
        phase: "boardReview",
        challengeIds: selectChallenges(
          state.recommendation.platform,
          state.evidenceIds
        ),
        challengeAnswers: {}
      };
    }

    case "ANSWER_CHALLENGE": {
      if (state.phase !== "boardReview") return state;
      if (!state.challengeIds.includes(action.challengeId)) return state;
      if (action.challengeId in state.challengeAnswers) return state;

      return {
        ...state,
        challengeAnswers: {
          ...state.challengeAnswers,
          [action.challengeId]: action.optionId
        }
      };
    }

    case "SHOW_OUTCOMES": {
      if (state.phase !== "boardReview") return state;
      const allAnswered = state.challengeIds.every(
        (id) => id in state.challengeAnswers
      );
      return allAnswered
        ? { ...state, phase: "outcomes", finishedAt: action.now ?? null }
        : state;
    }

    // Switch between the two results screens once the game is complete.
    case "SHOW_RESULTS_VIEW": {
      const resultsPhases = ["outcomes", "debrief"];
      if (!resultsPhases.includes(state.phase)) return state;
      if (!resultsPhases.includes(action.view)) return state;
      return { ...state, phase: action.view };
    }

    case "RESTART":
      return initialGameState;

    default:
      return state;
  }
}
