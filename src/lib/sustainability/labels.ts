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
