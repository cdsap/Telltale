import { useDashboard } from "../../app/DashboardState";
import { displayLabel } from "../../domain/metrics";

export function GlobalCompareBar() {
  const { report, selection, update } = useDashboard();
  const single = report.variants.length < 2;
  return (
    <div className="workbench-compare">
      <div className="workbench-compare-inner">
        <label>
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
        <label>
          Candidate
          <select
            value={selection.candidateId}
            disabled={single}
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
    </div>
  );
}
