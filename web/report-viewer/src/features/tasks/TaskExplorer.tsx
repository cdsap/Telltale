import { useDeferredValue, useMemo } from "react";
import type { TaskSort } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { DeltaRankingChart } from "../../components/charts/DeltaRankingChart";
import { MetricDelta } from "../../components/comparison/MetricDelta";
import { SortableColumnHeader } from "../../components/data/SortableColumnHeader";
import { VirtualTable } from "../../components/data/VirtualTable";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { statisticValue } from "../../domain/comparisons";
import { compareMetric, displayLabel } from "../../domain/metrics";
import {
  shortTypeName,
  taskModuleOf,
  taskSeriesByPath,
  taskSeriesByType,
  taskTypeByPath,
} from "../../domain/series";
import { compareTaskRows } from "../../domain/taskRowSort";
import { defaultTaskSelection, pinnedTaskDisplay } from "../../domain/taskSelection";
import { filterTaskRows } from "../../domain/taskTableFilters";
import { nextSortDirection, type SortDirection } from "../../domain/tableSort";
import { formatMetricValue } from "../../domain/units";
import {
  allTaskPathRows,
  taskTypeChangeRows,
  type TaskChangeRow,
} from "../../domain/viewModels";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { TaskFilterPanel } from "./TaskFilterPanel";

function defaultTaskSortDir(sort: TaskSort): SortDirection {
  return sort === "name" ? "asc" : "desc";
}

function sortRows(
  rows: TaskChangeRow[],
  sort: TaskSort,
  sortDir: SortDirection,
  baselineId: string,
  candidateId: string,
): TaskChangeRow[] {
  const copy = [...rows];
  copy.sort((left, right) =>
    compareTaskRows(left, right, sort, sortDir, baselineId, candidateId, "mean"),
  );
  return copy;
}

interface TaskExplorerProps {
  source?: "paths" | "types";
}

export function TaskExplorer({ source = "paths" }: TaskExplorerProps) {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const isTypes = source === "types";
  const baselineLabel = displayLabel(baseline);
  const candidateLabel = displayLabel(candidate);
  const typesByPath = useMemo(() => taskTypeByPath(report), [report]);
  const ranked = useMemo(
    () =>
      isTypes
        ? taskTypeChangeRows(report, baseline, candidate, "mean")
        : allTaskPathRows(report, baseline, candidate, "mean"),
    [baseline, candidate, isTypes, report],
  );
  const deferredQuery = useDeferredValue(selection.query);
  const modules = useMemo(() => {
    const values = new Set(ranked.map((row) => taskModuleOf(row.path)).filter(Boolean));
    return [...values].sort((left, right) => left.localeCompare(right));
  }, [ranked]);
  const activeModule = modules.includes(selection.module) ? selection.module : "all";
  const filtered = useMemo(
    () =>
      filterTaskRows(
        ranked,
        {
          query: deferredQuery,
          isTypes,
          module: activeModule,
          category: selection.category,
          taskType: selection.taskType,
          taskFilter: selection.taskFilter,
          minDeltaMs: selection.taskMinDeltaMs,
          minDurationMs: selection.taskMinDurationMs,
        },
        typesByPath,
        baseline,
        candidate,
      ),
    [
      activeModule,
      baseline,
      candidate,
      deferredQuery,
      isTypes,
      ranked,
      selection.category,
      selection.taskFilter,
      selection.taskMinDeltaMs,
      selection.taskMinDurationMs,
      selection.taskType,
      typesByPath,
    ],
  );
  const sorted = useMemo(
    () => sortRows(filtered, selection.sort, selection.sortDir, baseline.id, candidate.id),
    [baseline.id, candidate.id, filtered, selection.sort, selection.sortDir],
  );
  const setTaskSort = (sort: TaskSort) => {
    update({
      sort,
      sortDir: nextSortDirection(selection.sort, sort, selection.sortDir, defaultTaskSortDir(sort)),
    });
  };
  const seriesByKey = useMemo(
    () => (isTypes ? taskSeriesByType(report) : taskSeriesByPath(report)),
    [isTypes, report],
  );
  const { pinnedRow, pinnedOutside, displayRows } = useMemo(
    () => pinnedTaskDisplay(ranked, sorted, selection.taskId),
    [ranked, selection.taskId, sorted],
  );
  const fallbackRow = useMemo(
    () => (pinnedRow ? null : defaultTaskSelection(sorted, selection.taskFilter)),
    [pinnedRow, selection.taskFilter, sorted],
  );
  const detailRow = pinnedRow ?? fallbackRow;
  const highlightedId = detailRow?.metric.id ?? null;
  const extraStats = selection.taskExtendedStats ? 6 : 0;
  const columnCount = 5 + extraStats;
  const selectRow = (taskId: string) => update({ taskId });

  const openTaskPathsForType = (typeName: string) => {
    update({
      section: "tasks",
      query: "",
      taskId: null,
      category: "all",
      module: "all",
      taskType: typeName,
      taskMinDurationMs: 0,
    });
  };

  return (
    <section className="wb-panel">
      <SectionHeader
        title={isTypes ? "Task types" : "Task paths"}
        description={
          isTypes
            ? "Aggregated task-type durations. Select a type to inspect it, then open matching paths."
            : `Compare task execution duration across ${ranked.length} task paths.`
        }
      />
      <TaskFilterPanel
        isTypes={isTypes}
        modules={modules}
        activeModule={activeModule}
        showing={sorted.length}
        total={ranked.length}
      />
      <ChartPanel
        title="Absolute mean-duration change"
        subtitle="Candidate − baseline. Sequences are independent; this ranking is not wall-clock impact."
      >
        <DeltaRankingChart
          rows={sorted}
          selectedId={highlightedId}
          onSelect={selectRow}
        />
      </ChartPanel>
      {detailRow ? (
        <TaskDetailPanel
          row={detailRow}
          baseline={baseline}
          candidate={candidate}
          pinned={Boolean(pinnedRow)}
          outsideFilter={pinnedOutside}
          kind={isTypes ? "type" : "path"}
          series={seriesByKey.get(detailRow.path)}
          onClearPin={() => update({ taskId: null })}
          onDrillDown={isTypes ? () => openTaskPathsForType(detailRow.path) : undefined}
        />
      ) : null}
      <div className="task-table-pane task-table-pane--selectable">
        <VirtualTable
          rowCount={displayRows.length}
          rowHeight={44}
          columnCount={columnCount}
          resetKey={`${source}:${activeModule}:${deferredQuery}:${selection.sort}:${selection.sortDir}:${selection.taskFilter}:${selection.taskMinDeltaMs}:${selection.taskMinDurationMs}:${selection.taskExtendedStats}:${selection.category}:${selection.taskType}`}
          empty="No tasks match the current filters."
          header={
            <thead>
              <tr>
                <SortableColumnHeader
                  label={isTypes ? "Task type" : "Task path"}
                  column="name"
                  activeColumn={selection.sort}
                  direction={selection.sortDir}
                  onSort={(column) => setTaskSort(column as TaskSort)}
                  className="sticky-col"
                />
                <SortableColumnHeader
                  label={`${baselineLabel} mean`}
                  column="baseline-mean"
                  activeColumn={selection.sort}
                  direction={selection.sortDir}
                  onSort={(column) => setTaskSort(column as TaskSort)}
                  className="num"
                />
                <SortableColumnHeader
                  label={`${candidateLabel} mean`}
                  column="candidate-mean"
                  activeColumn={selection.sort}
                  direction={selection.sortDir}
                  onSort={(column) => setTaskSort(column as TaskSort)}
                  className="num"
                />
                <SortableColumnHeader
                  label="Δ mean"
                  column="delta-abs"
                  activeColumn={selection.sort}
                  direction={selection.sortDir}
                  onSort={(column) => setTaskSort(column as TaskSort)}
                  className="num"
                />
                <SortableColumnHeader
                  label="Samples"
                  column="count"
                  activeColumn={selection.sort}
                  direction={selection.sortDir}
                  onSort={(column) => setTaskSort(column as TaskSort)}
                  className="num"
                />
                {selection.taskExtendedStats ? (
                  <>
                    <SortableColumnHeader
                      label={`${baselineLabel} median`}
                      column="baseline-p50"
                      activeColumn={selection.sort}
                      direction={selection.sortDir}
                      onSort={(column) => setTaskSort(column as TaskSort)}
                      className="num"
                    />
                    <SortableColumnHeader
                      label={`${candidateLabel} median`}
                      column="candidate-p50"
                      activeColumn={selection.sort}
                      direction={selection.sortDir}
                      onSort={(column) => setTaskSort(column as TaskSort)}
                      className="num"
                    />
                    <th className="num">Δ median</th>
                    <SortableColumnHeader
                      label={`${baselineLabel} P90`}
                      column="baseline-p90"
                      activeColumn={selection.sort}
                      direction={selection.sortDir}
                      onSort={(column) => setTaskSort(column as TaskSort)}
                      className="num"
                    />
                    <SortableColumnHeader
                      label={`${candidateLabel} P90`}
                      column="candidate-p90"
                      activeColumn={selection.sort}
                      direction={selection.sortDir}
                      onSort={(column) => setTaskSort(column as TaskSort)}
                      className="num"
                    />
                    <th className="num">Δ P90</th>
                  </>
                ) : null}
              </tr>
            </thead>
          }
          renderRow={(index) => {
            const row = displayRows[index];
            if (!row) {
              return null;
            }
            const isHighlighted = highlightedId === row.metric.id;
            const isPinnedOutside = pinnedOutside && pinnedRow?.metric.id === row.metric.id;
            const left = statisticValue(row.metric.values[baseline.id], "mean");
            const right = statisticValue(row.metric.values[candidate.id], "mean");
            const medianCmp = compareMetric(row.metric, baseline.id, candidate.id, "p50");
            const p90Cmp = compareMetric(row.metric, baseline.id, candidate.id, "p90");
            return (
              <tr
                key={row.metric.id}
                className={[isHighlighted ? "is-selected" : "", isPinnedOutside ? "is-outside-filter" : ""]
                  .filter(Boolean)
                  .join(" ") || undefined}
                aria-selected={isHighlighted}
                onClick={() => selectRow(row.metric.id)}
              >
                <td className="path sticky-col" title={row.path}>
                  <button
                    type="button"
                    className="task-path-button"
                    aria-current={isHighlighted ? "true" : undefined}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectRow(row.metric.id);
                    }}
                  >
                    {isTypes ? shortTypeName(row.path) : row.path}
                  </button>
                </td>
                <td className="num">
                  {formatMetricValue(left, row.metric.unit, row.metric.valueType).text}
                </td>
                <td className="num">
                  {formatMetricValue(right, row.metric.unit, row.metric.valueType).text}
                </td>
                <td className="num">
                  <MetricDelta
                    comparison={row.comparison}
                    unit={row.metric.unit}
                    valueType={row.metric.valueType}
                    direction={row.metric.direction}
                  />
                </td>
                <td className="num">
                  {row.baselineCount ?? "—"} / {row.candidateCount ?? "—"}
                </td>
                {selection.taskExtendedStats ? (
                  <>
                    <td className="num">
                      {
                        formatMetricValue(
                          statisticValue(row.metric.values[baseline.id], "p50"),
                          row.metric.unit,
                          row.metric.valueType,
                        ).text
                      }
                    </td>
                    <td className="num">
                      {
                        formatMetricValue(
                          statisticValue(row.metric.values[candidate.id], "p50"),
                          row.metric.unit,
                          row.metric.valueType,
                        ).text
                      }
                    </td>
                    <td className="num">
                      <MetricDelta
                        comparison={medianCmp}
                        unit={row.metric.unit}
                        valueType={row.metric.valueType}
                        direction={row.metric.direction}
                      />
                    </td>
                    <td className="num">
                      {
                        formatMetricValue(
                          statisticValue(row.metric.values[baseline.id], "p90"),
                          row.metric.unit,
                          row.metric.valueType,
                        ).text
                      }
                    </td>
                    <td className="num">
                      {
                        formatMetricValue(
                          statisticValue(row.metric.values[candidate.id], "p90"),
                          row.metric.unit,
                          row.metric.valueType,
                        ).text
                      }
                    </td>
                    <td className="num">
                      <MetricDelta
                        comparison={p90Cmp}
                        unit={row.metric.unit}
                        valueType={row.metric.valueType}
                        direction={row.metric.direction}
                      />
                    </td>
                  </>
                ) : null}
              </tr>
            );
          }}
        />
      </div>
    </section>
  );
}
