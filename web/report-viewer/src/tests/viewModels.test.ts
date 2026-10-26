import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateReport } from "../api/validateReport";
import {
  investigationFindings,
  overviewFindings,
  overviewKpis,
  overviewOutcome,
  rankedTaskChanges,
} from "../domain/viewModels";
import { compareValues, isMaterialPercent } from "../domain/comparisons";

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

  it("summarizes duration changes without causation language", () => {
    const outcome = overviewOutcome(report, report.variants[0], report.variants[1]);
    expect(outcome.mean.deltaAbsolute).toBe(914975 - 810730);
    expect(outcome.headline).toMatch(/Build duration/);
    expect(`${outcome.headline} ${outcome.summary}`.toLowerCase()).not.toMatch(
      /caused by|statistically significant|root cause/,
    );
  });

  it("ranks tasks by absolute duration delta", () => {
    const ranked = rankedTaskChanges(report, report.variants[0], report.variants[1], "mean");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0]?.absDelta).toBeGreaterThanOrEqual(ranked[1]?.absDelta ?? 0);
  });

  it("ranks unique investigation findings with deep links", () => {
    const findings = investigationFindings(report, report.variants[0], report.variants[1]);
    expect(new Set(findings.map((item) => item.id)).size).toBe(findings.length);
    expect(findings.map((item) => `${item.title} ${item.detail}`).join(" ")).not.toMatch(
      /caused by|statistically significant|bottleneck|median build duration/i,
    );
    expect(findings.some((item) => item.section === "details" && /warning/i.test(item.title))).toBe(
      true,
    );
    expect(findings.some((item) => item.section === "tasks" && Boolean(item.taskId))).toBe(true);
    expect(findings.some((item) => item.id === "duration-mean")).toBe(true);
    const measured = findings.filter(
      (item) => item.section !== "details" && item.id !== "mean-median-disagree",
    );
    expect(measured.length).toBeGreaterThan(0);
    expect(
      measured.every((item) => {
        const match = item.detail.match(/([+\-−]?[\d.]+)%/);
        if (!match) {
          return false;
        }
        return isMaterialPercent(Number(match[1].replace("−", "-")));
      }),
    ).toBe(true);
  });
});

const thresholdReport = validateReport(
  JSON.parse(readFileSync(resolve("src/tests/fixtures/findings-threshold.json"), "utf8")),
);
const quietReport = validateReport(
  JSON.parse(readFileSync(resolve("src/tests/fixtures/findings-quiet.json"), "utf8")),
);

describe("investigation findings threshold", () => {
  it("keeps 5% changes and drops 4.9% and 4% measured rows", () => {
    const findings = investigationFindings(
      thresholdReport,
      thresholdReport.variants[0],
      thresholdReport.variants[1],
    );
    const ids = findings.map((item) => item.id);
    expect(ids).toContain("configuration-mean");
    expect(ids).toContain("path-down-task.task-path.app-dexbuilderdebug.ms");
    expect(ids).toContain("type-down-task.task-type.dexarchivebuilder.ms");
    expect(ids).toContain("resource-resource.build-processes-cpu.mean.percent");
    expect(ids).not.toContain("duration-mean");
    expect(ids.some((id) => id.includes("app-compiledebugkotlin"))).toBe(false);
    expect(ids.some((id) => id.includes("kotlincompile"))).toBe(false);
    expect(ids.some((id) => id.includes("memory"))).toBe(false);
    expect(findings.some((item) => item.section === "configuration")).toBe(true);
  });

  it("emits no findings when every measured change is under 5%", () => {
    const findings = investigationFindings(
      quietReport,
      quietReport.variants[0],
      quietReport.variants[1],
    );
    expect(findings).toEqual([]);
  });
});
