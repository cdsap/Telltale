import type { ExperimentResult, StatisticName, Variant } from "../../domain/types";
import type { DashboardSelection } from "../../domain/selections";
import { InsightRow } from "../../components/insights/InsightRow";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { MetricRows } from "../../components/MetricRows/MetricRows";
import { diagnosticsStatusLabel } from "../../domain/coverage";
import { displayLabel, metricById } from "../../domain/metrics";
import { isDiagnosticMetric } from "../../domain/series";
import { investigationFindings } from "../../domain/viewModels";

interface DiagnosticsProps {
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
  onNavigate: (patch: Partial<DashboardSelection>) => void;
}

export function Diagnostics({
  report,
  baseline,
  candidate,
  statistic,
  onNavigate,
}: DiagnosticsProps) {
  const diagnosticMetrics = report.metrics.filter(isDiagnosticMetric);
  const groups = report.diagnostics.groups;
  const findings = investigationFindings(report, baseline, candidate);
  return (
    <section id="diagnostics" className="report-block">
      <SectionHeader
        title="Findings"
        description="Changes of at least 5% in either direction. These are observations, not root-cause claims."
      />
      {findings.length > 0 ? (
        <ul className="findings-list">
          {findings.map((finding) => (
            <InsightRow
              key={finding.id}
              title={finding.title}
              detail={finding.detail}
              action={finding.action}
              onSelect={() =>
                onNavigate({
                  section: finding.section,
                  taskId: finding.taskId ?? null,
                })
              }
            />
          ))}
        </ul>
      ) : (
        <p className="panel-note">No changes of 5% or more were derived from this report.</p>
      )}
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
          compact
          caption="Diagnostic metrics"
          empty={
            report.diagnostics.status === "present" || report.diagnostics.status === "partial"
              ? "Diagnostic groups are present, but no numeric CPU/JFR metrics were exported."
              : undefined
          }
        />
      </div>
      <p className="visually-hidden">
        Compared variants: {displayLabel(baseline)} and {displayLabel(candidate)}.
      </p>
    </section>
  );
}
