// Platform options in the order they appear in the recommendation list.
export const platforms = [
  "Stay with CATIA V5",
  "3DEXPERIENCE",
  "Siemens NX",
  "PTC Creo"
];

// Scores (0–10) used by the outcome engine in later phases.
export const platformProfiles = {
  "Stay with CATIA V5": {
    cost: 10,
    manufacturing: 9,
    future: 2
  },

  "3DEXPERIENCE": {
    cost: 5,
    manufacturing: 7,
    future: 10
  },

  "Siemens NX": {
    cost: 5,
    manufacturing: 10,
    future: 9
  },

  // Provisional values — to be reviewed with the module tutor.
  "PTC Creo": {
    cost: 6,
    manufacturing: 7,
    future: 7
  }
};
