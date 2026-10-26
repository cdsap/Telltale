import { compareValues, statisticValue } from "./comparisons";
import type { Metric, StatisticName, Variant } from "./types";
import { parseStatTableColumn } from "./tableStatistics";
import {
  compareNullableNumbers,
  compareStrings,
  sortDirectionSign,
  type SortDirection,
} from "./tableSort";

export type MetricRowSortColumn =
  | "category"
  | "metric"
  | "baseline"
  | "candidate"
  | "delta"
  | string;

const DEFAULT_SORT_STATISTIC: StatisticName = "mean";

function sortStatisticForColumn(column: MetricRowSortColumn): StatisticName {
  const parsed = parseStatTableColumn(column);
  if (parsed) {
    return parsed.statistic;
  }
  return DEFAULT_SORT_STATISTIC;
}

export function sortMetrics(
  metrics: Metric[],
  baseline: Variant,
  candidate: Variant,
  _statistic: StatisticName,
  column: MetricRowSortColumn,
  direction: SortDirection,
): Metric[] {
  const sign = sortDirectionSign(direction);
  const parsed = parseStatTableColumn(column);
  const copy = [...metrics];
  copy.sort((left, right) => {
    switch (column) {
      case "category":
        return sign * compareStrings(left.category, right.category);
      case "metric":
        return sign * compareStrings(left.name, right.name);
      case "baseline":
      case "candidate":
      case "delta": {
        const stat = sortStatisticForColumn(column);
        if (column === "baseline") {
          const leftValue = statisticValue(left.values[baseline.id], stat);
          const rightValue = statisticValue(right.values[baseline.id], stat);
          return sign * compareNullableNumbers(leftValue, rightValue);
        }
        if (column === "candidate") {
          const leftValue = statisticValue(left.values[candidate.id], stat);
          const rightValue = statisticValue(right.values[candidate.id], stat);
          return sign * compareNullableNumbers(leftValue, rightValue);
        }
        const leftDelta = compareValues(
          statisticValue(left.values[baseline.id], stat),
          statisticValue(left.values[candidate.id], stat),
        ).deltaAbsolute;
        const rightDelta = compareValues(
          statisticValue(right.values[baseline.id], stat),
          statisticValue(right.values[candidate.id], stat),
        ).deltaAbsolute;
        return sign * compareNullableNumbers(leftDelta, rightDelta);
      }
      default:
        break;
    }
    if (parsed) {
      const { side, statistic } = parsed;
      if (side === "baseline") {
        return (
          sign *
          compareNullableNumbers(
            statisticValue(left.values[baseline.id], statistic),
            statisticValue(right.values[baseline.id], statistic),
          )
        );
      }
      if (side === "candidate") {
        return (
          sign *
          compareNullableNumbers(
            statisticValue(left.values[candidate.id], statistic),
            statisticValue(right.values[candidate.id], statistic),
          )
        );
      }
      const leftDelta = compareValues(
        statisticValue(left.values[baseline.id], statistic),
        statisticValue(left.values[candidate.id], statistic),
      ).deltaAbsolute;
      const rightDelta = compareValues(
        statisticValue(right.values[baseline.id], statistic),
        statisticValue(right.values[candidate.id], statistic),
      ).deltaAbsolute;
      return sign * compareNullableNumbers(leftDelta, rightDelta);
    }
    return 0;
  });
  return copy;
}
