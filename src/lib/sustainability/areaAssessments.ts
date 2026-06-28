import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export type AreaAssessmentKey = "overall" | "environment" | "social" | "governance";

export type AreaAssessmentItem = {
  key: AreaAssessmentKey;
  title: string;
  potentialLabel: string;
  assessment: string;
  uncertaintyNotes: string[];
};

const areaTitles: Record<AreaAssessmentKey, string> = {
  overall: "Övergripande bedömning",
  environment: "Miljömässig hållbarhet",
  social: "Social hållbarhet",
  governance: "Styrning och ansvar"
};

const legacyPotentialLabels = [
  { limit: 40, label: "Osäker potential" },
  { limit: 60, label: "Ansvarsfull" },
  { limit: 80, label: "Ansvarsfull → Hållbarhetsdrivande" },
  { limit: 101, label: "Impactdrivande" }
] as const;

export function getAreaAssessmentItems(dashboard?: FinalAnalysisResult | null): AreaAssessmentItem[] {
  return (Object.keys(areaTitles) as AreaAssessmentKey[]).map((key) => {
    const assessment = dashboard?.areaAssessments?.[key];
    return {
      key,
      title: areaTitles[key],
      potentialLabel: assessment?.potentialLabel ?? getLegacyPotentialLabel(dashboard, key),
      assessment: assessment?.assessment ?? getLegacyAssessmentText(dashboard, key),
      uncertaintyNotes: assessment?.uncertaintyNotes ?? getLegacyUncertaintyNotes(dashboard)
    };
  });
}

export function getOverallPotentialLabel(dashboard?: FinalAnalysisResult | null) {
  return getAreaAssessmentItems(dashboard).find((item) => item.key === "overall")?.potentialLabel ?? "-";
}

function getLegacyPotentialLabel(dashboard: FinalAnalysisResult | null | undefined, key: AreaAssessmentKey) {
  if (key === "overall" && dashboard?.impactLevel?.labelSv) return dashboard.impactLevel.labelSv;
  const legacyScore = dashboard?.scores?.[key];
  if (legacyScore == null) return dashboard?.impactLevel?.labelSv ?? "Ej bedömt";
  return legacyPotentialLabels.find((item) => legacyScore < item.limit)?.label ?? "Ej bedömt";
}

function getLegacyAssessmentText(dashboard: FinalAnalysisResult | null | undefined, key: AreaAssessmentKey) {
  if (!dashboard) return "Bedömning saknas.";
  if (key === "overall") {
    return dashboard.impactLevel?.rationale ?? dashboard.executiveSummary ?? "Övergripande bedömning saknas.";
  }

  const legacyRationale = dashboard.scoreRationale?.[key];
  if (legacyRationale) return legacyRationale;

  const fallbackTexts: Record<Exclude<AreaAssessmentKey, "overall">, string> = {
    environment:
      "Tidigare analys saknar separat miljötext. Läs bedömningen som en äldre version och skapa en ny analysversion för en mer genomarbetad områdesbedömning.",
    social:
      "Tidigare analys saknar separat social text. Läs bedömningen som en äldre version och skapa en ny analysversion för en mer genomarbetad områdesbedömning.",
    governance:
      "Tidigare analys saknar separat styrningstext. Läs bedömningen som en äldre version och skapa en ny analysversion för en mer genomarbetad områdesbedömning."
  };
  return fallbackTexts[key];
}

function getLegacyUncertaintyNotes(dashboard: FinalAnalysisResult | null | undefined) {
  if (!dashboard) return ["Analysen saknas eller är ofullständig."];
  return dashboard.limitations?.slice(0, 2) ?? ["Äldre analysversion saknar separata osäkerhetsnoteringar per område."];
}
