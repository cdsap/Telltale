import { useEffect, useId, useMemo, useState } from "react";
import { useDashboard } from "../../app/DashboardState";
import { metricsCsv } from "../../domain/csv";
import { csvFilename, variantScanSearchUrl, workflowUrl } from "../../domain/links";
import { displayLabel } from "../../domain/metrics";

export function ReportExportMenu() {
  const { report, jsonUrl, legacyCsvUrl, legacyHtmlUrl, baseline, candidate } = useDashboard();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const generatedCsvUrl = useMemo(() => {
    const blob = new Blob([metricsCsv(report)], { type: "text/csv" });
    return URL.createObjectURL(blob);
  }, [report]);
  useEffect(() => () => URL.revokeObjectURL(generatedCsvUrl), [generatedCsvUrl]);
  const csvUrl = legacyCsvUrl || generatedCsvUrl;
  const workflow = workflowUrl(report);
  const baselineScans = variantScanSearchUrl(report, baseline);
  const candidateScans = variantScanSearchUrl(report, candidate);

  return (
    <div className="export-menu">
      <button
        type="button"
        className="wb-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Export
      </button>
      {open ? (
        <ul id={menuId} className="export-menu-list" role="menu">
          {jsonUrl ? (
            <li role="none">
              <a role="menuitem" href={jsonUrl} download>
                Download JSON
              </a>
            </li>
          ) : null}
          <li role="none">
            <a role="menuitem" href={csvUrl} download={csvFilename(report)}>
              Download CSV
            </a>
          </li>
          {legacyHtmlUrl ? (
            <li role="none">
              <a role="menuitem" href={legacyHtmlUrl}>
                Legacy HTML
              </a>
            </li>
          ) : null}
          {workflow ? (
            <li role="none">
              <a role="menuitem" href={workflow} rel="noreferrer">
                Workflow
              </a>
            </li>
          ) : null}
          {baselineScans ? (
            <li role="none">
              <a role="menuitem" href={baselineScans} rel="noreferrer">
                {`Build Scans · ${displayLabel(baseline)}`}
              </a>
            </li>
          ) : null}
          {candidateScans ? (
            <li role="none">
              <a role="menuitem" href={candidateScans} rel="noreferrer">
                {`Build Scans · ${displayLabel(candidate)}`}
              </a>
            </li>
          ) : null}
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                await navigator.clipboard?.writeText(window.location.href);
                setOpen(false);
              }}
            >
              Copy report URL
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
