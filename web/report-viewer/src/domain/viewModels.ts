import { compareValues, comparisonTone, statisticValue } from "./comparisons";
import { diagnosticsStatusLabel } from "./coverage";
import { derivedStats, finiteValues } from "./distribution";
import { formatDelta, formatPercent } from "./formatting";
import {
  BUILD_CONFIGURATION_ID,
  BUILD_DURATION_ID,
  compareMetric,
  compareTitle,
  displayLabel,
  metricById,
} from "./metrics";
import { taskPathMetrics, taskPathOf } from "./series";
import { taskCategoryOf, type TaskCategory } from "./taskCategories";
import type {
  BuildObservation,
  Comparison,
  ComparisonTone,
  ExperimentResult,
  Metric,
  StatisticName,
  Variant,
} from "./types";
import { formatMetricValue } from "./units";

export interface KpiModel {
  id: string;
  title: string;
  metric: Metric | null;
  comparison: Comparison;
  tone: ComparisonTone;
  sampleUnit: string;
  quality?: boolean;
  detail: string;
}

export interface CoverageChip {
  id: string;
  label: string;
  state: "available" | "partial" | "unavailable" | "not-requested";
  reason: string;
}

export interface Finding {
  id: string;
  text: string;
  section: string;
}

export interface TaskChangeRow {
  metric: Metric;
  path: string;
  category: TaskCategory;
  comparison: Comparison;
  tone: ComparisonTone;
  baselineValue: number | null;
  candidateValue: number | null;
  baselineCount: number | null;
  candidateCount: number | null;
  absDelta: number;
}

export function coverageState(
  available: boolean,
  partial = false,
  notRequested = false,
): CoverageChip["state"] {
  if (notRequested) {
    return "not-requested";
  }
  if (partial) {
    return "partial";
  }
  return available ? "available" : "unavailable";
}

function familyAvailable(report: ExperimentResult, family: string, seriesCount: number): boolean {
  return report.metrics.some((metric) => metric.family === family) || seriesCount > 0;
}

export function coverageChips(report: ExperimentResult): CoverageChip[] {
  const diagnostics = report.diagnostics.status;
  return [
    {
      id: "builds",
      label: "Builds",
      state: coverageState(Object.values(report.datasets.builds).some((items) => items.length > 0)),
      reason: "Per-build duration and configuration observations.",
    },
    {
      id: "tasks",
      label: "Tasks",
      state: coverageState(
        taskPathMetrics(report).length > 0 || Object.keys(report.datasets.taskSeries).length > 0,
      ),
      reason: "Task path metrics and optional per-build task series.",
    },
    {
      id: "resources",
      label: "Resources",
      state: coverageState(
        familyAvailable(report, "resource", Object.keys(report.datasets.resourceSeries).length),
      ),
      reason: "Resource family metrics and resourceSeries.",
    },
    {
      id: "runtime",
      label: "Runtime",
      state: coverageState(
        familyAvailable(report, "process", Object.keys(report.datasets.processSeries).length),
      ),
      reason: "Gradle/Kotlin process metrics when exported.",
    },
    {
      id: "kotlin",
      label: "Kotlin",
      state: coverageState(
        familyAvailable(report, "kotlin", Object.keys(report.datasets.kotlinBuildReportSeries).length),
      ),
      reason: "Kotlin build report metrics when exported.",
    },
    {
      id: "gc",
      label: "GC",
      state: coverageState(familyAvailable(report, "gc", Object.keys(report.datasets.gcSeries).length)),
      reason: "GC metrics when exported.",
    },
    {
      id: "cpu",
      label: "CPU",
      state:
        diagnostics === "not-requested"
          ? "not-requested"
          : diagnostics === "unavailable"
            ? "unavailable"
            : report.metrics.some((metric) => metric.family === "cpu-diagnostics")
              ? diagnostics === "partial"
                ? "partial"
                : "available"
              : diagnostics === "partial"
                ? "partial"
                : "unavailable",
      reason: diagnosticsStatusLabel(diagnostics),
    },
    {
      id: "jfr",
      label: "JFR",
      state:
        diagnostics === "not-requested"
          ? "not-requested"
          : report.metrics.some((metric) => metric.family === "jfr")
            ? diagnostics === "partial"
              ? "partial"
              : diagnostics === "present"
                ? "available"
                : "unavailable"
            : diagnostics === "unavailable"
              ? "unavailable"
              : diagnostics === "partial"
                ? "partial"
                : "unavailable",
      reason: diagnosticsStatusLabel(diagnostics),
    },
  ];
}

export function overviewKpis(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): KpiModel[] {
  const duration = metricById(report, BUILD_DURATION_ID) ?? null;
  const configuration = metricById(report, BUILD_CONFIGURATION_ID) ?? null;
  const durationCmp = compareMetric(duration ?? undefined, baseline.id, candidate.id, statistic);
  const configurationCmp = compareMetric(
    configuration ?? undefined,
    baseline.id,
    candidate.id,
    statistic,
  );
  const p90Cmp = compareMetric(duration ?? undefined, baseline.id, candidate.id, "p90");
  const baselineBuilds = report.datasets.builds[baseline.id]?.length ?? baseline.buildCount;
  const candidateBuilds = report.datasets.builds[candidate.id]?.length ?? candidate.buildCount;
  return [
    {
      id: "duration",
      title: "Build duration",
      metric: duration,
      comparison: durationCmp,
      tone: comparisonTone(durationCmp, duration?.direction ?? "lower-is-better"),
      sampleUnit: duration?.aggregation?.sampleUnit ?? "build",
      detail: `${statisticLabel(statistic)} · ${displayLabel(candidate)} − ${displayLabel(baseline)}`,
    },
    {
      id: "configuration",
      title: "Configuration",
      metric: configuration,
      comparison: configurationCmp,
      tone: comparisonTone(configurationCmp, configuration?.direction ?? "lower-is-better"),
      sampleUnit: configuration?.aggregation?.sampleUnit ?? "build",
      detail: `${statisticLabel(statistic)} · same comparison`,
    },
    {
      id: "tail",
      title: "Tail latency (P90)",
      metric: duration,
      comparison: p90Cmp,
      tone: comparisonTone(p90Cmp, duration?.direction ?? "lower-is-better"),
      sampleUnit: duration?.aggregation?.sampleUnit ?? "build",
      detail: "P90 of build duration, independent of the selected statistic.",
    },
    {
      id: "coverage",
      title: "Experiment coverage",
      metric: null,
      comparison: compareValues(null, null),
      tone: "neutral",
      sampleUnit: "build",
      quality: true,
      detail: [
        `${baselineBuilds ?? "—"} / ${candidateBuilds ?? "—"} observed builds`,
        report.experiment.mode ?? "mode not recorded",
        `diagnostics ${report.diagnostics.status}`,
        report.warnings.length > 0 ? `${report.warnings.length} warnings` : "no warnings",
      ].join(" · "),
    },
  ];
}

export function statisticLabel(statistic: StatisticName): string {
  if (statistic === "mean") {
    return "Mean";
  }
  return statistic.toUpperCase();
}

export function taskChangeRows(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow[] {
  return taskPathMetrics(report).map((metric) => {
    const comparison = compareMetric(metric, baseline.id, candidate.id, statistic);
    const baselineValue = statisticValue(metric.values[baseline.id], statistic);
    const candidateValue = statisticValue(metric.values[candidate.id], statistic);
    return {
      metric,
      path: taskPathOf(metric),
      category: taskCategoryOf(metric),
      comparison,
      tone: comparisonTone(comparison, metric.direction),
      baselineValue,
      candidateValue,
      baselineCount: metric.values[baseline.id]?.count ?? null,
      candidateCount: metric.values[candidate.id]?.count ?? null,
      absDelta: Math.abs(comparison.deltaAbsolute ?? 0),
    };
  });
}

export function rankedTaskChanges(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow[] {
  return taskChangeRows(report, baseline, candidate, statistic)
    .filter((row) => row.comparison.deltaAbsolute !== null)
    .sort((left, right) => right.absDelta - left.absDelta);
}

export function splitTaskChanges(rows: TaskChangeRow[], limit = 8): {
  increases: TaskChangeRow[];
  decreases: TaskChangeRow[];
} {
  return {
    increases: rows.filter((row) => (row.comparison.deltaAbsolute ?? 0) > 0).slice(0, limit),
    decreases: rows.filter((row) => (row.comparison.deltaAbsolute ?? 0) < 0).slice(0, limit),
  };
}

export function overviewFindings(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): Finding[] {
  const findings: Finding[] = [];
  const duration = metricById(report, BUILD_DURATION_ID);
  const medianCmp = compareMetric(duration, baseline.id, candidate.id, "p50");
  const p90Cmp = compareMetric(duration, baseline.id, candidate.id, "p90");
  const selectedCmp = compareMetric(duration, baseline.id, candidate.id, statistic);
  if (duration && medianCmp.deltaAbsolute !== null) {
    const direction = medianCmp.deltaAbsolute < 0 ? "decreased" : "increased";
    const amount = formatMetricValue(
      Math.abs(medianCmp.deltaAbsolute),
      duration.unit,
      duration.valueType,
    ).text;
    const percent = formatPercent(medianCmp.deltaPercent);
    findings.push({
      id: "median",
      text: `Median build duration ${direction} by ${amount} (${percent}).`,
      section: "builds",
    });
  } else if (duration && selectedCmp.deltaAbsolute !== null) {
    const direction = selectedCmp.deltaAbsolute < 0 ? "decreased" : "increased";
    findings.push({
      id: "selected-stat",
      text: `${statisticLabel(statistic)} build duration ${direction} by ${formatMetricValue(
        Math.abs(selectedCmp.deltaAbsolute),
        duration.unit,
        duration.valueType,
      ).text} (${formatDelta(selectedCmp)}).`,
      section: "builds",
    });
  }
  if (
    medianCmp.deltaAbsolute !== null &&
    p90Cmp.deltaAbsolute !== null &&
    Math.sign(medianCmp.deltaAbsolute) !== 0
  ) {
    const same = Math.sign(medianCmp.deltaAbsolute) === Math.sign(p90Cmp.deltaAbsolute);
    findings.push({
      id: "p90-direction",
      text: same
        ? "P90 moved in the same direction as the median."
        : "P90 moved in the opposite direction from the median.",
      section: "builds",
    });
  }
  const baselineN = report.datasets.builds[baseline.id]?.length ?? baseline.buildCount;
  const candidateN = report.datasets.builds[candidate.id]?.length ?? candidate.buildCount;
  findings.push({
    id: "counts",
    text: `Candidate has ${candidateN ?? "an unknown number of"} measured builds, baseline ${baselineN ?? "an unknown number"}.`,
    section: "details",
  });
  const topIncrease = splitTaskChanges(
    rankedTaskChanges(report, baseline, candidate, statistic),
    1,
  ).increases[0];
  if (topIncrease) {
    findings.push({
      id: "largest-task",
      text: `Task ${topIncrease.path} had the largest absolute ${statisticLabel(statistic)} increase.`,
      section: "tasks",
    });
  }
  findings.push({
    id: "diagnostics",
    text: `Diagnostics ${report.diagnostics.status} — ${diagnosticsStatusLabel(report.diagnostics.status)}`,
    section: "diagnostics",
  });
  return findings;
}

export function buildObservations(
  report: ExperimentResult,
  variant: Variant,
): BuildObservation[] {
  return report.datasets.builds[variant.id] ?? [];
}

export function durationValues(report: ExperimentResult, variant: Variant): number[] {
  return finiteValues(buildObservations(report, variant).map((item) => item.durationMs));
}

export function configurationValues(report: ExperimentResult, variant: Variant): number[] {
  return finiteValues(buildObservations(report, variant).map((item) => item.configurationMs));
}

export function viewerBuildStats(report: ExperimentResult, variant: Variant) {
  return {
    duration: derivedStats(buildObservations(report, variant).map((item) => item.durationMs)),
    configuration: derivedStats(
      buildObservations(report, variant).map((item) => item.configurationMs),
    ),
  };
}

export function experimentHeading(report: ExperimentResult, baseline: Variant, candidate: Variant): {
  title: string;
  comparison: string;
} {
  const comparison = compareTitle(baseline, candidate);
  const title = report.report.title?.trim();
  return {
    title: title && title.length > 0 ? title : comparison,
    comparison,
  };
}

export function deltaFromMedian(
  value: number | null,
  observations: BuildObservation[],
): number | null {
  if (value === null) {
    return null;
  }
  const mid = derivedStats(observations.map((item) => item.durationMs)).p50;
  if (mid === null) {
    return null;
  }
  return value - mid;
}

export { displayLabel };
