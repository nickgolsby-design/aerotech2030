export const stakeholders = [
  {
    id: 1,
    name: "Finance Director",
    influence: 95,

    evidence: {
      text: "Projects above £5M require additional board approval.",
      category: "cost",
      weight: 10
    },

    responses: {
      cost: [
        "Licence costs are only a fraction of programme costs.",
        "Training and productivity losses must also be considered."
      ],

      budget: [
        "Board scrutiny increases significantly beyond £5M."
      ]
    }
  },

  {
    id: 2,
    name: "Manufacturing Director",
    influence: 85,

    evidence: {
      text: "Existing CAM workflows depend on CATIA outputs.",
      category: "manufacturing",
      weight: 10
    },

    responses: {
      manufacturing: [
        "Production disruption is my largest concern."
      ],

      cam: [
        "CAM migration could affect established processes."
      ]
    }
  }
];
