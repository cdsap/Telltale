import { searchTaskMetrics, taskModuleOf } from "./series";
import type { Variant } from "./types";
import type { TaskChangeRow } from "./viewModels";
import { statisticValue } from "./comparisons";

/** Default floor on mean task-path duration (either variant). Not applied to task types. */
export const DEFAULT_TASK_MIN_DURATION_MS = 1_000;

export const TASK_DURATION_PRESETS_MS = [
  { value: 0, label: "All tasks (no floor)" },
  { value: DEFAULT_TASK_MIN_DURATION_MS, label: "≥ 1 s mean (default)" },
  { value: 10_000, label: "≥ 10 s mean" },
  { value: 60_000, label: "≥ 1 min mean" },
] as const;

export const TASK_CHANGE_FILTERS = ["all", "regressions", "improvements"] as const;
export type TaskChangeFilter = (typeof TASK_CHANGE_FILTERS)[number];

export interface TaskRowFilter {
  query: string;
  isTypes: boolean;
  module: string;
  category: string;
  taskType: string;
  taskFilter: TaskChangeFilter;
  minDeltaMs: number;
  minDurationMs: number;
}

export function peakTaskMeanMs(
  row: TaskChangeRow,
  baselineId: string,
  candidateId: string,
): number | null {
  const left = statisticValue(row.metric.values[baselineId], "mean");
  const right = statisticValue(row.metric.values[candidateId], "mean");
  if (left == null && right == null) {
    return null;
  }
  return Math.max(left ?? 0, right ?? 0);
}

export function rowTaskType(row: TaskChangeRow, typesByPath: Map<string, string>): string {
  return row.metric.scope?.taskType ?? typesByPath.get(row.path) ?? "";
}

export function matchesTaskMinDuration(
  row: TaskChangeRow,
  minMeanMs: number,
  baselineId: string,
  candidateId: string,
): boolean {
  if (minMeanMs <= 0) {
    return true;
  }
  const peak = peakTaskMeanMs(row, baselineId, candidateId);
  if (peak == null) {
    return false;
  }
  return peak >= minMeanMs;
}

export function matchesTaskChangeFilter(row: TaskChangeRow, filter: TaskChangeFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "regressions") {
    return row.tone === "worse";
  }
  return row.tone === "better";
}

export function matchesTaskMinDelta(row: TaskChangeRow, minAbsoluteMs: number): boolean {
  if (minAbsoluteMs <= 0) {
    return true;
  }
  if (row.comparison.deltaAbsolute == null) {
    return false;
  }
  return row.absDelta >= minAbsoluteMs;
}

export function filterTaskRows(
  rows: TaskChangeRow[],
  filter: TaskRowFilter,
  typesByPath: Map<string, string>,
  baseline: Variant,
  candidate: Variant,
): TaskChangeRow[] {
  const searched = new Set(
    searchTaskMetrics(
      rows.map((row) => row.metric),
      filter.query,
    ).map((metric) => metric.id),
  );
  return rows.filter((row) => {
    if (!searched.has(row.metric.id)) {
      return false;
    }
    if (!filter.isTypes && filter.module !== "all" && taskModuleOf(row.path) !== filter.module) {
      return false;
    }
    if (filter.category !== "all" && row.category !== filter.category) {
      return false;
    }
    if (!filter.isTypes && filter.taskType && rowTaskType(row, typesByPath) !== filter.taskType) {
      return false;
    }
    if (!matchesTaskChangeFilter(row, filter.taskFilter)) {
      return false;
    }
    if (!matchesTaskMinDelta(row, filter.minDeltaMs)) {
      return false;
    }
    if (
      !filter.isTypes &&
      !matchesTaskMinDuration(row, filter.minDurationMs, baseline.id, candidate.id)
    ) {
      return false;
    }
    return true;
  });
}
