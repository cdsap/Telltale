import type {
  Comparison,
  ComparisonTone,
  MetricDirection,
  Statistic,
  StatisticName,
} from "./types";

export function statisticValue(
  stats: Statistic | undefined,
  name: StatisticName,
): number | null {
  if (!stats) {
    return null;
  }
  const value = stats[name];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function compareValues(
  baseline: number | null,
  candidate: number | null,
): Comparison {
  if (baseline === null || candidate === null) {
    return {
      baseline,
      candidate,
      deltaAbsolute: null,
      deltaPercent: null,
      unavailableReason: "A variant is missing this statistic.",
    };
  }
  if (baseline === 0) {
    return {
      baseline,
      candidate,
      deltaAbsolute: candidate - baseline,
      deltaPercent: null,
      unavailableReason: "Percent change is undefined when the baseline is zero.",
    };
  }
  return {
    baseline,
    candidate,
    deltaAbsolute: candidate - baseline,
    deltaPercent: (100 * (candidate - baseline)) / baseline,
    unavailableReason: null,
  };
}

export function comparisonTone(
  comparison: Comparison,
  direction: MetricDirection,
): ComparisonTone {
  if (comparison.deltaAbsolute === null) {
    return "unavailable";
  }
  if (comparison.deltaAbsolute === 0 || direction == null) {
    return "neutral";
  }
  if (direction === "lower-is-better") {
    return comparison.deltaAbsolute < 0 ? "better" : "worse";
  }
  return comparison.deltaAbsolute > 0 ? "better" : "worse";
}
