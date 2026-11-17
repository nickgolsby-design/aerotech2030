// Single source of stakeholder content.
//
// Each question has a hidden `trustDelta`: open, well-framed questions build
// trust; probing questions cost a little; leading questions damage it.
// `evidence` lists evidence ids (see evidence.js) the answer reveals.
export const stakeholders = [
  {
    id: "ceo",
    name: "CEO",
    role: "Sets strategic direction; chairs the board.",
    influence: 95,
    initialTrust: 55,
    category: "strategy",
    questions: [
      {
        id: "ceo-success",
        text: "What does success look like for AeroTech in 2030?",
        trustDelta: 5,
        response:
          "Future competitiveness is my primary concern. We can't stay a build-to-print shop forever.",
        evidence: ["strategy-growth"]
      },
      {
        id: "ceo-customers",
        text: "Which customer programmes are driving the timing of this decision?",
        trustDelta: -5,
        response:
          "Frankly, Airbus. Their supplier team has been clear about where new programme collaboration is heading.",
        evidence: ["supply-airbus-3dx"]
      },
      {
        id: "ceo-leading",
        text: "Surely staying on CATIA V5 is the safest option?",
        trustDelta: -15,
        response:
          "If I wanted the safe answer I wouldn't have hired consultants.",
        evidence: []
      }
    ]
  },
  {
    id: "finance-director",
    name: "Finance Director",
    role: "Owns the investment case and capital approval.",
    influence: 95,
    initialTrust: 45,
    category: "cost",
    questions: [
      {
        id: "fd-investment-case",
        text: "How will the board judge the investment case?",
        trustDelta: 5,
        response:
          "Migration costs must include licences, training and productivity loss. And mind the approval threshold.",
        evidence: ["cost-approval"]
      },
      {
        id: "fd-hidden-costs",
        text: "What hidden costs have hurt previous IT projects here?",
        trustDelta: -5,
        response:
          "The ERP rollout. Nobody budgeted for engineers being slower for half a year. I won't approve that mistake twice.",
        evidence: ["cost-productivity"]
      },
      {
        id: "fd-leading",
        text: "So the budget is flexible if the case is strong enough?",
        trustDelta: -15,
        response: "No budget is flexible. Let's move on.",
        evidence: []
      }
    ]
  },
  {
    id: "manufacturing-director",
    name: "Manufacturing Director",
    role: "Runs machining and assembly across two sites.",
    influence: 85,
    initialTrust: 50,
    category: "manufacturing",
    questions: [
      {
        id: "mfg-data-flow",
        text: "Can you walk me through how CAD data reaches the shop floor?",
        trustDelta: 5,
        response:
          "Production disruption is my biggest concern during migration. Every NC program starts from a CATIA model.",
        evidence: ["mfg-cam-dependency"]
      },
      {
        id: "mfg-downtime",
        text: "What would a week of CAM downtime actually cost?",
        trustDelta: -5,
        response:
          "Let me pull the order book... over a million pounds of deliveries exposed to penalties.",
        evidence: ["mfg-downtime"]
      },
      {
        id: "mfg-leading",
        text: "Could production simply pause during the cut-over?",
        trustDelta: -15,
        response: "Have you ever run a factory? No.",
        evidence: []
      }
    ]
  },
  {
    id: "chief-design-engineer",
    name: "Chief Design Engineer",
    role: "Leads 60 design engineers; owns CAD standards.",
    influence: 90,
    initialTrust: 50,
    category: "workforce",
    questions: [
      {
        id: "cde-team",
        text: "What makes your design team effective today?",
        trustDelta: 5,
        response:
          "Capability retention and productivity matter most. Our best people carry 20 years of V5 know-how.",
        evidence: ["wf-retirement"]
      },
      {
        id: "cde-legacy",
        text: "How much legacy V5 data must remain usable after a migration?",
        trustDelta: -5,
        response:
          "All of it, effectively. Our parts fly for decades and we must support them.",
        evidence: ["comp-legacy-data"]
      },
      {
        id: "cde-leading",
        text: "Your engineers will adapt quickly to any tool, won't they?",
        trustDelta: -15,
        response: "That's a very consultant thing to say.",
        evidence: []
      }
    ]
  },
  {
    id: "it-manager",
    name: "IT Manager",
    role: "Responsible for infrastructure, licensing servers and security.",
    influence: 75,
    initialTrust: 60,
    category: "cybersecurity",
    questions: [
      {
        id: "it-concerns",
        text: "What concerns you most about the current engineering IT estate?",
        trustDelta: 5,
        response:
          "Support lifecycle and patching are becoming increasingly important.",
        evidence: ["cyber-ageing"]
      },
      {
        id: "it-support-end",
        text: "What changes, technically, once V5 enters sustaining support?",
        trustDelta: 0,
        response:
          "We lose guarantees on compatibility with new Windows builds, and that drives our patch schedule.",
        evidence: ["cyber-support-end"]
      },
      {
        id: "it-leading",
        text: "Moving everything to the cloud would solve the security issues, right?",
        trustDelta: -10,
        response:
          "Not for us. Some of our data is export-controlled and has to stay onshore.",
        evidence: ["cyber-data-residency"]
      }
    ]
  },
  {
    id: "quality-manager",
    name: "Quality Manager",
    role: "Owns AS9100 certification and customer audits.",
    influence: 80,
    initialTrust: 45,
    category: "compliance",
    questions: [
      {
        id: "qm-certification",
        text: "How does the CAD platform affect your certification work?",
        trustDelta: 5,
        response:
          "Compliance and traceability cannot be compromised. People always underestimate this part.",
        evidence: ["comp-certification"]
      },
      {
        id: "qm-traceability",
        text: "What happens to the audit trail when models are migrated?",
        trustDelta: -5,
        response:
          "Every production model has to be re-verified. That's a lot of inspection hours.",
        evidence: ["comp-traceability"]
      },
      {
        id: "qm-leading",
        text: "Certification is mostly paperwork, isn't it?",
        trustDelta: -20,
        response: "I think we're done here.",
        evidence: []
      }
    ]
  },
  {
    id: "cae-lead",
    name: "Simulation (CAE) Lead",
    role: "Leads stress, thermal and fatigue analysis.",
    influence: 70,
    initialTrust: 50,
    category: "simulation",
    questions: [
      {
        id: "cae-tools",
        text: "Which analysis tools does your team depend on?",
        trustDelta: 5,
        response:
          "Abaqus, mainly, linked directly to CATIA geometry. Break that link and we're redrawing everything.",
        evidence: ["sim-tools"]
      },
      {
        id: "cae-rework",
        text: "How much time goes into preparing geometry for analysis?",
        trustDelta: -5,
        response: "Too much. Translation clean-up eats roughly a third of our week.",
        evidence: ["sim-rework"]
      },
      {
        id: "cae-leading",
        text: "Simulation is secondary to design in this decision, isn't it?",
        trustDelta: -15,
        response: "Tell that to the certification authority.",
        evidence: []
      }
    ]
  },
  {
    id: "hr-training-manager",
    name: "HR & Training Manager",
    role: "Manages skills, recruitment and staff engagement.",
    influence: 60,
    initialTrust: 55,
    category: "workforce",
    questions: [
      {
        id: "hr-readiness",
        text: "How ready is the workforce for a major tool change?",
        trustDelta: 5,
        response:
          "Ready to learn, but realistic timelines are months, not weeks.",
        evidence: ["wf-training"]
      },
      {
        id: "hr-survey",
        text: "What did staff say in the most recent engagement survey?",
        trustDelta: -5,
        response:
          "Change fatigue came up a lot. We've already lost two good engineers who mentioned it.",
        evidence: ["wf-change-fatigue"]
      },
      {
        id: "hr-leading",
        text: "A week of online courses should cover the training, surely?",
        trustDelta: -10,
        response: "I'll pretend you didn't say that.",
        evidence: []
      }
    ]
  },
  {
    id: "customer-programmes-director",
    name: "Customer Programmes Director",
    role: "Manages Airbus and Rolls-Royce relationships and bids.",
    influence: 85,
    initialTrust: 45,
    category: "supplychain",
    questions: [
      {
        id: "cpd-expectations",
        text: "What do key customers expect from suppliers' digital tools?",
        trustDelta: 5,
        response:
          "Native data, increasingly. Translations need sign-off and that slows every change.",
        evidence: ["supply-native-format"]
      },
      {
        id: "cpd-lost-bids",
        text: "Have you lost any bids because of digital capability?",
        trustDelta: -5,
        response:
          "One last year. The customer wanted model-based definition and we couldn't offer it.",
        evidence: ["strategy-lost-bid"]
      },
      {
        id: "cpd-leading",
        text: "Customers will accept neutral STEP files, won't they?",
        trustDelta: -15,
        response: "You clearly haven't read their supplier manuals.",
        evidence: []
      }
    ]
  },
  {
    id: "procurement-manager",
    name: "Procurement Manager",
    role: "Negotiates software and services contracts.",
    influence: 55,
    initialTrust: 60,
    category: "cost",
    questions: [
      {
        id: "proc-licences",
        text: "How are engineering software costs structured today?",
        trustDelta: 5,
        response:
          "Licences are the visible bit. Services and training are where budgets usually break.",
        evidence: ["cost-licence"]
      },
      {
        id: "proc-leverage",
        text: "What negotiating leverage do we have with vendors?",
        trustDelta: 0,
        response:
          "Plenty in year one. Everyone wants to displace a competitor. Watch the renewal terms though.",
        evidence: ["cost-vendor-incentive"]
      },
      {
        id: "proc-leading",
        text: "Can't we just sign the cheapest quote?",
        trustDelta: -10,
        response: "Cheapest to sign is rarely cheapest to own.",
        evidence: []
      }
    ]
  }
];

export const stakeholdersById = Object.fromEntries(
  stakeholders.map((stakeholder) => [stakeholder.id, stakeholder])
);

// Which stakeholder can reveal each evidence item.
export const evidenceSource = Object.fromEntries(
  stakeholders.flatMap((stakeholder) =>
    stakeholder.questions.flatMap((question) =>
      question.evidence.map((evidenceId) => [evidenceId, stakeholder.name])
    )
  )
);

export const GUARDED_RESPONSE =
  "I'm not comfortable going into detail on that with you right now.";
