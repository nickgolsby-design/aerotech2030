import { useEffect, useMemo, useReducer } from "react";
import BriefingScreen from "./components/BriefingScreen.jsx";
import Header from "./components/Header.jsx";
import FacilitatorPanel from "./components/FacilitatorPanel.jsx";
import InvestigationWorkspace from "./components/InvestigationWorkspace.jsx";
import BoardReview from "./components/BoardReview.jsx";
import OutcomeReport from "./components/OutcomeReport.jsx";
import Debrief from "./components/Debrief.jsx";
import { gameReducer, initialGameState } from "./state/gameReducer.js";
import { loadState, saveState, clearState } from "./state/persistence.js";
import { projectOutcomes } from "./engine/outcomeEngine.js";
import { FacilitatorContext, isFacilitatorMode } from "./facilitator.js";
import "./components/game.css";
import "./components/workspace.css";

const facilitator = isFacilitatorMode();

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

  return (
    <FacilitatorContext.Provider value={facilitator}>
      <Header state={state} onRestart={() => dispatch({ type: "RESTART" })} />

      <main className="game">
        {facilitator && <FacilitatorPanel state={state} />}

        {state.phase === "investigation" && (
          <InvestigationWorkspace state={state} dispatch={dispatch} />
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
