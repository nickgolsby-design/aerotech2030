import { useState } from "react";
import { QUESTION_BUDGET } from "../data/gameConfig.js";
import { MAX_TEAM_NAME_LENGTH } from "../state/gameReducer.js";

export default function BriefingScreen({ onStart }) {
  const [teamName, setTeamName] = useState("");
  const canStart = teamName.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canStart) onStart(teamName);
  };

  return (
    <main className="game briefing">
      <p className="eyebrow">Confidential · Board memorandum</p>
      <h1>AeroTech Precision Ltd</h1>
      <h2>Strategic Board Memorandum</h2>

      <div className="briefing-grid">
        <section className="card">
          <h3>Situation</h3>
          <p>
            AeroTech has used CATIA V5 for more than 15 years across design,
            manufacturing and simulation activities.
          </p>
          <p>
            Dassault Systèmes has announced that the current CATIA V5 release
            will soon enter sustaining support. The board must choose a
            CAD/CAM/CAE platform strategy for the next decade.
          </p>

          <h3>Company Profile</h3>
          <ul>
            <li>Industry: Aerospace Components</li>
            <li>Annual Revenue: £150M</li>
            <li>Employees: 450</li>
            <li>Key Customers: Airbus, Rolls-Royce</li>
            <li>Current Platform: CATIA V5</li>
          </ul>
        </section>

        <section className="card">
          <h3>Your Consultancy Task</h3>
          <ol>
            <li>Investigate stakeholder needs</li>
            <li>Gather evidence</li>
            <li>Identify risks</li>
            <li>Evaluate software options</li>
            <li>Present a recommendation</li>
          </ol>

          <h3>How the engagement works</h3>
          <ul>
            <li>
              You have <strong>{QUESTION_BUDGET} interview questions</strong>.
              Choose who to ask and what to ask carefully.
            </li>
            <li>
              Stakeholders share more when they trust you. The way you frame
              a question matters.
            </li>
            <li>
              The board will challenge the areas you investigated least, then
              you'll see the consequences in Years 1, 3 and 5.
            </li>
            <li>Allow 20–30 minutes.</li>
          </ul>
        </section>
      </div>

      <form className="start-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Consulting team name</span>
          <input
            type="text"
            value={teamName}
            maxLength={MAX_TEAM_NAME_LENGTH}
            placeholder="e.g. Team 3"
            autoComplete="off"
            onChange={(event) => setTeamName(event.target.value)}
          />
        </label>
        <button type="submit" className="primary" disabled={!canStart}>
          Begin Consultancy Engagement
        </button>
      </form>
    </main>
  );
}
