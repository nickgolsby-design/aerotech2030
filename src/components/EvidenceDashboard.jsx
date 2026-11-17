export default function EvidenceDashboard({ evidence }) {
  return (
    <>
      <hr />

      <h2>Evidence Log</h2>

      <ul>
        {evidence.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </>
  );
}
