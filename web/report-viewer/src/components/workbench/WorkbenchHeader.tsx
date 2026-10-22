import { SITE } from "../Shell/site";
import { useDashboard } from "../../app/DashboardState";
import { formatIsoDate } from "../../domain/formatting";
import { experimentHeading } from "../../domain/viewModels";
import { ReportExportMenu } from "./ReportExportMenu";

export function WorkbenchHeader() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const heading = experimentHeading(report, baseline, candidate);
  const warningCount = report.warnings.length;
  return (
    <header className="workbench-header">
      <div className="workbench-header-inner">
        <div>
          <p className="workbench-crumb">
            <a href={`${SITE}/posts/`}>Experiments</a>
            {" / "}
            {heading.title}
          </p>
          <h1 className="workbench-title">{heading.comparison}</h1>
          <p className="workbench-meta">
            {report.experiment.repository ?? "repository not recorded"}
            {report.experiment.requestedTasks.length > 0
              ? ` · ${report.experiment.requestedTasks.join(", ")}`
              : ""}
            {report.execution.runId ? ` · run ${report.execution.runId}` : ""}
            {report.execution.runAttempt != null ? ` · attempt ${report.execution.runAttempt}` : ""}
            {report.experiment.mode ? ` · ${report.experiment.mode}` : ""}
            {` · generated ${formatIsoDate(report.generatedAt)}`}
          </p>
          <div className="workbench-status">
            <span className="status-chip">{report.report.status}</span>
            <span className="status-chip">diagnostics {report.diagnostics.status}</span>
            {warningCount > 0 ? (
              <button
                type="button"
                className="status-chip is-warn"
                onClick={() => update({ ...selection, section: "details" })}
              >
                {warningCount} warning{warningCount === 1 ? "" : "s"}
              </button>
            ) : (
              <span className="status-chip">no warnings</span>
            )}
          </div>
        </div>
        <div className="workbench-actions">
          <ReportExportMenu />
          <a className="wb-btn" href={`${SITE}/`}>
            Telltale
          </a>
        </div>
      </div>
    </header>
  );
}
