import { useRef, useState } from "react";
import StakeholderPanel from "./StakeholderPanel.jsx";
import EvidenceDashboard from "./EvidenceDashboard.jsx";
import PlatformComparison from "./PlatformComparison.jsx";
import RecommendationPanel from "./RecommendationPanel.jsx";
import InvestigationSidebar from "./InvestigationSidebar.jsx";
import { stakeholders, stakeholdersById } from "../data/stakeholders.js";
import { platforms, criteria } from "../data/platformProfiles.js";
import { evidenceById } from "../data/evidence.js";
import { documents } from "../data/documents.js";
import { foundVia } from "../data/sources.js";
import { validateRecommendation } from "../engine/outcomeEngine.js";

/** Investigation phase: tabbed main area plus an always-visible summary. */
export default function InvestigationWorkspace({ state, dispatch }) {
  const [tab, setTab] = useState("interviews");
  const tabsRef = useRef(null);

  const assessed = new Set(state.evidenceIds.map((id) => evidenceById[id].category));
  const criteriaAssessed = criteria.filter((c) => assessed.has(c.category)).length;
  const ready = validateRecommendation(state.recommendation).length === 0;

  const tabs = [
    { id: "interviews", label: "Investigate" },
    { id: "evidence", label: `Evidence (${state.evidenceIds.length})` },
    { id: "comparison", label: `Comparison (${criteriaAssessed}/${criteria.length})` },
    { id: "recommendation", label: ready ? "Recommendation ✓" : "Recommendation" }
  ];

  const go = (id) => {
    setTab(id);
    // Keep the tabs in view when switching from further down the page.
    const top = tabsRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) tabsRef.current.scrollIntoView({ block: "start" });
  };

  const onTabKey = (event) => {
    const index = tabs.findIndex((t) => t.id === tab);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    go(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="workspace">
      <div className="workspace-main">
        <div className="tabs" role="tablist" aria-label="Investigation" ref={tabsRef} onKeyDown={onTabKey}>
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => go(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "interviews" && (
            <StakeholderPanel
              stakeholders={stakeholders}
              selected={stakeholdersById[state.selectedId] ?? null}
              trust={state.trust}
              interviews={state.interviews}
              documents={documents}
              documentsRead={state.documentsRead}
              actionsLeft={state.actionsLeft}
              onSelect={(stakeholderId) => dispatch({ type: "SELECT_STAKEHOLDER", stakeholderId })}
              onAsk={(stakeholderId, questionId) => dispatch({ type: "ASK", stakeholderId, questionId })}
              onRead={(documentId) => dispatch({ type: "READ_DOCUMENT", documentId })}
            />
          )}

          {tab === "evidence" && (
            <EvidenceDashboard
              evidenceIds={state.evidenceIds}
              foundBy={foundVia(state)}
              tags={state.tags}
              onTag={(evidenceId, tag) => dispatch({ type: "TAG_EVIDENCE", evidenceId, tag })}
            />
          )}

          {tab === "comparison" && (
            <PlatformComparison
              platforms={platforms}
              evidenceIds={state.evidenceIds}
              weights={state.weights}
              onWeightChange={(criterionId, weight) =>
                dispatch({ type: "SET_WEIGHT", criterionId, weight })
              }
            />
          )}

          {tab === "recommendation" && (
            <RecommendationPanel
              platforms={platforms}
              recommendation={state.recommendation}
              onFieldChange={(field, value) => dispatch({ type: "SET_RECOMMENDATION", field, value })}
              onRiskChange={(index, riskId) => dispatch({ type: "SET_RISK", index, riskId })}
              onMitigationChange={(index, mitigationId) =>
                dispatch({ type: "SET_MITIGATION", index, mitigationId })
              }
              onSubmit={() => dispatch({ type: "SUBMIT" })}
            />
          )}
        </div>
      </div>

      <InvestigationSidebar state={state} onNavigate={go} />
    </div>
  );
}
