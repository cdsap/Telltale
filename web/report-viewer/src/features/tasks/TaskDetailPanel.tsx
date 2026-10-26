import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { MetricStatisticsTable } from "../../components/inspectors/MetricStatisticsTable";
import { displayLabel } from "../../domain/metrics";
import { canPlotSequence, seriesHasPoints, shortTypeName, taskModuleOf } from "../../domain/series";
import { peakTaskMeanMs } from "../../domain/taskTableFilters";
import type { TaskSeries, Variant } from "../../domain/types";
import { formatMetricValue } from "../../domain/units";
import type { TaskChangeRow } from "../../domain/viewModels";

interface TaskDetailPanelProps {
  row: TaskChangeRow;
  baseline: Variant;
  candidate: Variant;
  pinned: boolean;
  series: TaskSeries | undefined;
  kind?: "path" | "type";
  outsideFilter?: boolean;
  onClearPin: () => void;
  onDrillDown?: () => void;
}

export function TaskDetailPanel({
  row,
  baseline,
  candidate,
  pinned,
  series,
  kind = "path",
  outsideFilter = false,
  onClearPin,
  onDrillDown,
}: TaskDetailPanelProps) {
  const peakMs = peakTaskMeanMs(row, baseline.id, candidate.id);
  const peakFormatted =
    peakMs == null ? "N/A" : formatMetricValue(peakMs, row.metric.unit, row.metric.valueType).text;
  const variantIds = [baseline.id, candidate.id];
  const hasTimeline = canPlotSequence(row.metric) && seriesHasPoints(series, variantIds);

  return (
    <section
      className="task-inspector"
      aria-labelledby="task-detail-title"
      data-pinned={pinned ? "true" : "false"}
    >
      <header className="task-inspector-head">
        <div className="task-inspector-identity">
          <p className="task-detail-kicker">
            {pinned
              ? kind === "type"
                ? "Selected type"
                : "Selected task"
              : "Largest change in this view"}
          </p>
          <h3 id="task-detail-title" className="task-detail-title" title={row.path}>
            {kind === "type" ? shortTypeName(row.path) : row.path}
          </h3>
          <p className="task-inspector-meta">
            {taskModuleOf(row.path) || "root"} · {row.category} · peak mean {peakFormatted}
          </p>
          {outsideFilter ? (
            <p className="task-inspector-outside" role="status">
              Selected {kind === "type" ? "type" : "task"} is outside the current filters and is
              pinned at the top of the table.
            </p>
          ) : null}
        </div>
        <div className="task-inspector-actions">
          {onDrillDown ? (
            <button type="button" className="wb-btn" onClick={onDrillDown}>
              View task paths
            </button>
          ) : null}
          {pinned ? (
            <button type="button" className="wb-btn" onClick={onClearPin}>
              Use ranking default
            </button>
          ) : (
            <p className="task-inspector-hint">Click a bar or row to inspect another task.</p>
          )}
        </div>
      </header>
      <div className={hasTimeline && series ? "task-inspector-body" : undefined}>
        <MetricStatisticsTable
          metric={row.metric}
          baseline={baseline}
          candidate={candidate}
          caption={`${displayLabel(baseline)} vs ${displayLabel(candidate)}`}
        />
        {hasTimeline && series ? (
          <div className="task-inspector-chart">
            <p className="task-inspector-chart-label">Duration by build</p>
            <SeriesChart
              title={row.path}
              variants={[baseline, candidate]}
              observations={series.observations}
              unit={row.metric.unit}
              valueType={row.metric.valueType}
              allowSequence={canPlotSequence(row.metric)}
            />
          </div>
        ) : (
          <p className="panel-note">No per-build timeline was published for this task path.</p>
        )}
      </div>
    </section>
  );
}
