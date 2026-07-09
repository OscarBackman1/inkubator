import { describe, expect, it } from "vitest";
import { createCategoryAspectDisplayCodes } from "./aspectCodes";

describe("aspect display codes", () => {
  it("numbers aspects within each sustainability category", () => {
    const codes = createCategoryAspectDisplayCodes([
      { category: "ENVIRONMENT" },
      { category: "SOCIAL" },
      { category: "ENVIRONMENT" },
      { category: "GOVERNANCE" },
      { category: "SOCIAL" },
      { category: "CUSTOM" }
    ]);

    expect(codes).toEqual(["ENV-01", "SOC-01", "ENV-02", "GOV-01", "SOC-02", "OWN-01"]);
  });
});
