# CLAUDE DEVELOPMENT BRIEF

Project: AeroTech 2030
Audience: MSc Engineering Business Management Students
Deployment Target: 2 Weeks
Platform: React + Vite + Azure Static Web Apps

## PRIMARY PURPOSE

This is NOT a software comparison exercise.

This is a consultancy simulation that teaches:
- Stakeholder analysis
- Requirements elicitation
- Strategic technology evaluation
- Risk management
- Change management
- Evidence-based decision making

Students should leave understanding:
1. Engineering software decisions are socio-technical.
2. Different stakeholders want different outcomes.
3. There is no perfect platform.
4. Investigation quality influences decision quality.
5. Risk mitigation is as important as platform selection.

---

# MVP SCOPE (DO NOT EXCEED)

Implement:
- Board briefing
- Stakeholder investigation
- Evidence gathering
- Investigation dashboard
- Platform comparison
- Final recommendation
- Board assessment
- Year 1 / Year 3 / Year 5 outcomes

Do NOT implement:
- Azure OpenAI
- Authentication
- Databases
- Leaderboards
- Analytics dashboards
- Multiplayer
- CSP optimisation
- Browser automation
- Security hardening beyond normal defaults

---

# CORE DESIGN CHANGE

Current system over-rewards trust.

New principle:

Primary Goal:
Gather relevant evidence.

Secondary Goal:
Build stakeholder openness.

Students should never feel they are trying to maximise a trust score.

Students should feel they are conducting an investigation.

---

# STAKEHOLDER SYSTEM

Replace obvious trust-building questions.

Avoid:
- Open Question (+5)
- Guarded Question (-5)

Instead:

Questions should reveal:
- Strategic Drivers
- Risks
- Constraints
- Workforce Issues
- Customer Requirements

Trust should be largely hidden.

Suggested display:
Relationship Status:
- Open
- Neutral
- Cautious

No numerical trust values required.

---

# EVIDENCE CLASSIFICATION

Replace:
- Requirement
- Risk
- Constraint

With:
- Strategic Driver
- Risk
- Constraint
- Workforce Issue
- Customer Requirement

Evidence should explicitly support decision criteria.

Example:

Evidence:
"Projects above £5M require Board review."

Classification:
Constraint

Supports:
- Cost
- Delivery Risk

---

# INVESTIGATION CATEGORIES

Track:

1. Cost
2. Manufacturing
3. Compliance
4. Workforce
5. Cybersecurity
6. Future Readiness
7. Customer Requirements
8. Change Management
9. Training
10. Supply Chain

Dashboard should show:

Green = Investigated
Amber = Partial
Red = Not Investigated

---

# STAKEHOLDERS

## CEO

Priorities:
- Growth
- Competitiveness
- Strategy

Strategic Driver:
Future programmes demand stronger digital engineering capability.

Questions that may reveal evidence:
- What does success look like in five years?
- What pressures exist from competitors?
- Why change now?

---

## Finance Director

Priorities:
- ROI
- Cash flow
- Programme cost

Constraint:
Major transformation spending receives enhanced Board scrutiny.

Risk:
Training and productivity losses may exceed licence costs.

Questions:
- What financial risks concern the Board?
- How are major projects evaluated?
- What would cause you to reject a proposal?

---

## Chief Design Engineer

Priorities:
- Capability
- Productivity
- Design quality

Workforce Issue:
Critical expertise may retire within the next decade.

Risk:
Migration could temporarily reduce engineering output.

Questions:
- Which capabilities are non-negotiable?
- What productivity risks concern you?
- What engineering workflows matter most?

---

## Manufacturing Director

Priorities:
- CAM
- CNC
- Production continuity

Constraint:
Existing processes have evolved around current outputs.

Risk:
Manufacturing workflow validation may be required.

Questions:
- What would stop production?
- What dependencies exist today?
- Where would migration create risk?

---

## Quality Manager

Priorities:
- AS9100
- Traceability
- Configuration control

Constraint:
Certification obligations cannot be compromised.

Risk:
Verification procedures may require revision.

Questions:
- What compliance risks concern you?
- What documentation is required?
- What would auditors expect?

---

## Airbus Customer Representative

Priorities:
- Collaboration
- Supplier capability
- Digital maturity

Customer Requirement:
Digital collaboration capability is becoming increasingly important.

Questions:
- What capabilities do customers value?
- How are supplier expectations changing?
- What would improve collaboration?

---

## HR Manager

Priorities:
- Recruitment
- Retention
- Skills development

Workforce Issue:
Modern engineering skills are increasingly important.

Risk:
Significant retraining may impact morale.

Questions:
- What skills shortages exist?
- What training burden would change create?
- How attractive are current tools to recruits?

---

## IT Manager

Priorities:
- Security
- Infrastructure
- Lifecycle management

Risk:
Older software may create increasing support challenges.

Strategic Driver:
Modern platforms may improve lifecycle management.

Questions:
- What support risks concern IT?
- How does lifecycle management influence decisions?
- What cybersecurity risks exist?

---

## Senior CAD Engineer

Priorities:
- Workflow stability
- Proven processes

Hidden Bias:
Prefers retaining CATIA.

Questions:
- What would make migration difficult?
- Which workflows are most valuable?

---

## Graduate Engineer

Priorities:
- Modern tools
- Career development

Hidden Bias:
Favours newer engineering environments.

Questions:
- What attracts new engineers?
- Which technologies interest graduates?

---

# PLATFORM CARDS

## Stay with CATIA V5

Strengths:
- Minimal disruption
- Existing expertise
- Proven processes

Concerns:
- Technical debt
- Support lifecycle
- Recruitment challenges

---

## 3DEXPERIENCE

Strengths:
- Vendor continuity
- Aerospace ecosystem
- Digital thread capability

Concerns:
- Significant implementation effort
- Organisational complexity

---

## Siemens NX

Strengths:
- Strong CAD/CAM integration
- Aerospace adoption
- Engineering capability

Concerns:
- Migration challenge
- Large training requirement

---

## PTC Creo

Strengths:
- Strong engineering functionality
- Balanced transition path

Concerns:
- Less aerospace ecosystem alignment

---

# OUTCOME ENGINE

Outcomes should depend on:
- Stakeholders consulted
- Investigation coverage
- Evidence collected
- Risks identified
- Mitigation quality
- Platform selected

NOT solely on platform selection.

Example:

Ignored Finance:
"Budget implications were underestimated."

Ignored Manufacturing:
"Production disruption exceeded expectations."

Ignored Quality:
"Compliance work emerged late in the programme."

Ignored Customer Requirements:
"Future customer expectations were not fully understood."

---

# FINAL DEBRIEF

Debrief should answer:

1. Which evidence was discovered?
2. Which critical evidence was missed?
3. Which stakeholders were ignored?
4. Which risks were underestimated?
5. How strong was the recommendation?

The discussion should focus on:
- quality of investigation
- stakeholder management
- evidence gathering
- strategic thinking

NOT on achieving maximum trust.
