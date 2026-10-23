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
  seriesHasPoints,
  taskModuleOf,
  taskSeriesByPath,
  taskSeriesByType,
  taskTypeOf,
} from "../../domain/series";
import { formatMetricValue, formatSignedMetricValue } from "../../domain/units";
import {
  allTaskPathRows,
  statisticLabel,
  taskTypeChangeRows,
  type TaskChangeRow,
} from "../../domain/viewModels";

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

function TimelineIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M3 16V4m0 12h14M5 12l3-3 3 2 4-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TaskExplorerProps {
  source?: "paths" | "types";
}

export function TaskExplorer({ source = "paths" }: TaskExplorerProps) {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const isTypes = source === "types";
  const variantIds = [baseline.id, candidate.id];
  const ranked = useMemo(
    () =>
      isTypes
        ? taskTypeChangeRows(report, baseline, candidate, selection.statistic)
        : allTaskPathRows(report, baseline, candidate, selection.statistic),
    [baseline, candidate, isTypes, report, selection.statistic],
  );
  const deferredQuery = useDeferredValue(selection.query);
  const modules = useMemo(() => {
    const values = new Set(ranked.map((row) => taskModuleOf(row.path)).filter(Boolean));
    return [...values].sort((left, right) => left.localeCompare(right));
  }, [ranked]);
  const activeModule = modules.includes(selection.module) ? selection.module : "all";
  const filtered = useMemo(() => {
    const searched = new Set(searchTaskMetrics(
      ranked.map((row) => row.metric),
      deferredQuery,
    ).map((metric) => metric.id));
    return ranked.filter((row) => {
      if (!searched.has(row.metric.id)) {
        return false;
      }
      if (!isTypes && activeModule !== "all" && taskModuleOf(row.path) !== activeModule) {
        return false;
      }
      return true;
    });
  }, [activeModule, deferredQuery, isTypes, ranked]);
  const sorted = useMemo(
    () => sortRows(filtered, selection.sort, baseline.id, candidate.id),
    [baseline.id, candidate.id, filtered, selection.sort],
  );
  const seriesByKey = useMemo(
    () => (isTypes ? taskSeriesByType(report) : taskSeriesByPath(report)),
    [isTypes, report],
  );
  const selected =
    sorted.find((row) => row.metric.id === selection.taskId) ??
    ranked.find((row) => row.metric.id === selection.taskId) ??
    null;
  const inA = ranked.filter((row) => row.baselineValue !== null).length;
  const inB = ranked.filter((row) => row.candidateValue !== null).length;
  const inBoth = ranked.filter((row) => row.baselineValue !== null && row.candidateValue !== null).length;
  const selectedKey = selected
    ? isTypes
      ? taskTypeOf(selected.metric)
      : selected.path
    : "";
  const selectedSeries = selectedKey ? seriesByKey.get(selectedKey) : undefined;
  const selectedHasTimeline =
    Boolean(selected) &&
    canPlotSequence(selected?.metric) &&
    seriesHasPoints(selectedSeries, variantIds);

  return (
    <>
      <section className="wb-panel">
        <h2>{isTypes ? "Task types" : "Task paths"}</h2>
        <p className="panel-note">
          {ranked.length} {isTypes ? "task types" : "task paths"} · {inA} with baseline values · {inB}{" "}
          with candidate values · {inBoth} in both. Selected statistic:{" "}
          {statisticLabel(selection.statistic)}. Missing values show N/A, never 0 ms.
        </p>
        <div className="filter-bar">
          <label>
            {isTypes ? "Search task type" : "Search task path"}
            <input
              type="search"
              value={selection.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder={isTypes ? "KotlinCompile" : "compileDebugKotlin"}
            />
          </label>
          {isTypes ? null : (
            <label>
              Module
              <select
                value={activeModule}
                onChange={(event) => update({ module: event.target.value })}
              >
                <option value="all">All</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module === ":" ? ": (root)" : module}
                  </option>
                ))}
              </select>
            </label>
          )}
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
          rowHeight={52}
          resetKey={`${source}:${activeModule}:${deferredQuery}:${selection.sort}`}
          empty="No tasks match this search."
          header={
            <thead>
              <tr>
                <th>{isTypes ? "Task type" : "Task path"}</th>
                {isTypes ? null : <th className="timeline-col">Timeline</th>}
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
            const series = seriesByKey.get(row.path);
            const hasTimeline = !isTypes && canPlotSequence(row.metric) && seriesHasPoints(series, variantIds);
            return (
              <tr
                key={row.metric.id}
                className={selection.taskId === row.metric.id ? "is-selected" : undefined}
              >
                <td className="path" title={row.path}>
                  <button
                    type="button"
                    className="task-path-button"
                    onClick={() => update({ taskId: row.metric.id })}
                  >
                    {row.path}
                  </button>
                </td>
                {isTypes ? null : (
                  <td className="timeline-col">
                    {hasTimeline ? (
                      <button
                        type="button"
                        className="timeline-icon"
                        aria-label={`Show timeline for ${row.path}`}
                        onClick={() => update({ taskId: row.metric.id })}
                      >
                        <TimelineIcon />
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                )}
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
        title={selected ? `${selected.path} timeline` : "Task timeline"}
        open={!isTypes && selectedHasTimeline}
        onClose={() => update({ taskId: null })}
      >
        {selected ? (
          <>
            <p className="panel-note">
              {isTypes ? "Task type" : `Module ${taskModuleOf(selected.path) || "root"}`} · sample
              unit {selected.metric.aggregation?.sampleUnit ?? "task"} · {selected.metric.unit}
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
              observations={selectedSeries?.observations ?? {}}
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
