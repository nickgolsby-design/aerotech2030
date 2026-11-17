import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import {
  strategies,
  changeApproaches,
  risksById
} from "../data/recommendation.js";
import {
  getChallenge,
  challengeImpact,
  stakeholderStance,
  stanceLabel
} from "../engine/outcomeEngine.js";

function reactionText(name, delta) {
  if (delta >= 10) return `${name} looks convinced.`;
  if (delta > 0) return `${name} nods, but makes a note to follow up.`;
  if (delta > -10) return `${name} seems unconvinced.`;
  return `${name} is visibly concerned, and other board members exchange glances.`;
}

export default function BoardReview({ state, onAnswer, onShowOutcomes }) {
  const { recommendation, challengeIds, challengeAnswers, trust, evidenceIds } =
    state;
  const strategy = strategies.find((s) => s.id === recommendation.strategy);
  const change = changeApproaches.find(
    (c) => c.id === recommendation.changeApproach
  );
  const allAnswered = challengeIds.every((id) => id in challengeAnswers);
  // Show challenges one at a time, in order.
  const visible = challengeIds.filter(
    (id, i) => i === 0 || challengeIds[i - 1] in challengeAnswers
  );

  return (
    <section className="panel">
      <h2>Board Review</h2>

      <div className="summary">
        <h3>Your recommendation</h3>
        <p>
          <strong>{recommendation.platform}</strong>
          {strategy && <> — {strategy.label}</>}
        </p>
        <ul>
          {recommendation.risks.map((slot) => {
            const risk = risksById[slot.riskId];
            const mitigation = risk.mitigations.find(
              (m) => m.id === slot.mitigationId
            );
            return (
              <li key={slot.riskId}>
                <strong>Risk:</strong> {risk.label}. <strong>Mitigation:</strong>{" "}
                {mitigation.label}.
              </li>
            );
          })}
        </ul>
        <p>
          <strong>Change management:</strong> {change.label}
        </p>
        <blockquote>{recommendation.rationale}</blockquote>
      </div>

      <h3>Stakeholder reactions</h3>
      <div className="stance-grid">
        {stakeholders.map((s) => {
          const label = stanceLabel(
            stakeholderStance(s, recommendation.platform, trust)
          );
          return (
            <div key={s.id} className={`stance stance-${label.toLowerCase()}`}>
              <strong>{s.name}</strong>
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <h3>Board challenges</h3>
      <p className="muted">
        The board probes the areas your case covers least. Choose your
        response to each challenge.
      </p>

      {visible.map((challengeId, index) => {
        const challenge = getChallenge(challengeId);
        const challenger = stakeholdersById[challenge.stakeholderId];
        const answer = challengeAnswers[challengeId];
        return (
          <div key={challengeId} className="challenge">
            <p className="question">
              {index + 1}. {challenger.name}: “{challenge.text}”
            </p>
            <div className="question-list">
              {challenge.options.map((option) => (
                <button
                  key={option.id}
                  disabled={answer !== undefined}
                  className={answer === option.id ? "chosen" : ""}
                  onClick={() => onAnswer(challengeId, option.id)}
                >
                  {option.text}
                </button>
              ))}
            </div>
            {answer !== undefined && (
              <p className="reaction">
                {reactionText(
                  challenger.name,
                  challengeImpact(challengeId, answer, evidenceIds, trust)
                )}
              </p>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <button className="primary" onClick={onShowOutcomes}>
          Hear the board's decision
        </button>
      )}
    </section>
  );
}
