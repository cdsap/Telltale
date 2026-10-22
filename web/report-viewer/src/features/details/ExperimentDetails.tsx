import { useDashboard } from "../../app/DashboardState";
import { WarningBanner } from "../../components/WarningBanner/WarningBanner";
import { formatIsoDate } from "../../domain/formatting";
import { displayLabel } from "../../domain/metrics";

export function ExperimentDetails() {
  const { report, jsonUrl, legacyCsvUrl, legacyHtmlUrl } = useDashboard();
  return (
    <>
      <section className="wb-panel">
        <h2>Experiment</h2>
        <dl className="glossary">
          <dt>Title / id</dt>
          <dd>
            {report.report.title ?? "—"} · {report.report.id}
          </dd>
          <dt>Repository</dt>
          <dd>{report.experiment.repository ?? "not recorded"}</dd>
          <dt>Requested tasks</dt>
          <dd>{report.experiment.requestedTasks.join(", ") || "not recorded"}</dd>
          <dt>Mode</dt>
          <dd>{report.experiment.mode ?? "not recorded"}</dd>
          <dt>Profiler</dt>
          <dd>
            {report.experiment.isProfiler == null ? "not recorded" : String(report.experiment.isProfiler)}
          </dd>
          <dt>GitHub run</dt>
          <dd>
            {report.execution.runId ?? "not recorded"}
            {report.execution.runAttempt != null ? ` · attempt ${report.execution.runAttempt}` : ""}
          </dd>
        </dl>
      </section>
      <section className="wb-panel">
        <h2>Variants</h2>
        <div className="table-wrap">
          <table className="experiment-snapshot-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Role</th>
                <th>Source tag</th>
                <th className="num">buildCount</th>
                <th className="num">observations</th>
              </tr>
            </thead>
            <tbody>
              {report.variants.map((variant) => (
                <tr key={variant.id}>
                  <td>{displayLabel(variant)}</td>
                  <td>{variant.role ?? "—"}</td>
                  <td className="change-path">{variant.sourceTag ?? "—"}</td>
                  <td className="num">{variant.buildCount ?? "—"}</td>
                  <td className="num">{report.datasets.builds[variant.id]?.length ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="wb-panel">
        <h2>Data provenance</h2>
        <p className="panel-note">
          {report.producer.name} {report.producer.version}
          {report.producer.revision ? ` · ${report.producer.revision}` : ""} · schema{" "}
          {report.schemaVersion} · generated {formatIsoDate(report.generatedAt)}
        </p>
        <p className="panel-note">
          Diagnostics {report.diagnostics.status}
          {report.diagnostics.source?.tool ? ` · ${report.diagnostics.source.tool}` : ""}
          {report.diagnostics.source?.schemaVersion
            ? ` ${report.diagnostics.source.schemaVersion}`
            : ""}
        </p>
      </section>
      <section className="wb-panel">
        <h2>Comparability</h2>
        <ul className="coverage-list">
          <li>Requested variants: {report.completeness.requestedVariantIds.join(", ") || "—"}</li>
          <li>Observed variants: {report.completeness.observedVariantIds.join(", ") || "—"}</li>
          <li>Missing metric ids: {report.completeness.missingMetricIds.length}</li>
          <li>Diagnostics completeness: {report.completeness.diagnostics}</li>
        </ul>
      </section>
      <section className="wb-panel">
        <h2>Warnings</h2>
        <WarningBanner warnings={report.warnings} />
        {report.warnings.length === 0 ? <p className="panel-note">No warnings were exported.</p> : null}
      </section>
      <section className="wb-panel">
        <h2>Assets</h2>
        <ul className="coverage-list">
          {jsonUrl ? (
            <li>
              <a href={jsonUrl} download>
                JSON
              </a>
            </li>
          ) : null}
          {legacyCsvUrl ? (
            <li>
              <a href={legacyCsvUrl}>
                Legacy CSV
              </a>
            </li>
          ) : null}
          {legacyHtmlUrl ? (
            <li>
              <a href={legacyHtmlUrl}>
                Legacy HTML
              </a>
            </li>
          ) : null}
        </ul>
      </section>
      <section className="wb-panel">
        <h2>Glossary</h2>
        <dl className="glossary">
          <dt>Mean / P50 / P90</dt>
          <dd>
            Producer aggregates. P50 is the median. Switching the statistic updates KPI emphasis and
            rankings, not raw observation charts.
          </dd>
          <dt>Sample</dt>
          <dd>
            A build, a task invocation, a diagnostic sample, or a JVM event. These units are not
            interchangeable.
          </dd>
          <dt>Task total vs wall-clock</dt>
          <dd>
            Concurrent Gradle tasks overlap. Summing task-duration deltas does not explain build
            wall-clock change.
          </dd>
          <dt>Aggregate vs time series</dt>
          <dd>
            CPU/JFR groups are pooled diagnostic samples. They are not aligned to Build 1 / Build 2 /
            Build 3.
          </dd>
        </dl>
      </section>
    </>
  );
}
