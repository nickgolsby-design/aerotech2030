// Single source of stakeholder content.
// `id` is the stable key used for evidence de-duplication and React keys.
export const stakeholders = [
  {
    id: "ceo",
    name: "CEO",
    influence: 95,
    category: "future",
    evidence:
      "The Board wants AeroTech to expand into digitally-enabled aerospace programmes.",
    response: "Future competitiveness is my primary concern."
  },
  {
    id: "finance-director",
    name: "Finance Director",
    influence: 95,
    category: "cost",
    evidence:
      "Projects above £5M require board approval and may delay implementation.",
    response:
      "Migration costs must include licences, training and productivity loss."
  },
  {
    id: "manufacturing-director",
    name: "Manufacturing Director",
    influence: 85,
    category: "manufacturing",
    evidence: "Existing CAM workflows are heavily dependent on CATIA outputs.",
    response: "Production disruption is my biggest concern during migration."
  },
  {
    id: "chief-design-engineer",
    name: "Chief Design Engineer",
    influence: 90,
    category: "workforce",
    evidence: "Many senior CAD engineers are approaching retirement.",
    response: "Capability retention and productivity matter most."
  },
  {
    id: "it-manager",
    name: "IT Manager",
    influence: 75,
    category: "cybersecurity",
    evidence: "Cybersecurity concerns are increasing around ageing software.",
    response:
      "Support lifecycle and patching are becoming increasingly important."
  },
  {
    id: "quality-manager",
    name: "Quality Manager",
    influence: 80,
    category: "compliance",
    evidence: "Certification effort is frequently underestimated.",
    response: "Compliance and traceability cannot be compromised."
  }
];
