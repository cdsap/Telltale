import { STATISTICS } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { displayLabel } from "../../domain/metrics";
import type { StatisticName } from "../../domain/types";
import { statisticLabel } from "../../domain/viewModels";

export function GlobalCompareBar() {
  const { report, selection, update, reset } = useDashboard();
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
        <div className="segmented" role="group" aria-label="Statistic">
          {STATISTICS.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={selection.statistic === name}
              onClick={() => update({ statistic: name as StatisticName })}
            >
              {statisticLabel(name)}
            </button>
          ))}
        </div>
        <button type="button" className="wb-btn" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
