import { useState } from "react";
import BriefingScreen from "./components/BriefingScreen.jsx";
import StakeholderPanel from "./components/StakeholderPanel.jsx";
import EvidenceDashboard from "./components/EvidenceDashboard.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import OutcomeReport from "./components/OutcomeReport.jsx";

const stakeholders = [
  {
    name: "Finance Director",
    influence: 95,
    evidence:
      "Projects above £5M require board approval and may delay implementation.",
    response:
      "Migration costs must include licences, training and productivity loss."
  },
  {
    name: "Manufacturing Director",
    influence: 85,
    evidence:
      "Existing CAM workflows are heavily dependent on CATIA outputs.",
    response:
      "Production disruption is my biggest concern during migration."
  },
  {
    name: "IT Manager",
    influence: 75,
    evidence:
      "Cybersecurity concerns are increasing around ageing software.",
    response:
      "Support lifecycle and patching are becoming increasingly important."
  }
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [questionsLeft, setQuestionsLeft] = useState(12);
  const [decision, setDecision] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const consultStakeholder = (stakeholder) => {
    setSelected(stakeholder);

    if (
      !evidence.includes(stakeholder.evidence) &&
      questionsLeft > 0
    ) {
      setEvidence([...evidence, stakeholder.evidence]);
      setQuestionsLeft(questionsLeft - 1);
    }
  };

  if (!started) {
    return <BriefingScreen onStart={() => setStarted(true)} />;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>AeroTech 2030</h1>

      <h3>Questions Remaining: {questionsLeft}</h3>

      <StakeholderPanel
        stakeholders={stakeholders}
        selected={selected}
        onConsult={consultStakeholder}
      />

      <EvidenceDashboard evidence={evidence} />

      <RecommendationPanel
        decision={decision}
        onDecisionChange={setDecision}
        onSubmit={() => setSubmitted(true)}
      />

      {submitted && (
        <OutcomeReport
          decision={decision}
          evidenceCount={evidence.length}
        />
      )}
    </div>
  );
}