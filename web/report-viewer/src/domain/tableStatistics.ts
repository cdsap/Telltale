import type { StatisticName } from "./types";

export const TABLE_STATISTICS = ["mean", "p50", "p90"] as const satisfies readonly StatisticName[];

export type StatTableSide = "baseline" | "candidate" | "delta" | "delta-pct";

export function statTableColumn(side: StatTableSide, statistic: StatisticName): string {
  return `${side}-${statistic}`;
}

export function parseStatTableColumn(
  column: string,
): { side: StatTableSide; statistic: StatisticName } | null {
  for (const side of ["delta-pct", "baseline", "candidate", "delta"] as const) {
    const prefix = `${side}-`;
    if (!column.startsWith(prefix)) {
      continue;
    }
    const statistic = column.slice(prefix.length) as StatisticName;
    if ((TABLE_STATISTICS as readonly string[]).includes(statistic)) {
      return { side, statistic };
    }
  }
  return null;
}

export const TASK_STAT_SORTS = TABLE_STATISTICS.flatMap((statistic) => [
  statTableColumn("baseline", statistic),
  statTableColumn("candidate", statistic),
  statTableColumn("delta", statistic),
  statTableColumn("delta-pct", statistic),
]);
