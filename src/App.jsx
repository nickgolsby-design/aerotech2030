import { useEffect, useMemo, useReducer } from "react";
import BriefingScreen from "./components/BriefingScreen.jsx";
import Header from "./components/Header.jsx";
import FacilitatorPanel from "./components/FacilitatorPanel.jsx";
import StakeholderPanel from "./components/StakeholderPanel.jsx";
import EvidenceDashboard from "./components/EvidenceDashboard.jsx";
import PlatformComparison from "./components/PlatformComparison.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import BoardReview from "./components/BoardReview.jsx";
import OutcomeReport from "./components/OutcomeReport.jsx";
import Debrief from "./components/Debrief.jsx";
import { stakeholders, stakeholdersById } from "./data/stakeholders.js";
import { platforms } from "./data/platformProfiles.js";
import { gameReducer, initialGameState } from "./state/gameReducer.js";
import { loadState, saveState, clearState } from "./state/persistence.js";
import { projectOutcomes } from "./engine/outcomeEngine.js";
import { FacilitatorContext, isFacilitatorMode } from "./facilitator.js";
import "./components/game.css";

const facilitator = isFacilitatorMode();

const SECTIONS = [
  { id: "interviews", label: "Interviews" },
  { id: "evidence", label: "Evidence" },
  { id: "comparison", label: "Comparison" },
  { id: "recommendation", label: "Recommendation" }
];

export default function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialGameState,
    (initial) => loadState(initial) ?? initial
  );

  // Save after every change so a refresh resumes the game.
  useEffect(() => {
    if (state.phase === "briefing") {
      clearState();
    } else {
      saveState(state);
    }
  }, [state]);

  // Each phase is a new screen; start it at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.phase]);

  const outcome = useMemo(
    () =>
      state.phase === "outcomes" || state.phase === "debrief"
        ? projectOutcomes(state)
        : null,
    [state]
  );

  if (state.phase === "briefing") {
    return (
      <BriefingScreen
        onStart={(teamName) =>
          dispatch({ type: "START", teamName, now: Date.now() })
        }
      />
    );
  }

  const selected = stakeholdersById[state.selectedId] ?? null;

  return (
    <FacilitatorContext.Provider value={facilitator}>
      <Header state={state} onRestart={() => dispatch({ type: "RESTART" })} />

      <main className="game">
        {facilitator && <FacilitatorPanel state={state} />}

        {state.phase === "investigation" && (
          <>
            <nav className="section-nav no-print" aria-label="Sections">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`}>
                  {s.label}
                </a>
              ))}
            </nav>

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
          </>
        )}

        {state.phase === "boardReview" && (
          <BoardReview
            state={state}
            onAnswer={(challengeId, optionId) =>
              dispatch({ type: "ANSWER_CHALLENGE", challengeId, optionId })
            }
            onShowOutcomes={() =>
              dispatch({ type: "SHOW_OUTCOMES", now: Date.now() })
            }
          />
        )}

        {state.phase === "outcomes" && (
          <OutcomeReport
            outcome={outcome}
            recommendation={state.recommendation}
            evidenceCount={state.evidenceIds.length}
            onDebrief={() =>
              dispatch({ type: "SHOW_RESULTS_VIEW", view: "debrief" })
            }
          />
        )}

        {state.phase === "debrief" && (
          <Debrief
            state={state}
            outcome={outcome}
            onBack={() =>
              dispatch({ type: "SHOW_RESULTS_VIEW", view: "outcomes" })
            }
          />
        )}
      </main>
    </FacilitatorContext.Provider>
  );
}
