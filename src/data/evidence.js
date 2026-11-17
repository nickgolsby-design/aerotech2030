// Evidence categories double as the platform comparison criteria groups.
export const categories = [
  { id: "strategy", label: "Strategy & Growth" },
  { id: "cost", label: "Cost & Finance" },
  { id: "manufacturing", label: "Manufacturing & CAM" },
  { id: "simulation", label: "Simulation & CAE" },
  { id: "workforce", label: "Workforce & Skills" },
  { id: "cybersecurity", label: "IT & Cybersecurity" },
  { id: "compliance", label: "Quality & Certification" },
  { id: "supplychain", label: "Customers & Supply Chain" }
];

// `critical` is hidden from students; later phases use it for scoring.
export const evidence = [
  // Strategy
  {
    id: "strategy-growth",
    category: "strategy",
    critical: false,
    text: "The Board wants AeroTech to expand into digitally-enabled aerospace programmes."
  },
  {
    id: "strategy-lost-bid",
    category: "strategy",
    critical: true,
    text: "AeroTech lost a 2025 bid partly because it lacked model-based definition (MBD) capability."
  },

  // Cost
  {
    id: "cost-approval",
    category: "cost",
    critical: true,
    text: "Projects above £5M require board approval and may delay implementation."
  },
  {
    id: "cost-productivity",
    category: "cost",
    critical: true,
    text: "The last ERP rollout cut engineering productivity by ~20% for six months, and none of it was budgeted."
  },
  {
    id: "cost-licence",
    category: "cost",
    critical: false,
    text: "Licences are typically only a third of total migration cost; services, training and lost productivity dominate."
  },
  {
    id: "cost-vendor-incentive",
    category: "cost",
    critical: false,
    text: "Vendors offer competitive-displacement discounts of up to 40% in year one, with higher renewal prices afterwards."
  },

  // Manufacturing
  {
    id: "mfg-cam-dependency",
    category: "manufacturing",
    critical: true,
    text: "Existing CAM workflows are heavily dependent on CATIA outputs."
  },
  {
    id: "mfg-downtime",
    category: "manufacturing",
    critical: true,
    text: "One week of CAM downtime would put ~£1.2M of deliveries at risk of late-delivery penalties."
  },

  // Simulation
  {
    id: "sim-tools",
    category: "simulation",
    critical: true,
    text: "Stress and thermal teams use Abaqus with associative links to CATIA-native geometry."
  },
  {
    id: "sim-rework",
    category: "simulation",
    critical: false,
    text: "Analysts spend ~30% of their time cleaning geometry translated between tools."
  },

  // Workforce
  {
    id: "wf-retirement",
    category: "workforce",
    critical: true,
    text: "Many senior CAD engineers are approaching retirement."
  },
  {
    id: "wf-training",
    category: "workforce",
    critical: true,
    text: "An experienced CAD engineer takes 3–6 months to reach full productivity on a new platform."
  },
  {
    id: "wf-change-fatigue",
    category: "workforce",
    critical: true,
    text: "The last staff survey flagged change fatigue; two key engineers cited it in exit interviews."
  },

  // Cybersecurity
  {
    id: "cyber-ageing",
    category: "cybersecurity",
    critical: false,
    text: "Cybersecurity concerns are increasing around ageing software."
  },
  {
    id: "cyber-support-end",
    category: "cybersecurity",
    critical: true,
    text: "Under sustaining support, security patches for new Windows releases are no longer guaranteed."
  },
  {
    id: "cyber-data-residency",
    category: "cybersecurity",
    critical: false,
    text: "Defence-related work requires export-controlled data to stay in UK-hosted environments."
  },

  // Compliance
  {
    id: "comp-certification",
    category: "compliance",
    critical: true,
    text: "Certification effort is frequently underestimated."
  },
  {
    id: "comp-traceability",
    category: "compliance",
    critical: true,
    text: "Every migrated production model must be re-verified against its released drawing under AS9100."
  },
  {
    id: "comp-legacy-data",
    category: "compliance",
    critical: true,
    text: "Over 40,000 V5 parts must remain retrievable and editable for in-service products for 25+ years."
  },

  // Supply chain
  {
    id: "supply-airbus-3dx",
    category: "supplychain",
    critical: true,
    text: "Airbus is moving key suppliers onto 3DEXPERIENCE-based collaboration for new programmes."
  },
  {
    id: "supply-native-format",
    category: "supplychain",
    critical: true,
    text: "Rolls-Royce contracts require native-format model exchange; translated models need customer approval."
  }
];

export const evidenceById = Object.fromEntries(
  evidence.map((item) => [item.id, item])
);
