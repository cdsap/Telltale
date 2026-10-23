import { Bar } from "react-chartjs-2";
import type { Comparison, ComparisonTone, Metric, StatisticName, Variant } from "../../domain/types";
import { compareValues, comparisonTone, statisticValue } from "../../domain/comparisons";
import { formatDelta } from "../../domain/formatting";
import { displayLabel } from "../../domain/metrics";
import { statisticLabel } from "../../domain/viewModels";
import { axisUnitLabel, formatMetricValue } from "../../domain/units";
import { percentileBarData } from "../../charts/chartAdapter";
import { barOptions } from "../../charts/chartTheme";

interface MetricCardProps {
  title: string;
  metric: Metric;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
  comparison: Comparison;
  tone: ComparisonTone;
}

export function MetricCard({
  title,
  metric,
  baseline,
  candidate,
  statistic,
  comparison,
  tone,
}: MetricCardProps) {
  const delta = formatDelta(comparison);
  const toneClass =
    tone === "better" ? "is-improvement" : tone === "worse" ? "is-regression" : "";
  const yLabel = axisUnitLabel(metric.unit, metric.valueType);
  const stats: StatisticName[] = ["mean", "p50", "p90"];
  return (
    <article className="experiment-snapshot">
      <h3 className="experiment-snapshot-title">{title}</h3>
      <div className="experiment-snapshot-kpi" aria-label={`${title} change`}>
        <div>
          <span className="experiment-snapshot-kpi-label">
            {statisticLabel(statistic)} change
          </span>
          <strong className={`experiment-snapshot-kpi-value ${toneClass}`}>{delta}</strong>
        </div>
        <span className="experiment-snapshot-kpi-context">
          {displayLabel(candidate)} relative to {displayLabel(baseline)}
        </span>
      </div>
      <p className="experiment-snapshot-metric">
        {metric.name} ({yLabel})
      </p>
      <div className="experiment-snapshot-chart-wrap">
        <Bar data={percentileBarData(metric, [baseline, candidate])} options={barOptions(yLabel)} />
      </div>
      <table className="experiment-snapshot-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th className="num">{displayLabel(baseline)}</th>
            <th className="num">{displayLabel(candidate)}</th>
            <th className="num">Δ</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((name) => {
            const left = statisticValue(metric.values[baseline.id], name);
            const right = statisticValue(metric.values[candidate.id], name);
            const row = compareValues(left, right);
            const rowTone = comparisonTone(row, metric.direction);
            const rowClass =
              rowTone === "better"
                ? "is-improvement"
                : rowTone === "worse"
                  ? "is-regression"
                  : "";
            return (
              <tr key={name}>
                <th scope="row">{name.toUpperCase()}</th>
                <td className="num">{formatMetricValue(left, metric.unit, metric.valueType).text}</td>
                <td className="num">{formatMetricValue(right, metric.unit, metric.valueType).text}</td>
                <td className={`num delta ${rowClass}`}>{formatDelta(row)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}
