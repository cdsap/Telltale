import { statisticValue } from "../../domain/comparisons";
import { compareMetric, displayLabel } from "../../domain/metrics";
import { TABLE_STATISTICS } from "../../domain/tableStatistics";
import type { Metric, Variant } from "../../domain/types";
import { formatMetricValue } from "../../domain/units";
import { statisticLabel } from "../../domain/viewModels";
import { MetricDelta } from "../comparison/MetricDelta";

interface MetricStatisticsTableProps {
  metric: Metric;
  baseline: Variant;
  candidate: Variant;
  caption?: string;
}

export function MetricStatisticsTable({
  metric,
  baseline,
  candidate,
  caption,
}: MetricStatisticsTableProps) {
  const baselineLabel = displayLabel(baseline);
  const candidateLabel = displayLabel(candidate);
  return (
    <table className="experiment-snapshot-table task-inspector-stats">
      {caption ? <caption className="visually-hidden">{caption}</caption> : null}
      <thead>
        <tr>
          <th>Statistic</th>
          <th className="num">{baselineLabel}</th>
          <th className="num">{candidateLabel}</th>
          <th className="num">Δ</th>
        </tr>
      </thead>
      <tbody>
        {TABLE_STATISTICS.map((stat) => {
          const comparison = compareMetric(metric, baseline.id, candidate.id, stat);
          const left = statisticValue(metric.values[baseline.id], stat);
          const right = statisticValue(metric.values[candidate.id], stat);
          return (
            <tr key={stat}>
              <th scope="row">{statisticLabel(stat)}</th>
              <td className="num">
                {formatMetricValue(left, metric.unit, metric.valueType).text}
              </td>
              <td className="num">
                {formatMetricValue(right, metric.unit, metric.valueType).text}
              </td>
              <td className="num">
                <MetricDelta
                  comparison={comparison}
                  unit={metric.unit}
                  valueType={metric.valueType}
                  direction={metric.direction}
                  practicalMs={0}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
