// Scenario context shown on the briefing screen. Fictional case study.
// Keep facts that students should *discover* (e.g. the £5M approval
// threshold, customer platform moves) out of the briefing.

export const timeline = [
  { when: "Now", what: "Your team is engaged to advise the board." },
  { when: "6 weeks", what: "Board meeting: your recommendation is presented and challenged." },
  { when: "18 months", what: "CATIA V5 enters sustaining support: no new functionality, and long-term compatibility is no longer assured." },
  { when: "Year 1–5", what: "The board will judge the decision on delivery, cost, people, customers and confidence." }
];

export const budget = {
  headline: "£4–6M pencilled in over three years",
  detail:
    "The capital plan has an indicative allocation for engineering systems. The board expects a whole-life business case, not just licence prices."
};

export const board = {
  members: [
    { role: "CEO", note: "Chairs the board" },
    { role: "Finance Director", note: "Owns the investment case" },
    { role: "Manufacturing Director", note: "Runs production at both sites" },
    { role: "Chief Design Engineer", note: "Leads design engineering and simulation" }
  ],
  attending:
    "Senior managers from engineering, IT, quality, simulation, HR and procurement will attend the review and may question your recommendation."
};

export const deliverable = [
  "A recommended platform and implementation strategy",
  "The three most important risks, each with a mitigation",
  "A change-management approach",
  "A short rationale grounded in your evidence"
];
