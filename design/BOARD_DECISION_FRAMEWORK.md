# BOARD_DECISION_FRAMEWORK.md

# AeroTech 2030 Board Decision Framework

## Purpose

This document defines how the Board of AeroTech Precision Ltd judges the
students' recommendation, and how that judgement feeds the Year 1 / 3 / 5
outcomes and the debrief.

It sits alongside, and must stay consistent with:

- CLAUDE_DEVELOPMENT_BRIEF.md
- SIMULATION_REDESIGN_V1.md
- SCENARIO_CONTENT_LIBRARY_V3.md
- STAKEHOLDER_INTELLIGENCE_FRAMEWORK_V1.md

Where this document and the code disagree, this document wins.

Status: agreed decisions are marked **Decided**. Items marked **Proposed**
need confirmation before the phase that implements them.

## V1-Pilot implementation status (2026-11-20)

Simulation mechanics are frozen for the V1 pilot. What the pilot build does:

- **Implemented:** the 10-stakeholder roster, depth-graded questions with
  follow-ups, documents, the 12-action budget, the evidence model with
  assumption items, the relationship labels Open / Neutral / Cautious (no
  numbers shown to students), and the Board Review as an executive
  challenge session. That session covers the ten dimensions, judgement
  questions, two defensible positions and one weak position per challenge,
  and board reactions that name the kind of evidence.
- **Pathways:** Creo has been removed. The pilot offers Stay with CATIA V5,
  3DEXPERIENCE and Siemens NX, with an implementation strategy of big-bang,
  phased or hybrid coexistence. A phased or hybrid strategy stands in for
  Pathway D. Pathway D as a separate choice is not built.
- **Not in the pilot (post-pilot backlog):** submitting assumptions with the
  recommendation, the contradiction library, the ten-dimension board
  scorecard and verdict bands described below, and the redesigned
  Year 1 / 3 / 5 outcomes and debrief. The pilot keeps the existing
  board-confidence verdict and outcome model.

---

# GOVERNING PRINCIPLE

The Board does not ask "Did they pick the right software?"

The Board asks "Is this a defensible recommendation, built on evidence, that
understands its own risks and assumptions?"

Consequences for implementation:

- No pathway is scored as correct or incorrect.
- Every pathway can be approved if it is well evidenced, and every pathway
  can be deferred if it is not.
- Stakeholder relationships matter only as context. They never dominate the
  board result, and relationship status is never shown as a number.
- The quality of the investigation is the main driver of the verdict and of
  the outcomes.

---

# STRATEGIC PATHWAYS (Decided)

Creo is removed as a strategic pathway. The four pathways are:

| Id | Pathway | Benefit | Risk |
|---|---|---|---|
| A | Retain CATIA V5 short-term | Low disruption, protects delivery | Capability stagnation; the decision is deferred, not avoided |
| B | Adopt 3DEXPERIENCE | Continuity within the Dassault ecosystem; digital thread | Large transformation programme; organisational complexity |
| C | Transform around Siemens NX | Integrated engineering and manufacturing capability | Major migration effort; large training requirement |
| D | Phased hybrid strategy | Reduced implementation shock | Extended transition; running two environments |

**Proposed:** Pathway D keeps CATIA V5 for in-flight programmes while new
programmes start on a successor platform, with full migration decided at a
Year 2 stage gate. Students name the successor (3DEXPERIENCE or Siemens NX)
as part of the recommendation, so outcomes can reflect it. Under A, students
must state a review point (for example, "revisit at the Year 2 stage gate").

**Proposed:** the separate implementation-strategy selector (big-bang /
phased / hybrid) is retired. Pathways B and C imply a planned migration whose
disruption is managed through mitigations; D is the phased option.

---

# RECOMMENDATION SUBMISSION (Decided)

Students submit:

1. **Strategic pathway** (A–D), plus the successor platform for D.
2. **Five supporting evidence items**, chosen from evidence they have found.
3. **Three major risks**, chosen from the risk library.
4. **Two assumptions**, chosen from the assumption list (see below).
5. **Three mitigations**, one for each chosen risk.

An optional one-paragraph rationale is kept for classroom discussion. It is
not scored.

Students cannot cite evidence they have not discovered.

---

# ASSUMPTIONS: CORE MECHANIC (Decided)

## Why

The redesign asks students to demonstrate assumption testing. An assumption is
a belief the recommendation depends on that has not yet been validated.
Identifying weak assumptions is a core consulting skill, and the debrief asks
"Which assumptions were weak?"

## How students meet assumptions

1. **In the investigation.** Stakeholders voice beliefs. Some evidence items
   are classified as *Assumption*: each states the belief, who holds it and why
   it is doubtful. Students also classify evidence themselves, and can tag
   anything as an assumption.
2. **In the recommendation.** Students submit the two assumptions their
   recommendation most depends on, or that most need testing before the
   Board commits.
3. **At the board.** The Board challenges unexamined assumptions.
4. **In the outcomes.** Assumptions that were not identified play out as
   consequences ("Engineers did not accept change as readily as planned").

## Assumption library

| Id | Belief | Commonly held by | Exposed by evidence | Consequence if left unchallenged |
|---|---|---|---|---|
| productivity | New software automatically improves productivity | Graduates, vendors, early business cases | assume-productivity | Productivity recovers far later than planned |
| workflows | Existing workflows can be recreated easily | Engineering planning | assume-workflows | Manufacturing re-validation overruns |
| acceptance | Engineers will accept change | Programme sponsors | assume-acceptance | Resistance and workarounds slow adoption |
| customers-static | Customers will value the same capabilities as five years ago | Operations, finance | assume-customer-static | Customer collaboration requirements arrive unprepared |
| training-only | Recruitment challenges can be solved through training alone | Line management | assume-training-only | Skills gap persists despite training spend |
| technology-risk | Technology risk is larger than organisational risk | Engineering, IT | assume-org-risk | Change management is under-resourced |
| quick-benefits | Benefits appear quickly, without operational disruption | Business-case authors | assume-quick-benefits | Year 1 spend and disruption exceed forecast |

## Distractors (Proposed)

The submission list also contains statements that are **not** good
assumptions to submit. Each looks plausible but fails one test:

- A discovered **fact**, not a belief: "Programmes above £5M receive enhanced
  Board scrutiny."
- A **trivial** belief that does not affect the decision: "Engineers will
  continue to use Windows workstations."
- An **unfalsifiable** opinion: "The best platform is the one engineers like."

## Scoring each submitted assumption

| Submission | Score |
|---|---|
| Library assumption whose exposing evidence the team discovered | 1 |
| Library assumption the team did not discover (a reasonable guess) | 0.5 |
| Distractor | 0 |

---

# BOARD ASSESSMENT: TEN DIMENSIONS

The Board scores each dimension **Weak (0)**, **Adequate (1)** or
**Strong (2)**, using rules that can be computed from the game state. The
rules below are the starting point; thresholds are tuned in the P2 balance
pass.

| # | Dimension | Strong (2) | Adequate (1) |
|---|---|---|---|
| 1 | Stakeholder coverage | Every High-influence stakeholder consulted, and 6+ stakeholders in total | 3+ High-influence stakeholders consulted |
| 2 | Evidence depth | 60%+ of critical evidence found | 35%+ found |
| 3 | Contradictions identified | 2+ contradiction pairs with both sides found | 1 pair |
| 4 | Assumptions challenged | Assumption score 2 | Assumption score 1–1.5 |
| 5 | Risks identified | All three risks among the top four for the pathway | Two of them |
| 6 | Mitigation quality | Mean mitigation quality of 0.8+ | 0.5+ |
| 7 | Strategic alignment | Cited evidence includes a strategic driver **and** a customer requirement | One of the two |
| 8 | Workforce consideration | Workforce evidence cited **and** a workforce risk or mitigation submitted | One of the two |
| 9 | Customer consideration | Customer evidence cited **and** delivery continuity addressed by a risk or mitigation | One of the two |
| 10 | Long-term viability | Future-readiness evidence cited, and for A or D a review point or stage gate stated | One of the two |

**Total: 0–20.**

## Board challenges

After scoring, the Board raises **three challenges**:

- **Two** aimed at the weakest dimensions, each voiced by the stakeholder who
  owns that area (Information Ownership Matrix).
- **One** pathway challenge, drawn from the stakeholders' challenge questions,
  for example the Finance Director to a team recommending NX: "Show me how long
  the implementation will take and how productivity losses will be managed."

Each answer has a strong / weak / poor option. Answers move the total by
+2 / 0 / −2, and only count as strong if the team has evidence in that area.

## Verdict

| Total after challenges | Verdict |
|---|---|
| 14–20 | Approved |
| 9–13 | Approved with conditions (the Board names the conditions from the weakest dimensions) |
| 0–8 | Deferred: AeroTech stays on CATIA V5 for another year |

## Role of stakeholder relationships

Relationship status (Open / Neutral / Cautious) affects how much a stakeholder
reveals and how they speak at the Board, never a score above its weight:

- A Cautious High-influence stakeholder adds one named concern to the
  conditions. This can turn "Approved" into "Approved with conditions", but
  cannot cause a deferral on its own.
- Relationship status contributes **no more than 2 of the 20 points** in total.

---

# PATHWAY DEFENSIBILITY

No pathway is correct. Each is defensible on different evidence, and each has
a characteristic weakness the Board will probe.

| Pathway | Defensible when the team shows | The Board will probe |
|---|---|---|
| A Retain V5 | Delivery continuity (supply-delivery-first, mfg-production-continuity), cost discipline (cost-approval), a defined review point | Support lifecycle (cyber-support-end), skills (wf-retirement, wf-recruitment), customer direction (supply-collaboration) |
| B 3DEXPERIENCE | Strategic and customer drivers (strategy-capability, strategy-lost-bid, supply-collaboration), vendor continuity | Organisational load (cost-change-share, assume-acceptance), governance work (comp-governance-work) |
| C Siemens NX | Engineering–manufacturing integration (mfg-integration, mfg-hidden-knowledge), capability gaps | Migration and validation effort (mfg-validation, sim-integration), training (wf-training-burden) |
| D Phased hybrid | Production protection plus a route to capability; a clear stage gate | Cost of running two environments, and drift: "Is this a decision or a deferral?" |

---

# CONTRADICTION LIBRARY: EVIDENCE MAPPING (for P1.7)

| Contradiction | Side 1 | Side 2 |
|---|---|---|
| Cost vs capability | cost-productivity (Finance) | supply-collaboration (Airbus) |
| Productivity vs transformation | eng-productivity-dip (Chief Design Engineer) | strategy-capability (CEO) |
| Stability vs future readiness | wf-personal-workflows (Senior CAD Engineer) | wf-graduate-appeal (Graduate Engineer) |
| Compliance vs agility | comp-governance-work (Quality) | mfg-integration (Manufacturing) |

A contradiction counts as identified when both sides have been found.

---

# HOW THE BOARD RESULT DRIVES OUTCOMES (for P2)

Outcomes are written narratives for each year, assembled from:

1. **Pathway base narrative**, from SCENARIO_CONTENT_LIBRARY_V3 (for D, a
   new narrative to be written; the content library has none).
2. **Neglect modifiers**: for each weak dimension, or High-influence
   stakeholder not consulted, add the matching consequence (for example,
   Finance not consulted: "Budget implications were underestimated.").
3. **Assumption modifiers**: each library assumption the team did not submit
   or discover can surface as a consequence in Year 1 or Year 3.
4. **Mitigation modifiers**: strong mitigations soften the matching risk's
   consequence; poor ones make it worse.
5. **Verdict**: a deferral replays pathway A with a one-year delay penalty.

Platform choice sets the shape of the story. Investigation quality sets
whether it goes well.

Year dimensions follow STAKEHOLDER_INTELLIGENCE_FRAMEWORK_V1:

- **Year 1:** technology, workforce, operations, customers, finance, governance
- **Year 3:** engineering capability, manufacturing capability, workforce
  capability, customer perception, competitive position, leadership confidence
- **Year 5:** strategic capability, contract success, recruitment, technology
  position, organisational resilience, board assessment

---

# DEBRIEF MAPPING (for P2)

| Debrief question | Source |
|---|---|
| What evidence did you uncover? | Evidence log |
| What evidence did you miss? | Critical evidence not found, with every route that would have revealed it |
| Which assumptions were weak? | Assumption library vs submitted and discovered assumptions |
| Which contradictions did you identify? | Contradiction pairs, found / half-found / missed |
| Which stakeholder perspective did you overvalue? | Stakeholders whose evidence dominates the cited five |
| What risks were underestimated? | Top pathway risks not submitted |
| Would a different recommendation also have been defensible? | Pathway defensibility table, scored against the team's evidence |

---

# TIME BUDGET

| Phase | Target |
|---|---|
| Briefing | 3 min |
| Investigation (12 actions) | 15 min |
| Recommendation | 5 min |
| Board review (3 challenges) | 3 min |
| Outcomes | 2 min |
| Debrief | 3–5 min |
| **Total** | **≈ 30 min** |

Content rules that protect the budget: answers of two sentences or fewer,
documents of three or four points, and a recommendation built by selecting
items rather than writing.

---

# OPEN QUESTIONS

1. Pathway D: confirm that students name the successor platform.
2. Should the implementation-strategy selector be retired (proposed above)?
3. Distractor assumptions: confirm the three types above.
4. Should the 10-dimension board scorecard be shown to students, or only
   in the debrief?
