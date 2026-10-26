import type { WorkbenchSection } from "../app/routes";
import { compareValues, comparisonTone, isMaterialPercent, statisticValue } from "./comparisons";
import { diagnosticsStatusLabel } from "./coverage";
import { derivedStats } from "./distribution";
import { formatDelta, formatPercent } from "./formatting";
import {
  BUILD_CONFIGURATION_ID,
  BUILD_DURATION_ID,
  compareMetric,
  compareTitle,
  displayLabel,
  metricById,
} from "./metrics";
import {
  DEFAULT_TASK_MIN_DURATION_MS,
  matchesTaskMinDuration,
} from "./taskTableFilters";
import {
  metricsInFamily,
  shortTypeName,
  taskPathMetrics,
  taskPathOf,
  taskTypeByPath,
  taskTypeMetrics,
  taskTypeOf,
} from "./series";
import { taskCategoryOf, type TaskCategory } from "./taskCategories";
import type {
  BuildObservation,
  Comparison,
  ComparisonTone,
  ExperimentResult,
  Metric,
  SeriesObservation,
  Statistic,
  StatisticName,
  TaskSeries,
  Variant,
} from "./types";
import { formatMetricValue, formatSignedMetricValue } from "./units";

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

export interface InvestigationFinding {
  id: string;
  title: string;
  detail: string;
  action: string;
  section: WorkbenchSection;
  taskId?: string | null;
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

export interface OverviewOutcome {
  duration: Metric | null;
  configuration: Metric | null;
  mean: Comparison;
  median: Comparison;
  p90: Comparison;
  headline: string;
  summary: string;
  baselineN: number | null;
  candidateN: number | null;
}

export function overviewOutcome(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
): OverviewOutcome {
  const duration = metricById(report, BUILD_DURATION_ID) ?? null;
  const configuration = metricById(report, BUILD_CONFIGURATION_ID) ?? null;
  const mean = compareMetric(duration ?? undefined, baseline.id, candidate.id, "mean");
  const median = compareMetric(duration ?? undefined, baseline.id, candidate.id, "p50");
  const p90 = compareMetric(duration ?? undefined, baseline.id, candidate.id, "p90");
  const meanSign = Math.sign(mean.deltaAbsolute ?? 0);
  const medianSign = Math.sign(median.deltaAbsolute ?? 0);
  let headline = "Build duration";
  let summary = "Duration statistics are not available for both variants.";
  if (duration && mean.deltaAbsolute != null && median.deltaAbsolute != null) {
    const meanText = formatSignedMetricValue(mean.deltaAbsolute, duration.unit, duration.valueType).text;
    const medianText = formatSignedMetricValue(
      median.deltaAbsolute,
      duration.unit,
      duration.valueType,
    ).text;
    if (meanSign !== 0 && medianSign !== 0 && meanSign !== medianSign) {
      headline = "Build duration: mixed result";
      summary = `Mean changed by ${meanText}, while median changed by ${medianText}. This is a descriptive result, not proof of a meaningful regression.`;
    } else if (meanSign < 0) {
      headline = "Build duration: candidate faster";
      summary = `Mean changed by ${meanText}; median changed by ${medianText}.`;
    } else if (meanSign > 0) {
      headline = "Build duration: candidate slower";
      summary = `Mean changed by ${meanText}; median changed by ${medianText}.`;
    } else {
      summary = `Mean changed by ${meanText}; median changed by ${medianText}.`;
    }
  }
  return {
    duration,
    configuration,
    mean,
    median,
    p90,
    headline,
    summary,
    baselineN: observedBuildCount(report, baseline),
    candidateN: observedBuildCount(report, candidate),
  };
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
  const baselineBuilds = observedBuildCount(report, baseline);
  const candidateBuilds = observedBuildCount(report, candidate);
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
  switch (statistic) {
    case "p50":
      return "Median";
    case "p90":
      return "P90";
    default:
      return "Average";
  }
}

function metricChangeRow(
  metric: Metric,
  path: string,
  category: TaskCategory,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow {
  const comparison = compareMetric(metric, baseline.id, candidate.id, statistic);
  const baselineValue = statisticValue(metric.values[baseline.id], statistic);
  const candidateValue = statisticValue(metric.values[candidate.id], statistic);
  return {
    metric,
    path,
    category,
    comparison,
    tone: comparisonTone(comparison, metric.direction),
    baselineValue,
    candidateValue,
    baselineCount: metric.values[baseline.id]?.count ?? null,
    candidateCount: metric.values[candidate.id]?.count ?? null,
    absDelta: Math.abs(comparison.deltaAbsolute ?? 0),
  };
}

function statisticFromObservations(
  observations: SeriesObservation[] | undefined,
): Statistic {
  const stats = derivedStats((observations ?? []).map((item) => item.durationMs ?? item.value));
  return {
    mean: stats.mean,
    p50: stats.p50,
    p90: stats.p90,
    count: stats.n,
  };
}

function metricFromTaskSeries(series: TaskSeries, baselineId: string, candidateId: string): Metric {
  return {
    id: series.id,
    family: "task",
    category: "Task Path",
    name: series.path,
    unit: "ms",
    valueType: "duration",
    direction: "lower-is-better",
    scope: {
      qualifier: null,
      taskPath: series.path,
      taskType: series.taskType,
    },
    aggregation: { sampleUnit: "build", method: "viewer-from-series" },
    values: {
      [baselineId]: statisticFromObservations(series.observations[baselineId]),
      [candidateId]: statisticFromObservations(series.observations[candidateId]),
    },
  };
}

export function taskChangeRows(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow[] {
  const types = taskTypeByPath(report);
  return taskPathMetrics(report).map((metric) => {
    const path = taskPathOf(metric);
    return metricChangeRow(
      metric,
      path,
      taskCategoryOf(metric, types.get(path)),
      baseline,
      candidate,
      statistic,
    );
  });
}

export function allTaskPathRows(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow[] {
  const rows = taskChangeRows(report, baseline, candidate, statistic);
  const seen = new Set(rows.map((row) => row.path));
  const extra: TaskChangeRow[] = [];
  for (const series of Object.values(report.datasets.taskSeries)) {
    if (seen.has(series.path)) {
      continue;
    }
    seen.add(series.path);
    const metric = metricFromTaskSeries(series, baseline.id, candidate.id);
    extra.push(
      metricChangeRow(
        metric,
        series.path,
        taskCategoryOf(metric, series.taskType),
        baseline,
        candidate,
        statistic,
      ),
    );
  }
  return extra.length === 0 ? rows : [...rows, ...extra];
}

export function taskTypeChangeRows(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow[] {
  return taskTypeMetrics(report).map((metric) =>
    metricChangeRow(
      metric,
      taskTypeOf(metric),
      taskCategoryOf(metric),
      baseline,
      candidate,
      statistic,
    ),
  );
}

export function rankedByAbsDelta(rows: TaskChangeRow[]): TaskChangeRow[] {
  return rows
    .filter((row) => row.comparison.deltaAbsolute !== null)
    .sort((left, right) => right.absDelta - left.absDelta);
}

export function rankedTaskChanges(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): TaskChangeRow[] {
  return rankedByAbsDelta(taskChangeRows(report, baseline, candidate, statistic));
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
  const baselineN = observedBuildCount(report, baseline);
  const candidateN = observedBuildCount(report, candidate);
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

function materialChangeRows(rows: TaskChangeRow[]): TaskChangeRow[] {
  return rankedByAbsDelta(rows.filter((row) => isMaterialPercent(row.comparison.deltaPercent)));
}

function taskFinding(
  row: TaskChangeRow,
  kind: "path" | "type",
): InvestigationFinding {
  const increased = (row.comparison.deltaAbsolute ?? 0) > 0;
  const name = kind === "type" ? shortTypeName(row.path) : row.path;
  return {
    id: `${kind}-${increased ? "up" : "down"}-${row.metric.id}`,
    title: `${name} mean duration ${increased ? "increased" : "decreased"}`,
    detail: `${formatSignedMetricValue(row.comparison.deltaAbsolute, row.metric.unit, row.metric.valueType).text} (${formatDelta(row.comparison)}) · n ${row.baselineCount ?? "—"}/${row.candidateCount ?? "—"}.`,
    action: kind === "type" ? "Inspect type" : "Inspect task",
    section: kind === "type" ? "task-types" : "tasks",
    taskId: row.metric.id,
  };
}

export function investigationFindings(
  report: ExperimentResult,
  baseline: Variant,
  candidate: Variant,
): InvestigationFinding[] {
  const findings: InvestigationFinding[] = [];
  const duration = metricById(report, BUILD_DURATION_ID);
  const configuration = metricById(report, BUILD_CONFIGURATION_ID);
  const mean = compareMetric(duration, baseline.id, candidate.id, "mean");
  const median = compareMetric(duration, baseline.id, candidate.id, "p50");
  const configurationMean = compareMetric(configuration, baseline.id, candidate.id, "mean");
  const baselineN = observedBuildCount(report, baseline);
  const candidateN = observedBuildCount(report, candidate);
  if (duration && isMaterialPercent(mean.deltaPercent)) {
    const increased = (mean.deltaAbsolute ?? 0) > 0;
    findings.push({
      id: "duration-mean",
      title: `Build duration mean ${increased ? "increased" : "decreased"}`,
      detail: `${formatSignedMetricValue(mean.deltaAbsolute, duration.unit, duration.valueType).text} (${formatDelta(mean)}). n ${baselineN ?? "—"}/${candidateN ?? "—"}.`,
      action: "Inspect builds",
      section: "builds",
    });
  }
  if (configuration && isMaterialPercent(configurationMean.deltaPercent)) {
    const increased = (configurationMean.deltaAbsolute ?? 0) > 0;
    findings.push({
      id: "configuration-mean",
      title: `Configuration time mean ${increased ? "increased" : "decreased"}`,
      detail: `${formatSignedMetricValue(configurationMean.deltaAbsolute, configuration.unit, configuration.valueType).text} (${formatDelta(configurationMean)}). n ${baselineN ?? "—"}/${candidateN ?? "—"}.`,
      action: "Inspect configuration",
      section: "configuration",
    });
  }
  if (
    duration &&
    mean.deltaAbsolute != null &&
    median.deltaAbsolute != null &&
    mean.deltaAbsolute !== 0 &&
    median.deltaAbsolute !== 0 &&
    Math.sign(mean.deltaAbsolute) !== Math.sign(median.deltaAbsolute)
  ) {
    findings.push({
      id: "mean-median-disagree",
      title: "Build duration mean and median moved in opposite directions",
      detail: `Mean ${formatSignedMetricValue(mean.deltaAbsolute, duration.unit, duration.valueType).text}; median ${formatSignedMetricValue(median.deltaAbsolute, duration.unit, duration.valueType).text}. n ${baselineN ?? "—"}/${candidateN ?? "—"}.`,
      action: "Inspect builds",
      section: "builds",
    });
  }
  const impactTasks = materialChangeRows(
    allTaskPathRows(report, baseline, candidate, "mean").filter((row) =>
      matchesTaskMinDuration(row, DEFAULT_TASK_MIN_DURATION_MS, baseline.id, candidate.id),
    ),
  );
  const taskSplit = splitTaskChanges(impactTasks, 3);
  for (const row of [...taskSplit.increases, ...taskSplit.decreases]) {
    findings.push(taskFinding(row, "path"));
  }
  const typeSplit = splitTaskChanges(
    materialChangeRows(taskTypeChangeRows(report, baseline, candidate, "mean")),
    1,
  );
  for (const row of [...typeSplit.increases, ...typeSplit.decreases]) {
    findings.push(taskFinding(row, "type"));
  }
  const resource = metricsInFamily(report, "resource")
    .map((metric) => ({
      metric,
      comparison: compareMetric(metric, baseline.id, candidate.id, "mean"),
    }))
    .filter((item) => isMaterialPercent(item.comparison.deltaPercent))
    .sort(
      (left, right) =>
        Math.abs(right.comparison.deltaPercent ?? 0) - Math.abs(left.comparison.deltaPercent ?? 0),
    )[0];
  if (resource) {
    findings.push({
      id: `resource-${resource.metric.id}`,
      title: `${resource.metric.category} ${resource.metric.name} changed`,
      detail: `${formatSignedMetricValue(resource.comparison.deltaAbsolute, resource.metric.unit, resource.metric.valueType).text} (${formatDelta(resource.comparison)}). Direction is not classified automatically.`,
      action: "Inspect resources",
      section: "resources",
    });
  }
  if (report.warnings.length > 0) {
    findings.push({
      id: "warnings",
      title: `${report.warnings.length} experiment warnings`,
      detail: "Collection or comparability issues may affect how these results should be read.",
      action: "Open details",
      section: "details",
    });
  }
  if (report.diagnostics.status !== "present") {
    findings.push({
      id: "diagnostics-coverage",
      title: `Diagnostics ${report.diagnostics.status}`,
      detail: diagnosticsStatusLabel(report.diagnostics.status),
      action: "Review coverage",
      section: "details",
    });
  }
  return findings;
}

export function observedBuildCount(report: ExperimentResult, variant: Variant): number | null {
  return report.datasets.builds[variant.id]?.length ?? variant.buildCount ?? null;
}

export function buildObservations(
  report: ExperimentResult,
  variant: { id: string },
): BuildObservation[] {
  return report.datasets.builds[variant.id] ?? [];
}

export function buildFieldSeries(
  report: ExperimentResult,
  variants: Array<{ id: string }>,
  field: "durationMs" | "configurationMs",
): Record<string, SeriesObservation[]> {
  const observations: Record<string, SeriesObservation[]> = {};
  for (const variant of variants) {
    observations[variant.id] = buildObservations(report, variant).map((item) => ({
      observationId: item.observationId,
      sequence: item.sequence,
      value: item[field],
      durationMs: item[field],
      outcome: null,
    }));
  }
  return observations;
}

export function buildFieldValues(
  report: ExperimentResult,
  variants: Array<{ id: string }>,
  field: "durationMs" | "configurationMs",
): Record<string, Array<number | null | undefined>> {
  const values: Record<string, Array<number | null | undefined>> = {};
  for (const variant of variants) {
    values[variant.id] = buildObservations(report, variant).map((item) => item[field]);
  }
  return values;
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
