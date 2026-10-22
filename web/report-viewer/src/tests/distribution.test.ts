import { describe, expect, it } from "vitest";
import { derivedStats, finiteValues, histogramBins, quantile } from "../domain/distribution";

describe("distribution", () => {
  it("drops missing values instead of treating them as zero", () => {
    expect(finiteValues([1, null, undefined, Number.NaN, 2])).toEqual([1, 2]);
  });

  it("computes min/max/percentiles from raw observations", () => {
    const stats = derivedStats([10, 20, 30, 40]);
    expect(stats.n).toBe(4);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(40);
    expect(stats.mean).toBe(25);
    expect(stats.p50).toBe(25);
    expect(quantile([10, 20, 30, 40], 0)).toBe(10);
  });

  it("uses shared bin edges across variants", () => {
    const bins = histogramBins({ a: [0, 10], b: [5, 15] }, 2);
    expect(bins.labels).toHaveLength(2);
    expect(bins.counts.a.reduce((sum, value) => sum + value, 0)).toBe(2);
    expect(bins.counts.b.reduce((sum, value) => sum + value, 0)).toBe(2);
  });
});
