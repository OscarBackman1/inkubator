import { describe, expect, it } from "vitest";
import { clampScore, scoreLabel } from "./scoring";

describe("scoring", () => {
  it("clamps score to visual range", () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(103)).toBe(100);
  });

  it("labels score bands", () => {
    expect(scoreLabel(35)).toBe("Behöver utvecklas");
    expect(scoreLabel(85)).toContain("Stark potential");
  });
});
