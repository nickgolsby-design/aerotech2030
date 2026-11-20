import { TRUST_BANDS } from "../engine/trust.js";
import FacilitatorNote from "./FacilitatorNote.jsx";

/** Collapsible explanation of how trust and influence work. */
export default function TrustLegend({ open = false }) {
  return (
    <details className="legend" open={open}>
      <summary>How relationships and influence work</summary>
      <div className="legend-body">
        <div>
          <h4>Relationship</h4>
          <p>
            Questions can change how open a stakeholder is with you. Each
            stakeholder has their own sensitivities: a question one welcomes,
            another may find uncomfortable.
          </p>
          <ul className="band-list">
            {TRUST_BANDS.map((band) => (
              <li key={band.label}>
                <span className={`band-chip band-${band.label.toLowerCase()}`}>
                  {band.label}
                </span>
                <FacilitatorNote> (trust {band.range}) </FacilitatorNote>
                {band.meaning}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Influence</h4>
          <p>
            How much weight a stakeholder carries with the board: High,
            Medium or Low.
          </p>
          <p>
            Board confidence depends most on high-influence stakeholders, so
            hear from them, and keep the relationship open, before you recommend.
          </p>
        </div>
      </div>
    </details>
  );
}
