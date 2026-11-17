// Board challenges. Category challenges are raised for the areas the team
// investigated least; one platform challenge is always raised.
// Option `quality`: 1 strong, 0.5 weak, 0 poor (hidden from students).

export const categoryChallenges = {
  cost: {
    stakeholderId: "finance-director",
    text: "Your case doesn't show the full cost. What happens to engineering output during the transition?",
    options: [
      { id: "a", text: "The vendor's year-one discount should cover it.", quality: 0.5 },
      {
        id: "b",
        text: "We will budget a productivity contingency and release funding through board stage gates.",
        quality: 1
      },
      { id: "c", text: "With good training, productivity should be unaffected.", quality: 0 }
    ]
  },
  manufacturing: {
    stakeholderId: "manufacturing-director",
    text: "How will you protect deliveries while CAM programs move to the new platform?",
    options: [
      {
        id: "a",
        text: "Pilot one part family, parallel-run NC output and cut over only after verification.",
        quality: 1
      },
      { id: "b", text: "Production will adapt once the new system is live.", quality: 0 },
      { id: "c", text: "Schedule the cut-over for the summer shutdown.", quality: 0.5 }
    ]
  },
  simulation: {
    stakeholderId: "cae-lead",
    text: "What happens to our analysis links to Abaqus?",
    options: [
      { id: "a", text: "Simulation can be dealt with in a later phase.", quality: 0 },
      { id: "b", text: "Analysts can re-mesh models as needed.", quality: 0.5 },
      {
        id: "c",
        text: "We'll validate the CAE integration in the pilot before committing to rollout.",
        quality: 1
      }
    ]
  },
  strategy: {
    stakeholderId: "ceo",
    text: "How does this position AeroTech for new digitally-enabled programmes?",
    options: [
      {
        id: "a",
        text: "It builds the model-based definition and digital collaboration capability customers now expect.",
        quality: 1
      },
      { id: "b", text: "It's the newest technology on the market.", quality: 0.5 },
      { id: "c", text: "Platform choice is mainly an IT matter.", quality: 0 }
    ]
  },
  workforce: {
    stakeholderId: "hr-training-manager",
    text: "How will you keep our experienced engineers engaged and productive?",
    options: [
      { id: "a", text: "Offer vendor e-learning to all staff.", quality: 0.5 },
      { id: "b", text: "Staff who won't adapt can be replaced.", quality: 0 },
      {
        id: "c",
        text: "Make senior engineers super-users and pair them with juniors to capture knowledge.",
        quality: 1
      }
    ]
  },
  cybersecurity: {
    stakeholderId: "it-manager",
    text: "How does this deal with the end of CATIA V5 security support?",
    options: [
      { id: "a", text: "Engineering software isn't a realistic attack target.", quality: 0 },
      {
        id: "b",
        text: "Move to a vendor-supported release that meets our patching and UK-hosting rules.",
        quality: 1
      },
      { id: "c", text: "Add firewall rules around the old workstations.", quality: 0.5 }
    ]
  },
  compliance: {
    stakeholderId: "quality-manager",
    text: "How will you keep certification intact through the migration?",
    options: [
      {
        id: "a",
        text: "Agree a verification plan with Quality and customers, and keep V5 access for legacy parts.",
        quality: 1
      },
      { id: "b", text: "Re-certify everything after go-live.", quality: 0.5 },
      { id: "c", text: "Translated models are identical, so no re-verification is needed.", quality: 0 }
    ]
  },
  supplychain: {
    stakeholderId: "customer-programmes-director",
    text: "How will this affect data exchange with Airbus and Rolls-Royce?",
    options: [
      { id: "a", text: "We'll send STEP files where needed.", quality: 0.5 },
      {
        id: "b",
        text: "We'll agree native-data exchange with each customer before go-live.",
        quality: 1
      },
      { id: "c", text: "Customers will adapt to our choice.", quality: 0 }
    ]
  }
};

export const platformChallenges = {
  "Stay with CATIA V5": {
    stakeholderId: "ceo",
    category: "strategy",
    text: "Why should we stay on a platform that is entering sustaining support?",
    options: [
      { id: "a", text: "It's proven and our staff know it well.", quality: 0.5 },
      { id: "b", text: "Support status rarely matters in practice.", quality: 0 },
      {
        id: "c",
        text: "Only as a short bridge: we'll plan the migration now and fund it in the next budget cycle.",
        quality: 1
      }
    ]
  },
  "3DEXPERIENCE": {
    stakeholderId: "finance-director",
    category: "cost",
    text: "3DEXPERIENCE is the most expensive option. Why is it worth it?",
    options: [
      {
        id: "a",
        text: "Customer alignment and continuity with our CATIA data reduce long-term risk; funding will be stage-gated.",
        quality: 1
      },
      { id: "b", text: "It's from Dassault, so it's the natural successor.", quality: 0.5 },
      { id: "c", text: "Cost isn't the main concern here.", quality: 0 }
    ]
  },
  "Siemens NX": {
    stakeholderId: "customer-programmes-director",
    category: "supplychain",
    text: "Airbus is moving suppliers onto 3DEXPERIENCE. Why choose NX?",
    options: [
      { id: "a", text: "Airbus will accept NX data.", quality: 0 },
      {
        id: "b",
        text: "NX best protects manufacturing, and we'll budget for certified data exchange with Airbus.",
        quality: 1
      },
      { id: "c", text: "Modern translators are good enough.", quality: 0.5 }
    ]
  },
  "PTC Creo": {
    stakeholderId: "manufacturing-director",
    category: "manufacturing",
    text: "Creo is weaker on CAM and customer fit. Why recommend it?",
    options: [
      { id: "a", text: "It has the cheapest licences.", quality: 0.5 },
      { id: "b", text: "CAM gaps can be fixed later.", quality: 0 },
      {
        id: "c",
        text: "We'll validate CAM and customer data exchange in a pilot before committing.",
        quality: 1
      }
    ]
  }
};

export const CATEGORY_CHALLENGE_COUNT = 3;
