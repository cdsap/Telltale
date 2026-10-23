import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateReport } from "../api/validateReport";
import {
  aggregateProcessSeries,
  canPlotSequence,
  expensiveTaskMetric,
  isDiagnosticMetric,
  searchTaskMetrics,
  seriesForMetric,
  taskModuleOf,
  taskPathMetrics,
  taskSeriesByPath,
  taskTypeMetrics,
} from "../domain/series";
import { reportSections } from "../domain/coverage";
import { allTaskPathRows, taskChangeRows } from "../domain/viewModels";

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

  it("derives the module as the task path without the last segment", () => {
    expect(taskModuleOf(":app:app:compileDebugKotlin")).toBe(":app:app");
    expect(taskModuleOf(":core:network:compileDebugKotlin")).toBe(":core:network");
    expect(taskModuleOf(":assemble")).toBe(":");
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
    expect(byId["task-types"].available).toBe(false);
    expect(byId.resources.available).toBe(true);
    expect(byId.diagnostics.available).toBe(true);
    expect(byId.runtime.available).toBe(false);
    expect(byId.kotlin.available).toBe(false);
    expect(byId.details.available).toBe(true);
  });
});

const gaps = validateReport(
  JSON.parse(readFileSync(resolve("src/tests/fixtures/viewer-gaps.json"), "utf8")),
);

describe("family series matching", () => {
  it("matches resource timelines when producer names differ slightly", () => {
    const metric = gaps.metrics.find((item) => item.family === "resource");
    expect(metric).toBeDefined();
    const matched = seriesForMetric(metric!, gaps.datasets.resourceSeries);
    expect(matched?.name).toBe("Build process memory max");
  });

  it("aggregates per-PID process series into one timeline", () => {
    const aggregated = aggregateProcessSeries(gaps.datasets.processSeries);
    const usage = Object.values(aggregated).find((item) => item.name === "Gradle-Process-usage");
    expect(usage?.observations.a[0]?.value).toBe(70);
    expect(usage?.observations.b[0]?.value).toBe(60);
  });

  it("exposes task types and kotlin reports when present", () => {
    const byId = Object.fromEntries(reportSections(gaps).map((section) => [section.id, section]));
    expect(taskTypeMetrics(gaps)).toHaveLength(1);
    expect(byId["task-types"].available).toBe(true);
    expect(byId.kotlin.available).toBe(true);
  });

  it("filters task paths with the series task type category", () => {
    const rows = taskChangeRows(gaps, gaps.variants[0], gaps.variants[1], "mean");
    expect(rows[0]?.category).toBe("Kotlin");
  });

  it("includes task series that have no producer Task Path metric", () => {
    const rows = allTaskPathRows(gaps, gaps.variants[0], gaps.variants[1], "mean");
    expect(taskChangeRows(gaps, gaps.variants[0], gaps.variants[1], "mean").map((row) => row.path)).not.toContain(
      ":app:app:dexBuilderDebug",
    );
    expect(rows.map((row) => row.path)).toContain(":app:app:dexBuilderDebug");
    const matches = searchTaskMetrics(
      rows.map((row) => row.metric),
      "dexBuilder",
    );
    expect(matches.map((metric) => metric.name)).toEqual([":app:app:dexBuilderDebug"]);
  });
});
