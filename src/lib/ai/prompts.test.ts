import { describe, expect, it } from "vitest";
import { COMMON_SYSTEM_PROMPT, PHASE_QUESTION_RULES, PROMPTS, PROMPT_VERSION, QUESTION_STYLE_RULES } from "./prompts";

describe("AI prompts", () => {
  it("includes coach-friendly question rules wherever questions are generated", () => {
    expect(PROMPT_VERSION).toBe("2026-06-28-v2");
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
    expect(PROMPTS.final).toContain("informationQualityComment");
    expect(PROMPTS.update).toContain(QUESTION_STYLE_RULES);
  });
});
