// Platform options in the order they appear in the recommendation list.
export const platforms = [
  "Stay with CATIA V5",
  "3DEXPERIENCE",
  "Siemens NX",
  "PTC Creo"
];

// Comparison criteria. Each is revealed in the comparison matrix once the
// team has gathered at least one evidence item in its `category`.
export const criteria = [
  { id: "cost", label: "Cost of ownership", category: "cost" },
  { id: "manufacturing", label: "Manufacturing / CAM continuity", category: "manufacturing" },
  { id: "simulation", label: "Simulation integration", category: "simulation" },
  { id: "future", label: "Strategic fit", category: "strategy" },
  { id: "compliance", label: "Certification & data continuity", category: "compliance" },
  { id: "supplychain", label: "Customer alignment", category: "supplychain" },
  { id: "security", label: "Security & vendor support", category: "cybersecurity" },
  { id: "change", label: "Ease of change for staff", category: "workforce" }
];

// Scores 0–10, higher is better. cost/manufacturing/future are the original
// values; the remaining criteria (and all PTC Creo values) are provisional
// and should be reviewed with the module tutor.
export const platformProfiles = {
  "Stay with CATIA V5": {
    cost: 10,
    manufacturing: 9,
    future: 2,
    simulation: 6,
    compliance: 7,
    supplychain: 5,
    security: 2,
    change: 10
  },

  "3DEXPERIENCE": {
    cost: 5,
    manufacturing: 7,
    future: 10,
    simulation: 8,
    compliance: 9,
    supplychain: 9,
    security: 8,
    change: 6
  },

  "Siemens NX": {
    cost: 5,
    manufacturing: 10,
    future: 9,
    simulation: 8,
    compliance: 8,
    supplychain: 7,
    security: 8,
    change: 3
  },

  "PTC Creo": {
    cost: 6,
    manufacturing: 7,
    future: 7,
    simulation: 6,
    compliance: 7,
    supplychain: 4,
    security: 8,
    change: 3
  }
};
