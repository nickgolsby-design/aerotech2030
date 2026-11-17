export default function StakeholderPanel({
  stakeholders,
  selected,
  onConsult
}) {
  return (
    <>
      <hr />

      <h2>Stakeholders</h2>

      {stakeholders.map((stakeholder) => (
        <button
          key={stakeholder.name}
          style={{
            marginRight: "10px",
            marginBottom: "10px"
          }}
          onClick={() => onConsult(stakeholder)}
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
    </>
  );
}
