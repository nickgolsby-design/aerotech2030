import { describe, it, expect } from "vitest";
import { gameReducer, initialGameState } from "./gameReducer.js";

const run = (state, ...actions) => actions.reduce(gameReducer, state);
const START = { type: "START", teamName: "Team 1", now: 1000 };

const completeRecommendation = [
  { type: "SET_RECOMMENDATION", field: "platform", value: "3DEXPERIENCE" },
  { type: "SET_RECOMMENDATION", field: "strategy", value: "phased" },
  { type: "SET_RISK", index: 0, riskId: "cost-overrun" },
  { type: "SET_MITIGATION", index: 0, mitigationId: "co-tco" },
  { type: "SET_RISK", index: 1, riskId: "production-disruption" },
  { type: "SET_MITIGATION", index: 1, mitigationId: "pd-parallel" },
  { type: "SET_RISK", index: 2, riskId: "skills-loss" },
  { type: "SET_MITIGATION", index: 2, mitigationId: "sl-pairing" },
  { type: "SET_RECOMMENDATION", field: "changeApproach", value: "sponsored" },
  { type: "SET_RECOMMENDATION", field: "rationale", value: "Customer alignment and data continuity." }
];

describe("investigation", () => {
  it("asking costs a question, moves trust and reveals evidence", () => {
    const s = run(
      initialGameState,
      START,
      { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" }
    );
    expect(s.questionsLeft).toBe(14);
    expect(s.trust.ceo).toBe(60);
    expect(s.evidenceIds).toEqual(["strategy-growth"]);
  });

  it("guarded stakeholders reveal nothing", () => {
    const s = run(
      initialGameState,
      START,
      { type: "ASK", stakeholderId: "quality-manager", questionId: "qm-leading" },
      { type: "ASK", stakeholderId: "quality-manager", questionId: "qm-certification" }
    );
    expect(s.interviews[1].guarded).toBe(true);
    expect(s.evidenceIds).toEqual([]);
  });

  it("questions cannot be repeated and the budget locks out", () => {
    const started = run(initialGameState, START);
    const once = gameReducer(started, { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" });
    expect(gameReducer(once, { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" })).toBe(once);
    const broke = { ...started, questionsLeft: 0 };
    expect(gameReducer(broke, { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" })).toBe(broke);
  });
});

describe("recommendation and board review", () => {
  it("cannot submit an incomplete recommendation", () => {
    const s = run(
      initialGameState,
      START,
      { type: "SET_RECOMMENDATION", field: "platform", value: "Siemens NX" },
      { type: "SUBMIT" }
    );
    expect(s.phase).toBe("investigation");
  });

  it("choosing V5 clears the strategy, and changing a risk clears its mitigation", () => {
    const s = run(
      initialGameState,
      START,
      ...completeRecommendation,
      { type: "SET_RISK", index: 0, riskId: "security" },
      { type: "SET_RECOMMENDATION", field: "platform", value: "Stay with CATIA V5" }
    );
    expect(s.recommendation.strategy).toBe("");
    expect(s.recommendation.risks[0]).toEqual({ riskId: "security", mitigationId: "" });
  });

  it("runs submit -> board review -> outcomes, and locks the recommendation", () => {
    let s = run(initialGameState, START, ...completeRecommendation, { type: "SUBMIT" });
    expect(s.phase).toBe("boardReview");
    expect(s.challengeIds).toHaveLength(4);

    // Locked after submission.
    const locked = gameReducer(s, { type: "SET_RECOMMENDATION", field: "platform", value: "PTC Creo" });
    expect(locked).toBe(s);
    expect(gameReducer(s, { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" })).toBe(s);

    // Can't see outcomes until every challenge is answered.
    expect(gameReducer(s, { type: "SHOW_OUTCOMES" }).phase).toBe("boardReview");

    for (const id of s.challengeIds) {
      s = gameReducer(s, { type: "ANSWER_CHALLENGE", challengeId: id, optionId: "a" });
    }
    // Answers can't be changed.
    const first = s.challengeIds[0];
    expect(gameReducer(s, { type: "ANSWER_CHALLENGE", challengeId: first, optionId: "b" })).toBe(s);

    s = gameReducer(s, { type: "SHOW_OUTCOMES", now: 61000 });
    expect(s.phase).toBe("outcomes");
    expect(s.finishedAt - s.startedAt).toBe(60000);

    // Outcomes and debrief can be switched between, but nothing earlier.
    s = gameReducer(s, { type: "SHOW_RESULTS_VIEW", view: "debrief" });
    expect(s.phase).toBe("debrief");
    expect(gameReducer(s, { type: "SHOW_RESULTS_VIEW", view: "investigation" })).toBe(s);
    s = gameReducer(s, { type: "SHOW_RESULTS_VIEW", view: "outcomes" });
    expect(s.phase).toBe("outcomes");

    expect(gameReducer(s, { type: "RESTART" })).toBe(initialGameState);
  });
});

describe("briefing", () => {
  it("requires a team name and records it trimmed", () => {
    expect(gameReducer(initialGameState, { type: "START", teamName: "   " })).toBe(initialGameState);
    const s = gameReducer(initialGameState, { type: "START", teamName: "  Team 7 ", now: 5 });
    expect(s.phase).toBe("investigation");
    expect(s.teamName).toBe("Team 7");
    expect(s.startedAt).toBe(5);
  });

  it("results views are unavailable mid-game", () => {
    const s = run(initialGameState, START);
    expect(gameReducer(s, { type: "SHOW_RESULTS_VIEW", view: "debrief" })).toBe(s);
  });
});
