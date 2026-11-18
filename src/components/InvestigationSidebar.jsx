import { categories, evidence, evidenceById } from "../data/evidence.js";
import { criteria } from "../data/platformProfiles.js";
import { QUESTION_BUDGET } from "../data/gameConfig.js";
import { validateRecommendation } from "../engine/outcomeEngine.js";
import { stakeholdersById } from "../data/stakeholders.js";

const LATEST_COUNT = 4;
const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));
const criterionLabel = Object.fromEntries(criteria.map((c) => [c.category, c.label]));

/** Always-visible summary beside the investigation tabs. */
export default function InvestigationSidebar({ state, onNavigate }) {
  const { questionsLeft, evidenceIds, interviews, recommendation } = state;
  const used = QUESTION_BUDGET - questionsLeft;

  // Evidence revealed by the most recent question is highlighted as new.
  const newIds = new Set(revealedByLastQuestion(interviews));
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
        <h3>Question budget</h3>
        <div className="budget-dots" role="img" aria-label={`${used} of ${QUESTION_BUDGET} questions used`}>
          {Array.from({ length: QUESTION_BUDGET }, (_, i) => (
            <span key={i} className={i < used ? "dot used" : "dot"} />
          ))}
        </div>
        <p className="sidebar-stat">
          <strong>{questionsLeft}</strong> of {QUESTION_BUDGET} left
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
                <span className="muted"> Informs: {criterionLabel[item.category]}</span>
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

/** Evidence ids revealed by the most recent question (none if guarded). */
function revealedByLastQuestion(interviews) {
  const last = interviews.at(-1);
  if (!last || last.guarded) return [];
  const question = stakeholdersById[last.stakeholderId].questions.find(
    (q) => q.id === last.questionId
  );
  return question.evidence;
}
