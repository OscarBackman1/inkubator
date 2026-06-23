export const SCHEMA_CONTRACTS = {
  materiality: `Returnera exakt ett JSON-objekt med:
- companySummary: string
- sustainabilityPerspectiveSummary: string
- materialityApproach: string
- selectedAspects: array med 1-4 normalfall, varje item: code, name, category, status, materialityStrength, materialityDrivers, underlyingAspects, rationale, startupSpecificReason, futureDevelopmentRelevance, evidence, confidence, uncertaintyNotes
- consideredButNotMaterial: array med code, name, category, rationale
- assumptions: string[]
- warnings: string[]

Tillåtna category: ENVIRONMENT, SOCIAL, GOVERNANCE, CUSTOM.
Tillåtna status för selectedAspects: MATERIAL, UNCERTAIN.
Tillåtna confidence: LOW, MEDIUM, HIGH.
Tillåtna materialityDrivers: RISK, OPPORTUNITY, IMPACT, VALUE_CHAIN, REGULATORY, USER_IMPACT.
materialityStrength ska vara heltal 1-5.
evidence MÅSTE vara en array av objekt, t.ex. [{"note":"Underlaget visar ..."}], aldrig en string.
uncertaintyNotes MÅSTE vara string[], t.ex. ["Det saknas information om ..."], aldrig en string.`,

  sufficiency: `Returnera exakt ett JSON-objekt med:
- readyForFinalAnalysis: boolean
- overallInformationQuality: number 0-100
- generalComment: string
- aspectChecks: array, ett item per väsentligt område: code, name, category, informationStatus, rationale, whatWeKnow, missingInformation, optional question, confidence
- generalMissingInformation: string[]
- userMessage: string

Tillåtna informationStatus: SUFFICIENT, PARTIAL, MISSING.
Om informationStatus är SUFFICIENT ska question utelämnas.
Om question finns: question, missingInformation, whyThisMattersForFinalAssessment, severity, exampleHelpfulEvidence.
Tillåtna severity: REQUIRED, RECOMMENDED.
confidence måste vara LOW, MEDIUM eller HIGH, inte en siffra.
Ställ högst en fråga per aspekt.
Inuti question-objektet ska missingInformation och exampleHelpfulEvidence vara string, inte arrays.`,

  final: `Returnera exakt ett JSON-objekt med:
- executiveSummary
- companySustainabilityDescription
- businessModelCompatibility: status, rationale, consequencesIfScaled
- impactLevel: level, labelSv, rationale
- riskIndicator: level, labelSv, rationale
- scores: overall, environment, social, governance, alla 0-100
- scoreRationale: overall, environment, social, governance
- informationQualityScore: 0-100
- informationQualityRationale
- whatCompanyNeedsToWorkOn: array med title, description, priority, realisticStartupNextStep
- risks: array med aspectCode, category, title, description, severity, timeHorizon, whyImportant, howItCanAffectFutureDevelopment, mitigationSuggestion, evidence
- opportunities: array med aspectCode, category, title, description, potential, whyImportant, howCompanyCanUseIt, recommendedAction, evidence
- discussionQuestions: array med 3-5 frågor, varje item: question, whyImportant, optional suggestedOwnerRole, optional aspectCode
- greenwashingRisks: array
- assumptions: string[]
- limitations: string[]
- disclaimer

Tillåtna businessModelCompatibility.status: HARMFUL_OR_RISKY, COMPATIBLE_WITH_LONG_TERM_SUSTAINABILITY, UNCERTAIN.
Tillåtna impactLevel.level: HARMFUL_RISKY, RISK_EXPOSED, RESPONSIBLE, SUSTAINABILITY_DRIVEN, IMPACT_DRIVEN, SYSTEM_CHANGING_IMPACT.
Tillåtna riskIndicator.level: BALANCED, SOME_IMBALANCE, SIGNIFICANT_IMBALANCE.
Tillåtna priority/severity/potential: LOW, MEDIUM, HIGH.
Tillåtna timeHorizon: SHORT, MEDIUM, LONG.
För risks och opportunities måste category vara ENVIRONMENT, SOCIAL, GOVERNANCE eller CUSTOM. Använd inte BUSINESS.
greenwashingRisks måste vara array av objekt med claimOrRisk, whyRisky och howToSubstantiate, inte array av strings.`,

  update: `Returnera exakt ett JSON-objekt med:
- updatedDashboard: samma struktur som FinalAnalysisResult
- deltaSummary: whatChangedSinceLastAssessment, newRisks, reducedRisks, newOpportunities, optional changedImpactLevel, optional changedRiskIndicator, changedScores, recommendedNextDiscussions

changedScores items ska ha category, previousScore, newScore, reason.
Tillåtna category: OVERALL, ENVIRONMENT, SOCIAL, GOVERNANCE.`
} as const;
