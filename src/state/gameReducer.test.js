import { describe, it, expect } from "vitest";
import { gameReducer, initialGameState } from "./gameReducer.js";
import { getChallenge } from "../engine/outcomeEngine.js";

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

const ask = (stakeholderId, questionId) => ({ type: "ASK", stakeholderId, questionId });
const read = (documentId) => ({ type: "READ_DOCUMENT", documentId });

describe("investigation", () => {
  it("asking costs an action, moves trust and reveals evidence", () => {
    const s = run(initialGameState, START, ask("ceo", "ceo-problem"));
    expect(s.actionsLeft).toBe(11);
    expect(s.trust.ceo).toBe(60);
    expect(s.evidenceIds).toEqual(["strategy-capability"]);
    expect(s.lastFound).toEqual(["strategy-capability"]);
    expect(s.interviews[0].found).toEqual(["strategy-capability"]);
  });

  it("generic questions use an action but reveal no evidence", () => {
    const s = run(initialGameState, START, ask("ceo", "ceo-concerns"));
    expect(s.actionsLeft).toBe(11);
    expect(s.evidenceIds).toEqual([]);
    expect(s.lastFound).toEqual([]);
  });

  it("follow-ups are locked until their parent question is asked", () => {
    const started = run(initialGameState, START);
    expect(gameReducer(started, ask("ceo", "ceo-lost-work"))).toBe(started);
    const s = run(started, ask("ceo", "ceo-competitors"), ask("ceo", "ceo-lost-work"));
    expect(s.evidenceIds).toEqual(["strategy-competitors", "strategy-lost-bid"]);
  });

  it("guarded stakeholders reveal nothing", () => {
    const started = run(initialGameState, START);
    const cold = { ...started, trust: { ...started.trust, ceo: 20 } };
    const s = gameReducer(cold, ask("ceo", "ceo-problem"));
    expect(s.interviews[0].guarded).toBe(true);
    expect(s.evidenceIds).toEqual([]);
  });

  it("questions cannot be repeated and the budget locks out", () => {
    const started = run(initialGameState, START);
    const once = gameReducer(started, ask("ceo", "ceo-problem"));
    expect(gameReducer(once, ask("ceo", "ceo-problem"))).toBe(once);
    const broke = { ...started, actionsLeft: 0 };
    expect(gameReducer(broke, ask("ceo", "ceo-problem"))).toBe(broke);
    expect(gameReducer(broke, read("doc-competitors"))).toBe(broke);
  });

  it("reviewing a document costs an action and reveals its evidence once", () => {
    const s = run(initialGameState, START, read("doc-competitors"));
    expect(s.actionsLeft).toBe(11);
    expect(s.evidenceIds).toEqual(["strategy-competitors", "strategy-lost-bid"]);
    expect(s.documentsRead).toEqual([
      { documentId: "doc-competitors", found: ["strategy-competitors", "strategy-lost-bid"] }
    ]);
    expect(gameReducer(s, read("doc-competitors"))).toBe(s);
    expect(gameReducer(s, read("no-such-document"))).toBe(s);
  });

  it("evidence found by another route is not counted twice", () => {
    const s = run(initialGameState, START, ask("ceo", "ceo-competitors"), read("doc-competitors"));
    expect(s.evidenceIds).toEqual(["strategy-competitors", "strategy-lost-bid"]);
    expect(s.documentsRead[0].found).toEqual(["strategy-lost-bid"]);
    expect(s.lastFound).toEqual(["strategy-lost-bid"]);
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
    expect(s.challengeIds).toHaveLength(3);

    // Locked after submission.
    const locked = gameReducer(s, { type: "SET_RECOMMENDATION", field: "platform", value: "Siemens NX" });
    expect(locked).toBe(s);
    expect(gameReducer(s, { type: "ASK", stakeholderId: "ceo", questionId: "ceo-success" })).toBe(s);

    // Can't see outcomes until every challenge is answered.
    expect(gameReducer(s, { type: "SHOW_OUTCOMES" }).phase).toBe("boardReview");

    const defend = (id, n) => ({
      type: "ANSWER_CHALLENGE",
      challengeId: id,
      positionId: getChallenge(id).positions[n].id,
      evidenceIds: []
    });
    // Unknown positions are ignored.
    expect(gameReducer(s, { ...defend(s.challengeIds[0], 0), positionId: "nope" })).toBe(s);
    for (const id of s.challengeIds) s = gameReducer(s, defend(id, 0));
    expect(s.challengeAnswers[s.challengeIds[0]]).toEqual({
      positionId: getChallenge(s.challengeIds[0]).positions[0].id,
      evidenceIds: []
    });
    // Answers can't be changed.
    const first = s.challengeIds[0];
    expect(gameReducer(s, defend(first, 1))).toBe(s);

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

describe("defending a position", () => {
  it("must cite one or two pieces of evidence the team actually found", () => {
    let s = run(
      initialGameState,
      START,
      { type: "READ_DOCUMENT", documentId: "doc-competitors" },
      { type: "READ_DOCUMENT", documentId: "doc-workforce" },
      ...completeRecommendation,
      { type: "SUBMIT" }
    );
    const id = s.challengeIds[0];
    const positionId = getChallenge(id).positions[0].id;
    const answer = (evidenceIds) => ({ type: "ANSWER_CHALLENGE", challengeId: id, positionId, evidenceIds });

    expect(gameReducer(s, answer([]))).toBe(s);
    expect(gameReducer(s, answer(["cost-approval"]))).toBe(s); // not found
    expect(gameReducer(s, answer(["strategy-lost-bid", "wf-retirement", "strategy-competitors"]))).toBe(s);

    s = gameReducer(s, answer(["strategy-lost-bid", "wf-retirement"]));
    expect(s.challengeAnswers[id]).toEqual({
      positionId,
      evidenceIds: ["strategy-lost-bid", "wf-retirement"]
    });
  });
});
