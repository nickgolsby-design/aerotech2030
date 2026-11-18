import { useState } from "react";
import { QUESTION_BUDGET } from "../data/gameConfig.js";
import { MAX_TEAM_NAME_LENGTH } from "../state/gameReducer.js";
import { platforms } from "../data/platformProfiles.js";
import { timeline, budget, board, deliverable } from "../data/briefing.js";
import Glossary from "./Glossary.jsx";

export default function BriefingScreen({ onStart }) {
  const [teamName, setTeamName] = useState("");
  const canStart = teamName.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canStart) onStart(teamName);
  };

  return (
    <main className="game briefing">
      <div className="section-head">
        <p className="eyebrow">Confidential · Board memorandum</p>
        <Glossary />
      </div>
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
          <h3>Timeline</h3>
          <ol className="timeline">
            {timeline.map((t) => (
              <li key={t.when}>
                <span className="timeline-when">{t.when}</span>
                <span>{t.what}</span>
              </li>
            ))}
          </ol>

          <h3>Budget</h3>
          <p>
            <strong>{budget.headline}.</strong> {budget.detail}
          </p>
        </section>

        <section className="card">
          <h3>The board</h3>
          <ul>
            {board.members.map((m) => (
              <li key={m.role}>
                <strong>{m.role}</strong> — {m.note}
              </li>
            ))}
          </ul>
          <p className="muted">{board.attending}</p>

          <h3>Options on the table</h3>
          <ul>
            {platforms.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="muted">You can read a profile of each option during the investigation.</p>
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

          <h3>The board expects</h3>
          <ul>
            {deliverable.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h3>How the engagement works</h3>
          <ul>
            <li>
              You have <strong>{QUESTION_BUDGET} interview questions</strong>.
              Choose who to ask and what to ask carefully.
            </li>
            <li>
              Stakeholders share more when they trust you. The way you frame
              a question matters, and influential stakeholders matter most to
              the board.
            </li>
            <li>
              The board will challenge the areas you investigated least, then
              you'll see the consequences in Years 1, 3 and 5.
            </li>
            <li>Allow 20–30 minutes. Unfamiliar terms are in the Glossary.</li>
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
