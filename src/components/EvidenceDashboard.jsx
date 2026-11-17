export default function EvidenceDashboard({ evidence }) {
  return (
    <>
      <hr />

      <h2>Evidence Log</h2>

      <ul>
        {evidence.map((item) => (
          <li key={item.stakeholderId}>{item.text}</li>
        ))}
      </ul>
    </>
  );
}
