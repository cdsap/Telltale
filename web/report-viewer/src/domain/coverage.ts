import type { ExperimentResult } from "./types";
import { metricsInFamily, taskPathMetrics } from "./series";

export interface ReportSection {
  id: string;
  title: string;
  available: boolean;
}

export function diagnosticsStatusLabel(status: string): string {
  switch (status) {
    case "present":
      return "CPU and JFR diagnostics are present.";
    case "partial":
      return "Some CPU or JFR diagnostics are missing.";
    case "unavailable":
      return "Diagnostics were requested, but no usable artifacts were imported.";
    case "not-requested":
      return "CPU and JFR diagnostics were not requested for this experiment.";
    default:
      return `Diagnostics status: ${status}.`;
  }
}

export function runtimeSubsections(report: ExperimentResult): ReportSection[] {
  return [
    {
      id: "processes",
      title: "Processes",
      available:
        metricsInFamily(report, "process").length > 0 ||
        Object.keys(report.datasets.processSeries).length > 0,
    },
    {
      id: "kotlin",
      title: "Kotlin",
      available:
        metricsInFamily(report, "kotlin").length > 0 ||
        Object.keys(report.datasets.kotlinBuildReportSeries).length > 0,
    },
    {
      id: "gc",
      title: "GC",
      available:
        metricsInFamily(report, "gc").length > 0 || Object.keys(report.datasets.gcSeries).length > 0,
    },
  ];
}

export function reportSections(report: ExperimentResult): ReportSection[] {
  const hasBuilds = Object.values(report.datasets.builds).some((items) => items.length > 0);
  const hasTasks =
    taskPathMetrics(report).length > 0 || Object.keys(report.datasets.taskSeries).length > 0;
  const runtime = runtimeSubsections(report);
  return [
    { id: "overview", title: "Overview", available: true },
    { id: "builds", title: "Builds", available: hasBuilds },
    { id: "tasks", title: "Tasks", available: hasTasks },
    {
      id: "resources",
      title: "Resources",
      available:
        metricsInFamily(report, "resource").length > 0 ||
        Object.keys(report.datasets.resourceSeries).length > 0,
    },
    {
      id: "runtime",
      title: "Runtime",
      available: runtime.some((section) => section.available),
    },
    { id: "diagnostics", title: "Diagnostics", available: true },
    { id: "metrics", title: "Metrics", available: report.metrics.length > 0 },
    { id: "details", title: "Details", available: true },
  ];
}
