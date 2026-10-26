import { useDashboard } from "../../app/DashboardState";
import { displayLabel } from "../../domain/metrics";

interface VariantCompareSelectsProps {
  id?: string;
  className?: string;
}

export function VariantCompareSelects({
  id,
  className = "header-compare-panel",
}: VariantCompareSelectsProps) {
  const { report, selection, update } = useDashboard();
  return (
    <div id={id} className={className}>
      <label className="header-compare">
        Baseline
        <select
          value={selection.baselineId}
          onChange={(event) => update({ baselineId: event.target.value })}
        >
          {report.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {displayLabel(variant)}
            </option>
          ))}
        </select>
      </label>
      <label className="header-compare">
        Candidate
        <select
          value={selection.candidateId}
          disabled={report.variants.length < 2}
          onChange={(event) => update({ candidateId: event.target.value })}
        >
          {report.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {displayLabel(variant)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
