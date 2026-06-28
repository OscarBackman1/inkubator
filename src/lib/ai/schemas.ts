import { z } from "zod";

const CategoryEnumSchema = z.enum(["ENVIRONMENT", "SOCIAL", "GOVERNANCE", "CUSTOM"]);

export const CategorySchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toUpperCase();
  if (normalized === "ENVIRONMENTAL" || normalized === "MILJO" || normalized === "MILJÖ") {
    return "ENVIRONMENT";
  }
  if (normalized === "HUMAN_RIGHTS" || normalized === "SOCIAL_HUMAN_RIGHTS") {
    return "SOCIAL";
  }
  if (normalized === "ETHICS" || normalized === "GOVERNANCE_ETHICS") {
    return "GOVERNANCE";
  }
  if (!CategoryEnumSchema.safeParse(normalized).success) return "CUSTOM";
  return normalized;
}, CategoryEnumSchema);
export const ConfidenceSchema = z.preprocess((value) => {
  if (typeof value === "number") {
    const normalized = value <= 1 ? value * 100 : value;
    if (normalized <= 40) return "LOW";
    if (normalized <= 75) return "MEDIUM";
    return "HIGH";
  }
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (["LOW", "MEDIUM", "HIGH"].includes(normalized)) return normalized;
    const numeric = Number(normalized);
    if (Number.isFinite(numeric)) {
      const normalizedNumeric = numeric <= 1 ? numeric * 100 : numeric;
      if (normalizedNumeric <= 40) return "LOW";
      if (normalizedNumeric <= 75) return "MEDIUM";
      return "HIGH";
    }
  }
  return value;
}, z.enum(["LOW", "MEDIUM", "HIGH"]));
export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const FlexibleStringSchema = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .filter(Boolean)
      .join("; ");
  }
  if (value != null && typeof value !== "string") return String(value);
  return value;
}, z.string());

const StringArraySchema = z.preprocess((value) => {
  if (typeof value === "string") return value.trim() ? [value] : [];
  return value;
}, z.array(z.string()));

export const EvidenceSchema = z.object({
  documentName: z.string().optional(),
  note: z.string(),
  excerpt: z.string().optional()
});

const EvidenceArraySchema = z.preprocess((value) => {
  if (typeof value === "string") return value.trim() ? [{ note: value }] : [];
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? { note: item } : item));
  }
  return value;
}, z.array(EvidenceSchema));

const GreenwashingRiskSchema = z.object({
  claimOrRisk: FlexibleStringSchema,
  whyRisky: FlexibleStringSchema,
  howToSubstantiate: FlexibleStringSchema
});

const GreenwashingRiskArraySchema = z.preprocess((value) => {
  const toRisk = (item: unknown) => {
    if (typeof item === "string") {
      return {
        claimOrRisk: item,
        whyRisky: "Risken behöver konkretiseras eftersom påståendet annars kan uppfattas som obestyrkt.",
        howToSubstantiate: "Koppla påståendet till tydliga antaganden, pilotdata, kundcase eller annan verifierbar evidens."
      };
    }
    return item;
  };
  if (typeof value === "string") return value.trim() ? [toRisk(value)] : [];
  if (Array.isArray(value)) return value.map(toRisk);
  return value;
}, z.array(GreenwashingRiskSchema));

const AreaAssessmentSchema = z.object({
  potentialLabel: FlexibleStringSchema,
  assessment: FlexibleStringSchema,
  uncertaintyNotes: StringArraySchema.default([])
});

const LegacyScoresSchema = z.object({
  overall: z.number().min(0).max(100),
  environment: z.number().min(0).max(100),
  social: z.number().min(0).max(100),
  governance: z.number().min(0).max(100)
});

const LegacyScoreRationaleSchema = z.object({
  overall: z.string(),
  environment: z.string(),
  social: z.string(),
  governance: z.string()
});

export const MaterialityResultSchema = z.object({
  companySummary: z.string(),
  sustainabilityPerspectiveSummary: z.string(),
  materialityApproach: z.string(),
  selectedAspects: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      category: CategorySchema,
      status: z.enum(["MATERIAL", "UNCERTAIN"]),
      materialityStrength: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5)
      ]),
      materialityDrivers: StringArraySchema.pipe(z.array(
        z.enum(["RISK", "OPPORTUNITY", "IMPACT", "VALUE_CHAIN", "REGULATORY", "USER_IMPACT"])
      )),
      underlyingAspects: StringArraySchema,
      rationale: z.string(),
      startupSpecificReason: z.string(),
      futureDevelopmentRelevance: z.string(),
      evidence: EvidenceArraySchema,
      confidence: ConfidenceSchema,
      uncertaintyNotes: StringArraySchema
    })
  ),
  consideredButNotMaterial: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      category: CategorySchema,
      rationale: z.string()
    })
  ),
  assumptions: StringArraySchema,
  warnings: StringArraySchema
});

export const SufficiencyResultSchema = z.object({
  readyForFinalAnalysis: z.boolean(),
  overallInformationQuality: z.number().min(0).max(100),
  generalComment: z.string(),
  aspectChecks: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      category: CategorySchema,
      informationStatus: z.enum(["SUFFICIENT", "PARTIAL", "MISSING"]),
      rationale: z.string(),
      whatWeKnow: StringArraySchema,
      missingInformation: StringArraySchema,
      question: z
        .object({
          question: FlexibleStringSchema,
          missingInformation: FlexibleStringSchema,
          whyThisMattersForFinalAssessment: FlexibleStringSchema,
          severity: z.enum(["REQUIRED", "RECOMMENDED"]),
          exampleHelpfulEvidence: FlexibleStringSchema
        })
        .optional(),
      confidence: ConfidenceSchema
    })
  ),
  generalMissingInformation: StringArraySchema,
  userMessage: z.string()
});

export const FinalAnalysisResultSchema = z.object({
  executiveSummary: z.string(),
  companySustainabilityDescription: z.string(),
  businessModelCompatibility: z.object({
    status: z.enum(["HARMFUL_OR_RISKY", "COMPATIBLE_WITH_LONG_TERM_SUSTAINABILITY", "UNCERTAIN"]),
    rationale: z.string(),
    consequencesIfScaled: z.string()
  }),
  impactLevel: z.object({
    level: z.enum([
      "HARMFUL_RISKY",
      "RISK_EXPOSED",
      "RESPONSIBLE",
      "SUSTAINABILITY_DRIVEN",
      "IMPACT_DRIVEN",
      "SYSTEM_CHANGING_IMPACT"
    ]),
    labelSv: z.string(),
    rationale: z.string()
  }),
  riskIndicator: z.object({
    level: z.enum(["BALANCED", "SOME_IMBALANCE", "SIGNIFICANT_IMBALANCE"]),
    labelSv: z.string(),
    rationale: z.string()
  }),
  areaAssessments: z.object({
    overall: AreaAssessmentSchema,
    environment: AreaAssessmentSchema,
    social: AreaAssessmentSchema,
    governance: AreaAssessmentSchema
  }),
  scores: LegacyScoresSchema.optional(),
  scoreRationale: LegacyScoreRationaleSchema.optional(),
  informationQualityComment: z.string(),
  informationQualityScore: z.number().min(0).max(100).optional(),
  informationQualityRationale: z.string().optional(),
  whatCompanyNeedsToWorkOn: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: PrioritySchema,
      realisticStartupNextStep: z.string()
    })
  ),
  risks: z.array(
    z.object({
      aspectCode: z.string(),
      category: CategorySchema,
      title: z.string(),
      description: z.string(),
      severity: PrioritySchema,
      timeHorizon: z.enum(["SHORT", "MEDIUM", "LONG"]),
      whyImportant: z.string(),
      howItCanAffectFutureDevelopment: z.string(),
      mitigationSuggestion: z.string(),
      evidence: StringArraySchema
    })
  ),
  opportunities: z.array(
    z.object({
      aspectCode: z.string(),
      category: CategorySchema,
      title: z.string(),
      description: z.string(),
      potential: PrioritySchema,
      whyImportant: z.string(),
      howCompanyCanUseIt: z.string(),
      recommendedAction: z.string(),
      evidence: StringArraySchema
    })
  ),
  discussionQuestions: z.array(
    z.object({
      question: z.string(),
      whyImportant: z.string(),
      suggestedOwnerRole: z.string().optional(),
      aspectCode: z.string().optional()
    })
  ).min(3).max(5),
  greenwashingRisks: GreenwashingRiskArraySchema,
  assumptions: StringArraySchema,
  limitations: StringArraySchema,
  disclaimer: z.string()
});

export const UpdateAnalysisResultSchema = z.object({
  updatedDashboard: FinalAnalysisResultSchema,
  deltaSummary: z.object({
    whatChangedSinceLastAssessment: StringArraySchema,
    newRisks: StringArraySchema,
    reducedRisks: StringArraySchema,
    newOpportunities: StringArraySchema,
    changedImpactLevel: z.string().optional(),
    changedRiskIndicator: z.string().optional(),
    changedAreaAssessments: z.array(
      z.object({
        category: z.enum(["OVERALL", "ENVIRONMENT", "SOCIAL", "GOVERNANCE"]),
        previousPotential: z.string(),
        newPotential: z.string(),
        reason: z.string()
      })
    ),
    recommendedNextDiscussions: StringArraySchema
  })
});

export type MaterialityResult = z.infer<typeof MaterialityResultSchema>;
export type SufficiencyResult = z.infer<typeof SufficiencyResultSchema>;
export type FinalAnalysisResult = z.infer<typeof FinalAnalysisResultSchema>;
export type UpdateAnalysisResult = z.infer<typeof UpdateAnalysisResultSchema>;
