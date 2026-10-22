import type { ExperimentResult, StatisticName, Variant } from "../../domain/types";
import { comparisonTone } from "../../domain/comparisons";
import { diagnosticsStatusLabel } from "../../domain/coverage";
import { compareMetric, displayLabel, metricById } from "../../domain/metrics";
import { isDiagnosticMetric } from "../../domain/series";
import { MetricCard } from "../../components/MetricCard/MetricCard";
import { MetricRows } from "../../components/MetricRows/MetricRows";

interface DiagnosticsProps {
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
}

export function Diagnostics({
  report,
  baseline,
  candidate,
  statistic,
}: DiagnosticsProps) {
  const diagnosticMetrics = report.metrics.filter(isDiagnosticMetric);
  const groups = report.diagnostics.groups;
  return (
    <section id="diagnostics" className="report-block">
      <div className="experiment-snapshot">
        <h2 className="experiment-snapshot-title">CPU / JFR</h2>
        <p className="series-note">{diagnosticsStatusLabel(report.diagnostics.status)}</p>
        <p className="series-note">
          These are pooled diagnostic samples; they are not aligned to Build 1 / Build 2 / Build 3.
          This page will not draw a timeline for them.
        </p>
        <p className="series-note">
          CPU/JFR aggregated metrics are available when exported, but individual recording files were
          not published in the report.
        </p>
        {groups.length > 0 ? (
          <ul className="coverage-list">
            {groups.map((group) => {
              const present = group.metricIds.filter((id) => metricById(report, id)).length;
              const jobs = [
                ...(group.jobKeysByVariant[baseline.id] ?? []),
                ...(group.jobKeysByVariant[candidate.id] ?? []),
              ];
              return (
                <li key={group.id}>
                  <strong>{group.family}</strong> · {present}/{group.metricIds.length} metrics ·
                  sample unit {group.sampleUnit}
                  {jobs.length > 0 ? ` · jobs ${jobs.join(", ")}` : ""}
                </li>
              );
            })}
          </ul>
        ) : null}
        <MetricRows
          metrics={diagnosticMetrics}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          caption="Diagnostic metrics"
          empty={
            report.diagnostics.status === "present" || report.diagnostics.status === "partial"
              ? "Diagnostic groups are present, but no numeric CPU/JFR metrics were exported."
              : undefined
          }
        />
      </div>
      {diagnosticMetrics.length > 0 ? (
        <div className="snapshot-grid">
          {diagnosticMetrics.slice(0, 4).map((metric) => {
            const comparison = compareMetric(metric, baseline.id, candidate.id, statistic);
            return (
              <MetricCard
                key={metric.id}
                title={metric.name}
                metric={metric}
                baseline={baseline}
                candidate={candidate}
                statistic={statistic}
                comparison={comparison}
                tone={comparisonTone(comparison, metric.direction)}
              />
            );
          })}
        </div>
      ) : null}
      <p className="visually-hidden">
        Compared variants: {displayLabel(baseline)} and {displayLabel(candidate)}.
      </p>
    </section>
  );
}
