import { TRUST_BANDS } from "../engine/trust.js";
import { HIGH_INFLUENCE, MEDIUM_INFLUENCE } from "../data/gameConfig.js";

/** Collapsible explanation of how trust and influence work. */
export default function TrustLegend({ open = false }) {
  return (
    <details className="legend" open={open}>
      <summary>How trust and influence work</summary>
      <div className="legend-body">
        <div>
          <h4>Trust (0–100)</h4>
          <p>
            Every question changes trust, depending on how it's framed. Open,
            well-framed questions build trust; probing questions can cost a
            little; leading or dismissive questions damage it.
          </p>
          <ul className="band-list">
            {TRUST_BANDS.map((band) => (
              <li key={band.label}>
                <span className={`band-chip band-${band.label.toLowerCase()}`}>
                  {band.label} {band.range}
                </span>
                {band.meaning}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Influence (0–100)</h4>
          <p>
            How much weight a stakeholder carries with the board. Tiers: High (
            {HIGH_INFLUENCE}+), Medium ({MEDIUM_INFLUENCE}–{HIGH_INFLUENCE - 1}),
            Low (below {MEDIUM_INFLUENCE}).
          </p>
          <p>
            Board confidence depends most on high-influence stakeholders, so
            hear from them, and keep their trust, before you recommend.
          </p>
        </div>
      </div>
    </details>
  );
}
