import { useEffect, useRef, useState } from "react";
import { GUARDED_RESPONSE } from "../data/stakeholders.js";
import { influenceTier, trustLabel } from "../data/gameConfig.js";
import { evidenceById, categories } from "../data/evidence.js";
import { criteria } from "../data/platformProfiles.js";
import { trustHistory, quadrantFor, QUADRANTS } from "../engine/trust.js";
import TrustMeter from "./TrustMeter.jsx";
import TrustLegend from "./TrustLegend.jsx";
import StakeholderMap from "./StakeholderMap.jsx";
import FacilitatorNote from "./FacilitatorNote.jsx";

const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));
const criterionLabel = Object.fromEntries(criteria.map((c) => [c.category, c.label]));

function InfluenceBadge({ influence }) {
  const tier = influenceTier(influence);
  return (
    <span className={`influence-badge influence-${tier.toLowerCase()}`}>
      {tier} influence · {influence}
    </span>
  );
}

function TrustChange({ before, after, change }) {
  if (change === 0) {
    return <span className="trust-change neutral">Trust unchanged ({after})</span>;
  }
  return (
    <span className={`trust-change ${change > 0 ? "up" : "down"}`}>
      Trust {change > 0 ? "▲" : "▼"} {change > 0 ? "+" : ""}
      {change} ({before} → {after})
      {trustLabel(before) !== trustLabel(after) && ` · now ${trustLabel(after)}`}
    </span>
  );
}

function Overview({ stakeholders, trust, interviews, onSelect }) {
  const [view, setView] = useState("cards");
  const askedIds = new Set(interviews.map((entry) => entry.questionId));

  return (
    <>
      <div className="section-head">
        <h2>Stakeholders</h2>
        <div className="segmented" role="group" aria-label="Stakeholder view">
          <button aria-pressed={view === "cards"} onClick={() => setView("cards")}>
            Cards
          </button>
          <button aria-pressed={view === "map"} onClick={() => setView("map")}>
            Influence–trust map
          </button>
        </div>
      </div>

      <TrustLegend />

      {view === "map" ? (
        <StakeholderMap
          stakeholders={stakeholders}
          trust={trust}
          selectedId={null}
          onSelect={onSelect}
        />
      ) : (
        <div className="card-grid">
          {stakeholders.map((stakeholder) => {
            const asked = stakeholder.questions.filter((q) => askedIds.has(q.id)).length;
            return (
              <button
                key={stakeholder.id}
                className="stakeholder-card"
                onClick={() => onSelect(stakeholder.id)}
              >
                <strong>{stakeholder.name}</strong>
                <InfluenceBadge influence={stakeholder.influence} />
                <TrustMeter value={trust[stakeholder.id]} compact />
                <span className="muted">
                  {asked}/{stakeholder.questions.length} questions asked
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function Interview({ stakeholders, selected, trust, interviews, questionsLeft, onSelect, onAsk }) {
  const askedIds = new Set(interviews.map((entry) => entry.questionId));
  const history = trustHistory(selected, interviews);
  const transcript = interviews.filter((entry) => entry.stakeholderId === selected.id);
  const quadrant = QUADRANTS[quadrantFor(trust[selected.id], selected.influence)];

  return (
    <div className="interview">
      <div className="interview-nav">
        <button className="ghost" onClick={() => onSelect(null)}>
          ← All stakeholders
        </button>
        <div className="chip-strip" role="group" aria-label="Switch stakeholder">
          {stakeholders.map((s) => (
            <button
              key={s.id}
              className={`chip trust-dot-${trustLabel(trust[s.id]).toLowerCase()}`}
              aria-pressed={s.id === selected.id}
              title={s.name}
              onClick={() => onSelect(s.id)}
            >
              {s.shortName}
            </button>
          ))}
        </div>
      </div>

      <div className="profile card">
        <div className="profile-head">
          <div>
            <h2>{selected.name}</h2>
            <p className="muted">{selected.role}</p>
          </div>
          <InfluenceBadge influence={selected.influence} />
        </div>
        <TrustMeter value={trust[selected.id]} />
        <p className="quadrant-note">
          <strong>{quadrant.label}.</strong> {quadrant.advice}
        </p>
      </div>

      {transcript.length > 0 && (
        <ol className="transcript" aria-live="polite">
          {transcript.map((entry, index) => {
            const question = selected.questions.find((q) => q.id === entry.questionId);
            const found = entry.guarded ? [] : question.evidence.map((id) => evidenceById[id]);
            return (
              <li key={entry.questionId}>
                <p className="bubble bubble-q">
                  <span className="speaker">You</span>
                  {question.text}
                </p>
                <p className="bubble bubble-a">
                  <span className="speaker">{selected.name}</span>
                  {entry.guarded ? GUARDED_RESPONSE : question.response}
                </p>
                <div className="outcome-line">
                  <TrustChange {...history[index]} />
                  {entry.guarded && (
                    <span className="evidence-none">Guarded: no evidence shared</span>
                  )}
                  {!entry.guarded && found.length === 0 && (
                    <span className="evidence-none">No new evidence</span>
                  )}
                </div>
                {found.map((item) => (
                  <div key={item.id} className="evidence-found">
                    <span className="evidence-found-head">
                      New evidence · {categoryLabel[item.category]}
                    </span>
                    {item.text}
                    <span className="muted"> Informs: {criterionLabel[item.category]}</span>
                  </div>
                ))}
              </li>
            );
          })}
        </ol>
      )}

      {questionsLeft === 0 && (
        <p className="notice">
          Your question budget is spent. Review your evidence and prepare your
          recommendation.
        </p>
      )}

      <h3>Ask a question</h3>
      <div className="question-list">
        {selected.questions.map((question) => (
          <button
            key={question.id}
            disabled={askedIds.has(question.id) || questionsLeft === 0}
            onClick={() => onAsk(selected.id, question.id)}
          >
            {question.text}
            {askedIds.has(question.id) && <span className="muted"> (asked)</span>}
            <FacilitatorNote>
              {question.trustDelta > 0 ? "+" : ""}
              {question.trustDelta} trust ·{" "}
              {question.evidence.length === 0
                ? "no evidence"
                : question.evidence
                    .map((id) => (evidenceById[id].critical ? "critical" : "minor"))
                    .join(", ")}
            </FacilitatorNote>
          </button>
        ))}
      </div>

      <TrustLegend />
    </div>
  );
}

export default function StakeholderPanel(props) {
  const { selected } = props;
  const ref = useRef(null);

  // Switching between the overview and an interview replaces the panel's
  // content; bring its top into view if the page was scrolled past it.
  useEffect(() => {
    const top = ref.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) {
      ref.current.scrollIntoView({ block: "start" });
    }
  }, [selected?.id]);

  return (
    <section className="panel" id="interviews" ref={ref}>
      {selected ? <Interview {...props} /> : <Overview {...props} />}
    </section>
  );
}
