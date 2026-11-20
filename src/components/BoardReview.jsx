import { useState } from "react";
import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import {
  strategies,
  changeApproaches,
  risksById
} from "../data/recommendation.js";
import { evidenceById, categories } from "../data/evidence.js";
import { assumptionBeliefs, MAX_CITED_EVIDENCE } from "../data/boardChallenges.js";
import {
  getChallenge,
  assessArgument,
  stakeholderStance,
  stanceLabel
} from "../engine/outcomeEngine.js";
import FacilitatorNote from "./FacilitatorNote.jsx";

const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));
const nameOf = (id) => stakeholdersById[id].name;
const list = (items) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

function headline(name, rating) {
  if (rating === "Convincing") return `${name} is persuaded.`;
  if (rating.startsWith("Reasonable")) return `${name} accepts the position, but wants more behind it.`;
  if (rating === "Weak judgement") return `${name} is not satisfied with that answer.`;
  return `${name} is not convinced.`;
}

const RATING_STYLE = {
  Convincing: "convincing",
  "Weak judgement": "unconvincing",
  Unconvincing: "unconvincing"
};

/** The board's reasons, tied to what the team's investigation did or didn't produce. */
function boardReasons(a) {
  if (a.kind === "weak") {
    return [{ good: false, text: a.position.weakness }];
  }
  const reasons = a.groups.map((g) => {
    if (g.status === "cited") {
      return { good: true, text: `The ${g.label} supports this argument.` };
    }
    if (g.status === "uncited") {
      return { good: false, text: `You have ${g.label} that would support this, but you didn't put it in front of the Board.` };
    }
    return { good: false, text: `This position may be reasonable, but ${g.label} is limited.` };
  });
  if (a.irrelevant.length > 0) {
    reasons.push({ good: false, text: "Some of the evidence you cited doesn't bear on this argument." });
  }
  if (a.consulted.length > 0) {
    reasons.push({ good: true, text: `You have clearly heard from the ${list(a.consulted.map(nameOf))}.` });
  }
  if (a.notConsulted.length > 0) {
    reasons.push({ good: false, text: `We haven't seen the views of the ${list(a.notConsulted.map(nameOf))} reflected in your work.` });
  }
  if (a.assumption) {
    reasons.push(
      a.assumptionTested
        ? { good: true, text: `You have tested the belief that ${assumptionBeliefs[a.assumption]}.` }
        : { good: false, text: `It rests on an untested belief: that ${assumptionBeliefs[a.assumption]}.` }
    );
  }
  if (a.conflict) {
    reasons.push({ good: false, text: "This argument sits awkwardly with your own recommendation." });
  }
  return reasons;
}

/** The board's response to a defended position, explaining its reasons. */
function BoardResponse({ assessment, challenger }) {
  const a = assessment;
  const reasons = boardReasons(a);

  return (
    <div className={`board-response rating-${RATING_STYLE[a.rating] ?? "reasonable"}`} aria-live="polite">
      <p className="reaction">
        <strong>{a.rating}.</strong> {headline(challenger.name, a.rating)}
      </p>
      <ul className="reasons">
        {reasons.map((r) => (
          <li key={r.text} className={r.good ? "reason-good" : "reason-gap"}>
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChallengeCard({ number, challengeId, state, onAnswer }) {
  const challenge = getChallenge(challengeId);
  const challenger = stakeholdersById[challenge.stakeholderId];
  const answer = state.challengeAnswers[challengeId];
  const [positionId, setPositionId] = useState("");
  const [cited, setCited] = useState([]);

  const hasEvidence = state.evidenceIds.length > 0;
  const canPresent = positionId && (cited.length > 0 || !hasEvidence);

  const toggle = (id) =>
    setCited((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < MAX_CITED_EVIDENCE
          ? [...current, id]
          : current
    );

  const heading = (
    <>
      <p className="challenge-label">
        {challenge.kind === "judgement" ? "Finally, a question of judgement" : challenge.label}
      </p>
      <p className="question">
        {number}. {challenger.name}: “{challenge.text}”
      </p>
    </>
  );

  if (answer) {
    const assessment = assessArgument(challengeId, answer, state);
    return (
      <div className="challenge">
        {heading}
        <p className="defended">
          <strong>You argued:</strong> {assessment.position.stance}.{" "}
          {assessment.position.argument}
        </p>
        <BoardResponse assessment={assessment} challenger={challenger} />
      </div>
    );
  }

  return (
    <div className="challenge">
      {heading}
      <p className="trade-off">
        <span>Trade-off</span> {challenge.tradeOff}
      </p>

      <fieldset className="positions">
        <legend>Choose the position you will defend</legend>
        {challenge.positions.map((p) => (
          <label key={p.id} className={`position${positionId === p.id ? " chosen" : ""}`}>
            <input
              type="radio"
              name={`position-${challengeId}`}
              value={p.id}
              checked={positionId === p.id}
              onChange={() => setPositionId(p.id)}
            />
            <span>
              <strong>{p.stance}</strong>
              <span className="position-argument">{p.argument}</span>
              <span className="position-accepts">Accepts: {p.accepts}</span>
              <FacilitatorNote>
                {p.kind === "weak"
                  ? `Weak position: ${p.weakness}`
                  : `Defensible · needs ${p.support
                      .map((g) => `${g.label} (${g.evidence.join(", ")})`)
                      .join("; ")} · consult: ${p.consult.map(nameOf).join(", ")}${
                      p.assumption ? ` · tests: ${p.assumption}` : ""
                    }${p.conflictsWith ? ` · conflicts with: ${p.conflictsWith.join(", ")}` : ""}`}
              </FacilitatorNote>
            </span>
          </label>
        ))}
      </fieldset>

      {hasEvidence ? (
        <fieldset className="cite">
          <legend>
            Back your argument with evidence ({cited.length}/{MAX_CITED_EVIDENCE})
          </legend>
          <div className="cite-list">
            {state.evidenceIds.map((id) => {
              const item = evidenceById[id];
              const checked = cited.includes(id);
              return (
                <label key={id} className={`cite-item${checked ? " chosen" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && cited.length >= MAX_CITED_EVIDENCE}
                    onChange={() => toggle(id)}
                  />
                  <span>
                    <span className="cite-category">{categoryLabel[item.category]}</span>
                    {item.text}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <p className="muted">You have no evidence to cite. You'll have to argue from position alone.</p>
      )}

      <button
        className="primary"
        disabled={!canPresent}
        onClick={() => onAnswer(challengeId, positionId, cited)}
      >
        Present this argument
      </button>
    </div>
  );
}

export default function BoardReview({ state, onAnswer, onShowOutcomes }) {
  const { recommendation, challengeIds, challengeAnswers, trust } = state;
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
        The board will test your recommendation where your case looks
        thinnest, then test your judgement. Each challenge has more than one
        defensible position, and no hidden right answer. Choose the position
        you can best defend and back it with evidence from your
        investigation. The board weighs that evidence, who you consulted, and
        whether you tested the assumptions behind your argument.
      </p>

      {visible.map((challengeId, index) => (
        <ChallengeCard
          key={challengeId}
          number={index + 1}
          challengeId={challengeId}
          state={state}
          onAnswer={onAnswer}
        />
      ))}

      {allAnswered && (
        <button className="primary" onClick={onShowOutcomes}>
          Hear the board's decision
        </button>
      )}
    </section>
  );
}
