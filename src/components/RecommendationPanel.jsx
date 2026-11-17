export default function RecommendationPanel({
  platforms,
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
        {platforms.map((platform) => (
          <option key={platform}>{platform}</option>
        ))}
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
