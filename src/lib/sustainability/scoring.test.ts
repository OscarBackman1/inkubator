import { describe, expect, it } from "vitest";
import { clampPercentage } from "./scoring";

describe("percentage helpers", () => {
  it("clamps values to a 0-100 range", () => {
    expect(clampPercentage(-10)).toBe(0);
    expect(clampPercentage(103)).toBe(100);
  });
});
