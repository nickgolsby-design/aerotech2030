export default function StakeholderPanel({
  stakeholders,
  selected,
  questionsLeft,
  onConsult
}) {
  return (
    <>
      <h3>Questions Remaining: {questionsLeft}</h3>

      <hr />

      <h2>Stakeholders</h2>

      {stakeholders.map((stakeholder) => (
        <button
          key={stakeholder.id}
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
