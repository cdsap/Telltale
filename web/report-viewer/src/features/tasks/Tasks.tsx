import { useMemo, useState } from "react";
import type { ExperimentResult, StatisticName, Variant } from "../../domain/types";
import { comparisonTone } from "../../domain/comparisons";
import { compareMetric } from "../../domain/metrics";
import {
  canPlotSequence,
  expensiveTaskMetric,
  searchTaskMetrics,
  taskPathMetrics,
  taskPathOf,
  taskSeriesByPath,
} from "../../domain/series";
import { MetricCard } from "../../components/MetricCard/MetricCard";
import { MetricRows } from "../../components/MetricRows/MetricRows";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";

const TABLE_LIMIT = 40;

interface TasksProps {
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
}

export function Tasks({ report, baseline, candidate, statistic }: TasksProps) {
  const metrics = useMemo(() => taskPathMetrics(report), [report]);
  const seriesByPath = useMemo(() => taskSeriesByPath(report), [report]);
  const defaultMetric = expensiveTaskMetric(metrics, baseline, candidate, statistic);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(defaultMetric?.id ?? metrics[0]?.id ?? "");
  const filtered = useMemo(() => searchTaskMetrics(metrics, query), [metrics, query]);
  const selected =
    filtered.find((metric) => metric.id === selectedId) ??
    filtered[0] ??
    defaultMetric ??
    metrics[0];
  if (metrics.length === 0 && seriesByPath.size === 0) {
    return null;
  }
  const selectedSeries = selected ? seriesByPath.get(taskPathOf(selected)) : undefined;
  const tableRows = filtered.slice(0, TABLE_LIMIT);
  return (
    <section id="tasks" className="report-block">
      <div className="experiment-snapshot">
        <h2 className="experiment-snapshot-title">Tasks</h2>
        <div className="controls">
          <label>
            Search task path
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder=":app:app:compileDebugKotlin"
            />
          </label>
          <label>
            Selected task
            <select
              value={selected?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {filtered.slice(0, TABLE_LIMIT).map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {taskPathOf(metric)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selected ? (
          <>
            <p className="experiment-snapshot-metric">{taskPathOf(selected)} by build</p>
            <SeriesChart
              title={taskPathOf(selected)}
              variants={[baseline, candidate]}
              observations={selectedSeries?.observations ?? {}}
              unit={selected.unit}
              valueType={selected.valueType}
              allowSequence={canPlotSequence(selected)}
            />
          </>
        ) : null}
        <MetricRows
          metrics={tableRows}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          caption="Task path metrics"
          selectedId={selected?.id}
          onSelect={setSelectedId}
          empty="No tasks match this search."
        />
        {filtered.length > TABLE_LIMIT ? (
          <p className="series-note">
            Showing {TABLE_LIMIT} of {filtered.length} matching tasks. Narrow the search to see
            the rest.
          </p>
        ) : null}
      </div>
      {selected ? (
        <div className="snapshot-grid">
          <MetricCard
            title={taskPathOf(selected)}
            metric={selected}
            baseline={baseline}
            candidate={candidate}
            statistic={statistic}
            comparison={compareMetric(selected, baseline.id, candidate.id, statistic)}
            tone={comparisonTone(
              compareMetric(selected, baseline.id, candidate.id, statistic),
              selected.direction,
            )}
          />
        </div>
      ) : null}
    </section>
  );
}
