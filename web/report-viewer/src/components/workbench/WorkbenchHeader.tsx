import { useState } from "react";
import { useTheme } from "../../app/theme";
import { SITE } from "../Shell/site";
import { useDashboard } from "../../app/DashboardState";
import { VariantCompareSelects } from "../comparison/VariantCompareSelects";
import { displayLabel } from "../../domain/metrics";
import { experimentHeading, observedBuildCount } from "../../domain/viewModels";
import { ExperimentLinks } from "./ExperimentLinks";
import { ReportExportMenu } from "./ReportExportMenu";

export function WorkbenchHeader() {
  const { report, baseline, candidate, update } = useDashboard();
  const heading = experimentHeading(report, baseline, candidate);
  const warningCount = report.warnings.length;
  const baselineN = observedBuildCount(report, baseline);
  const candidateN = observedBuildCount(report, candidate);
  const [compareOpen, setCompareOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  return (
    <header className="workbench-header">
      <div className="workbench-header-inner">
        <div>
          <p className="workbench-crumb">
            <a href={`${SITE}/posts/`}>Experiments</a>
            {" / "}
            <span>{heading.comparison}</span>
          </p>
          <h1 className="workbench-title">{heading.title}</h1>
          <p className="workbench-meta">
            Baseline → {displayLabel(candidate)} · {baselineN ?? "—"} vs {candidateN ?? "—"} builds
            {report.experiment.repository ? ` · ${report.experiment.repository}` : ""}
          </p>
          <ExperimentLinks />
        </div>
        <div className="workbench-actions">
          <button
            type="button"
            className="wb-btn"
            aria-expanded={compareOpen}
            aria-controls="header-compare-panel"
            onClick={() => setCompareOpen((open) => !open)}
          >
            Compare
          </button>
          <button type="button" className="wb-btn" onClick={() => update({ section: "details" })}>
            Experiment details
            {warningCount > 0 ? ` (${warningCount})` : ""}
          </button>
          <ReportExportMenu />
          <button
            type="button"
            className="wb-btn"
            onClick={async () => {
              await navigator.clipboard?.writeText(window.location.href);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            className="wb-btn"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>
      {compareOpen ? (
        <VariantCompareSelects
          id="header-compare-panel"
          className="workbench-compare-inner header-compare-panel"
        />
      ) : null}
    </header>
  );
}
