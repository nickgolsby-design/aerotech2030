import { useEffect, useRef, useState } from "react";
import { GUARDED_RESPONSE, isQuestionAvailable } from "../data/stakeholders.js";
import { trustLabel } from "../data/gameConfig.js";
import { evidenceById, categories } from "../data/evidence.js";
import { criteria } from "../data/platformProfiles.js";
import { trustHistory, quadrantFor, QUADRANTS } from "../engine/trust.js";
import TrustMeter from "./TrustMeter.jsx";
import TrustLegend from "./TrustLegend.jsx";
import StakeholderMap from "./StakeholderMap.jsx";
import FacilitatorNote from "./FacilitatorNote.jsx";
import { useFacilitator } from "../facilitator.js";

const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));
const criterionLabel = Object.fromEntries(criteria.map((c) => [c.id, c.label]));

function InfluenceBadge({ stakeholder }) {
  const level = stakeholder.influenceLevel;
  return (
    <span className={`influence-badge influence-${level.toLowerCase()}`}>
      {level} influence
    </span>
  );
}

// Students see the direction of a change and any new relationship label;
// facilitators also see the numbers.
function TrustChange({ before, after, change }) {
  const facilitator = useFacilitator();
  if (change === 0) {
    return (
      <span className="trust-change neutral">
        Relationship unchanged{facilitator && ` (${after})`}
      </span>
    );
  }
  return (
    <span className={`trust-change ${change > 0 ? "up" : "down"}`}>
      {change > 0 ? "▲ Relationship improved" : "▼ Relationship strained"}
      {facilitator && ` (${before} → ${after})`}
      {trustLabel(before) !== trustLabel(after) && ` · now ${trustLabel(after)}`}
    </span>
  );
}

/** One evidence item revealed by a question or document. */
export function FoundEvidence({ item }) {
  return (
    <div className="evidence-found">
      <span className="evidence-found-head">
        New evidence · {categoryLabel[item.category]}
      </span>
      {item.text}
      <span className="muted">
        {" "}
        Supports: {item.supports.map((id) => criterionLabel[id]).join(", ")}
      </span>
      <FacilitatorNote>{item.classification}{item.critical ? " · critical" : ""}</FacilitatorNote>
    </div>
  );
}

function AlreadyKnown({ ids }) {
  if (ids.length === 0) return null;
  return (
    <p className="muted already-known">
      Confirms evidence you already had: {ids.map((id) => evidenceById[id].text).join(" ")}
    </p>
  );
}

function Overview({ stakeholders, trust, interviews, documents, documentsRead, onSelect, onOpenDocument }) {
  const [view, setView] = useState("cards");
  const askedIds = new Set(interviews.map((entry) => entry.questionId));
  const readIds = new Set(documentsRead.map((d) => d.documentId));

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
      <p className="muted">
        Each question or document review uses one investigation action. You
        can't investigate everything: decide what information matters.
      </p>

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
                <InfluenceBadge stakeholder={stakeholder} />
                <span className="public-position">“{stakeholder.publicPosition}”</span>
                <TrustMeter value={trust[stakeholder.id]} compact />
                <span className="muted">
                  {asked === 0 ? "Not yet interviewed" : `${asked} question${asked === 1 ? "" : "s"} asked`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <h2>Documents</h2>
      <div className="card-grid">
        {documents.map((doc) => (
          <button key={doc.id} className="stakeholder-card document-card" onClick={() => onOpenDocument(doc.id)}>
            <span className="doc-type">{doc.type}</span>
            <strong>{doc.title}</strong>
            <span className="muted">{doc.summary}</span>
            <span className="muted">{readIds.has(doc.id) ? "Reviewed" : "Not yet reviewed"}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function DocumentView({ doc, read, actionsLeft, onBack, onRead }) {
  return (
    <div className="interview">
      <div className="interview-nav">
        <button className="ghost" onClick={onBack}>
          ← Back to overview
        </button>
      </div>
      <article className="card document">
        <span className="doc-type">{doc.type} · {doc.owner}</span>
        <h2>{doc.title}</h2>
        <p className="muted">{doc.summary}</p>
        {read ? (
          <>
            <ul>
              {doc.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {read.found.map((id) => (
              <FoundEvidence key={id} item={evidenceById[id]} />
            ))}
            <AlreadyKnown ids={doc.evidence.filter((id) => !read.found.includes(id))} />
          </>
        ) : (
          <button className="primary" disabled={actionsLeft === 0} onClick={() => onRead(doc.id)}>
            Review this document (uses 1 action)
          </button>
        )}
      </article>
    </div>
  );
}

function QuestionButton({ question, asked, actionsLeft, onAsk, followUp }) {
  return (
    <button disabled={asked || actionsLeft === 0} onClick={onAsk} className={followUp ? "follow-up" : ""}>
      {followUp && <span className="follow-up-label">Follow-up</span>}
      {question.text}
      {asked && <span className="muted"> (asked)</span>}
      <FacilitatorNote>
        {question.depth} · {question.trustDelta > 0 ? "+" : ""}
        {question.trustDelta} trust ·{" "}
        {question.evidence.length === 0
          ? "no evidence"
          : question.evidence
              .map((id) => (evidenceById[id].critical ? "critical" : "minor"))
              .join(", ")}
      </FacilitatorNote>
    </button>
  );
}

function Interview({ stakeholders, selected, trust, interviews, actionsLeft, onSelect, onAsk }) {
  const askedIds = new Set(interviews.map((entry) => entry.questionId));
  const history = trustHistory(selected, interviews);
  const transcript = interviews.filter((entry) => entry.stakeholderId === selected.id);
  const quadrant = QUADRANTS[quadrantFor(trust[selected.id], selected.influence)];
  const available = selected.questions.filter((q) => isQuestionAvailable(q, askedIds));

  return (
    <div className="interview">
      <div className="interview-nav">
        <button className="ghost" onClick={() => onSelect(null)}>
          ← Back to overview
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
          <InfluenceBadge stakeholder={selected} />
        </div>
        <p className="public-position">
          <strong>Public position:</strong> “{selected.publicPosition}”
        </p>
        <TrustMeter value={trust[selected.id]} />
        <p className="quadrant-note">
          <strong>{quadrant.label}.</strong> {quadrant.advice}
        </p>
        <FacilitatorNote>
          Underlying concern: {selected.underlyingConcern} Blind spot:{" "}
          {selected.blindSpot}
        </FacilitatorNote>
      </div>

      {transcript.length > 0 && (
        <ol className="transcript" aria-live="polite">
          {transcript.map((entry, index) => {
            const question = selected.questions.find((q) => q.id === entry.questionId);
            const found = entry.found ?? [];
            const known = entry.guarded ? [] : question.evidence.filter((id) => !found.includes(id));
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
                    <span className="evidence-none">Cautious: no evidence shared</span>
                  )}
                  {!entry.guarded && question.evidence.length === 0 && (
                    <span className="evidence-none">No evidence: a public position only</span>
                  )}
                </div>
                {found.map((id) => (
                  <FoundEvidence key={id} item={evidenceById[id]} />
                ))}
                <AlreadyKnown ids={known} />
              </li>
            );
          })}
        </ol>
      )}

      {actionsLeft === 0 && (
        <p className="notice">
          You have used all your investigation actions. Review your evidence and
          prepare your recommendation.
        </p>
      )}

      <h3>Ask a question</h3>
      <div className="question-list">
        {available.map((question) => (
          <QuestionButton
            key={question.id}
            question={question}
            asked={askedIds.has(question.id)}
            actionsLeft={actionsLeft}
            followUp={Boolean(question.requires)}
            onAsk={() => onAsk(selected.id, question.id)}
          />
        ))}
      </div>

      <TrustLegend />
    </div>
  );
}

export default function StakeholderPanel(props) {
  const { selected, documents, documentsRead, actionsLeft, onSelect, onRead } = props;
  const [documentId, setDocumentId] = useState(null);
  const ref = useRef(null);
  const doc = documents.find((d) => d.id === documentId);

  // Switching view replaces the panel's content; bring its top into view if
  // the page was scrolled past it.
  useEffect(() => {
    const top = ref.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) {
      ref.current.scrollIntoView({ block: "start" });
    }
  }, [selected?.id, documentId]);

  const select = (id) => {
    setDocumentId(null);
    onSelect(id);
  };

  let content;
  if (doc) {
    content = (
      <DocumentView
        doc={doc}
        read={documentsRead.find((d) => d.documentId === doc.id)}
        actionsLeft={actionsLeft}
        onBack={() => setDocumentId(null)}
        onRead={onRead}
      />
    );
  } else if (selected) {
    content = <Interview {...props} onSelect={select} />;
  } else {
    content = <Overview {...props} onSelect={select} onOpenDocument={setDocumentId} />;
  }

  return (
    <section className="panel" id="interviews" ref={ref}>
      {content}
    </section>
  );
}
