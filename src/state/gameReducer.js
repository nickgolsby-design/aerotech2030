import {
  ACTION_BUDGET,
  GUARDED_THRESHOLD,
  DEFAULT_CRITERION_WEIGHT
} from "../data/gameConfig.js";
import {
  stakeholders,
  stakeholdersById,
  isQuestionAvailable
} from "../data/stakeholders.js";
import { documentsById } from "../data/documents.js";
import { criteria } from "../data/platformProfiles.js";
import { STAY_PLATFORM, RISK_SLOTS } from "../data/recommendation.js";
import {
  selectChallenges,
  getChallenge,
  validateRecommendation
} from "../engine/outcomeEngine.js";
import { MAX_CITED_EVIDENCE } from "../data/boardChallenges.js";

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
  // Investigation actions left: each question or document review costs one.
  actionsLeft: ACTION_BUDGET,
  trust: Object.fromEntries(stakeholders.map((s) => [s.id, s.initialTrust])),
  // Interview transcript:
  //   { stakeholderId, questionId, guarded, trustDelta, found[] }
  // `found` lists the evidence ids that answer newly revealed.
  interviews: [],
  // Documents reviewed: { documentId, found[] }
  documentsRead: [],
  // Evidence ids in the order they were discovered.
  evidenceIds: [],
  // Evidence ids newly revealed by the most recent action.
  lastFound: [],
  // evidenceId -> a classification label (see evidence.js EVIDENCE_TAGS)
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
  // Board review: challenge ids chosen at submission, and the position the
  // team defended on each: challengeId -> { positionId, evidenceIds[] }.
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
      const askedIds = new Set(state.interviews.map((entry) => entry.questionId));

      if (
        !question ||
        askedIds.has(question.id) ||
        !isQuestionAvailable(question, askedIds) ||
        state.actionsLeft <= 0
      ) {
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
        actionsLeft: state.actionsLeft - 1,
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
            trustDelta: question.trustDelta,
            found: newEvidence
          }
        ],
        evidenceIds: [...state.evidenceIds, ...newEvidence],
        lastFound: newEvidence
      };
    }

    case "READ_DOCUMENT": {
      if (state.phase !== "investigation") return state;

      const doc = documentsById[action.documentId];
      const alreadyRead = state.documentsRead.some(
        (entry) => entry.documentId === action.documentId
      );
      if (!doc || alreadyRead || state.actionsLeft <= 0) return state;

      const newEvidence = doc.evidence.filter(
        (id) => !state.evidenceIds.includes(id)
      );
      return {
        ...state,
        actionsLeft: state.actionsLeft - 1,
        documentsRead: [
          ...state.documentsRead,
          { documentId: doc.id, found: newEvidence }
        ],
        evidenceIds: [...state.evidenceIds, ...newEvidence],
        lastFound: newEvidence
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
        challengeIds: selectChallenges(state),
        challengeAnswers: {}
      };
    }

    // Defend a position on a board challenge, citing evidence the team has
    // found: { challengeId, positionId, evidenceIds[] }.
    case "ANSWER_CHALLENGE": {
      if (state.phase !== "boardReview") return state;
      if (!state.challengeIds.includes(action.challengeId)) return state;
      if (action.challengeId in state.challengeAnswers) return state;

      const challenge = getChallenge(action.challengeId);
      if (!challenge.positions.some((p) => p.id === action.positionId)) {
        return state;
      }
      const cited = [...new Set(action.evidenceIds ?? [])];
      const minimum = Math.min(1, state.evidenceIds.length);
      if (
        cited.length < minimum ||
        cited.length > MAX_CITED_EVIDENCE ||
        !cited.every((id) => state.evidenceIds.includes(id))
      ) {
        return state;
      }

      return {
        ...state,
        challengeAnswers: {
          ...state.challengeAnswers,
          [action.challengeId]: {
            positionId: action.positionId,
            evidenceIds: cited
          }
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
