import { displayLabel } from "../../domain/metrics";
import type { Variant } from "../../domain/types";

interface ComparisonLegendProps {
  baseline: Variant;
  candidate: Variant;
  baselineN?: number | null;
  candidateN?: number | null;
}

export function ComparisonLegend({
  baseline,
  candidate,
  baselineN,
  candidateN,
}: ComparisonLegendProps) {
  return (
    <ul className="comparison-legend">
      <li>
        <span className="legend-swatch legend-swatch--baseline" />
        {displayLabel(baseline)}
        {baselineN != null ? ` · ${baselineN}` : ""}
      </li>
      <li>
        <span className="legend-swatch legend-swatch--candidate" />
        {displayLabel(candidate)}
        {candidateN != null ? ` · ${candidateN}` : ""}
      </li>
    </ul>
  );
}
