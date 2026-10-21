import type { ExperimentResult, Variant } from "../../domain/types";
import { compareTitle, displayLabel } from "../../domain/metrics";
import { variantScanSearchUrl, workflowUrl } from "../../domain/links";
import { metricsCsv } from "../../domain/csv";
import { csvFilename } from "../../domain/links";
import { useEffect, useMemo } from "react";

interface ExperimentHeaderProps {
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  jsonUrl: string | null;
  legacyCsvUrl?: string | null;
  legacyHtmlUrl?: string | null;
}

export function ExperimentHeader({
  report,
  baseline,
  candidate,
  jsonUrl,
}: ExperimentHeaderProps) {
  const workflow = workflowUrl(report);
  const csvUrl = useMemo(() => {
    const blob = new Blob([metricsCsv(report)], { type: "text/csv" });
    return URL.createObjectURL(blob);
  }, [report]);
  useEffect(() => () => URL.revokeObjectURL(csvUrl), [csvUrl]);
  const baselineScans = variantScanSearchUrl(report, baseline);
  const candidateScans = variantScanSearchUrl(report, candidate);

  return (
    <section className="home-hero page-header">
      <p className="home-hero-eyebrow">Latest experiment</p>
      <h1>{compareTitle(baseline, candidate)}</h1>
      <p className="home-hero-desc">
        {report.experiment.requestedTasks.join(", ") || "Gradle experiment"}
        {report.experiment.mode ? ` · ${report.experiment.mode}` : ""}
        {report.experiment.repository ? ` · ${report.experiment.repository}` : ""}
      </p>
      <div className="home-hero-actions">
        {jsonUrl ? (
          <a className="home-hero-cta" href={jsonUrl} download>
            Download JSON
          </a>
        ) : null}
        <a className="home-hero-cta home-hero-cta--secondary" href={csvUrl} download={csvFilename(report)}>
          Download CSV
        </a>
        {workflow ? (
          <a className="home-hero-cta home-hero-cta--secondary" href={workflow} rel="noreferrer">
            Workflow
          </a>
        ) : null}
        {baselineScans ? (
          <a className="home-hero-cta home-hero-cta--secondary" href={baselineScans} rel="noreferrer">
            {displayLabel(baseline)} scans
          </a>
        ) : null}
        {candidateScans ? (
          <a className="home-hero-cta home-hero-cta--secondary" href={candidateScans} rel="noreferrer">
            {displayLabel(candidate)} scans
          </a>
        ) : null}
      </div>
      <p className="home-hero-footnote">
        {baseline.buildCount ?? 0} / {candidate.buildCount ?? 0} builds · diagnostics{" "}
        <strong>{report.diagnostics.status}</strong>
        {report.report.kind ? ` · ${report.report.kind}` : ""}
      </p>
    </section>
  );
}
