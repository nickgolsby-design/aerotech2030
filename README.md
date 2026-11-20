# AeroTech 2030

A browser-based consultancy simulation for MSc Engineering Business Management
students. It takes 20–30 minutes. Teams act as consultants advising the Board
of AeroTech Precision Ltd on its engineering technology strategy as CATIA V5
enters sustaining support.

**Version:** V1 pilot. Simulation mechanics are frozen; only bug fixes and
facilitator or deployment work go in until the pilot has been evaluated.

## How a session runs

1. **Briefing:** the Board's brief and the platform options.
2. **Investigation:** 12 actions to spend interviewing ten stakeholders
   (with follow-up questions) and reviewing documents. Relationships are
   shown as Open, Neutral or Cautious. Cautious stakeholders withhold
   evidence.
3. **Recommendation:** platform (Stay with CATIA V5, 3DEXPERIENCE or Siemens
   NX), implementation strategy, three risks with mitigations, change
   approach and rationale.
4. **Board review:** an executive challenge session. Two questions probe the
   dimensions the team investigated least, and a final question tests its
   judgement. Each question has two defensible positions and one weak one.
   The board judges the evidence cited, who was consulted and whether the
   assumptions were tested.
5. **Outcomes and debrief:** Year 1 / 3 / 5 outcomes, learning-outcome
   ratings, missed evidence and how it could have been found, and a JSON
   results export.

## Facilitator mode

Add `?facilitator=1` to the URL to see hidden values: trust numbers,
question effects, critical evidence, which board position is weak, and live
scores.

## Development

```sh
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run lint
npm run build    # production build in dist/
```

Progress is saved in the browser's localStorage. Scenario content lives in
`src/data` (JSON and JS). The design authority is the `/design` folder: where
it disagrees with the code, the design documents win.
