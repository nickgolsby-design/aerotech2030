// Descriptions of each platform option for players. Simplified for this
// case study; consistent with (but never revealing) the scores in
// platformProfiles.json.

export const platformInfo = {
  "Stay with CATIA V5": {
    vendor: "Dassault Systèmes",
    summary: "Keep the current platform and accept sustaining support.",
    strengths: [
      "No migration: data, CAM programs and simulation links stay as they are",
      "Staff are fully trained and productive today",
      "Lowest cost in the short term"
    ],
    concerns: [
      "No new capability while support is sustaining only",
      "Long-term compatibility and security updates aren't assured",
      "Defers, rather than avoids, the platform decision"
    ]
  },
  "3DEXPERIENCE": {
    vendor: "Dassault Systèmes",
    summary:
      "Dassault's successor platform, combining current-generation CATIA with integrated data management and collaboration.",
    strengths: [
      "Closest continuity with existing CATIA data and skills",
      "Integrated design, simulation and product data management",
      "Supports model-based definition (MBD) and online collaboration"
    ],
    concerns: [
      "Typically the highest licence and platform cost",
      "New data-management and working practices to learn",
      "Subscription pricing needs careful whole-life costing"
    ]
  },
  "Siemens NX": {
    vendor: "Siemens",
    summary:
      "Integrated CAD/CAM/CAE platform widely used in aerospace machining and manufacturing.",
    strengths: [
      "Strong CAM and manufacturing integration",
      "Strong simulation and mature MBD capability",
      "Well-supported, current releases"
    ],
    concerns: [
      "CATIA data must be translated and re-verified",
      "Significant retraining for experienced CATIA users",
      "Data exchange with customers on Dassault platforms needs planning"
    ]
  },
  "PTC Creo": {
    vendor: "PTC",
    summary:
      "Parametric CAD platform, usually paired with PTC's own data-management tools.",
    strengths: [
      "Competitive licensing",
      "Capable parametric modelling",
      "Well-supported, current releases"
    ],
    concerns: [
      "Weaker fit with AeroTech's current CAM workflows",
      "Limited alignment with AeroTech's key customers",
      "Full data migration and retraining required"
    ]
  }
};
