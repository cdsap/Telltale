import { statisticValue } from "./comparisons";
import type {
  ExperimentResult,
  Metric,
  NamedSeries,
  SeriesObservation,
  StatisticName,
  TaskSeries,
  Variant,
} from "./types";

export interface SequencePoint {
  sequence: number;
  value: number | null;
}

const DIAGNOSTIC_FAMILIES = new Set(["cpu-diagnostics", "jfr"]);
const DIAGNOSTIC_SAMPLE_UNITS = new Set(["diagnostic-sample", "jvm-event"]);

export function isDiagnosticMetric(metric: Metric): boolean {
  const sampleUnit = metric.aggregation?.sampleUnit ?? "";
  return DIAGNOSTIC_FAMILIES.has(metric.family) || DIAGNOSTIC_SAMPLE_UNITS.has(sampleUnit);
}

export function canPlotSequence(metric: Metric | null | undefined): boolean {
  if (!metric) {
    return false;
  }
  return !isDiagnosticMetric(metric);
}

export function sequenceValues(
  observations: SeriesObservation[] | undefined,
): SequencePoint[] {
  return (observations ?? [])
    .map((observation, index) => ({
      sequence: observation.sequence ?? index + 1,
      value:
        observation.value ??
        observation.durationMs ??
        null,
    }))
    .sort((left, right) => left.sequence - right.sequence);
}

export function namedSeriesList(
  series: Record<string, NamedSeries>,
): NamedSeries[] {
  return Object.values(series);
}

export function taskPathMetrics(report: ExperimentResult): Metric[] {
  return report.metrics.filter(
    (metric) =>
      metric.family === "task" &&
      (metric.category === "Task Path" || Boolean(metric.scope?.taskPath)),
  );
}

export function taskSeriesByPath(report: ExperimentResult): Map<string, TaskSeries> {
  const map = new Map<string, TaskSeries>();
  for (const series of Object.values(report.datasets.taskSeries)) {
    map.set(series.path, series);
  }
  return map;
}

export function taskPathOf(metric: Metric): string {
  return metric.scope?.taskPath ?? metric.name;
}

export function searchTaskMetrics(
  metrics: Metric[],
  query: string,
): Metric[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return metrics;
  }
  return metrics.filter((metric) =>
    `${taskPathOf(metric)} ${metric.category} ${metric.id}`.toLowerCase().includes(needle),
  );
}

export function expensiveTaskMetric(
  metrics: Metric[],
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
): Metric | undefined {
  let best: Metric | undefined;
  let bestValue = Number.NEGATIVE_INFINITY;
  for (const metric of metrics) {
    const left = statisticValue(metric.values[baseline.id], statistic) ?? 0;
    const right = statisticValue(metric.values[candidate.id], statistic) ?? 0;
    const value = Math.max(left, right);
    if (value > bestValue) {
      best = metric;
      bestValue = value;
    }
  }
  return best;
}

export function metricsInFamily(
  report: ExperimentResult,
  family: string,
): Metric[] {
  return report.metrics.filter((metric) => metric.family === family);
}

export function headlineMetrics(
  metrics: Metric[],
  baseline: Variant,
  candidate: Variant,
  statistic: StatisticName,
  limit: number,
): Metric[] {
  return [...metrics]
    .sort((left, right) => {
      const leftMax = Math.max(
        Math.abs(statisticValue(left.values[baseline.id], statistic) ?? 0),
        Math.abs(statisticValue(left.values[candidate.id], statistic) ?? 0),
      );
      const rightMax = Math.max(
        Math.abs(statisticValue(right.values[baseline.id], statistic) ?? 0),
        Math.abs(statisticValue(right.values[candidate.id], statistic) ?? 0),
      );
      return rightMax - leftMax;
    })
    .slice(0, limit);
}

export function seriesForMetric(
  metric: Metric,
  series: Record<string, NamedSeries>,
): NamedSeries | undefined {
  if (series[metric.id]) {
    return series[metric.id];
  }
  return Object.values(series).find(
    (item) => item.name === metric.name || item.name === metric.id,
  );
}
