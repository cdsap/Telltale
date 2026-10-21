import { useMemo, useState } from "react";
import type { ExperimentResult, StatisticName, Variant } from "../../domain/types";
import { compareValues, comparisonTone, statisticValue } from "../../domain/comparisons";
import { formatDelta } from "../../domain/formatting";
import { formatMetricValue } from "../../domain/units";
import { KEY_METRIC_FAMILIES, displayLabel, familiesIn } from "../../domain/metrics";

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
  const families = familiesIn(report);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return report.metrics.filter((metric) => {
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
  }, [family, query, report.metrics]);

  return (
    <section id="metrics" className="experiment-snapshot">
      <h2 className="experiment-snapshot-title">All metrics</h2>
      <div className="controls">
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
      <div className="table-wrap">
        <table className="experiment-snapshot-table metrics-table">
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
            {rows.map((metric) => {
              const baselineValue = statisticValue(metric.values[baseline.id], statistic);
              const candidateValue = statisticValue(metric.values[candidate.id], statistic);
              const comparison = compareValues(baselineValue, candidateValue);
              const tone = comparisonTone(comparison, metric.direction);
              const toneClass =
                tone === "better" ? "is-improvement" : tone === "worse" ? "is-regression" : "";
              return (
                <tr key={metric.id}>
                  <td>{metric.category}</td>
                  <td className="path">{metric.name}</td>
                  <td className="num" title={formatMetricValue(baselineValue, metric.unit, metric.valueType).title}>
                    {formatMetricValue(baselineValue, metric.unit, metric.valueType).text}
                  </td>
                  <td className="num" title={formatMetricValue(candidateValue, metric.unit, metric.valueType).title}>
                    {formatMetricValue(candidateValue, metric.unit, metric.valueType).text}
                  </td>
                  <td className={`num delta ${toneClass}`}>{formatDelta(comparison)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
