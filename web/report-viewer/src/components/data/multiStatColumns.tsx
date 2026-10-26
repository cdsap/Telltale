import type { ReactNode } from "react";
import { compareValues, comparisonTone, statisticValue } from "../../domain/comparisons";
import { formatDelta } from "../../domain/formatting";
import {
  TABLE_STATISTICS,
  statTableColumn,
  type StatTableSide,
} from "../../domain/tableStatistics";
import type { Metric, StatisticName, Variant } from "../../domain/types";
import { formatMetricValue, formatSignedMetricValue } from "../../domain/units";
import { statisticLabel } from "../../domain/viewModels";
import type { SortDirection } from "../../domain/tableSort";
import { SortableColumnHeader } from "./SortableColumnHeader";

interface MultiStatHeaderGroupProps {
  side: StatTableSide;
  activeColumn: string;
  direction: SortDirection;
  onSort: (column: string) => void;
  /** e.g. " A" / " B" for task tables */
  valueSuffix?: string;
  /** e.g. variant display label before each statistic */
  labelPrefix?: string;
  className?: string;
}

function headerLabel(
  side: StatTableSide,
  statistic: (typeof TABLE_STATISTICS)[number],
  valueSuffix: string,
  labelPrefix: string,
): string {
  const stat = statisticLabel(statistic);
  switch (side) {
    case "baseline":
    case "candidate":
      return labelPrefix ? `${labelPrefix} · ${stat}` : `${stat}${valueSuffix}`;
    case "delta":
      return `Δ · ${stat}`;
    case "delta-pct":
      return `Δ% · ${stat}`;
    default:
      return stat;
  }
}

export function MultiStatHeaderGroup({
  side,
  activeColumn,
  direction,
  onSort,
  valueSuffix = "",
  labelPrefix = "",
  className = "num",
}: MultiStatHeaderGroupProps): ReactNode {
  return TABLE_STATISTICS.map((statistic) => (
    <SortableColumnHeader
      key={statTableColumn(side, statistic)}
      label={headerLabel(side, statistic, valueSuffix, labelPrefix)}
      column={statTableColumn(side, statistic)}
      activeColumn={activeColumn}
      direction={direction}
      onSort={onSort}
      className={className}
    />
  ));
}

interface MultiStatValueCellsProps {
  metric: Metric;
  variantId: string;
  statistics?: readonly StatisticName[];
}

export function MultiStatValueCells({
  metric,
  variantId,
  statistics = TABLE_STATISTICS,
}: MultiStatValueCellsProps): ReactNode {
  return statistics.map((statistic) => {
    const value = statisticValue(metric.values[variantId], statistic);
    const formatted = formatMetricValue(value, metric.unit, metric.valueType);
    return (
      <td key={statistic} className="num" title={formatted.title}>
        {formatted.text}
      </td>
    );
  });
}

interface MultiStatDeltaCellsProps {
  metric: Metric;
  baseline: Variant;
  candidate: Variant;
  mode: "absolute" | "percent";
  statistics?: readonly StatisticName[];
}

export function MultiStatDeltaCells({
  metric,
  baseline,
  candidate,
  mode,
  statistics = TABLE_STATISTICS,
}: MultiStatDeltaCellsProps): ReactNode {
  return statistics.map((statistic) => {
    const comparison = compareValues(
      statisticValue(metric.values[baseline.id], statistic),
      statisticValue(metric.values[candidate.id], statistic),
    );
    const tone = comparisonTone(comparison, metric.direction);
    const toneClass =
      tone === "better" ? "is-improvement" : tone === "worse" ? "is-regression" : "";
    if (mode === "absolute") {
      const formatted = formatSignedMetricValue(
        comparison.deltaAbsolute,
        metric.unit,
        metric.valueType,
      );
      return (
        <td key={statistic} className={`num ${toneClass}`} title={formatted.title}>
          {formatted.text}
        </td>
      );
    }
    return (
      <td key={statistic} className={`num ${toneClass}`}>
        {formatDelta(comparison)}
      </td>
    );
  });
}
