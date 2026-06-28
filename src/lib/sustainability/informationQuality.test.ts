import { describe, expect, it } from "vitest";
import type { SufficiencyResult } from "@/lib/ai/schemas";
import { getSufficiencyInformationComment } from "./informationQuality";

const baseCheck = {
  code: "E1",
  name: "Klimatförändringar",
  category: "ENVIRONMENT" as const,
  rationale: "Underlaget behöver kompletteras.",
  whatWeKnow: ["Bolaget beskriver affärsidén."],
  missingInformation: ["Hur området påverkas vid skalning."],
  confidence: "MEDIUM" as const
};

describe("information quality comments", () => {
  it("does not call weak sufficiency evidence good", () => {
    const sufficiency: SufficiencyResult = {
      readyForFinalAnalysis: false,
      overallInformationQuality: 82,
      generalComment: "Gott underlag.",
      aspectChecks: [
        { ...baseCheck, informationStatus: "PARTIAL" },
        { ...baseCheck, code: "S4", name: "Konsumenter och slutanvändare", category: "SOCIAL", informationStatus: "MISSING" }
      ],
      generalMissingInformation: ["Mer information behövs."],
      userMessage: "Komplettera gärna."
    };

    const comment = getSufficiencyInformationComment(sufficiency);

    expect(comment).toContain("Underlaget är fortfarande svagt");
    expect(comment).toContain("1 område är delvis belyst");
    expect(comment).toContain("1 område saknar viktig information");
    expect(comment).not.toContain("Gott underlag");
  });

  it("explains when a first assessment can proceed with remaining gaps", () => {
    const sufficiency: SufficiencyResult = {
      readyForFinalAnalysis: true,
      overallInformationQuality: 62,
      generalComment: "Kort kommentar.",
      aspectChecks: [
        { ...baseCheck, informationStatus: "SUFFICIENT" },
        { ...baseCheck, code: "G1", name: "Affärsetik och bolagsstyrning", category: "GOVERNANCE", informationStatus: "PARTIAL" }
      ],
      generalMissingInformation: ["Vissa antaganden återstår."],
      userMessage: "Du kan gå vidare."
    };

    const comment = getSufficiencyInformationComment(sufficiency);

    expect(comment).toContain("första coachande bedömning");
    expect(comment).toContain("inte komplett");
    expect(comment).toContain("1 område har tillräcklig information");
  });
});
