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
      metric.category === "Task Path" &&
      (Boolean(metric.scope?.taskPath) || Boolean(metric.name)),
  );
}

export function taskTypeMetrics(report: ExperimentResult): Metric[] {
  return report.metrics.filter(
    (metric) => metric.family === "task" && metric.category === "Task Type",
  );
}

export function taskSeriesByPath(report: ExperimentResult): Map<string, TaskSeries> {
  const map = new Map<string, TaskSeries>();
  for (const series of Object.values(report.datasets.taskSeries)) {
    map.set(series.path, series);
  }
  return map;
}

export function taskTypeByPath(report: ExperimentResult): Map<string, string> {
  const map = new Map<string, string>();
  for (const series of Object.values(report.datasets.taskSeries)) {
    if (series.taskType) {
      map.set(series.path, series.taskType);
    }
  }
  return map;
}

export function taskPathOf(metric: Metric): string {
  return metric.scope?.taskPath ?? metric.name;
}

export function taskModuleOf(path: string): string {
  const lastColon = path.lastIndexOf(":");
  if (lastColon <= 0) {
    return path.startsWith(":") ? ":" : "";
  }
  return path.slice(0, lastColon);
}

export function taskTypeOf(metric: Metric): string {
  return metric.scope?.taskType ?? metric.name;
}

function addDuration(
  left: number | null | undefined,
  right: number | null | undefined,
): number | null {
  if (left == null && right == null) {
    return null;
  }
  return (left ?? 0) + (right ?? 0);
}

export function taskSeriesByType(report: ExperimentResult): Map<string, TaskSeries> {
  const map = new Map<string, TaskSeries>();
  for (const series of Object.values(report.datasets.taskSeries)) {
    const typeName = series.taskType;
    if (!typeName) {
      continue;
    }
    const current = map.get(typeName) ?? {
      id: `task.type.${typeName}`,
      path: typeName,
      taskType: typeName,
      observations: {},
    };
    for (const [variantId, observations] of Object.entries(series.observations)) {
      const byKey = new Map(
        (current.observations[variantId] ?? []).map((item) => [
          item.observationId ?? String(item.sequence),
          item,
        ]),
      );
      for (const observation of observations) {
        const key = observation.observationId ?? String(observation.sequence);
        const existing = byKey.get(key);
        if (!existing) {
          byKey.set(key, { ...observation });
          continue;
        }
        byKey.set(key, {
          ...existing,
          value: addDuration(existing.value, observation.value ?? observation.durationMs),
          durationMs: addDuration(existing.durationMs, observation.durationMs ?? observation.value),
        });
      }
      current.observations[variantId] = [...byKey.values()].sort(
        (left, right) => (left.sequence ?? 0) - (right.sequence ?? 0),
      );
    }
    map.set(typeName, current);
  }
  return map;
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
    `${taskPathOf(metric)} ${metric.category} ${metric.id} ${metric.scope?.taskType ?? ""}`
      .toLowerCase()
      .includes(needle),
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

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function stemToken(token: string): string {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }
  if (token.endsWith("es") && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && token.length > 3) {
    return token.slice(0, -1);
  }
  return token;
}

const GENERIC_TOKENS = new Set([
  "max",
  "min",
  "mean",
  "value",
  "total",
  "the",
  "of",
  "and",
  "metric",
]);

function distinctiveTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1 && !GENERIC_TOKENS.has(token))
      .map(stemToken),
  );
}

export function seriesHasPoints(
  series: { observations: Record<string, SeriesObservation[]> } | undefined,
  variantIds: string[],
): boolean {
  if (!series) {
    return false;
  }
  return variantIds.some((variantId) =>
    (series.observations[variantId] ?? []).some(
      (item) => item.value != null || item.durationMs != null,
    ),
  );
}

export function seriesForMetric(
  metric: Metric,
  series: Record<string, NamedSeries>,
): NamedSeries | undefined {
  if (series[metric.id]) {
    return series[metric.id];
  }
  const values = Object.values(series);
  const exactName = values.find(
    (item) =>
      item.name === metric.name ||
      item.name === metric.id ||
      item.name.toLowerCase() === metric.name.toLowerCase(),
  );
  if (exactName) {
    return exactName;
  }
  const metricKey = normalizeKey(`${metric.category} ${metric.name}`);
  const nameKey = normalizeKey(metric.name);
  const idKey = normalizeKey(metric.id);
  const normalized = values.find((item) => {
    const seriesKey = normalizeKey(item.name);
    const seriesId = normalizeKey(item.id);
    return seriesKey === metricKey || seriesKey === nameKey || seriesId === idKey || seriesId === nameKey;
  });
  if (normalized) {
    return normalized;
  }
  const metricTokens = distinctiveTokens(`${metric.category} ${metric.name} ${metric.id}`);
  let best: NamedSeries | undefined;
  let bestScore = 0;
  for (const item of values) {
    const itemTokens = distinctiveTokens(`${item.name} ${item.id}`);
    if (metricTokens.size === 0 || itemTokens.size === 0) {
      continue;
    }
    const overlap = [...metricTokens].filter((token) => itemTokens.has(token)).length;
    const score = overlap / Math.min(metricTokens.size, itemTokens.size);
    if (overlap >= 2 && score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return bestScore >= 0.5 ? best : undefined;
}

export function firstSeriesWithPoints(
  series: Record<string, NamedSeries> | NamedSeries[],
  variantIds: string[],
): NamedSeries | undefined {
  const values = Array.isArray(series) ? series : Object.values(series);
  return values.find((item) => seriesHasPoints(item, variantIds)) ?? values[0];
}

const PROCESS_KIND = /(capacity|gctime|gctype|max|uptime|usage)$/i;

function processGroup(series: NamedSeries): { runtime: string; kind: string } {
  const haystack = `${series.id} ${series.name}`;
  const runtime = /kotlin/i.test(haystack)
    ? "kotlin"
    : /gradle/i.test(haystack)
      ? "gradle"
      : "process";
  const kind = haystack.match(PROCESS_KIND)?.[1]?.toLowerCase() ?? "value";
  return { runtime, kind };
}

function mergeObservationMax(items: NamedSeries[]): Record<string, SeriesObservation[]> {
  const observations: Record<string, Map<string, SeriesObservation>> = {};
  for (const series of items) {
    for (const [variantId, points] of Object.entries(series.observations)) {
      const bucket = observations[variantId] ?? new Map<string, SeriesObservation>();
      for (const point of points) {
        const key = point.observationId ?? String(point.sequence);
        const value = point.value ?? point.durationMs;
        const existing = bucket.get(key);
        if (!existing) {
          bucket.set(key, { ...point, value });
          continue;
        }
        const current = existing.value ?? existing.durationMs;
        if (value != null && (current == null || value > current)) {
          bucket.set(key, { ...existing, value, durationMs: point.durationMs ?? existing.durationMs });
        }
      }
      observations[variantId] = bucket;
    }
  }
  return Object.fromEntries(
    Object.entries(observations).map(([variantId, points]) => [
      variantId,
      [...points.values()].sort((left, right) => (left.sequence ?? 0) - (right.sequence ?? 0)),
    ]),
  );
}

export function aggregateProcessSeries(
  series: Record<string, NamedSeries>,
): Record<string, NamedSeries> {
  const groups = new Map<string, NamedSeries[]>();
  for (const item of Object.values(series)) {
    const group = processGroup(item);
    const key = `${group.runtime}-${group.kind}`;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  const aggregated: Record<string, NamedSeries> = {};
  for (const [key, items] of groups) {
    const [runtime, kind] = key.split("-");
    const prefix = runtime === "kotlin" ? "Kotlin-Process" : runtime === "gradle" ? "Gradle-Process" : "Process";
    const name = `${prefix}-${kind}`;
    aggregated[`process.aggregated.${key}`] = {
      id: `process.aggregated.${key}`,
      name,
      unit: items.find((item) => item.unit)?.unit ?? "",
      observations: mergeObservationMax(items),
    };
  }
  return aggregated;
}
