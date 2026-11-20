import { categories, evidence, evidenceById } from "../data/evidence.js";
import { criteria } from "../data/platformProfiles.js";
import { ACTION_BUDGET } from "../data/gameConfig.js";
import { validateRecommendation } from "../engine/outcomeEngine.js";

const LATEST_COUNT = 4;
const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));
const criterionLabel = Object.fromEntries(criteria.map((c) => [c.id, c.label]));

/** Always-visible summary beside the investigation tabs. */
export default function InvestigationSidebar({ state, onNavigate }) {
  const { actionsLeft, evidenceIds, lastFound, recommendation } = state;
  const used = ACTION_BUDGET - actionsLeft;

  // Evidence revealed by the most recent action is highlighted as new.
  const newIds = new Set(lastFound);
  const latest = [...evidenceIds].reverse().slice(0, LATEST_COUNT).map((id) => evidenceById[id]);

  const coverage = categories.map((c) => ({
    ...c,
    total: evidence.filter((e) => e.category === c.id).length,
    found: evidenceIds.filter((id) => evidenceById[id].category === c.id).length
  }));
  const blindSpots = coverage.filter((c) => c.found === 0).length;
  const remaining = validateRecommendation(recommendation).length;

  return (
    <aside className="sidebar" aria-label="Investigation summary">
      <section className="sidebar-block">
        <h3>Investigation actions</h3>
        <div className="budget-dots" role="img" aria-label={`${used} of ${ACTION_BUDGET} actions used`}>
          {Array.from({ length: ACTION_BUDGET }, (_, i) => (
            <span key={i} className={i < used ? "dot used" : "dot"} />
          ))}
        </div>
        <p className="sidebar-stat">
          <strong>{actionsLeft}</strong> of {ACTION_BUDGET} left
        </p>
      </section>

      <section className="sidebar-block">
        <h3>Coverage</h3>
        <ul className="mini-coverage">
          {coverage.map((c) => (
            <li key={c.id} className={c.found === 0 ? "blind-spot" : ""}>
              <span className="mini-label">{c.label}</span>
              <span className="mini-meter" aria-hidden="true">
                <span style={{ width: `${(c.found / c.total) * 100}%` }} />
              </span>
              <span className="mini-count">
                {c.found}/{c.total}
              </span>
            </li>
          ))}
        </ul>
        <p className="sidebar-stat">
          {blindSpots === 0 ? "No blind spots" : `${blindSpots} blind spot${blindSpots === 1 ? "" : "s"}`}
        </p>
      </section>

      <section className="sidebar-block">
        <h3>Latest evidence</h3>
        {latest.length === 0 ? (
          <p className="muted">Nothing yet. Interview stakeholders to gather evidence.</p>
        ) : (
          <ul className="latest-evidence">
            {latest.map((item) => (
              <li key={item.id} className={newIds.has(item.id) ? "is-new" : ""}>
                {newIds.has(item.id) && <span className="new-badge">New</span>}
                <span className="latest-category">{categoryLabel[item.category]}</span>
                {item.text}
                <span className="muted">
                  {" "}
                  Supports: {item.supports.map((id) => criterionLabel[id]).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button className="link-button" onClick={() => onNavigate("evidence")}>
          View all evidence ({evidenceIds.length}) →
        </button>
      </section>

      <section className="sidebar-block">
        <h3>Recommendation</h3>
        <p className="sidebar-stat">
          {remaining === 0 ? "Ready to present" : `${remaining} item${remaining === 1 ? "" : "s"} to complete`}
        </p>
        <button className="link-button" onClick={() => onNavigate("recommendation")}>
          Go to recommendation →
        </button>
      </section>
    </aside>
  );
}
