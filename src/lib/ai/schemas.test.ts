import { describe, expect, it } from "vitest";
import { FinalAnalysisResultSchema, MaterialityResultSchema, SufficiencyResultSchema } from "./schemas";
import { mockFinalAnalysis, mockMateriality, mockSufficiency } from "./mock";

describe("AI schemas", () => {
  it("validates mock materiality output", () => {
    const result = mockMateriality({
      name: "Demo AB",
      phase: "SCREENING",
      industry: "SaaS / Programvara",
      journeyText: "AI-lösning för energioptimering.",
      documentText: "AI-lösning för energioptimering."
    });

    expect(MaterialityResultSchema.parse(result).selectedAspects.length).toBeGreaterThan(0);
  });

  it("normalizes common OpenAI materiality shape drift", () => {
    const result = mockMateriality({
      name: "Demo AB",
      phase: "SCREENING",
      industry: "SaaS / Programvara",
      journeyText: "AI-lösning för energioptimering.",
      documentText: "AI-lösning för energioptimering."
    });

    const drifted = {
      ...result,
      selectedAspects: result.selectedAspects.map((aspect) => ({
        ...aspect,
        evidence: "Underlaget nämner AI och energioptimering.",
        uncertaintyNotes: "Det saknas detaljer om drift och datakällor."
      }))
    };

    const parsed = MaterialityResultSchema.parse(drifted);

    expect(parsed.selectedAspects[0].evidence[0].note).toContain("Underlaget");
    expect(parsed.selectedAspects[0].uncertaintyNotes[0]).toContain("saknas");
  });

  it("normalizes sufficiency question string fields returned as arrays", () => {
    const materiality = mockMateriality({
      name: "Demo AB",
      phase: "SCREENING",
      industry: "SaaS / Programvara",
      journeyText: "AI-lösning för energioptimering.",
      documentText: "AI-lösning för energioptimering."
    });
    const result = mockSufficiency({ materiality, documentText: "Kort underlag" });
    const drifted = {
      ...result,
      aspectChecks: result.aspectChecks.map((check) => ({
        ...check,
        question: check.question
          ? {
              ...check.question,
              missingInformation: ["Framtida vägval", "Ansvarsfördelning"],
              exampleHelpfulEvidence: ["Kort fritext", "Pitchdeck-utdrag"]
            }
          : undefined
      }))
    };

    const parsed = SufficiencyResultSchema.parse(drifted);

    expect(parsed.aspectChecks[0].question?.missingInformation).toContain("Framtida vägval");
    expect(parsed.aspectChecks[0].question?.exampleHelpfulEvidence).toContain("Pitchdeck");
  });

  it("normalizes numeric confidence values", () => {
    const materiality = mockMateriality({
      name: "Demo AB",
      phase: "SCREENING",
      industry: "SaaS / Programvara",
      journeyText: "AI-lösning för energioptimering.",
      documentText: "AI-lösning för energioptimering."
    });
    const result = mockSufficiency({ materiality, documentText: "Kort underlag" });
    const drifted = {
      ...result,
      aspectChecks: result.aspectChecks.map((check, index) => ({
        ...check,
        confidence: index === 0 ? 0.2 : 0.6
      }))
    };
    drifted.aspectChecks.push({
      ...result.aspectChecks[0],
      code: "CUSTOM-CONFIDENCE",
      confidence: 92
    });

    const parsed = SufficiencyResultSchema.parse(drifted);

    expect(parsed.aspectChecks[0].confidence).toBe("LOW");
    expect(parsed.aspectChecks[1].confidence).toBe("MEDIUM");
    expect(parsed.aspectChecks[2].confidence).toBe("HIGH");
  });

  it("normalizes final analysis business categories and greenwashing strings", () => {
    const materiality = mockMateriality({
      name: "Demo AB",
      phase: "SCREENING",
      industry: "SaaS / Programvara",
      journeyText: "AI-lösning för energioptimering.",
      documentText: "AI-lösning för energioptimering."
    });
    const sufficiency = mockSufficiency({ materiality, documentText: "Kort underlag" });
    const result = mockFinalAnalysis({
      companyName: "Demo AB",
      industry: "SaaS / Programvara",
      materiality,
      sufficiency,
      gapAnswers: ["Vi arbetar med tydliga principer."]
    });
    const drifted = {
      ...result,
      areaAssessments: {
        ...result.areaAssessments,
        overall: {
          ...result.areaAssessments.overall,
          uncertaintyNotes: ["Den här ska visas i respektive område, inte övergripande."]
        }
      },
      risks: [...result.risks, { ...result.risks[0], title: "Affärsrisk", category: "BUSINESS" }],
      opportunities: [
        ...result.opportunities,
        { ...result.opportunities[0], title: "Affärsmöjlighet", category: "BUSINESS" }
      ],
      greenwashingRisks: ["Påstår klimatnytta utan pilotdata", "Säger ansvarsfull AI utan transparens"]
    };

    const parsed = FinalAnalysisResultSchema.parse(drifted);

    expect(parsed.areaAssessments.overall.potentialLabel).toContain("potential");
    expect(parsed.areaAssessments.overall.uncertaintyNotes).toEqual([]);
    expect(parsed.areaAssessments.environment.assessment).toContain("miljö");
    expect(parsed.informationQualityComment).toContain("bedömning");
    expect(parsed.risks.at(-1)?.category).toBe("CUSTOM");
    expect(parsed.opportunities.at(-1)?.category).toBe("CUSTOM");
    expect(parsed.greenwashingRisks[0].claimOrRisk).toContain("klimatnytta");
    expect(parsed.greenwashingRisks[0].howToSubstantiate).toContain("pilotdata");
  });
});
