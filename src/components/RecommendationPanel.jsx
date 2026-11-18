import {
  STAY_PLATFORM,
  strategies,
  changeApproaches,
  risks,
  risksById
} from "../data/recommendation.js";
import { validateRecommendation, riskSeverity } from "../engine/outcomeEngine.js";
import FacilitatorNote from "./FacilitatorNote.jsx";
import PlatformCards from "./PlatformCards.jsx";

export default function RecommendationPanel({
  platforms,
  recommendation,
  onFieldChange,
  onRiskChange,
  onMitigationChange,
  onSubmit
}) {
  const problems = validateRecommendation(recommendation);
  const staying = recommendation.platform === STAY_PLATFORM;
  const chosenRiskIds = recommendation.risks.map((r) => r.riskId);

  return (
    <section className="panel recommendation" id="recommendation">
      <h2>Board Recommendation</h2>
      <p className="muted">
        Prepare your recommendation. Once presented, it can't be changed, and
        your investigation ends.
      </p>

      <label className="field">
        <span>Platform</span>
        <select
          value={recommendation.platform}
          onChange={(event) => onFieldChange("platform", event.target.value)}
        >
          <option value="">Select Platform</option>
          {platforms.map((platform) => (
            <option key={platform}>{platform}</option>
          ))}
        </select>
      </label>

      {recommendation.platform && (
        <PlatformCards only={recommendation.platform} />
      )}

      {!staying && (
        <fieldset className="field">
          <legend>Implementation strategy</legend>
          {strategies.map((strategy) => (
            <label key={strategy.id} className="radio">
              <input
                type="radio"
                name="strategy"
                value={strategy.id}
                checked={recommendation.strategy === strategy.id}
                onChange={() => onFieldChange("strategy", strategy.id)}
              />
              <span>
                <strong>{strategy.label}</strong>
                <span className="muted"> — {strategy.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="field">
        <legend>Top three risks and how you will mitigate them</legend>
        {recommendation.risks.map((slot, index) => (
          <div key={index} className="risk-row">
            <span className="risk-number">{index + 1}.</span>
            <select
              aria-label={`Risk ${index + 1}`}
              value={slot.riskId}
              onChange={(event) => onRiskChange(index, event.target.value)}
            >
              <option value="">Select a risk</option>
              {risks.map((risk) => (
                <option
                  key={risk.id}
                  value={risk.id}
                  disabled={
                    chosenRiskIds.includes(risk.id) && slot.riskId !== risk.id
                  }
                >
                  {risk.label}
                </option>
              ))}
            </select>
            <select
              aria-label={`Mitigation for risk ${index + 1}`}
              value={slot.mitigationId}
              disabled={!slot.riskId}
              onChange={(event) =>
                onMitigationChange(index, event.target.value)
              }
            >
              <option value="">Select a mitigation</option>
              {slot.riskId &&
                risksById[slot.riskId].mitigations.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
            </select>
            {slot.riskId && recommendation.platform && (
              <FacilitatorNote as="div">
                Severity{" "}
                {riskSeverity(
                  risksById[slot.riskId],
                  recommendation.platform,
                  recommendation.strategy || null
                ).toFixed(1)}{" "}
                for this option
                {slot.mitigationId &&
                  ` · mitigation quality ${
                    risksById[slot.riskId].mitigations.find(
                      (m) => m.id === slot.mitigationId
                    ).quality
                  }`}
              </FacilitatorNote>
            )}
          </div>
        ))}
      </fieldset>

      <label className="field">
        <span>Change-management approach</span>
        <select
          value={recommendation.changeApproach}
          onChange={(event) =>
            onFieldChange("changeApproach", event.target.value)
          }
        >
          <option value="">Select an approach</option>
          {changeApproaches.map((approach) => (
            <option key={approach.id} value={approach.id}>
              {approach.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Rationale for the board</span>
        <textarea
          rows={4}
          value={recommendation.rationale}
          placeholder="Summarise why this recommendation is right for AeroTech, citing your evidence."
          onChange={(event) => onFieldChange("rationale", event.target.value)}
        />
      </label>

      {problems.length > 0 && (
        <ul className="problems">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      <button
        className="primary"
        disabled={problems.length > 0}
        onClick={onSubmit}
      >
        Present to Board
      </button>
    </section>
  );
}
