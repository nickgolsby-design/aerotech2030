import { strategies } from "../data/recommendation.js";
import { metricLabels, verdictLabels } from "../engine/outcomeEngine.js";

const pct = (value) => `${Math.round(value * 100)}%`;

function band(score) {
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

export default function OutcomeReport({
  outcome,
  recommendation,
  evidenceCount,
  onRestart
}) {
  const strategy = strategies.find((s) => s.id === outcome.strategy);

  return (
    <section className="panel">
      <h2>Board Outcome</h2>

      <div className={`verdict verdict-${outcome.verdict}`}>
        <strong>{verdictLabels[outcome.verdict]}</strong>
        <span> · Board confidence {outcome.confidence}/100</span>
      </div>

      <p>Recommendation: {recommendation.platform}</p>
      <p>
        Implemented:{" "}
        <strong>
          {outcome.platform}
          {strategy && ` (${strategy.label})`}
        </strong>
      </p>
      <p>Evidence Gathered: {evidenceCount}</p>

      <div className="years">
        {outcome.years.map((y) => (
          <article key={y.year} className="year-card">
            <h3>Year {y.year}</h3>
            <p className={`overall band-${band(y.overall)}`}>
              Overall {y.overall}/100
            </p>
            {Object.entries(y.metrics).map(([key, value]) => (
              <div key={key} className="metric">
                <span>{metricLabels[key]}</span>
                <div className="meter">
                  <div
                    className={`meter-fill band-bg-${band(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="metric-value">{value}</span>
              </div>
            ))}
            {y.events.length > 0 && (
              <ul className="events">
                {y.events.map((event) => (
                  <li key={event.text} className={`event-${event.tone}`}>
                    {event.text}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <h3>What drove this outcome</h3>
      <table className="comparison drivers">
        <tbody>
          <tr>
            <th scope="row">Investigation depth (critical evidence found)</th>
            <td>{pct(outcome.scores.diligence)}</td>
          </tr>
          <tr>
            <th scope="row">Stakeholder buy-in</th>
            <td>{pct(outcome.scores.buyIn)}</td>
          </tr>
          <tr>
            <th scope="row">Risk mitigation coverage</th>
            <td>{pct(outcome.scores.mitigation)}</td>
          </tr>
          <tr>
            <th scope="row">Change-management quality</th>
            <td>{pct(outcome.scores.change)}</td>
          </tr>
        </tbody>
      </table>

      <button className="primary" onClick={onRestart}>
        Restart simulation
      </button>
    </section>
  );
}
