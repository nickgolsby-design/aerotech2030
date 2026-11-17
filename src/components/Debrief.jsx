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
            <p>
              <span className={a.wasBest ? "band-good" : "band-poor"}>
                {a.wasBest ? "✓ Strongest answer" : "✗ Your answer"}:
              </span>{" "}
              {a.chosen.text}
            </p>
            {!a.wasBest && (
              <p>
                <span className="band-good">Stronger answer:</span>{" "}
                {a.best.text}
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
                Ask the {m.stakeholder.name}: “{m.question.text}”
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
