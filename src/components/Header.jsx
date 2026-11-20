import { useEffect, useState } from "react";
import { PHASES } from "../state/gameReducer.js";
import Glossary from "./Glossary.jsx";

function useNow(intervalMs) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Elapsed({ startedAt, finishedAt }) {
  const now = useNow(15000);
  if (startedAt == null) return null;
  const minutes = Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 60000));
  return <span className="header-stat">{minutes} min</span>;
}

export default function Header({ state, onRestart }) {
  const [confirming, setConfirming] = useState(false);
  const currentIndex = PHASES.findIndex((p) => p.id === state.phase);

  return (
    <header className="app-header">
      <div className="header-row">
        <div className="brand">
          <strong>AeroTech 2030</strong>
          <span className="team">{state.teamName}</span>
        </div>

        <div className="header-stats">
          {state.phase === "investigation" && (
            <span className="header-stat" aria-live="polite">
              {state.actionsLeft} actions left
            </span>
          )}
          <Elapsed startedAt={state.startedAt} finishedAt={state.finishedAt} />
          <Glossary />

          {confirming ? (
            <span className="confirm" role="group" aria-label="Confirm restart">
              <span>Lose all progress?</span>
              <button
                className="danger"
                onClick={() => {
                  setConfirming(false);
                  onRestart();
                }}
              >
                Restart
              </button>
              <button onClick={() => setConfirming(false)}>Cancel</button>
            </span>
          ) : (
            <button className="ghost" onClick={() => setConfirming(true)}>
              Restart
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Progress">
        <ol className="stepper">
          {PHASES.map((phase, index) => (
            <li
              key={phase.id}
              className={
                index < currentIndex
                  ? "done"
                  : index === currentIndex
                    ? "current"
                    : ""
              }
              aria-current={index === currentIndex ? "step" : undefined}
            >
              {phase.label}
            </li>
          ))}
        </ol>
      </nav>
    </header>
  );
}
