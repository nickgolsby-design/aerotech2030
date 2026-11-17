import { categories, evidence, evidenceById } from "../data/evidence.js";
import { evidenceSource } from "../data/stakeholders.js";
import { EVIDENCE_TAGS } from "../data/gameConfig.js";
import FacilitatorNote from "./FacilitatorNote.jsx";

export default function EvidenceDashboard({ evidenceIds, tags, onTag }) {
  const found = evidenceIds.map((id) => evidenceById[id]);

  const coverage = categories.map((category) => {
    const total = evidence.filter((e) => e.category === category.id).length;
    const items = found.filter((e) => e.category === category.id);
    return { ...category, total, items };
  });

  const blindSpots = coverage.filter((c) => c.items.length === 0);

  return (
    <section className="panel" id="evidence">
      <hr />

      <h2>Investigation Coverage</h2>
      <p className="muted">
        {found.length} of {evidence.length} evidence items discovered.
      </p>

      <div className="coverage">
        {coverage.map((c) => (
          <div
            key={c.id}
            className={`coverage-row${c.items.length === 0 ? " blind-spot" : ""}`}
          >
            <span className="coverage-label">{c.label}</span>
            <div
              className="meter"
              role="progressbar"
              aria-label={`${c.label} coverage`}
              aria-valuemin={0}
              aria-valuemax={c.total}
              aria-valuenow={c.items.length}
            >
              <div
                className="meter-fill coverage-fill"
                style={{ width: `${(c.items.length / c.total) * 100}%` }}
              />
            </div>
            <span className="coverage-count">
              {c.items.length}/{c.total}
              {c.items.length === 0 && " · blind spot"}
            </span>
          </div>
        ))}
      </div>

      {blindSpots.length > 0 && found.length > 0 && (
        <p className="notice">
          Blind spots: {blindSpots.map((c) => c.label).join(", ")}. The board
          may challenge a recommendation that ignores these areas.
        </p>
      )}

      <hr />

      <h2>Evidence Log</h2>
      {found.length === 0 && (
        <p className="muted">
          No evidence yet. Interview stakeholders to build your case.
        </p>
      )}

      {coverage
        .filter((c) => c.items.length > 0)
        .map((c) => (
          <div key={c.id} className="evidence-group">
            <h3>{c.label}</h3>
            <ul>
              {c.items.map((item) => (
                <li key={item.id} className="evidence-item">
                  <div>
                    {item.text}
                    <span className="muted"> — {evidenceSource[item.id]}</span>
                    {item.critical && <FacilitatorNote>critical</FacilitatorNote>}
                  </div>
                  <select
                    aria-label="Classify evidence"
                    value={tags[item.id] ?? ""}
                    onChange={(event) => onTag(item.id, event.target.value)}
                  >
                    <option value="">Unclassified</option>
                    {EVIDENCE_TAGS.map((tag) => (
                      <option key={tag}>{tag}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
}
