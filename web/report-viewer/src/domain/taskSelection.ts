import type { TaskChangeFilter } from "./taskTableFilters";
import type { TaskChangeRow } from "./viewModels";

export function defaultTaskSelection(
  rows: TaskChangeRow[],
  filter: TaskChangeFilter,
): TaskChangeRow | null {
  if (rows.length === 0) {
    return null;
  }
  if (filter === "improvements") {
    return rows.reduce((best, row) =>
      (row.comparison.deltaAbsolute ?? 0) < (best.comparison.deltaAbsolute ?? 0) ? row : best,
    );
  }
  if (filter === "regressions") {
    return rows.reduce((best, row) =>
      (row.comparison.deltaAbsolute ?? 0) > (best.comparison.deltaAbsolute ?? 0) ? row : best,
    );
  }
  return rows.reduce((best, row) => (row.absDelta > best.absDelta ? row : best));
}

export function pinnedTaskDisplay(
  ranked: TaskChangeRow[],
  visible: TaskChangeRow[],
  taskId: string | null,
): {
  pinnedRow: TaskChangeRow | null;
  pinnedOutside: boolean;
  displayRows: TaskChangeRow[];
} {
  const pinnedRow = taskId
    ? (ranked.find((row) => row.metric.id === taskId) ?? null)
    : null;
  const pinnedOutside = Boolean(
    pinnedRow && !visible.some((row) => row.metric.id === pinnedRow.metric.id),
  );
  return {
    pinnedRow,
    pinnedOutside,
    displayRows: pinnedOutside && pinnedRow ? [pinnedRow, ...visible] : visible,
  };
}
