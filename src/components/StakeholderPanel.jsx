import { GUARDED_RESPONSE } from "../data/stakeholders.js";
import { trustLabel } from "../data/gameConfig.js";
import { evidenceById } from "../data/evidence.js";
import FacilitatorNote from "./FacilitatorNote.jsx";

function TrustMeter({ value }) {
  const label = trustLabel(value);
  return (
    <div className="trust">
      <div
        className="meter"
        role="progressbar"
        aria-label="Trust"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value}, ${label}`}
      >
        <div
          className={`meter-fill trust-${label.toLowerCase()}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="trust-label">
        Trust: {label} ({value})
      </span>
    </div>
  );
}

export default function StakeholderPanel({
  stakeholders,
  selected,
  trust,
  interviews,
  questionsLeft,
  onSelect,
  onAsk
}) {
  const askedIds = new Set(interviews.map((entry) => entry.questionId));
  const transcript = selected
    ? interviews.filter((entry) => entry.stakeholderId === selected.id)
    : [];

  return (
    <section className="panel" id="interviews">
      {questionsLeft === 0 && (
        <p className="notice">
          Your question budget is spent. Review your evidence and prepare
          your recommendation.
        </p>
      )}

      <h2>Stakeholders</h2>

      <div className="card-grid">
        {stakeholders.map((stakeholder) => {
          const asked = stakeholder.questions.filter((q) =>
            askedIds.has(q.id)
          ).length;
          return (
            <button
              key={stakeholder.id}
              className={`stakeholder-card${
                selected?.id === stakeholder.id ? " selected" : ""
              }`}
              onClick={() => onSelect(stakeholder.id)}
            >
              <strong>{stakeholder.name}</strong>
              <span className="muted">Influence {stakeholder.influence}</span>
              <TrustMeter value={trust[stakeholder.id]} />
              <span className="muted">
                {asked}/{stakeholder.questions.length} questions asked
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="interview">
          <hr />

          <h2>{selected.name}</h2>
          <p className="muted">{selected.role}</p>
          <TrustMeter value={trust[selected.id]} />

          {transcript.length > 0 && (
            <ol className="transcript" aria-live="polite">
              {transcript.map((entry) => {
                const question = selected.questions.find(
                  (q) => q.id === entry.questionId
                );
                return (
                  <li key={entry.questionId}>
                    <p className="question">Q: {question.text}</p>
                    <p>A: {entry.guarded ? GUARDED_RESPONSE : question.response}</p>
                    <p className="muted">
                      {entry.trustDelta > 0 && "Trust increased. "}
                      {entry.trustDelta < 0 && "Trust decreased. "}
                      {entry.guarded
                        ? "No evidence gained: stakeholder was guarded."
                        : question.evidence.length === 0 &&
                          "No new evidence gained."}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <h3>Ask a question</h3>
          <div className="question-list">
            {selected.questions.map((question) => (
              <button
                key={question.id}
                disabled={askedIds.has(question.id) || questionsLeft === 0}
                onClick={() => onAsk(selected.id, question.id)}
              >
                {question.text}
                <FacilitatorNote>
                  {question.trustDelta > 0 ? "+" : ""}
                  {question.trustDelta} trust ·{" "}
                  {question.evidence.length === 0
                    ? "no evidence"
                    : question.evidence
                        .map((id) =>
                          evidenceById[id].critical ? "critical" : "minor"
                        )
                        .join(", ")}
                </FacilitatorNote>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
