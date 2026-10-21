import type { Metric, StatisticName, Variant } from "../../domain/types";
import { compareValues, comparisonTone, statisticValue } from "../../domain/comparisons";
import { formatDelta } from "../../domain/formatting";
import { displayLabel } from "../../domain/metrics";
import { formatMetricValue } from "../../domain/units";

interface MetricRowsProps {
  metrics: Metric[];
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
  caption?: string;
  empty?: string;
  onSelect?: (metricId: string) => void;
  selectedId?: string | null;
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
}: MetricRowsProps) {
  if (metrics.length === 0) {
    return empty ? <p className="series-note">{empty}</p> : null;
  }
  return (
    <div className="table-wrap">
      <table className="experiment-snapshot-table metrics-table">
        {caption ? <caption className="visually-hidden">{caption}</caption> : null}
        <thead>
          <tr>
            <th>Category</th>
            <th>Metric</th>
            <th className="num">{displayLabel(baseline)}</th>
            <th className="num">{displayLabel(candidate)}</th>
            <th className="num">Δ</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => {
            const baselineValue = statisticValue(metric.values[baseline.id], statistic);
            const candidateValue = statisticValue(metric.values[candidate.id], statistic);
            const comparison = compareValues(baselineValue, candidateValue);
            const tone = comparisonTone(comparison, metric.direction);
            const toneClass =
              tone === "better" ? "is-improvement" : tone === "worse" ? "is-regression" : "";
            return (
              <tr
                key={metric.id}
                className={selectedId === metric.id ? "is-selected" : undefined}
              >
                <td>{metric.category}</td>
                <td className="path">
                  {onSelect ? (
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => onSelect(metric.id)}
                    >
                      {metric.name}
                    </button>
                  ) : (
                    metric.name
                  )}
                </td>
                <td
                  className="num"
                  title={formatMetricValue(baselineValue, metric.unit, metric.valueType).title}
                >
                  {formatMetricValue(baselineValue, metric.unit, metric.valueType).text}
                </td>
                <td
                  className="num"
                  title={formatMetricValue(candidateValue, metric.unit, metric.valueType).title}
                >
                  {formatMetricValue(candidateValue, metric.unit, metric.valueType).text}
                </td>
                <td className={`num delta ${toneClass}`}>{formatDelta(comparison)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
