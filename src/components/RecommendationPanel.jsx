export default function RecommendationPanel({
  decision,
  onDecisionChange,
  onSubmit
}) {
  return (
    <>
      <hr />

      <h2>Board Recommendation</h2>

      <select
        value={decision}
        onChange={(event) => onDecisionChange(event.target.value)}
      >
        <option value="">Select Platform</option>
        <option>Stay with CATIA V5</option>
        <option>3DEXPERIENCE</option>
        <option>Siemens NX</option>
        <option>PTC Creo</option>
      </select>

      <button
        style={{ marginLeft: "10px" }}
        onClick={onSubmit}
      >
        Present to Board
      </button>
    </>
  );
}
