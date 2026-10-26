import { compareMetric } from "./metrics";
import { statisticValue } from "./comparisons";
import type { StatisticName } from "./types";
import { parseStatTableColumn } from "./tableStatistics";
import { compareNullableNumbers, sortDirectionSign, type SortDirection } from "./tableSort";
import type { TaskChangeRow } from "./viewModels";

export function compareTaskRows(
  left: TaskChangeRow,
  right: TaskChangeRow,
  sort: string,
  sortDir: SortDirection,
  baselineId: string,
  candidateId: string,
  legacyStatistic: StatisticName,
): number {
  const sign = sortDirectionSign(sortDir);
  const parsed = parseStatTableColumn(sort);
  let delta = 0;

  if (parsed) {
    const { side, statistic } = parsed;
    const leftMetric = left.metric;
    const rightMetric = right.metric;
    if (side === "baseline") {
      delta = compareNullableNumbers(
        statisticValue(leftMetric.values[baselineId], statistic),
        statisticValue(rightMetric.values[baselineId], statistic),
      );
    } else if (side === "candidate") {
      delta = compareNullableNumbers(
        statisticValue(leftMetric.values[candidateId], statistic),
        statisticValue(rightMetric.values[candidateId], statistic),
      );
    } else if (side === "delta") {
      delta =
        Math.abs(compareMetric(leftMetric, baselineId, candidateId, statistic).deltaAbsolute ?? 0) -
        Math.abs(compareMetric(rightMetric, baselineId, candidateId, statistic).deltaAbsolute ?? 0);
    } else {
      const leftPct = compareMetric(leftMetric, baselineId, candidateId, statistic).deltaPercent ?? 0;
      const rightPct = compareMetric(rightMetric, baselineId, candidateId, statistic).deltaPercent ?? 0;
      delta = Math.abs(leftPct) - Math.abs(rightPct);
    }
    return sign * delta;
  }

  switch (sort) {
    case "delta-pct": {
      const leftPct = compareMetric(left.metric, baselineId, candidateId, legacyStatistic).deltaPercent ?? 0;
      const rightPct = compareMetric(right.metric, baselineId, candidateId, legacyStatistic).deltaPercent ?? 0;
      delta = Math.abs(leftPct) - Math.abs(rightPct);
      break;
    }
    case "baseline":
      delta =
        (left.baselineValue ?? Number.NEGATIVE_INFINITY) -
        (right.baselineValue ?? Number.NEGATIVE_INFINITY);
      break;
    case "candidate":
      delta =
        (left.candidateValue ?? Number.NEGATIVE_INFINITY) -
        (right.candidateValue ?? Number.NEGATIVE_INFINITY);
      break;
    case "baseline-count":
      delta = (left.baselineCount ?? 0) - (right.baselineCount ?? 0);
      break;
    case "candidate-count":
      delta = (left.candidateCount ?? 0) - (right.candidateCount ?? 0);
      break;
    case "p90-delta":
      delta =
        Math.abs(compareMetric(left.metric, baselineId, candidateId, "p90").deltaAbsolute ?? 0) -
        Math.abs(compareMetric(right.metric, baselineId, candidateId, "p90").deltaAbsolute ?? 0);
      break;
    case "name":
      delta = left.path.localeCompare(right.path);
      break;
    case "count":
      delta =
        (left.baselineCount ?? 0) +
        (left.candidateCount ?? 0) -
        ((right.baselineCount ?? 0) + (right.candidateCount ?? 0));
      break;
    default:
      delta = left.absDelta - right.absDelta;
      break;
  }
  return sign * delta;
}
