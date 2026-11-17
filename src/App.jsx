import { useReducer } from "react";
import BriefingScreen from "./components/BriefingScreen.jsx";
import StakeholderPanel from "./components/StakeholderPanel.jsx";
import EvidenceDashboard from "./components/EvidenceDashboard.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import OutcomeReport from "./components/OutcomeReport.jsx";
import { stakeholders } from "./data/stakeholders.js";
import { platforms } from "./data/platformProfiles.js";
import { gameReducer, initialGameState } from "./state/gameReducer.js";

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  if (!state.started) {
    return <BriefingScreen onStart={() => dispatch({ type: "START" })} />;
  }

  const selected =
    stakeholders.find((stakeholder) => stakeholder.id === state.selectedId) ??
    null;

  return (
    <div style={{ padding: "40px" }}>
      <h1>AeroTech 2030</h1>

      <StakeholderPanel
        stakeholders={stakeholders}
        selected={selected}
        questionsLeft={state.questionsLeft}
        onConsult={(stakeholder) => dispatch({ type: "CONSULT", stakeholder })}
      />

      <EvidenceDashboard evidence={state.evidence} />

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
          evidenceCount={state.evidence.length}
        />
      )}
    </div>
  );
}
