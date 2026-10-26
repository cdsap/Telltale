import type { ExperimentResult, Metric, StatisticName, Variant } from "./types";
import { compareValues, statisticValue } from "./comparisons";

export const BUILD_DURATION_ID = "build.duration";
export const BUILD_CONFIGURATION_ID = "build.configuration";

export function metricById(
  report: ExperimentResult,
  id: string,
): Metric | undefined {
  return report.metrics.find((metric) => metric.id === id);
}

export function variantByRole(
  variants: Variant[],
  role: "baseline" | "candidate",
): Variant | undefined {
  return (
    variants.find((variant) => variant.role === role) ??
    (role === "baseline" ? variants[0] : variants[1])
  );
}

export function compareMetric(
  metric: Metric | undefined,
  baselineId: string,
  candidateId: string,
  statistic: StatisticName,
) {
  if (!metric) {
    return compareValues(null, null);
  }
  return compareValues(
    statisticValue(metric.values[baselineId], statistic),
    statisticValue(metric.values[candidateId], statistic),
  );
}

export function familiesIn(report: ExperimentResult): string[] {
  return [...new Set(report.metrics.map((metric) => metric.family))];
}

export function displayLabel(variant: Variant): string {
  return variant.label.replace(/^variant[ab]_/i, "");
}

export function metricDisplayName(metric: Metric): string {
  if (metric.category && metric.category !== metric.name) {
    return `${metric.category} · ${metric.name}`;
  }
  return metric.name;
}

export function resourceGroupOf(category: string): "CPU" | "Memory" | "Other" {
  const value = category.toLowerCase();
  if (value.includes("cpu")) {
    return "CPU";
  }
  if (value.includes("memory") || /\bmem\b/.test(value)) {
    return "Memory";
  }
  return "Other";
}

export function compareTitle(baseline: Variant, candidate: Variant): string {
  return `${displayLabel(baseline)} vs ${displayLabel(candidate)}`;
}

export const KEY_METRIC_FAMILIES = new Set([
  "build",
  "resource",
  "process",
  "gc",
  "kotlin",
  "cpu-diagnostics",
  "jfr",
]);
