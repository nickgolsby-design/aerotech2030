// Board challenges: an executive challenge session, not a quiz.
// See design/BOARD_DECISION_FRAMEWORK.md.
//
// Each challenge offers two defensible positions and one weak position.
// Defensible positions take different sides of a real trade-off; which is
// stronger depends on what the team's investigation can support. The weak
// position sounds plausible but shows poor judgement (delegating, deferring
// responsibility, or ignoring evidence). Its place in the list varies, and
// every position states what it accepts, so layout gives nothing away.
//
// Challenge: { stakeholderId, dimension, text, tradeOff, positions[] }
//
// Position:
//   id, kind ("defensible" | "weak"), stance, argument, accepts
//   support[]      { label, evidence[] }: the kinds of evidence the argument
//                  needs, e.g. "customer evidence". The board reacts to each.
//   consult[]      stakeholders whose input grounds it; consulted once asked a
//                  probing or follow-up question
//   assumption     evidence id of the assumption it depends on; tested once
//                  that evidence has been found
//   conflictsWith  recommended platforms this argument sits awkwardly with
//   weakness       (weak positions) why the board finds it poor judgement

const STAY = "Stay with CATIA V5";

// The ten board dimensions (BOARD_DECISION_FRAMEWORK.md). The board probes
// the two where the team's investigation is thinnest.
export const dimensions = {
  "strategic-capability": "Strategic capability",
  "competitive-positioning": "Competitive positioning",
  "customer-requirements": "Customer requirements",
  "workforce-capability": "Workforce capability",
  "risk-exposure": "Risk exposure",
  "organisational-change": "Organisational change",
  compliance: "Compliance",
  "investment-governance": "Investment governance",
  "operational-continuity": "Operational continuity",
  "long-term-viability": "Long-term viability"
};

export const dimensionChallenges = {
  "strategic-capability": {
    stakeholderId: "ceo",
    text: "How does this recommendation position AeroTech for digitally-enabled programmes?",
    tradeOff: "Future capability vs operational continuity",
    positions: [
      {
        id: "capability-priority",
        kind: "defensible",
        stance: "Capability is the priority",
        argument: "Future competitiveness increasingly depends on digital collaboration and model-based capability. Customer evidence and the CEO's own view point the same way.",
        accepts: "A heavier change programme over the next two years.",
        support: [
          { label: "customer evidence", evidence: ["supply-collaboration", "supply-no-mandate"] },
          { label: "strategic evidence", evidence: ["strategy-capability", "strategy-lost-bid", "strategy-competitors"] }
        ],
        consult: ["ceo", "airbus-representative"],
        assumption: "assume-customer-static",
        conflictsWith: [STAY]
      },
      {
        id: "continuity-first",
        kind: "defensible",
        stance: "Continuity first, capability in steps",
        argument: "Digital capability matters, but implementation disruption is the more immediate business risk. We prioritised operational continuity and build capability in stages.",
        accepts: "Competitors may move faster in the meantime.",
        support: [
          { label: "operational evidence", evidence: ["mfg-production-continuity", "supply-delivery-first"] },
          { label: "engineering evidence", evidence: ["eng-productivity-dip", "cost-productivity"] }
        ],
        consult: ["manufacturing-director", "chief-design-engineer"],
        assumption: "assume-org-risk"
      },
      {
        id: "delegated",
        kind: "weak",
        stance: "Led by the engineering teams",
        argument: "Technology selection was largely delegated to the engineering teams, who know the tools best.",
        accepts: "Less Board involvement in technical detail.",
        weakness: "This treats a strategic capability decision as a technical one. The Board asked for a business judgement."
      }
    ]
  },

  "competitive-positioning": {
    stakeholderId: "ceo",
    text: "Competitors are investing in digital engineering. Are we catching up, or choosing a different way to compete?",
    tradeOff: "Matching competitors vs differentiating",
    positions: [
      {
        id: "follow-leader",
        kind: "weak",
        stance: "Follow the market leader",
        argument: "Choose whatever the largest competitor uses. It is the lowest-risk way to stay competitive.",
        accepts: "Less control over our own technology direction.",
        weakness: "Copying a competitor's choice doesn't test whether it fits AeroTech's customers, processes or people."
      },
      {
        id: "close-gap",
        kind: "defensible",
        stance: "Close the capability gap",
        argument: "We have already lost work for lack of model-based capability, and competitors are investing. Closing that gap protects future bids.",
        accepts: "Significant spend before the benefits show in contract wins.",
        support: [
          { label: "competitor evidence", evidence: ["strategy-competitors", "strategy-lost-bid"] },
          { label: "customer evidence", evidence: ["supply-collaboration"] }
        ],
        consult: ["ceo"],
        assumption: "assume-customer-static",
        conflictsWith: [STAY]
      },
      {
        id: "compete-on-delivery",
        kind: "defensible",
        stance: "Compete on delivery and reliability",
        argument: "Reliable delivery is what customers value most during change. We protect it, and build capability selectively.",
        accepts: "Being seen as less digitally advanced for a while.",
        support: [
          { label: "customer evidence", evidence: ["supply-delivery-first", "supply-no-mandate"] },
          { label: "operational evidence", evidence: ["mfg-production-continuity"] }
        ],
        consult: ["airbus-representative", "manufacturing-director"],
        assumption: "assume-customer-static"
      }
    ]
  },

  "customer-requirements": {
    stakeholderId: "airbus-representative",
    text: "How well will this recommendation serve your customers in ten years rather than one?",
    tradeOff: "Today's delivery vs tomorrow's collaboration",
    positions: [
      {
        id: "build-collaboration",
        kind: "defensible",
        stance: "Build the collaboration customers will expect",
        argument: "Customer expectations will move towards digital collaboration within the decade, so we invest now in model-based data and collaboration.",
        accepts: "Higher near-term disruption and cost.",
        support: [
          { label: "customer evidence", evidence: ["supply-collaboration"] },
          { label: "competitor evidence", evidence: ["strategy-lost-bid", "strategy-competitors"] }
        ],
        consult: ["airbus-representative", "ceo"],
        assumption: "assume-customer-static",
        conflictsWith: [STAY]
      },
      {
        id: "customers-adapt",
        kind: "weak",
        stance: "Customers will work with our choice",
        argument: "Customers will adapt to whatever platform AeroTech chooses. They need our parts.",
        accepts: "Some translation work for customers.",
        weakness: "This assumes customer power runs AeroTech's way, and ignores where supplier expectations are heading."
      },
      {
        id: "delivery-then-prove",
        kind: "defensible",
        stance: "Delivery first, proven customer by customer",
        argument: "Customers judge delivery before technology and don't mandate a tool. We protect delivery and prove data exchange with each customer.",
        accepts: "Slower progress on digital collaboration.",
        support: [
          { label: "customer evidence", evidence: ["supply-delivery-first", "supply-no-mandate"] },
          { label: "operational evidence", evidence: ["mfg-production-continuity"] }
        ],
        consult: ["airbus-representative"],
        assumption: "assume-customer-static"
      }
    ]
  },

  "workforce-capability": {
    stakeholderId: "hr-manager",
    text: "Who will train 220 engineers, and how do we keep the people who know how things really work?",
    tradeOff: "Retaining experience vs attracting new talent",
    positions: [
      {
        id: "knowledge-transfer",
        kind: "defensible",
        stance: "Two-way knowledge transfer",
        argument: "Train internal super-users first, and pair experienced engineers with graduates so knowledge passes in both directions.",
        accepts: "Experienced staff spend time teaching instead of delivering.",
        support: [
          { label: "workforce evidence", evidence: ["wf-retirement", "wf-training-burden"] },
          { label: "early-career evidence", evidence: ["wf-graduate-appeal", "wf-recruitment"] }
        ],
        consult: ["hr-manager", "graduate-engineer"],
        assumption: "assume-productivity"
      },
      {
        id: "capture-first",
        kind: "defensible",
        stance: "Capture knowledge before changing anything",
        argument: "Document the undocumented workflows and plan succession first. The retirement risk exists whatever platform we choose.",
        accepts: "Months of effort before the change itself begins.",
        support: [
          { label: "workforce evidence", evidence: ["wf-retirement", "wf-personal-workflows"] },
          { label: "manufacturing evidence", evidence: ["mfg-hidden-knowledge"] }
        ],
        consult: ["hr-manager", "senior-cad-engineer"],
        assumption: "assume-acceptance"
      },
      {
        id: "vendor-training",
        kind: "weak",
        stance: "Use the vendor's training programme",
        argument: "The vendor's standard training courses will bring everyone up to speed.",
        accepts: "A training budget line for each engineer.",
        weakness: "This treats a capability and morale problem as a course booking. It ignores retirement risk and the time engineers need to recover productivity."
      }
    ]
  },

  "risk-exposure": {
    stakeholderId: "finance-director",
    text: "Where is this recommendation most exposed, and how have you bounded that exposure?",
    tradeOff: "Bounding risk vs speed of benefit",
    positions: [
      {
        id: "fixed-price",
        kind: "weak",
        stance: "Transfer the risk to the vendor",
        argument: "A fixed-price implementation contract transfers the risk to the vendor.",
        accepts: "A premium on the implementation contract.",
        weakness: "Licences and implementation are the smaller part of the cost. Productivity loss, validation and change effort stay with AeroTech."
      },
      {
        id: "stage-gated",
        kind: "defensible",
        stance: "Stage-gate the exposure",
        argument: "Release funding in stages tied to pilot results, so the Board commits further only once productivity and validation costs are proven.",
        accepts: "Slower benefits, and momentum lost between gates.",
        support: [
          { label: "financial evidence", evidence: ["cost-approval", "cost-productivity"] },
          { label: "manufacturing evidence", evidence: ["mfg-validation"] }
        ],
        consult: ["finance-director"],
        assumption: "assume-quick-benefits"
      },
      {
        id: "organisational-exposure",
        kind: "defensible",
        stance: "The exposure is mostly organisational",
        argument: "The biggest exposure is people and process, not technology, so we hold contingency for productivity loss and change support.",
        accepts: "A larger contingency that may look excessive.",
        support: [
          { label: "financial evidence", evidence: ["cost-change-share", "cost-productivity"] },
          { label: "engineering evidence", evidence: ["eng-productivity-dip"] }
        ],
        consult: ["finance-director", "chief-design-engineer"],
        assumption: "assume-org-risk"
      }
    ]
  },

  "organisational-change": {
    stakeholderId: "chief-design-engineer",
    text: "Several of my senior engineers expect this to be reversed. How will you bring them with you?",
    tradeOff: "Pace of change vs acceptance",
    positions: [
      {
        id: "involve-sceptics",
        kind: "defensible",
        stance: "Involve the sceptics early",
        argument: "Bring senior engineers into selecting and piloting the platform. Their knowledge and their acceptance both matter.",
        accepts: "Slower decisions and more consultation.",
        support: [
          { label: "workforce evidence", evidence: ["wf-personal-workflows", "wf-retirement"] },
          { label: "engineering evidence", evidence: ["eng-productivity-dip"] }
        ],
        consult: ["senior-cad-engineer", "chief-design-engineer"],
        assumption: "assume-acceptance"
      },
      {
        id: "mandate",
        kind: "weak",
        stance: "Set a firm go-live date",
        argument: "Set a firm go-live date and expect line managers to handle resistance.",
        accepts: "Some short-term friction in the teams.",
        weakness: "Mandated change without involvement drives workarounds and quiet resistance, especially where knowledge sits with a few experts."
      },
      {
        id: "sponsor-and-show",
        kind: "defensible",
        stance: "Visible sponsorship and early wins",
        argument: "CEO-led sponsorship and a pilot with a willing team, so change spreads from visible success rather than instruction.",
        accepts: "The sceptics are won over later, not first.",
        support: [
          { label: "strategic evidence", evidence: ["strategy-capability", "strategy-board-deferral"] },
          { label: "early-career evidence", evidence: ["wf-graduate-appeal"] }
        ],
        consult: ["ceo", "graduate-engineer"],
        assumption: "assume-org-risk"
      }
    ]
  },

  compliance: {
    stakeholderId: "quality-manager",
    text: "What evidence supports your confidence in compliance continuity?",
    tradeOff: "Protecting governance vs speed of improvement",
    positions: [
      {
        id: "prove-traceability",
        kind: "defensible",
        stance: "Prove traceability before scaling",
        argument: "Migrate one released configuration end to end and have it audited before any wider migration.",
        accepts: "A slower rollout.",
        support: [
          { label: "quality evidence", evidence: ["comp-traceability", "comp-certification", "comp-legacy-data"] }
        ],
        consult: ["quality-manager"],
        assumption: "assume-workflows"
      },
      {
        id: "governance-workstream",
        kind: "defensible",
        stance: "Fund governance as a workstream",
        argument: "Procedure rewrites, training records and audit evidence are planned and funded as their own workstream.",
        accepts: "Cost and time that engineering plans usually leave out.",
        support: [
          { label: "quality evidence", evidence: ["comp-governance-work", "comp-certification"] },
          { label: "financial evidence", evidence: ["cost-change-share"] }
        ],
        consult: ["quality-manager", "finance-director"],
        assumption: "assume-quick-benefits"
      },
      {
        id: "vendor-certified",
        kind: "weak",
        stance: "Rely on the platform's track record",
        argument: "The platform is already used by certified aerospace suppliers, so compliance is covered.",
        accepts: "Less quality effort during the transition.",
        weakness: "Certification belongs to AeroTech's processes, not the software. Procedures, records and traceability still have to be rebuilt."
      }
    ]
  },

  "investment-governance": {
    stakeholderId: "finance-director",
    text: "How should the Board govern an investment of this size?",
    tradeOff: "Control vs momentum",
    positions: [
      {
        id: "full-budget",
        kind: "weak",
        stance: "Approve the full budget now",
        argument: "Approve the full budget upfront to avoid delays, and review at the end of the programme.",
        accepts: "Less Board oversight during delivery.",
        weakness: "This removes the Board's ability to stop or redirect spending just when uncertainty is highest."
      },
      {
        id: "gates-and-exits",
        kind: "defensible",
        stance: "Stage gates with exit criteria",
        argument: "Each phase is funded separately, with criteria agreed in advance for continuing, re-planning or stopping.",
        accepts: "Gate reviews slow the programme down.",
        support: [
          { label: "financial evidence", evidence: ["cost-approval", "cost-capability-tradeoff"] },
          { label: "Board expectations", evidence: ["strategy-board-deferral"] }
        ],
        consult: ["finance-director", "ceo"],
        assumption: "assume-quick-benefits"
      },
      {
        id: "whole-change",
        kind: "defensible",
        stance: "Budget for the whole change",
        argument: "The business case funds training, process redesign and productivity loss explicitly, not just licences and hardware.",
        accepts: "A larger headline number facing enhanced scrutiny.",
        support: [
          { label: "financial evidence", evidence: ["cost-change-share", "cost-productivity"] },
          { label: "workforce evidence", evidence: ["wf-training-burden"] }
        ],
        consult: ["finance-director", "hr-manager"],
        assumption: "assume-org-risk"
      }
    ]
  },

  "operational-continuity": {
    stakeholderId: "manufacturing-director",
    text: "What happens if implementation impacts production delivery?",
    tradeOff: "Protecting delivery vs pace of change",
    positions: [
      {
        id: "manufacturing-last",
        kind: "defensible",
        stance: "Manufacturing moves last",
        argument: "CAM stays on the current system until each NC program family has been re-verified in a pilot.",
        accepts: "Two systems in parallel, and integration benefits later.",
        support: [
          { label: "manufacturing evidence", evidence: ["mfg-production-continuity", "mfg-validation"] },
          { label: "customer evidence", evidence: ["supply-delivery-first"] }
        ],
        consult: ["manufacturing-director"],
        assumption: "assume-workflows"
      },
      {
        id: "summer-shutdown",
        kind: "weak",
        stance: "Cut over in the summer shutdown",
        argument: "Do the whole cut-over during the two-week summer shutdown so production isn't affected.",
        accepts: "An intense fortnight for the engineering teams.",
        weakness: "Hundreds of NC programs need re-verifying and undocumented macros need rebuilding. Two weeks moves the risk; it doesn't remove it."
      },
      {
        id: "new-programme",
        kind: "defensible",
        stance: "Start on a new programme",
        argument: "The new platform starts on a new programme. Live work, including Abaqus-linked analysis, stays where it is until rebuilt and validated.",
        accepts: "Two environments for several years.",
        support: [
          { label: "engineering evidence", evidence: ["sim-integration", "eng-productivity-dip"] },
          { label: "manufacturing evidence", evidence: ["mfg-production-continuity"] }
        ],
        consult: ["chief-design-engineer", "manufacturing-director"],
        assumption: "assume-productivity"
      }
    ]
  },

  "long-term-viability": {
    stakeholderId: "it-manager",
    text: "Will this recommendation still be supportable, and still right, in ten years?",
    tradeOff: "Short-term stability vs long-term supportability",
    positions: [
      {
        id: "supported-platform",
        kind: "defensible",
        stance: "Move onto a supported future",
        argument: "V5 is entering sustaining support and graduates expect modern tools. A supported platform protects both security and recruitment.",
        accepts: "Migration effort now, rather than later.",
        support: [
          { label: "IT evidence", evidence: ["cyber-support-end", "cyber-lifecycle"] },
          { label: "workforce evidence", evidence: ["wf-recruitment"] }
        ],
        consult: ["it-manager", "hr-manager"],
        assumption: "assume-customer-static",
        conflictsWith: [STAY]
      },
      {
        id: "revisit-later",
        kind: "weak",
        stance: "Keep options open",
        argument: "Software can always be changed later if the situation changes.",
        accepts: "Some uncertainty about the long-term platform.",
        weakness: "Each year on an ageing platform raises the eventual migration cost and widens the skills gap. Keeping options open is still a decision."
      },
      {
        id: "bridge-with-date",
        kind: "defensible",
        stance: "A stable bridge with a decision date",
        argument: "Keep today's environment stable while retiring unsupported builds and documenting knowledge, with a firm date to commit.",
        accepts: "Capability gains are deferred.",
        support: [
          { label: "IT evidence", evidence: ["cyber-ageing", "cyber-support-end"] },
          { label: "manufacturing evidence", evidence: ["mfg-hidden-knowledge"] }
        ],
        consult: ["it-manager", "manufacturing-director"],
        assumption: "assume-org-risk"
      }
    ]
  }
};

// Judgement challenges test the reasoning behind the recommendation. One is
// asked last, chosen by selectChallenges in outcomeEngine.js.
export const judgementChallenges = {
  assumptions: {
    stakeholderId: "ceo",
    text: "What assumptions underpin this recommendation?",
    tradeOff: "Confidence vs humility",
    positions: [
      {
        id: "people-assumptions",
        kind: "defensible",
        stance: "Productivity and acceptance",
        argument: "We are assuming productivity recovers within 12–18 months and that senior engineers accept the change. The pilot is designed to test both.",
        accepts: "Admitting the plan could slip.",
        support: [
          { label: "engineering evidence", evidence: ["assume-productivity", "eng-productivity-dip"] },
          { label: "workforce evidence", evidence: ["assume-acceptance", "wf-personal-workflows"] }
        ],
        consult: ["chief-design-engineer", "senior-cad-engineer"],
        assumption: "assume-productivity"
      },
      {
        id: "no-assumptions",
        kind: "weak",
        stance: "The case rests on evidence",
        argument: "The recommendation rests on the evidence we gathered; there are no major assumptions.",
        accepts: "Less discussion of uncertainty.",
        weakness: "Every recommendation rests on assumptions. Claiming none suggests they haven't been examined."
      },
      {
        id: "market-assumptions",
        kind: "defensible",
        stance: "Customers and cost",
        argument: "We assume customer expectations will keep moving towards digital collaboration, and that benefits won't arrive quickly. The case is built to survive if either is wrong.",
        accepts: "A more cautious benefits forecast.",
        support: [
          { label: "customer evidence", evidence: ["assume-customer-static", "supply-collaboration"] },
          { label: "financial evidence", evidence: ["assume-quick-benefits", "cost-productivity"] }
        ],
        consult: ["airbus-representative", "finance-director"],
        assumption: "assume-customer-static"
      }
    ]
  },

  "change-your-mind": {
    stakeholderId: "finance-director",
    text: "What evidence would make you change your recommendation?",
    tradeOff: "Conviction vs openness",
    positions: [
      {
        id: "pilot-tripwires",
        kind: "defensible",
        stance: "Pilot results we would act on",
        argument: "If productivity recovers far slower than planned, or traceability can't be maintained, we would slow or stop at the next gate.",
        accepts: "The Board may see the plan change.",
        support: [
          { label: "engineering evidence", evidence: ["eng-productivity-dip", "assume-productivity"] },
          { label: "quality evidence", evidence: ["comp-traceability"] }
        ],
        consult: ["chief-design-engineer", "quality-manager"],
        assumption: "assume-productivity"
      },
      {
        id: "customer-tripwires",
        kind: "defensible",
        stance: "Customer signals we would act on",
        argument: "If customers made clear that delivery mattered far more than digital capability, we would re-phase towards continuity.",
        accepts: "Our direction depends partly on customers.",
        support: [
          { label: "customer evidence", evidence: ["supply-delivery-first", "supply-collaboration"] }
        ],
        consult: ["airbus-representative"],
        assumption: "assume-customer-static"
      },
      {
        id: "confident",
        kind: "weak",
        stance: "We are confident in the conclusion",
        argument: "The evidence is clear enough that we don't expect to change our view.",
        accepts: "Less flexibility later.",
        weakness: "A recommendation without stated tripwires can't be governed. The Board needs to know what would trigger a rethink."
      }
    ]
  },

  "unresolved-risks": {
    stakeholderId: "quality-manager",
    text: "What risks remain unresolved in your recommendation?",
    tradeOff: "Completeness vs focus",
    positions: [
      {
        id: "risks-covered",
        kind: "weak",
        stance: "Our mitigations cover them",
        argument: "Our three mitigations address the risks; nothing significant remains.",
        accepts: "Little contingency for the unexpected.",
        weakness: "No plan resolves every risk. Claiming full coverage suggests residual risk hasn't been thought through."
      },
      {
        id: "revalidation",
        kind: "defensible",
        stance: "Manufacturing re-validation",
        argument: "Re-verifying NC programs and rebuilding undocumented post-processors isn't fully sized. It is the first thing the pilot must measure.",
        accepts: "Open questions in the business case.",
        support: [
          { label: "manufacturing evidence", evidence: ["mfg-validation", "mfg-hidden-knowledge"] }
        ],
        consult: ["manufacturing-director"],
        assumption: "assume-workflows"
      },
      {
        id: "governance-evidence",
        kind: "defensible",
        stance: "Governance and audit evidence",
        argument: "Rewriting procedures and proving traceability is unresolved. Quality signs off before each phase proceeds.",
        accepts: "Quality can hold up the programme.",
        support: [
          { label: "quality evidence", evidence: ["comp-governance-work", "comp-traceability"] }
        ],
        consult: ["quality-manager"],
        assumption: "assume-quick-benefits"
      }
    ]
  },

  "act-now": {
    stakeholderId: "ceo",
    text: "Why act now rather than defer the decision?",
    tradeOff: "Cost of action vs cost of delay",
    positions: [
      {
        id: "delay-costs",
        kind: "defensible",
        stance: "Delay makes the move harder",
        argument: "V5 is entering sustaining support and key experts may retire within five years. Every year of delay raises the cost of the eventual move.",
        accepts: "Taking on change during busy delivery years.",
        support: [
          { label: "IT evidence", evidence: ["cyber-support-end"] },
          { label: "workforce evidence", evidence: ["wf-retirement", "wf-recruitment"] }
        ],
        consult: ["it-manager", "hr-manager"],
        assumption: "assume-org-risk"
      },
      {
        id: "discount",
        kind: "weak",
        stance: "The commercial window is now",
        argument: "The vendor's discount is only available this year.",
        accepts: "Committing on the vendor's timetable.",
        weakness: "A time-limited discount is a sales tactic, not a strategic reason. Licences are a small part of the real cost."
      },
      {
        id: "market-wont-wait",
        kind: "defensible",
        stance: "Customers and competitors won't wait",
        argument: "We have already lost work on capability, competitors are investing, and customer expectations are moving.",
        accepts: "Acting before every uncertainty is resolved.",
        support: [
          { label: "competitor evidence", evidence: ["strategy-lost-bid", "strategy-competitors"] },
          { label: "customer evidence", evidence: ["supply-collaboration"] }
        ],
        consult: ["ceo", "airbus-representative"],
        assumption: "assume-customer-static"
      }
    ]
  },

  defer: {
    stakeholderId: "ceo",
    text: "Why defer, when the platform is entering sustaining support?",
    tradeOff: "Stability now vs capability later",
    positions: [
      {
        id: "bridge",
        kind: "defensible",
        stance: "A bridge, with a decision date",
        argument: "We stay for now, but with a firm decision point, retiring unsupported builds and preparing the move in the meantime.",
        accepts: "Capability gains are deferred.",
        support: [
          { label: "IT evidence", evidence: ["cyber-support-end", "cyber-ageing"] },
          { label: "Board expectations", evidence: ["strategy-board-deferral"] }
        ],
        consult: ["ceo", "it-manager"],
        assumption: "assume-org-risk"
      },
      {
        id: "still-works",
        kind: "weak",
        stance: "V5 still meets our needs",
        argument: "V5 still does everything we need today.",
        accepts: "Revisiting the question in a few years.",
        weakness: "Today's fitness isn't the question. Support, skills and customer direction are all moving."
      },
      {
        id: "stability-now",
        kind: "defensible",
        stance: "Delivery stability matters most now",
        argument: "With live Airbus work and production that can't pause, stability is the responsible choice for the next two years.",
        accepts: "Falling further behind competitors.",
        support: [
          { label: "operational evidence", evidence: ["mfg-production-continuity", "supply-delivery-first"] },
          { label: "engineering evidence", evidence: ["eng-productivity-dip"] }
        ],
        consult: ["manufacturing-director", "airbus-representative"],
        assumption: "assume-customer-static"
      }
    ]
  },

  dissent: {
    stakeholderId: "ceo",
    text: "Which stakeholder would disagree most strongly with your conclusion, and why?",
    tradeOff: "Consensus vs conviction",
    positions: [
      {
        id: "manufacturing-dissent",
        kind: "defensible",
        stance: "Manufacturing, on delivery risk",
        argument: "The Manufacturing Director would push back hardest: production can't pause, and much process knowledge is undocumented. Our phasing is designed around that objection.",
        accepts: "Manufacturing sets the pace.",
        support: [
          { label: "manufacturing evidence", evidence: ["mfg-production-continuity", "mfg-hidden-knowledge"] }
        ],
        consult: ["manufacturing-director"],
        assumption: "assume-workflows",
        conflictsWith: [STAY]
      },
      {
        id: "finance-dissent",
        kind: "defensible",
        stance: "Finance, on hidden costs",
        argument: "The Finance Director would challenge the cost: productivity loss and change effort exceed the licences. We have funded them explicitly.",
        accepts: "A larger budget request.",
        support: [
          { label: "financial evidence", evidence: ["cost-productivity", "cost-change-share"] }
        ],
        consult: ["finance-director"],
        assumption: "assume-quick-benefits",
        conflictsWith: [STAY]
      },
      {
        id: "no-dissent",
        kind: "weak",
        stance: "There was broad agreement",
        argument: "We found broad agreement across the stakeholders we spoke to.",
        accepts: "Little time spent on objections.",
        weakness: "Stakeholders in this case want different things. Finding no dissent suggests the investigation heard only part of the organisation."
      }
    ]
  }
};

// Short statements of the beliefs behind each assumption evidence item, used
// when the board points out an untested assumption.
export const assumptionBeliefs = {
  "assume-productivity": "new software automatically improves productivity",
  "assume-workflows": "existing workflows can be recreated easily",
  "assume-acceptance": "engineers will accept the change",
  "assume-customer-static": "customer expectations will stay as they are",
  "assume-training-only": "training alone can close the skills gap",
  "assume-org-risk": "technology risk is bigger than organisational risk",
  "assume-quick-benefits": "benefits will appear quickly without disruption"
};

// Two dimension challenges (the thinnest areas) plus one judgement challenge.
export const DIMENSION_CHALLENGE_COUNT = 2;

// Evidence a team may cite in support of one argument.
export const MAX_CITED_EVIDENCE = 2;
