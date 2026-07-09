import { describe, expect, it } from "vitest";
import {
  COMMON_SYSTEM_PROMPT,
  MATERIALITY_OPEN_AREA_RULES,
  PHASE_QUESTION_RULES,
  PROMPTS,
  PROMPT_VERSION,
  QUESTION_STYLE_RULES
} from "./prompts";

describe("AI prompts", () => {
  it("includes coach-friendly question rules wherever questions are generated", () => {
    expect(PROMPT_VERSION).toBe("2026-07-09-v2");
    expect(QUESTION_STYLE_RULES).toContain("utan specialistkunskap");
    expect(QUESTION_STYLE_RULES).toContain("observerbara fakta");
    expect(QUESTION_STYLE_RULES).toContain("3-5 meningar");
    expect(PHASE_QUESTION_RULES).toContain("SCREENING");
    expect(PHASE_QUESTION_RULES).toContain("Kräv inte pilotresultat");
    expect(QUESTION_STYLE_RULES).toContain(PHASE_QUESTION_RULES);

    expect(COMMON_SYSTEM_PROMPT).toContain(QUESTION_STYLE_RULES);
    expect(COMMON_SYSTEM_PROMPT).toContain("inte betyg");
    expect(PROMPTS.sufficiency).toContain(QUESTION_STYLE_RULES);
    expect(PROMPTS.final).toContain(QUESTION_STYLE_RULES);
    expect(PROMPTS.final).toContain("textbaserade områdesbedömningar");
    expect(PROMPTS.final).toContain("inte ett snitt");
    expect(PROMPTS.final).toContain("Systemförändrande");
    expect(PROMPTS.final).toContain("konkret riskbild");
    expect(PROMPTS.final).toContain("balans mellan");
    expect(PROMPTS.final).toContain("informationQualityComment");
    expect(PROMPTS.update).toContain(QUESTION_STYLE_RULES);
  });

  it("creates open, company-specific materiality areas behind a sustainability gate", () => {
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("ingen sluten lista");
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("inte som en uttömmande lista");
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("Generisk skalning");
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("ENV, SOC och GOV");
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("kategoriseras som SOCIAL (SOC)");
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("OWN-GOV-01");
    expect(MATERIALITY_OPEN_AREA_RULES).toContain("Använd aldrig CUS, ESRS, CSRD eller VSME som prefix");

    expect(PROMPTS.materiality).toContain(MATERIALITY_OPEN_AREA_RULES);
    expect(PROMPTS.materiality).toContain("Använd denna väsentlighetsgrind");
    expect(PROMPTS.materiality).toContain("SaaS");
    expect(PROMPTS.materiality).toContain("consideredButNotMaterial");
    expect(PROMPTS.materiality).toContain("2-3 neutrala, konkreta och sakliga meningar");
    expect(PROMPTS.materiality).toContain("RISK, OPPORTUNITY, IMPACT, VALUE_CHAIN, REGULATORY och USER_IMPACT");
    expect(PROMPTS.materiality).toContain("Hitta inte på fakta");
    expect(PROMPTS.materiality).toContain("Kvalitetskontroll innan output");
    expect(PROMPTS.final).not.toContain("category CUSTOMER");
  });
});
