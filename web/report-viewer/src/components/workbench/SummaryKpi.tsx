import type { WorkbenchSection } from "../../app/routes";
import { formatDelta } from "../../domain/formatting";
import { formatMetricValue, formatSignedMetricValue } from "../../domain/units";
import type { KpiModel } from "../../domain/viewModels";
import { useDashboard } from "../../app/DashboardState";
import { displayLabel } from "../../domain/metrics";

interface SummaryKpiProps {
  kpi: KpiModel;
  section: WorkbenchSection;
}

export function SummaryKpi({ kpi, section }: SummaryKpiProps) {
  const { update, baseline, candidate } = useDashboard();
  const unit = kpi.metric?.unit ?? "";
  const valueType = kpi.metric?.valueType ?? null;
  const toneClass =
    kpi.tone === "better" ? "is-better" : kpi.tone === "worse" ? "is-worse" : "";
  return (
    <button type="button" className="kpi-tile" onClick={() => update({ section })}>
      <p className="kpi-label">{kpi.title}</p>
      {kpi.quality ? (
        <p className="kpi-detail">{kpi.detail}</p>
      ) : (
        <>
          <div className="kpi-values">
            <span className="kpi-value" title={formatMetricValue(kpi.comparison.candidate, unit, valueType).title}>
              {formatMetricValue(kpi.comparison.candidate, unit, valueType).text}
            </span>
            <span className="muted">
              vs {formatMetricValue(kpi.comparison.baseline, unit, valueType).text}
            </span>
          </div>
          <p className={`kpi-delta ${toneClass}`}>
            {formatSignedMetricValue(kpi.comparison.deltaAbsolute, unit, valueType).text}
            {" · "}
            {kpi.comparison.deltaPercent === null && kpi.comparison.deltaAbsolute !== null
              ? "percent undefined"
              : formatDelta(kpi.comparison)}
          </p>
          <p className="kpi-detail">
            {displayLabel(candidate)} − {displayLabel(baseline)} · {kpi.sampleUnit}
          </p>
        </>
      )}
    </button>
  );
}
