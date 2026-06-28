import type { FinalAnalysisResult, SufficiencyResult } from "@/lib/ai/schemas";

export function getDashboardInformationComment(dashboard?: FinalAnalysisResult | null) {
  if (!dashboard) return "-";
  return (
    compactComment(dashboard.informationQualityComment, dashboard.informationQualityScore) ??
    compactComment(dashboard.informationQualityRationale, dashboard.informationQualityScore) ??
    getLegacyInformationComment(dashboard.informationQualityScore)
  );
}

export function getSufficiencyInformationComment(sufficiency?: SufficiencyResult | null) {
  if (!sufficiency) return "-";
  const counts = sufficiency.aspectChecks.reduce(
    (result, check) => ({
      sufficient: result.sufficient + (check.informationStatus === "SUFFICIENT" ? 1 : 0),
      partial: result.partial + (check.informationStatus === "PARTIAL" ? 1 : 0),
      missing: result.missing + (check.informationStatus === "MISSING" ? 1 : 0)
    }),
    { sufficient: 0, partial: 0, missing: 0 }
  );
  const summary = formatAspectStatusSummary(counts);

  if (!sufficiency.readyForFinalAnalysis) {
    return `Underlaget är fortfarande svagt för en trygg slutbedömning. ${summary}. Komplettera framför allt frågorna nedan, annars behöver analysen markera större osäkerhet.`;
  }

  if (counts.partial > 0 || counts.missing > 0) {
    return `Underlaget räcker för en första coachande bedömning, men är inte komplett. ${summary}. Svaren nedan hjälper till att göra risker, möjligheter och antaganden tydligare.`;
  }

  return `Underlaget ger en bra grund för en första coachande bedömning. ${summary}. Analysen ska ändå markera antaganden och osäkerheter där effekten ännu inte är validerad.`;
}

function getLegacyInformationComment(score?: number | null) {
  if (score == null) return "Ej bedömt.";
  if (score < 45) return "Begränsat underlag.";
  if (score < 70) return "Första bedömning möjlig.";
  return "Gott underlag.";
}

function compactComment(input?: string | null, score?: number | null) {
  const sentence = firstSentence(input);
  if (!sentence) return undefined;
  if (sentence.length <= 110) return sentence;
  if (score != null) return getLegacyInformationComment(score);
  return `${sentence.slice(0, 107)}...`;
}

function formatAspectStatusSummary(counts: { sufficient: number; partial: number; missing: number }) {
  const parts = [
    counts.sufficient ? `${counts.sufficient} ${areaWord(counts.sufficient)} har tillräcklig information` : undefined,
    counts.partial ? formatPartialAreas(counts.partial) : undefined,
    counts.missing ? `${counts.missing} ${areaWord(counts.missing)} saknar viktig information` : undefined
  ].filter(Boolean);

  if (!parts.length) return "Inga väsentliga områden har informationsbedömts ännu";
  if (parts.length === 1) return parts[0]!;
  return `${parts.slice(0, -1).join(", ")} och ${parts.at(-1)}`;
}

function areaWord(count: number) {
  return count === 1 ? "område" : "områden";
}

function formatPartialAreas(count: number) {
  return count === 1 ? "1 område är delvis belyst" : `${count} områden är delvis belysta`;
}

function firstSentence(input?: string | null) {
  const trimmed = input?.trim();
  if (!trimmed) return undefined;
  const sentence = trimmed.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() ?? trimmed;
  return sentence;
}
