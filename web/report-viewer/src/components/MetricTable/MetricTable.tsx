import { useMemo, useState } from "react";
import type { ExperimentResult, StatisticName, Variant } from "../../domain/types";
import { SectionHeader } from "../layout/SectionHeader";
import { KEY_METRIC_FAMILIES, displayLabel, familiesIn } from "../../domain/metrics";
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

interface MetricTableProps {
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
}

export function MetricTable({
  report,
  baseline,
  candidate,
  statistic,
}: MetricTableProps) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("key");
  const [sortColumn, setSortColumn] = useState<MetricRowSortColumn>("delta-mean");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const families = familiesIn(report);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = report.metrics.filter((metric) => {
      if (family === "key" && !KEY_METRIC_FAMILIES.has(metric.family)) {
        return false;
      }
      if (family !== "all" && family !== "key" && metric.family !== family) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return `${metric.category} ${metric.name} ${metric.id}`
        .toLowerCase()
        .includes(needle);
    });
    return sortMetrics(filtered, baseline, candidate, statistic, sortColumn, sortDir);
  }, [baseline, candidate, family, query, report.metrics, sortColumn, sortDir, statistic]);

  const setMetricSort = (column: string) => {
    const next = column as MetricRowSortColumn;
    const defaultDir: SortDirection =
      next === "category" || next === "metric" ? "asc" : "desc";
    setSortDir(nextSortDirection(sortColumn, next, sortDir, defaultDir));
    setSortColumn(next);
  };

  return (
    <section id="metrics" className="experiment-snapshot">
      <SectionHeader
        title="Metric catalog"
        description="Complete metric inventory for this experiment."
      />
      <div className="analysis-toolbar">
        <div className="analysis-toolbar-row">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Family
          <select value={family} onChange={(event) => setFamily(event.target.value)}>
            <option value="key">Key metrics</option>
            <option value="all">All</option>
            {families.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        </div>
      </div>
      <div className="table-wrap">
        <table className="experiment-snapshot-table metrics-table">
          <thead>
            <tr>
              <SortableColumnHeader
                label="Category"
                column="category"
                activeColumn={sortColumn}
                direction={sortDir}
                onSort={setMetricSort}
              />
              <SortableColumnHeader
                label="Metric"
                column="metric"
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
            </tr>
          </thead>
          <tbody>
            {rows.map((metric) => (
              <tr key={metric.id}>
                <td>{metric.category}</td>
                <td className="path">{metric.name}</td>
                <MultiStatValueCells metric={metric} variantId={baseline.id} />
                <MultiStatValueCells metric={metric} variantId={candidate.id} />
                <MultiStatDeltaCells
                  metric={metric}
                  baseline={baseline}
                  candidate={candidate}
                  mode="percent"
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
