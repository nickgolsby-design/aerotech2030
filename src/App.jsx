import { useReducer } from "react";
import BriefingScreen from "./components/BriefingScreen.jsx";
import StakeholderPanel from "./components/StakeholderPanel.jsx";
import EvidenceDashboard from "./components/EvidenceDashboard.jsx";
import PlatformComparison from "./components/PlatformComparison.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import OutcomeReport from "./components/OutcomeReport.jsx";
import { stakeholders, stakeholdersById } from "./data/stakeholders.js";
import { platforms } from "./data/platformProfiles.js";
import { gameReducer, initialGameState } from "./state/gameReducer.js";
import "./components/game.css";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  if (!state.started) {
    return <BriefingScreen onStart={() => dispatch({ type: "START" })} />;
  }

  const selected = stakeholdersById[state.selectedId] ?? null;

  return (
    <div className="game">
      <h1>AeroTech 2030</h1>

      <StakeholderPanel
        stakeholders={stakeholders}
        selected={selected}
        trust={state.trust}
        interviews={state.interviews}
        questionsLeft={state.questionsLeft}
        onSelect={(stakeholderId) =>
          dispatch({ type: "SELECT_STAKEHOLDER", stakeholderId })
        }
        onAsk={(stakeholderId, questionId) =>
          dispatch({ type: "ASK", stakeholderId, questionId })
        }
      />

      <EvidenceDashboard
        evidenceIds={state.evidenceIds}
        tags={state.tags}
        onTag={(evidenceId, tag) =>
          dispatch({ type: "TAG_EVIDENCE", evidenceId, tag })
        }
      />

      <PlatformComparison
        platforms={platforms}
        evidenceIds={state.evidenceIds}
        weights={state.weights}
        onWeightChange={(criterionId, weight) =>
          dispatch({ type: "SET_WEIGHT", criterionId, weight })
        }
      />

      <RecommendationPanel
        platforms={platforms}
        decision={state.decision}
        onDecisionChange={(decision) =>
          dispatch({ type: "SET_DECISION", decision })
        }
        onSubmit={() => dispatch({ type: "SUBMIT" })}
      />

      {state.submitted && (
        <OutcomeReport
          decision={state.decision}
          evidenceCount={state.evidenceIds.length}
        />
      )}
    </div>
  );
}
