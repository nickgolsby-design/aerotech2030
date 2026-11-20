import { stakeholdersById } from "../data/stakeholders.js";
import { verdictLabels } from "../engine/outcomeEngine.js";
import {
  assessLearningOutcomes,
  expertRecommendation,
  missedCriticalEvidence,
  reviewChallengeAnswers,
  buildResultsExport
} from "../engine/debrief.js";
import { downloadJson, slugify } from "../download.js";

const ratingClass = {
  Strong: "good",
  Developing: "fair",
  "Needs work": "poor"
};

/** e.g. "partly convincing; it needed input from the Finance Director." */
function alternativeNote(alt) {
  if (alt.kind === "weak") return `a weak position. ${alt.position.weakness}`;
  const gaps = alt.groups
    .filter((g) => g.status === "missing")
    .map((g) => `${g.label} was limited`);
  if (alt.notConsulted.length > 0) {
    gaps.push(
      `it needed input from the ${alt.notConsulted
        .map((id) => stakeholdersById[id].name)
        .join(" and ")}`
    );
  }
  return [alt.rating.toLowerCase(), ...gaps].join("; ") + ".";
}

const RATING_CLASS = {
  Convincing: "band-good",
  "Reasonable, but under-supported": "band-fair",
  Unconvincing: "band-poor",
  "Weak judgement": "band-poor"
};

export default function Debrief({ state, outcome, onBack }) {
  const assessment = assessLearningOutcomes(state, outcome);
  const expert = expertRecommendation();
  const missed = missedCriticalEvidence(state.evidenceIds);
  const answers = reviewChallengeAnswers(state);

  const handleDownload = () => {
    const data = buildResultsExport(state, outcome, assessment);
    downloadJson(`aerotech2030-${slugify(state.teamName)}.json`, data);
  };

  return (
    <section className="panel debrief">
      <div className="section-head">
        <h2>Debrief: {state.teamName}</h2>
        <div className="actions no-print">
          <button onClick={onBack}>Back to outcomes</button>
          <button onClick={() => window.print()}>Print / save as PDF</button>
          <button className="primary" onClick={handleDownload}>
            Download results (JSON)
          </button>
        </div>
      </div>

      <div className="card result-summary">
        <p>
          <strong>Recommendation:</strong> {state.recommendation.platform} ·{" "}
          <strong>Board:</strong> {verdictLabels[outcome.verdict]} (
          {outcome.confidence}/100)
        </p>
        <p>
          <strong>Overall performance:</strong>{" "}
          {outcome.years.map((y) => `Year ${y.year}: ${y.overall}`).join(" · ")}
        </p>
      </div>

      <h3>Learning outcomes</h3>
      <div className="lo-grid">
        {assessment.map((lo) => (
          <article key={lo.id} className="card lo">
            <div className="lo-head">
              <h4>{lo.title}</h4>
              <span className={`badge badge-${ratingClass[lo.rating]}`}>
                {lo.rating}
              </span>
            </div>
            <ul>
              {lo.observations.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
            <p className="learning-point">{lo.learningPoint}</p>
          </article>
        ))}
      </div>

      <h3>The expert view</h3>
      <div className="card">
        <p>
          A strong recommendation for AeroTech is{" "}
          <strong>{expert.platform}</strong>, implemented{" "}
          <strong>{expert.strategy.label.toLowerCase()}</strong>. It keeps
          continuity with 15 years of CATIA data, aligns with Airbus's supplier
          direction and remains vendor-supported. Phasing protects deliveries
          while staff build capability. Siemens NX is a defensible alternative
          if manufacturing is weighted most heavily, but it brings higher
          migration and customer-exchange risk.
        </p>
        <p>The most severe risks for that approach, with strong mitigations:</p>
        <ul>
          {expert.risks.map(({ risk, mitigation }) => (
            <li key={risk.id}>
              <strong>{risk.label}:</strong> {mitigation.label}.
            </li>
          ))}
        </ul>
        <p>
          <strong>Change management:</strong> {expert.changeApproach.label}.
        </p>
      </div>

      <h3>Board challenges reviewed</h3>
      <ol className="answer-review">
        {answers.map((a) => (
          <li key={a.id}>
            <p className="question">
              {a.stakeholder}: “{a.text}”
            </p>
            <p className="muted">Trade-off: {a.tradeOff}</p>
            <p>
              <span className={RATING_CLASS[a.defended.rating]}>
                You argued “{a.defended.position.stance}”: {a.defended.rating.toLowerCase()}
              </span>
            </p>
            <p>The other positions, judged on your investigation:</p>
            <ul>
              {a.alternatives.map((alt) => (
                <li key={alt.position.id}>
                  <strong>{alt.position.stance}</strong>: {alternativeNote(alt)}
                </li>
              ))}
            </ul>
            {a.bestAvailable.kind === "defensible" &&
              a.bestAvailable.position.id !== a.defended.position.id &&
              a.bestAvailable.strength > a.defended.strength && (
                <p className="muted">
                  With the evidence you had, “{a.bestAvailable.position.stance}”
                  was your best-supported position.
                </p>
              )}
          </li>
        ))}
      </ol>

      <h3>Critical evidence you missed ({missed.length})</h3>
      {missed.length === 0 ? (
        <p>You uncovered every critical piece of evidence.</p>
      ) : (
        <ul className="missed">
          {missed.map((m) => (
            <li key={m.id}>
              {m.text}
              <span className="muted">
                {" "}
                Found via:{" "}
                {m.routes
                  .map((r) =>
                    r.kind === "document"
                      ? `reviewing “${r.label}”`
                      : `asking the ${r.label} “${r.detail}”`
                  )
                  .join(", or ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
