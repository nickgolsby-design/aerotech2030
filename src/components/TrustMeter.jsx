import { trustLabel } from "../data/gameConfig.js";
import { useFacilitator } from "../facilitator.js";

/**
 * A stakeholder's relationship with the team: Open, Neutral or Cautious.
 * Students see only the label; facilitators also see the 0–100 value.
 */
export default function TrustMeter({ value, compact = false }) {
  const facilitator = useFacilitator();
  const label = trustLabel(value);
  return (
    <div className={`trust${compact ? " trust-compact" : ""}`}>
      <span className="trust-label">
        Relationship:{" "}
        <strong className={`trust-text-${label.toLowerCase()}`}>{label}</strong>
        {facilitator && <span className="facilitator-note"> {value}/100</span>}
      </span>
    </div>
  );
}
