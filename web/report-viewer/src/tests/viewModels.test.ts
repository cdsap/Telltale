import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateReport } from "../api/validateReport";
import { overviewFindings, overviewKpis, rankedTaskChanges } from "../domain/viewModels";
import { compareValues } from "../domain/comparisons";

const report = validateReport(
  JSON.parse(readFileSync(resolve("public/data/sample.json"), "utf8")),
);

describe("overview view models", () => {
  it("keeps producer build duration numbers for the sample fixture", () => {
    const kpis = overviewKpis(report, report.variants[0], report.variants[1], "mean");
    const duration = kpis.find((kpi) => kpi.id === "duration");
    expect(duration?.comparison.baseline).toBe(810730);
    expect(duration?.comparison.candidate).toBe(914975);
    expect(duration?.comparison.deltaAbsolute).toBe(914975 - 810730);
  });

  it("does not paint a win when percent is undefined", () => {
    expect(compareValues(0, 10).deltaPercent).toBeNull();
  });

  it("emits deterministic findings without causation language", () => {
    const findings = overviewFindings(report, report.variants[0], report.variants[1], "mean");
    expect(findings.map((item) => item.text).join(" ")).not.toMatch(/caused by|statistically significant|bottleneck/i);
    expect(findings.some((item) => /diagnostics/i.test(item.text))).toBe(true);
  });

  it("ranks tasks by absolute duration delta", () => {
    const ranked = rankedTaskChanges(report, report.variants[0], report.variants[1], "mean");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0]?.absDelta).toBeGreaterThanOrEqual(ranked[1]?.absDelta ?? 0);
  });
});
