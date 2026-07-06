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
rationale visas som huvudtext i väsentlighetsanalysen och ska vara 2-3 neutrala meningar om vad området handlar om och varför det är väsentligt för just bolaget. Beskriv inte risker, möjligheter, nuläge, framtida utveckling eller rekommendationer i rationale.
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
Inuti question-objektet ska missingInformation och exampleHelpfulEvidence vara string, inte arrays.
Frågan i question.question ska vara konkret och kunna besvaras med 3-5 meningar av en coach eller grundare utan specialistkunskap.
Undvik tekniska termer, förkortningar och fackspråk som ack, alerts, notifieringslogik, implementation, scope-data, regulatorisk bedömning eller juridisk analys.
Fråga efter observerbara fakta, erfarenheter, feedback, resultat, beslut eller arbetssätt som rimligen finns hos ett bolag i input.phase.
För SCREENING ska frågan kunna besvaras utan pilotresultat, dokumenterade arbetssätt, mätetal, policyer eller tekniska lösningar. Fråga hellre vad bolaget vet, antar, har observerat eller vill testa.
För BOOST_CHAMBER och INKUBATOR kan frågan handla om tidiga tester, kunddialoger, feedback och praktiska beslut.
För ACCELERATOR kan frågan handla om återkommande arbetssätt eller resultat, men fortfarande utan krav på formell rapportering.`,

  final: `Returnera exakt ett JSON-objekt med:
- executiveSummary
- companySustainabilityDescription
- businessModelCompatibility: status, rationale, consequencesIfScaled
- impactLevel: level, labelSv, rationale
- riskIndicator: level, labelSv, rationale
- areaAssessments: overall, environment, social, governance
- informationQualityComment
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
Riskindikatorns labelSv används som intern översiktsetikett, men riskIndicator.rationale ska kunna visas ensam under rubriken Riskbild. Skriv en konkret riskbild i 2-4 meningar: nämn tydliga styrkor eller skyddsfaktorer, de viktigaste riskluckorna, varför de kan bli allvarliga vid skalning och om de verkar hanterbara med prioriterade åtgärder i närtid. Undvik abstrakta formuleringar som "balans mellan" eller att upprepa labelSv.
Tillåtna priority/severity/potential: LOW, MEDIUM, HIGH.
Tillåtna timeHorizon: SHORT, MEDIUM, LONG.
Varje areaAssessments-item ska ha potentialLabel, assessment och uncertaintyNotes.
potentialLabel ska vara en svensk textetikett, t.ex. "Ansvarsfull", "Hållbarhetsdrivande", "Impactdrivande", "Systemförändrande" eller "Ansvarsfull → Hållbarhetsdrivande".
assessment ska vara 2-4 genomarbetade, coachande meningar som bedömer affärsidéns framtida påverkan, risker och möjligheter inom området. Skriv inte som betyg, ranking eller compliancekontroll.
overall ska vara en självständig samlad bedömning av affärsidéns system-, bransch- eller marknadspåverkan, inte ett snitt av environment, social och governance. Ett bolag kan vara Systemförändrande om kärnaffären driver omställning i en bransch även om SOC, GOV eller vissa ENV-frågor är svaga. Förklara i overall.assessment varför och ange om den främsta potentialen ligger i ENV, SOC, GOV eller en kombination.
impactLevel.labelSv och areaAssessments.overall.potentialLabel ska beskriva samma övergripande nivå.
environment ska fokusera på miljömässig hållbarhet, social på social hållbarhet och governance på styrning, etik, ansvar och förtroende.
uncertaintyNotes ska vara string[] och tydligt markera saknad information eller antaganden. Begränsat underlag gör inte ett område oväsentligt. För overall ska uncertaintyNotes vara [] eftersom osäkerheter och saknad information hör hemma i respektive område och i informationsläget.
informationQualityComment ska vara en mycket kort svensk kommentar på högst 12 ord om hur underlaget bör läsas, t.ex. "Första bedömning möjlig, men antaganden återstår." Använd inte siffror eller /100.
För risks och opportunities måste category vara ENVIRONMENT, SOCIAL, GOVERNANCE eller CUSTOM. Använd inte BUSINESS.
greenwashingRisks måste vara array av objekt med claimOrRisk, whyRisky och howToSubstantiate, inte array av strings.
Varje discussionQuestions.question ska vara konkret och kunna besvaras med 3-5 meningar av en coach eller grundare utan specialistkunskap.
Undvik tekniska termer, förkortningar och fackspråk. Fråga efter observerbara fakta, erfarenheter, feedback, resultat, beslut eller arbetssätt, inte hur något tekniskt implementeras.
Anpassa frågorna efter input.phase. För tidiga faser ska frågorna handla om antaganden, planerade tester, kunddialoger eller tidiga observationer, inte etablerade processer eller mätdata.`,

  update: `Returnera exakt ett JSON-objekt med:
- updatedDashboard: samma struktur som FinalAnalysisResult
- deltaSummary: whatChangedSinceLastAssessment, newRisks, reducedRisks, newOpportunities, optional changedImpactLevel, optional changedRiskIndicator, changedAreaAssessments, recommendedNextDiscussions

changedAreaAssessments items ska ha category, previousPotential, newPotential, reason.
Tillåtna category: OVERALL, ENVIRONMENT, SOCIAL, GOVERNANCE.
recommendedNextDiscussions ska vara konkreta frågor som kan besvaras med 3-5 meningar av en coach eller grundare utan specialistkunskap.
Anpassa recommendedNextDiscussions efter input.phase och fråga inte efter underlag som är mer moget än bolagets fas.`
} as const;
