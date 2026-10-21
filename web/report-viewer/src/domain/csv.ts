import type { ExperimentResult, StatisticName } from "./types";
import { statisticValue } from "./comparisons";

const STATS: StatisticName[] = ["mean", "p50", "p90"];

function cell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function metricsCsv(report: ExperimentResult): string {
  const headers = ["Category", "Metric", "Unit"];
  for (const variant of report.variants) {
    for (const stat of STATS) {
      headers.push(`${variant.label} ${stat}`);
    }
    headers.push(`${variant.label} count`);
  }
  const lines = [headers.map(cell).join(",")];
  for (const metric of report.metrics) {
    const row = [metric.category, metric.name, metric.unit];
    for (const variant of report.variants) {
      const stats = metric.values[variant.id];
      for (const stat of STATS) {
        const value = statisticValue(stats, stat);
        row.push(value == null ? "" : String(value));
      }
      row.push(stats?.count == null ? "" : String(stats.count));
    }
    lines.push(row.map(cell).join(","));
  }
  return `${lines.join("\n")}\n`;
}
