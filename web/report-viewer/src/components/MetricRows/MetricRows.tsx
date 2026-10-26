import { useMemo, useState } from "react";
import type { Metric, StatisticName, Variant } from "../../domain/types";
import { compareMetric, displayLabel, metricDisplayName } from "../../domain/metrics";
import { statisticValue } from "../../domain/comparisons";
import { formatMetricValue } from "../../domain/units";
import { MetricDelta } from "../comparison/MetricDelta";
import {
  MultiStatDeltaCells,
  MultiStatHeaderGroup,
  MultiStatValueCells,
} from "../data/multiStatColumns";
import { SortableColumnHeader } from "../data/SortableColumnHeader";
import {
  sortMetrics,
  type MetricRowSortColumn,
} from "../../domain/metricRowSort";
import { nextSortDirection, type SortDirection } from "../../domain/tableSort";

interface MetricRowsProps {
  metrics: Metric[];
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
  caption?: string;
  empty?: string;
  onSelect?: (metricId: string) => void;
  selectedId?: string | null;
  compact?: boolean;
}

export function MetricRows({
  metrics,
  baseline,
  candidate,
  statistic,
  caption,
  empty,
  onSelect,
  selectedId,
  compact = false,
}: MetricRowsProps) {
  const [sortColumn, setSortColumn] = useState<MetricRowSortColumn>(compact ? "delta-mean" : "metric");
  const [sortDir, setSortDir] = useState<SortDirection>(compact ? "desc" : "asc");
  const rows = useMemo(
    () => sortMetrics(metrics, baseline, candidate, statistic, sortColumn, sortDir),
    [baseline, candidate, metrics, sortColumn, sortDir, statistic],
  );
  const setMetricSort = (column: string) => {
    const next = column as MetricRowSortColumn;
    const defaultDir: SortDirection =
      next === "category" || next === "metric" ? "asc" : "desc";
    setSortDir(nextSortDirection(sortColumn, next, sortDir, defaultDir));
    setSortColumn(next);
  };
  if (metrics.length === 0) {
    return empty ? <p className="series-note">{empty}</p> : null;
  }
  return (
    <div className="table-wrap">
      <table className="experiment-snapshot-table metrics-table">
        {caption ? <caption className="visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            <SortableColumnHeader
              label="Metric"
              column="metric"
              activeColumn={sortColumn}
              direction={sortDir}
              onSort={setMetricSort}
            />
            {compact ? (
              <>
                <SortableColumnHeader
                  label={`${displayLabel(baseline)} mean`}
                  column="baseline-mean"
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                  className="num"
                />
                <SortableColumnHeader
                  label={`${displayLabel(candidate)} mean`}
                  column="candidate-mean"
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                  className="num"
                />
                <SortableColumnHeader
                  label="Δ mean"
                  column="delta-mean"
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                  className="num"
                />
              </>
            ) : (
              <>
                <SortableColumnHeader
                  label="Category"
                  column="category"
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                />
                <MultiStatHeaderGroup
                  side="baseline"
                  labelPrefix={displayLabel(baseline)}
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                />
                <MultiStatHeaderGroup
                  side="candidate"
                  labelPrefix={displayLabel(candidate)}
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                />
                <MultiStatHeaderGroup
                  side="delta"
                  activeColumn={sortColumn}
                  direction={sortDir}
                  onSort={setMetricSort}
                />
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((metric) => (
            <tr
              key={metric.id}
              className={selectedId === metric.id ? "is-selected" : undefined}
            >
              <td className="path">
                {onSelect ? (
                  <button type="button" className="linkish" onClick={() => onSelect(metric.id)}>
                    {compact ? metricDisplayName(metric) : metric.name}
                  </button>
                ) : compact ? (
                  metricDisplayName(metric)
                ) : (
                  metric.name
                )}
              </td>
              {compact ? (
                <>
                  <td className="num">
                    {
                      formatMetricValue(
                        statisticValue(metric.values[baseline.id], "mean"),
                        metric.unit,
                        metric.valueType,
                      ).text
                    }
                  </td>
                  <td className="num">
                    {
                      formatMetricValue(
                        statisticValue(metric.values[candidate.id], "mean"),
                        metric.unit,
                        metric.valueType,
                      ).text
                    }
                  </td>
                  <td className="num">
                    <MetricDelta
                      comparison={compareMetric(metric, baseline.id, candidate.id, "mean")}
                      unit={metric.unit}
                      valueType={metric.valueType}
                      direction={metric.direction}
                    />
                  </td>
                </>
              ) : (
                <>
                  <td>{metric.category}</td>
                  <MultiStatValueCells metric={metric} variantId={baseline.id} />
                  <MultiStatValueCells metric={metric} variantId={candidate.id} />
                  <MultiStatDeltaCells
                    metric={metric}
                    baseline={baseline}
                    candidate={candidate}
                    mode="percent"
                  />
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
