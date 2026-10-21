import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateReport } from "../api/validateReport";
import {
  canPlotSequence,
  expensiveTaskMetric,
  isDiagnosticMetric,
  searchTaskMetrics,
  taskPathMetrics,
  taskSeriesByPath,
} from "../domain/series";
import { reportSections } from "../domain/coverage";

const report = validateReport(
  JSON.parse(readFileSync(resolve("public/data/sample.json"), "utf8")),
);

describe("series and coverage", () => {
  it("picks the slowest task path as the default", () => {
    const tasks = taskPathMetrics(report);
    const metric = expensiveTaskMetric(tasks, report.variants[0], report.variants[1], "mean");
    expect(metric?.name).toBe(":app:app:generateDebugGlobalSynthetics");
    expect(
      taskSeriesByPath(report).get(":app:app:compileDebugKotlin")?.observations.cpu_test,
    ).toHaveLength(2);
  });

  it("filters task paths by search", () => {
    const matches = searchTaskMetrics(taskPathMetrics(report), "dexBuilder");
    expect(matches.map((metric) => metric.name)).toEqual([":app:app:dexBuilderDebug"]);
  });

  it("refuses sequence charts for CPU and JFR aggregates", () => {
    const cpu = report.metrics.find((metric) => metric.family === "cpu-diagnostics");
    const jfr = report.metrics.find((metric) => metric.family === "jfr");
    expect(cpu && isDiagnosticMetric(cpu)).toBe(true);
    expect(jfr && canPlotSequence(jfr)).toBe(false);
  });

  it("hides empty process/kotlin/gc sections on the sample fixture", () => {
    const byId = Object.fromEntries(reportSections(report).map((section) => [section.id, section]));
    expect(byId.tasks.available).toBe(true);
    expect(byId.resources.available).toBe(true);
    expect(byId.diagnostics.available).toBe(true);
    expect(byId.processes.available).toBe(false);
    expect(byId.kotlin.available).toBe(false);
    expect(byId.gc.available).toBe(false);
  });
});
