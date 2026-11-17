import { useState } from "react";

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
    return (
      <div style={{ padding: "40px" }}>
        <h1>AeroTech Precision Ltd</h1>

        <h2>Strategic Board Memorandum</h2>

        <p>
          AeroTech has used CATIA V5 for over 15 years.
        </p>

        <p>
          A replacement strategy must be recommended.
        </p>

        <button onClick={() => setStarted(true)}>
          Begin Consultancy Engagement
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>AeroTech 2030</h1>

      <h3>
        Questions Remaining: {questionsLeft}
      </h3>

      <hr />

      <h2>Stakeholders</h2>

      {stakeholders.map((stakeholder) => (
        <button
          key={stakeholder.name}
          style={{
            marginRight: "10px",
            marginBottom: "10px"
          }}
          onClick={() =>
            consultStakeholder(stakeholder)
          }
        >
          {stakeholder.name}
        </button>
      ))}

      {selected && (
        <>
          <hr />

          <h2>{selected.name}</h2>

          <p>{selected.response}</p>
        </>
      )}

      <hr />

      <h2>Evidence Log</h2>

      <ul>
        {evidence.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <hr />

      <h2>Board Recommendation</h2>

      <select
        value={decision}
        onChange={(e) =>
          setDecision(e.target.value)
        }
      >
        <option value="">
          Select Platform
        </option>
        <option>Stay with CATIA V5</option>
        <option>3DEXPERIENCE</option>
        <option>Siemens NX</option>
        <option>PTC Creo</option>
      </select>

      <button
        style={{ marginLeft: "10px" }}
        onClick={() => setSubmitted(true)}
      >
        Present to Board
      </button>

      {submitted && (
        <div style={{ marginTop: "30px" }}>
          <h2>Board Outcome</h2>

          <p>
            Recommendation:
            {" "}
            {decision}
          </p>

          <p>
            Evidence Gathered:
            {" "}
            {evidence.length}
          </p>

          <p>
            Stakeholder engagement completed.
          </p>
        </div>
      )}
    </div>
  );
}