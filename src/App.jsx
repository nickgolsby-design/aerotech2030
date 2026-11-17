import { useEffect, useMemo, useReducer } from "react";
import BriefingScreen from "./components/BriefingScreen.jsx";
import StakeholderPanel from "./components/StakeholderPanel.jsx";
import EvidenceDashboard from "./components/EvidenceDashboard.jsx";
import PlatformComparison from "./components/PlatformComparison.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import BoardReview from "./components/BoardReview.jsx";
import OutcomeReport from "./components/OutcomeReport.jsx";
import { stakeholders, stakeholdersById } from "./data/stakeholders.js";
import { platforms } from "./data/platformProfiles.js";
import { gameReducer, initialGameState } from "./state/gameReducer.js";
import { projectOutcomes } from "./engine/outcomeEngine.js";
import "./components/game.css";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const outcome = useMemo(
    () => (state.phase === "outcomes" ? projectOutcomes(state) : null),
    [state]
  );

  // Each phase is a new screen; start it at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.phase]);

  if (state.phase === "briefing") {
    return <BriefingScreen onStart={() => dispatch({ type: "START" })} />;
  }

  if (state.phase === "boardReview") {
    return (
      <div className="game">
        <h1>AeroTech 2030</h1>
        <BoardReview
          state={state}
          onAnswer={(challengeId, optionId) =>
            dispatch({ type: "ANSWER_CHALLENGE", challengeId, optionId })
          }
          onShowOutcomes={() => dispatch({ type: "SHOW_OUTCOMES" })}
        />
      </div>
    );
  }

  if (state.phase === "outcomes") {
    return (
      <div className="game">
        <h1>AeroTech 2030</h1>
        <OutcomeReport
          outcome={outcome}
          recommendation={state.recommendation}
          evidenceCount={state.evidenceIds.length}
          onRestart={() => dispatch({ type: "RESTART" })}
        />
      </div>
    );
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
        recommendation={state.recommendation}
        onFieldChange={(field, value) =>
          dispatch({ type: "SET_RECOMMENDATION", field, value })
        }
        onRiskChange={(index, riskId) =>
          dispatch({ type: "SET_RISK", index, riskId })
        }
        onMitigationChange={(index, mitigationId) =>
          dispatch({ type: "SET_MITIGATION", index, mitigationId })
        }
        onSubmit={() => dispatch({ type: "SUBMIT" })}
      />
    </div>
  );
}
