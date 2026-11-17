export default function BriefingScreen({ onStart }) {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>AeroTech Precision Ltd</h1>

      <h2>Strategic Board Memorandum</h2>

      <p>
        AeroTech has used CATIA V5 for more than 15 years across
        design, manufacturing and simulation activities.
      </p>

      <p>
        Dassault Systèmes has announced that the current CATIA V5
        release will soon enter sustaining support.
      </p>

      <h3>Company Profile</h3>

      <ul>
        <li>Industry: Aerospace Components</li>
        <li>Annual Revenue: £150M</li>
        <li>Employees: 450</li>
        <li>Key Customers: Airbus, Rolls-Royce</li>
        <li>Current Platform: CATIA V5</li>
      </ul>

      <h3>Your Consultancy Task</h3>

      <ol>
        <li>Investigate stakeholder needs</li>
        <li>Gather evidence</li>
        <li>Identify risks</li>
        <li>Evaluate software options</li>
        <li>Present a recommendation</li>
      </ol>

      <button
        onClick={onStart}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Begin Consultancy Engagement
      </button>
    </div>
  );
}
