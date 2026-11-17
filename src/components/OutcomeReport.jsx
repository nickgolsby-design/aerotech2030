export default function OutcomeReport({ decision, evidenceCount }) {
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Board Outcome</h2>

      <p>
        Recommendation:{" "}
        {decision}
      </p>

      <p>
        Evidence Gathered:{" "}
        {evidenceCount}
      </p>

      <p>Stakeholder engagement completed.</p>
    </div>
  );
}
