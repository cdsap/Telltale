import { useDashboard } from "../../app/DashboardState";
import { variantScanSearchUrl, workflowUrl } from "../../domain/links";
import { displayLabel } from "../../domain/metrics";
import type { Variant } from "../../domain/types";

interface ExperimentLinksProps {
  variants?: Variant[];
  includeWorkflow?: boolean;
  className?: string;
}

export function ExperimentLinks({
  variants,
  includeWorkflow = true,
  className = "experiment-links",
}: ExperimentLinksProps) {
  const { report, baseline, candidate } = useDashboard();
  const list = variants ?? [baseline, candidate];
  const scans = list.flatMap((variant) => {
    const href = variantScanSearchUrl(report, variant);
    return href ? [{ variant, href }] : [];
  });
  const workflow = includeWorkflow ? workflowUrl(report) : null;
  if (scans.length === 0 && !workflow) {
    return null;
  }
  return (
    <nav className={className} aria-label="Experiment links">
      {scans.map(({ variant, href }) => (
        <a key={variant.id} href={href} rel="noreferrer">
          {`Build Scans · ${displayLabel(variant)}`}
        </a>
      ))}
      {workflow ? (
        <a href={workflow} rel="noreferrer">
          Workflow
        </a>
      ) : null}
    </nav>
  );
}
