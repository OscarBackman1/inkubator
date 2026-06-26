import { clampScore } from "@/lib/sustainability/scoring";
import type {
  FinalAnalysisResult,
  MaterialityResult,
  SufficiencyResult,
  UpdateAnalysisResult
} from "./schemas";

type MaterialityInput = {
  name: string;
  phase: string;
  industry: string;
  journeyText: string;
  ideaText: string;
};

function lower(input: string) {
  return input.toLowerCase();
}

export function mockMateriality(input: MaterialityInput): MaterialityResult {
  const text = lower(`${input.industry} ${input.journeyText} ${input.ideaText}`);
  const isAi = text.includes("ai") || text.includes("mjukvara") || text.includes("saas");
  const isIndustry = text.includes("industri") || text.includes("material") || text.includes("produktion");
  const isHealth = text.includes("health") || text.includes("life") || text.includes("vård") || text.includes("patient");

  const selectedAspects: MaterialityResult["selectedAspects"] = [];

  if (isIndustry) {
    selectedAspects.push({
      code: "E5",
      name: "Resursanvändning och cirkularitet",
      category: "ENVIRONMENT",
      status: "MATERIAL",
      materialityStrength: 5,
      materialityDrivers: ["IMPACT", "VALUE_CHAIN", "OPPORTUNITY"],
      underlyingAspects: ["Materialval", "Cirkularitet", "Leverantörskedja"],
      rationale:
        "Resursanvändning och cirkularitet handlar om hur material väljs, används och kan återföras eller minska spill. Området bedöms vara väsentligt eftersom bolagets lösning verkar vara beroende av materialflöden mellan produkt, produktion och leverantörer.",
      startupSpecificReason:
        "I en tidig fas är materialval, pilotproduktion och leverantörsval viktiga vägval som kan påverka bolagets framtida hållbarhetsprofil.",
      futureDevelopmentRelevance:
        "Om bolaget skalar blir resurseffektivitet, spårbarhet och återvinningsbarhet centrala för både kostnad, klimatpåverkan och trovärdighet.",
      evidence: [{ note: "Bransch och beskrivning pekar mot materialintensiv utveckling." }],
      confidence: "MEDIUM",
      uncertaintyNotes: ["Underlaget beskriver inte leverantörsled eller produktionsupplägg i detalj."]
    });
  } else {
    selectedAspects.push({
      code: "E1",
      name: "Klimatförändringar",
      category: "ENVIRONMENT",
      status: isAi ? "MATERIAL" : "UNCERTAIN",
      materialityStrength: isAi ? 4 : 3,
      materialityDrivers: ["RISK", "OPPORTUNITY", "VALUE_CHAIN"],
      underlyingAspects: isAi
        ? ["Digital infrastruktur", "Energianvändning", "Datacenterpåverkan"]
        : ["Energianvändning", "Klimatpåverkan vid skalning"],
      rationale:
        "Klimatförändringar handlar om hur bolagets lösning påverkar eller påverkas av energi, drift, transporter och andra utsläppskällor. Området bedöms vara väsentligt eftersom bolagets produkt, teknik och värdekedja har en direkt koppling till energibehov och utsläppskällor.",
      startupSpecificReason:
        "Tidiga teknik- och affärsmodellval kan göra det lättare att styra mot lägre klimatpåverkan när kundbasen växer.",
      futureDevelopmentRelevance:
        "Om lösningen får många användare eller kräver betydande digital infrastruktur behöver klimatpåverkan följas utan att det blir ett tungt rapporteringskrav.",
      evidence: [{ note: "Bedömningen bygger på bransch, affärsidé och känd skalningslogik." }],
      confidence: "MEDIUM",
      uncertaintyNotes: ["Det saknas konkret information om teknikstack och framtida driftvolymer."]
    });
  }

  selectedAspects.push({
    code: isHealth ? "S4" : "G1",
    name: isHealth ? "Konsumenter och slutanvändare" : "Affärsetik och bolagsstyrning",
    category: isHealth ? "SOCIAL" : "GOVERNANCE",
    status: "MATERIAL",
    materialityStrength: 4,
    materialityDrivers: ["RISK", "USER_IMPACT", "REGULATORY"],
    underlyingAspects: isHealth
      ? ["Patientsäkerhet", "Dataskydd", "Ansvarsfull AI", "Tillgänglighet"]
      : ["Dataskydd", "Informationssäkerhet", "Ansvarsfull AI", "Transparens"],
    rationale: isHealth
      ? "Konsumenter och slutanvändare handlar om hur lösningen påverkar personer som använder eller berörs av produkten. Området bedöms vara väsentligt eftersom hälsorelaterade lösningar har en direkt koppling till användares trygghet, tillgänglighet och beslut."
      : "Affärsetik och bolagsstyrning handlar om ansvar, datahantering, transparens och förtroende i hur bolaget utvecklar och erbjuder sin lösning. Området bedöms vara väsentligt eftersom digitala och AI-stödda affärsmodeller ofta bygger på information och relationer där tydliga principer påverkar kundernas förtroende.",
    startupSpecificReason:
      "Det är rimligt att diskutera principer, ansvar och riskförståelse tidigt även om bolaget ännu saknar formella policys.",
    futureDevelopmentRelevance:
      "När bolaget växer kan förtroende, regulatoriska krav och incidenthantering bli avgörande för kundrelationer och skalbarhet.",
    evidence: [{ note: "Underlaget indikerar digital eller datadriven produktlogik." }],
    confidence: "MEDIUM",
    uncertaintyNotes: ["Det saknas fullständig beskrivning av dataflöden, användare och ansvarsfördelning."]
  });

  return {
    companySummary: `${input.name} är i fasen ${input.phase} och verkar inom ${input.industry}. Underlaget visar en tidig affärsidé där de viktigaste hållbarhetsfrågorna handlar om hur modellen utvecklas vid skalning.`,
    sustainabilityPerspectiveSummary:
      "Bedömningen fokuserar på framtida konsekvenser, risker och möjligheter snarare än på om bolaget redan har mogna processer eller rapporter.",
    materialityApproach:
      "Områdena har valts restriktivt utifrån branschlogik, affärsmodell, sannolik värdekedja och frågor som Movexum bör diskutera med bolaget.",
    selectedAspects,
    consideredButNotMaterial: [
      {
        code: "E3",
        name: "Vatten och marina resurser",
        category: "ENVIRONMENT",
        rationale:
          "Inget i underlaget pekar på direkt vattenberoende, men indirekt vattenpåverkan kan bli relevant om digital infrastruktur eller produktion växer."
      },
      {
        code: "S2",
        name: "Arbetstagare i värdekedjan",
        category: "SOCIAL",
        rationale:
          "Området är inte prioriterat i nuläget, men bör omprövas om bolaget får mer omfattande leverantörsled eller hårdvaruproduktion."
      }
    ],
    assumptions: [
      "Bolaget är i tidig fas och saknar sannolikt fullständig mätdata.",
      "Bedömningen bygger på affärsidéns sannolika utveckling, inte bevisad effekt."
    ],
    warnings: [
      "Detta är inte en formell CSRD-, VSME- eller juridisk compliance-bedömning."
    ]
  };
}

export function mockSufficiency(input: {
  materiality: MaterialityResult;
  documentText: string;
}): SufficiencyResult {
  const enoughText = input.documentText.trim().length > 500;
  const aspectChecks: SufficiencyResult["aspectChecks"] = input.materiality.selectedAspects.map((aspect) => {
    const partial = enoughText || aspect.confidence === "HIGH";
    return {
      code: aspect.code,
      name: aspect.name,
      category: aspect.category,
      informationStatus: partial ? "PARTIAL" : "MISSING",
      rationale: partial
        ? "Det finns viss information om affärsidén, men flera viktiga vägval är fortfarande otydliga."
        : "Underlaget är för begränsat för att göra mer än en försiktig bedömning.",
      whatWeKnow: [aspect.startupSpecificReason],
      missingInformation: [
        "Hur bolaget tänker hantera området när produkten, kundbasen eller värdekedjan växer."
      ],
      question: {
        question: `Hur tänker ni kring ${aspect.underlyingAspects[0]?.toLowerCase() ?? "detta område"} när bolaget växer, och vilka principer eller vägval ser ni redan nu som viktiga?`,
        missingInformation:
          "Det saknas en tydlig bild av framtida vägval, ansvar och möjliga riskreducerande beslut.",
        whyThisMattersForFinalAssessment:
          "Svaret hjälper Movexum att bedöma om potentialen stöds av realistisk riskförståelse.",
        severity: "RECOMMENDED",
        exampleHelpfulEvidence:
          "Kort fritext, kundinsikter, teknisk beskrivning, beslutsprinciper eller relevanta utdrag ur pitchdeck."
      },
      confidence: "MEDIUM"
    };
  });

  return {
    readyForFinalAnalysis: true,
    overallInformationQuality: enoughText ? 62 : 46,
    generalComment:
      "Det finns tillräckligt underlag för en första analys, men dashboarden bör tydligt markera antaganden och osäkerheter.",
    aspectChecks,
    generalMissingInformation: [
      "Mer konkret beskrivning av skalning, kunder, värdekedja och ansvarsfördelning skulle stärka analysen."
    ],
    userMessage:
      "Du kan komplettera där det finns frågor, men det går också att gå vidare med lägre informationskvalitet."
  };
}

export function mockFinalAnalysis(input: {
  companyName: string;
  industry: string;
  materiality: MaterialityResult;
  sufficiency: SufficiencyResult;
  gapAnswers: string[];
}): FinalAnalysisResult {
  const hasAnswers = input.gapAnswers.some((answer) => answer.trim().length > 20);
  const base = hasAnswers ? 72 : input.sufficiency.overallInformationQuality + 12;
  const overall = clampScore(base);
  const firstAspect = input.materiality.selectedAspects[0];

  return {
    executiveSummary:
      `${input.companyName} har en tydlig möjlighet att bygga hållbarhet in i affärsutvecklingen, men analysen behöver läsas som ett första beslutsstöd. Potentialen ligger främst i hur lösningen kan skala med lägre negativ påverkan och högre nytta för kunder eller användare. Den största svagheten är att flera framtida vägval ännu inte är konkretiserade.`,
    companySustainabilityDescription:
      "Bolaget bör bedömas utifrån affärsmodellens framtida konsekvenser snarare än dagens interna hållbarhetsmognad. Fokus ligger på värdekedja, användarpåverkan, data/AI och trovärdig kommunikation.",
    businessModelCompatibility: {
      status: "COMPATIBLE_WITH_LONG_TERM_SUSTAINABILITY",
      rationale:
        "Inget i underlaget visar att kärnaffären i sig bygger på betydande negativ påverkan, men vissa risker behöver hanteras tidigt.",
      consequencesIfScaled:
        "Om bolaget skalar utan tydliga principer kan positiva effekter försvagas av datarisker, energiberoenden eller otydlig ansvarsfördelning."
    },
    impactLevel: {
      level: overall >= 80 ? "IMPACT_DRIVEN" : overall >= 62 ? "SUSTAINABILITY_DRIVEN" : "RESPONSIBLE",
      labelSv: overall >= 80 ? "Impactdrivande" : overall >= 62 ? "Hållbarhetsdrivande" : "Ansvarsfullt",
      rationale:
        "Affärsidén har hållbarhetsrelevant potential, men nivån beror på om bolaget kan omsätta den i konkreta val och validerad kundnytta."
    },
    riskIndicator: {
      level: hasAnswers ? "SOME_IMBALANCE" : "SIGNIFICANT_IMBALANCE",
      labelSv: hasAnswers ? "Viss obalans identifierad" : "Betydande obalans identifierad",
      rationale:
        "Potentialen är tydligare än bolagets beskrivna förmåga att hantera risker, särskilt kring styrning, data och värdekedja."
    },
    scores: {
      overall,
      environment: clampScore(overall - 5),
      social: clampScore(overall - 2),
      governance: clampScore(overall - 8)
    },
    scoreRationale: {
      overall:
        "Scoren väger positiv potential, riskexponering, informationskvalitet och rimliga startupnästa steg.",
      environment:
        "Miljöscoren påverkas främst av klimat- eller resursfrågor kopplade till skalning och värdekedja.",
      social:
        "Social score påverkas av användarpåverkan, tillgänglighet, dataskydd och möjlig påverkan på kunder eller patienter.",
      governance:
        "Styrningsscoren hålls tillbaka av att ansvar, transparens och riskrutiner ännu är tidiga."
    },
    informationQualityScore: input.sufficiency.overallInformationQuality,
    informationQualityRationale:
      "Underlaget räcker för en första coachande bedömning men innehåller få verifierbara detaljer om framtida drift, leverantörer och ansvar.",
    whatCompanyNeedsToWorkOn: [
      {
        title: "Beskriv riskprinciper tidigt",
        description:
          "Bolaget bör formulera hur de vill fatta vägval kring de mest väsentliga hållbarhetsfrågorna när lösningen skalar.",
        priority: "HIGH",
        realisticStartupNextStep:
          "Skriv en sida med principer för teknikval, kundnytta, ansvar och risker inför nästa coachmöte."
      },
      {
        title: "Knyt potential till bevis",
        description:
          "Den positiva effekten behöver kopplas till kundproblem, mätbara proxyindikatorer eller validerad användarnytta.",
        priority: "MEDIUM",
        realisticStartupNextStep:
          "Välj 2-3 enkla indikatorer som kan följas i pilot eller kunddialog."
      }
    ],
    risks: [
      {
        aspectCode: firstAspect?.code ?? "G1",
        category: firstAspect?.category ?? "GOVERNANCE",
        title: "Potential utan tillräcklig riskstyrning",
        description:
          "Bolaget kan ha hög positiv potential men ännu sakna tydlig bild av vilka risker som växer med affären.",
        severity: "HIGH",
        timeHorizon: "MEDIUM",
        whyImportant:
          "Obalansen kan påverka förtroende, kundkrav, investerardialog och framtida regelefterlevnad.",
        howItCanAffectFutureDevelopment:
          "Om frågorna hanteras sent kan bolaget behöva ändra teknik, processer eller kommunikation under press.",
        mitigationSuggestion:
          "Använd materialitetsområdena som agenda i produkt- och affärsutveckling, inte som rapporteringschecklista.",
        evidence: ["Underlaget innehåller begränsad information om framtida riskhantering."]
      }
    ],
    opportunities: [
      {
        aspectCode: firstAspect?.code ?? "E1",
        category: firstAspect?.category ?? "ENVIRONMENT",
        title: "Bygga in hållbarhet i skalningsval",
        description:
          "Tidiga beslut om teknik, kunder, leverantörer och kommunikation kan stärka både impact och affärsnytta.",
        potential: "HIGH",
        whyImportant:
          "Startupfasen ger möjlighet att forma affärsmodellen innan dyra strukturer låser sig.",
        howCompanyCanUseIt:
          "Bolaget kan använda hållbarhetsfrågorna för bättre prioriteringar i pilot, produktutveckling och kunddialog.",
        recommendedAction:
          "Koppla varje väsentligt område till ett konkret beslut som teamet behöver fatta de kommande 3-6 månaderna.",
        evidence: ["Affärsidén är tidig och vägvalen är fortfarande påverkbara."]
      }
    ],
    discussionQuestions: [
      {
        question:
          "Vilket hållbarhetsrelaterat vägval riskerar att bli svårt att ändra om ni väntar för länge?",
        whyImportant: "Frågan hjälper teamet att prioritera tidiga beslut med stor framtida effekt."
      },
      {
        question:
          "Vilken positiv effekt vill ni kunna visa med enkel evidens redan i pilotfasen?",
        whyImportant: "Det minskar risken för breda påståenden utan stöd."
      },
      {
        question:
          "Vilka risker kan öka om ni lyckas snabbt och får fler kunder än planerat?",
        whyImportant: "Snabb skalning kan förstärka både positiva och negativa konsekvenser."
      }
    ],
    greenwashingRisks: [
      {
        claimOrRisk: "Att kommunicera stark impact innan effekten är validerad.",
        whyRisky:
          "Tidiga antaganden kan misstolkas som bevisad samhälls- eller miljönytta.",
        howToSubstantiate:
          "Använd försiktiga formuleringar och koppla påståenden till pilotdata, kundcase eller tydliga antaganden."
      }
    ],
    assumptions: [
      "Bolaget är i tidig fas och har begränsad verifierbar data.",
      "Analysen antar att affärsmodellen kan skalas ungefär enligt beskriven riktning."
    ],
    limitations: [
      "Analysen är inte en juridisk, finansiell, regulatorisk eller formell CSRD/VSME-bedömning.",
      "Dokument med bilder, diagram eller muntlig pitch kan innehålla information som textutdraget missar."
    ],
    disclaimer:
      "Movexum Impact Navigator är ett vägledande analysstöd för coachning och intern prioritering. Resultatet ska inte användas som formell hållbarhetsrapport, juridisk rådgivning eller bevisad impactbedömning."
  };
}

export function mockUpdateAnalysis(input: {
  previousDashboard: FinalAnalysisResult;
  narrative: string;
  companyName: string;
  materiality: MaterialityResult;
  sufficiency: SufficiencyResult;
}): UpdateAnalysisResult {
  const changedDashboard: FinalAnalysisResult = {
    ...input.previousDashboard,
    executiveSummary: `${input.previousDashboard.executiveSummary} Sedan förra versionen har bolaget beskrivit ny utveckling: ${input.narrative.slice(0, 180)}.`,
    scores: {
      ...input.previousDashboard.scores,
      overall: clampScore(input.previousDashboard.scores.overall + 4),
      governance: clampScore(input.previousDashboard.scores.governance + 5)
    },
    informationQualityScore: clampScore(input.previousDashboard.informationQualityScore + 6),
    informationQualityRationale:
      "Informationskvaliteten har stärkts något genom uppdateringen, men flera antaganden kvarstår."
  };

  return {
    updatedDashboard: changedDashboard,
    deltaSummary: {
      whatChangedSinceLastAssessment: [
        "Bolaget har lämnat ny information om nuläge och nästa steg.",
        "Analysen bedömer att styrning och prioriteringar är något tydligare än tidigare."
      ],
      newRisks: ["Nya beroenden kan uppstå om uppdateringen innebär snabbare skalning."],
      reducedRisks: ["Viss osäkerhet minskar när bolaget beskriver fler konkreta vägval."],
      newOpportunities: ["Uppdateringen kan användas för mer fokuserad kund- och pilotvalidering."],
      changedScores: [
        {
          category: "OVERALL",
          previousScore: input.previousDashboard.scores.overall,
          newScore: changedDashboard.scores.overall,
          reason: "Mer konkret information stärker bedömningen något."
        },
        {
          category: "GOVERNANCE",
          previousScore: input.previousDashboard.scores.governance,
          newScore: changedDashboard.scores.governance,
          reason: "Uppdateringen ger något bättre bild av ansvar och vägval."
        }
      ],
      recommendedNextDiscussions: [
        "Vad i uppdateringen bör påverka bolagets viktigaste prioriteringar kommande kvartal?",
        "Vilka nya antaganden behöver testas med kunder eller partners?"
      ]
    }
  };
}
