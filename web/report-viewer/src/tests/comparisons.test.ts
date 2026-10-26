import { describe, expect, it } from "vitest";
import { compareValues, comparisonTone, isMaterialPercent } from "../domain/comparisons";

describe("compareValues", () => {
  it("computes absolute and percent delta", () => {
    expect(compareValues(200, 150)).toEqual({
      baseline: 200,
      candidate: 150,
      deltaAbsolute: -50,
      deltaPercent: -25,
      unavailableReason: null,
    });
  });

  it("returns N/A percent when the baseline is zero", () => {
    const result = compareValues(0, 10);
    expect(result.deltaAbsolute).toBe(10);
    expect(result.deltaPercent).toBeNull();
    expect(result.unavailableReason).toMatch(/zero/i);
  });

  it("does not invent a delta when a value is missing", () => {
    const result = compareValues(null, 10);
    expect(result.deltaAbsolute).toBeNull();
    expect(result.deltaPercent).toBeNull();
  });
});

describe("isMaterialPercent", () => {
  it("treats absolute changes of 5% or more as material", () => {
    expect(isMaterialPercent(5)).toBe(true);
    expect(isMaterialPercent(-5)).toBe(true);
    expect(isMaterialPercent(12.8)).toBe(true);
    expect(isMaterialPercent(4.99)).toBe(false);
    expect(isMaterialPercent(null)).toBe(false);
  });
});

describe("comparisonTone", () => {
  it("treats lower duration as better", () => {
    expect(comparisonTone(compareValues(200, 150), "lower-is-better")).toBe("better");
    expect(comparisonTone(compareValues(200, 250), "lower-is-better")).toBe("worse");
  });

  it("stays neutral when direction is unknown", () => {
    expect(comparisonTone(compareValues(200, 150), null)).toBe("neutral");
  });
});
