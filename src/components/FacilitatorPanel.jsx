import { platforms } from "../data/platformProfiles.js";
import {
  buyInScore,
  diligenceScore,
  mitigationScore,
  changeScore
} from "../engine/outcomeEngine.js";

const pct = (value) => `${Math.round(value * 100)}%`;

/** Live hidden scores, shown only in facilitator mode. */
export default function FacilitatorPanel({ state }) {
  const rec = state.recommendation;
  const hasRisks = rec.platform && rec.risks.some((r) => r.riskId);

  return (
    <aside className="facilitator-panel no-print" aria-label="Facilitator view">
      <strong>Facilitator view</strong>
      <span>Critical evidence: {pct(diligenceScore(state.evidenceIds))}</span>
      <span>
        Buy-in:{" "}
        {platforms
          .map((p) => `${p} ${pct(buyInScore(p, state.trust))}`)
          .join(" · ")}
      </span>
      {hasRisks && (
        <span>
          Mitigation coverage:{" "}
          {pct(mitigationScore(rec, rec.platform, rec.strategy || null))}
        </span>
      )}
      {rec.changeApproach && <span>Change quality: {pct(changeScore(rec))}</span>}
    </aside>
  );
}
