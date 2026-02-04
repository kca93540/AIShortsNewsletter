import { describe, expect, it } from "vitest";
import { simplifyCardFields } from "../src/utils/simplify";

describe("simplifyCardFields", () => {
  it("returns shorter simplified text", () => {
    const original = {
      concept: "Utilize clear instructions and constraints to optimize prompt quality and reduce confusion.",
      whyItMatters: "This facilitates better outcomes and helps you evaluate responses more efficiently.",
      example: "For example, request a summary with three bullets and ask for any uncertain claims to be highlighted.",
      actionStep: "Create a short prompt checklist before you use the tool each time."
    };

    const simplified = simplifyCardFields(original);

    expect(simplified.concept.length).toBeLessThan(original.concept.length);
    expect(simplified.whyItMatters.length).toBeLessThan(original.whyItMatters.length);
    expect(simplified.actionStep.length).toBeLessThan(original.actionStep.length);
    expect(simplified.concept.toLowerCase()).toContain("use");
  });
});
