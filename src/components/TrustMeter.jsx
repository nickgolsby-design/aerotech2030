import { trustLabel } from "../data/gameConfig.js";

export default function TrustMeter({ value, compact = false }) {
  const label = trustLabel(value);
  return (
    <div className={`trust${compact ? " trust-compact" : ""}`}>
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
        Trust: <strong className={`trust-text-${label.toLowerCase()}`}>{label}</strong> ({value})
      </span>
    </div>
  );
}
