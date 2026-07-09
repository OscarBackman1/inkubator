export const phaseLabels = {
  SCREENING: "Screening",
  BOOST_CHAMBER: "Boost Chamber",
  INKUBATOR: "Inkubator",
  ACCELERATOR: "Accelerator"
} as const;

export const statusLabels = {
  DRAFT: "Utkast",
  MATERIALITY_REVIEW: "Väsentlighet granskas",
  INFO_COLLECTION: "Informationsinsamling",
  NEEDS_MORE_INFO: "Behöver mer information",
  ANALYZED: "Analyserad"
} as const;

export const categoryLabels = {
  ENVIRONMENT: "Miljö",
  SOCIAL: "Socialt & mänskliga rättigheter",
  GOVERNANCE: "Etik & styrning",
  CUSTOM: "Eget område"
} as const;

export const categoryCodePrefixes = {
  ENVIRONMENT: "ENV",
  SOCIAL: "SOC",
  GOVERNANCE: "GOV",
  CUSTOM: "OWN"
} as const;

export const confidenceLabels = {
  LOW: "Låg",
  MEDIUM: "Medel",
  HIGH: "Hög"
} as const;

export const priorityLabels = {
  LOW: "Låg",
  MEDIUM: "Medel",
  HIGH: "Hög"
} as const;

export const businessModelCompatibilityLabels = {
  COMPATIBLE_WITH_LONG_TERM_SUSTAINABILITY: "Hållbar riktning",
  UNCERTAIN: "Osäker riktning",
  HARMFUL_OR_RISKY: "Riskfylld riktning"
} as const;

export const businessModelCompatibilityDescriptions = {
  COMPATIBLE_WITH_LONG_TERM_SUSTAINABILITY:
    "Kärnaffären verkar kunna utvecklas utan att bygga på tydlig negativ påverkan.",
  UNCERTAIN:
    "Det går inte att avgöra riktningen ännu eftersom viktiga antaganden eller konsekvenser är oklara.",
  HARMFUL_OR_RISKY:
    "Kärnaffären verkar kunna skapa betydande negativ påverkan eller affärsrisk om den växer."
} as const;

export const materialityDriverLabels = {
  RISK: "Risk",
  OPPORTUNITY: "Möjlighet",
  IMPACT: "Påverkan",
  VALUE_CHAIN: "Värdekedja",
  REGULATORY: "Regelverk",
  USER_IMPACT: "Användarpåverkan"
} as const;

export const materialityDriverDescriptions = {
  RISK: "Kan skapa framtida affärs-, förtroende- eller hållbarhetsrisker.",
  OPPORTUNITY: "Kan stärka erbjudandet, positioneringen eller möjligheten att skala ansvarsfullt.",
  IMPACT: "Kan ge tydlig positiv eller negativ påverkan om affärsidén växer.",
  VALUE_CHAIN: "Beror på leverantörer, produktion, drift, distribution eller andra led runt lösningen.",
  REGULATORY: "Kan påverkas av regler, standarder, branschkrav eller kunders kravbild.",
  USER_IMPACT: "Berör människors trygghet, integritet, tillgänglighet eller beslut."
} as const;

export const uploadStageLabels = {
  IDEA_DESCRIPTION: "Idébeskrivning",
  FULL_INFORMATION: "Full information",
  GAP_RESPONSE: "Kompletteringssvar",
  UPDATE: "Uppdatering"
} as const;

export const extractionStatusLabels = {
  PENDING: "Väntar",
  COMPLETE: "Klar",
  FAILED: "Misslyckades"
} as const;
