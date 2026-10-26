import { MetricStatisticsTable } from "./MetricStatisticsTable";
import { metricDisplayName } from "../../domain/metrics";
import type { Metric, Variant } from "../../domain/types";

interface MetricInspectorProps {
  metric: Metric;
  baseline: Variant;
  candidate: Variant;
  kicker?: string;
}

export function MetricInspector({ metric, baseline, candidate, kicker }: MetricInspectorProps) {
  return (
    <section className="metric-inspector" aria-label={`${metric.name} comparison`}>
      {kicker ? <p className="task-detail-kicker">{kicker}</p> : null}
      <h3 className="metric-inspector-title">{metricDisplayName(metric)}</h3>
      <p className="task-inspector-meta">
        {metric.unit || "no unit"}
        {metric.direction ? ` · ${metric.direction}` : ""}
      </p>
      <MetricStatisticsTable metric={metric} baseline={baseline} candidate={candidate} />
    </section>
  );
}
