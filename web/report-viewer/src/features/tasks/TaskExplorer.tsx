import { useDeferredValue, useMemo } from "react";
import { TASK_SORTS, type TaskSort } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { VirtualTable } from "../../components/data/VirtualTable";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { ContextDrawer } from "../../components/workbench/ContextDrawer";
import { compareMetric } from "../../domain/metrics";
import { formatDelta } from "../../domain/formatting";
import {
  canPlotSequence,
  searchTaskMetrics,
  taskPathMetrics,
  taskPathOf,
  taskSeriesByPath,
} from "../../domain/series";
import { TASK_CATEGORIES } from "../../domain/taskCategories";
import { formatMetricValue, formatSignedMetricValue } from "../../domain/units";
import { taskChangeRows, statisticLabel, type TaskChangeRow } from "../../domain/viewModels";

function sortRows(
  rows: TaskChangeRow[],
  sort: TaskSort,
  baselineId: string,
  candidateId: string,
): TaskChangeRow[] {
  const copy = [...rows];
  copy.sort((left, right) => {
    switch (sort) {
      case "delta-pct":
        return Math.abs(right.comparison.deltaPercent ?? 0) - Math.abs(left.comparison.deltaPercent ?? 0);
      case "baseline":
        return (right.baselineValue ?? Number.NEGATIVE_INFINITY) - (left.baselineValue ?? Number.NEGATIVE_INFINITY);
      case "candidate":
        return (right.candidateValue ?? Number.NEGATIVE_INFINITY) - (left.candidateValue ?? Number.NEGATIVE_INFINITY);
      case "p90-delta":
        return (
          Math.abs(compareMetric(right.metric, baselineId, candidateId, "p90").deltaAbsolute ?? 0) -
          Math.abs(compareMetric(left.metric, baselineId, candidateId, "p90").deltaAbsolute ?? 0)
        );
      case "name":
        return left.path.localeCompare(right.path);
      case "count":
        return (
          (right.baselineCount ?? 0) +
          (right.candidateCount ?? 0) -
          ((left.baselineCount ?? 0) + (left.candidateCount ?? 0))
        );
      default:
        return right.absDelta - left.absDelta;
    }
  });
  return copy;
}

export function TaskExplorer() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const ranked = useMemo(
    () => taskChangeRows(report, baseline, candidate, selection.statistic),
    [baseline, candidate, report, selection.statistic],
  );
  const deferredQuery = useDeferredValue(selection.query);
  const filtered = useMemo(() => {
    const searched = new Set(searchTaskMetrics(taskPathMetrics(report), deferredQuery).map((metric) => metric.id));
    return ranked.filter((row) => {
      if (!searched.has(row.metric.id)) {
        return false;
      }
      if (selection.category !== "all" && row.category !== selection.category) {
        return false;
      }
      return true;
    });
  }, [deferredQuery, ranked, report, selection.category]);
  const sorted = useMemo(
    () => sortRows(filtered, selection.sort, baseline.id, candidate.id),
    [baseline.id, candidate.id, filtered, selection.sort],
  );
  const selected =
    sorted.find((row) => row.metric.id === selection.taskId) ??
    ranked.find((row) => row.metric.id === selection.taskId) ??
    null;
  const seriesByPath = useMemo(() => taskSeriesByPath(report), [report]);
  const inA = ranked.filter((row) => row.baselineValue !== null).length;
  const inB = ranked.filter((row) => row.candidateValue !== null).length;
  const inBoth = ranked.filter((row) => row.baselineValue !== null && row.candidateValue !== null).length;

  return (
    <>
      <section className="wb-panel">
        <h2>Tasks</h2>
        <p className="panel-note">
          {ranked.length} task paths · {inA} with baseline values · {inB} with candidate values ·{" "}
          {inBoth} in both. Selected statistic: {statisticLabel(selection.statistic)}. Missing values
          show N/A, never 0 ms.
        </p>
        <div className="filter-bar">
          <label>
            Search task path
            <input
              type="search"
              value={selection.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder="compileDebugKotlin"
            />
          </label>
          <label>
            Category
            <select
              value={selection.category}
              onChange={(event) => update({ category: event.target.value })}
            >
              <option value="all">All</option>
              {TASK_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort
            <select
              value={selection.sort}
              onChange={(event) => update({ sort: event.target.value as TaskSort })}
            >
              {TASK_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {sort}
                </option>
              ))}
            </select>
          </label>
        </div>
        <VirtualTable
          rowCount={sorted.length}
          empty="No tasks match this search."
          header={
            <thead>
              <tr>
                <th>Task path</th>
                <th>Category</th>
                <th className="num">n(A)</th>
                <th className="num">n(B)</th>
                <th className="num">{statisticLabel(selection.statistic)} A</th>
                <th className="num">{statisticLabel(selection.statistic)} B</th>
                <th className="num">Δ</th>
                <th className="num">Δ%</th>
              </tr>
            </thead>
          }
          renderRow={(index) => {
            const row = sorted[index];
            if (!row) {
              return null;
            }
            return (
              <tr
                key={row.metric.id}
                className={selection.taskId === row.metric.id ? "is-selected" : undefined}
              >
                <td className="path">
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => update({ taskId: row.metric.id })}
                  >
                    {row.path}
                  </button>
                </td>
                <td>{row.category}</td>
                <td className="num">{row.baselineCount ?? "N/A"}</td>
                <td className="num">{row.candidateCount ?? "N/A"}</td>
                <td className="num">
                  {formatMetricValue(row.baselineValue, row.metric.unit, row.metric.valueType).text}
                </td>
                <td className="num">
                  {formatMetricValue(row.candidateValue, row.metric.unit, row.metric.valueType).text}
                </td>
                <td className="num">
                  {formatSignedMetricValue(
                    row.comparison.deltaAbsolute,
                    row.metric.unit,
                    row.metric.valueType,
                  ).text}
                </td>
                <td className="num">{formatDelta(row.comparison)}</td>
              </tr>
            );
          }}
        />
      </section>
      <ContextDrawer
        title={selected ? taskPathOf(selected.metric) : "Task"}
        open={Boolean(selected)}
        onClose={() => update({ taskId: null })}
      >
        {selected ? (
          <>
            <p className="panel-note">
              {selected.category} · sample unit {selected.metric.aggregation?.sampleUnit ?? "task"} ·{" "}
              {selected.metric.unit}
            </p>
            <p>
              {formatMetricValue(selected.baselineValue, selected.metric.unit, selected.metric.valueType).text}
              {" vs "}
              {formatMetricValue(selected.candidateValue, selected.metric.unit, selected.metric.valueType).text}
              {" ("}
              {formatDelta(selected.comparison)})
            </p>
            <SeriesChart
              title={selected.path}
              variants={[baseline, candidate]}
              observations={seriesByPath.get(selected.path)?.observations ?? {}}
              unit={selected.metric.unit}
              valueType={selected.metric.valueType}
              allowSequence={canPlotSequence(selected.metric)}
            />
          </>
        ) : null}
      </ContextDrawer>
    </>
  );
}
