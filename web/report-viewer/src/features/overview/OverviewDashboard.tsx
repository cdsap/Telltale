import { DISTRIBUTION_VIEWS, type DistributionView, type WorkbenchSection } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { DataCoverage } from "../../components/workbench/DataCoverage";
import { SummaryKpi } from "../../components/workbench/SummaryKpi";
import { DistributionChart } from "../../components/charts/DistributionChart";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { formatSignedMetricValue } from "../../domain/units";
import { formatDelta } from "../../domain/formatting";
import {
  coverageChips,
  durationValues,
  overviewFindings,
  overviewKpis,
  rankedTaskChanges,
  splitTaskChanges,
  statisticLabel,
} from "../../domain/viewModels";
import type { ExperimentResult, SeriesObservation } from "../../domain/types";

function durationSeries(
  variants: Array<{ id: string }>,
  report: ExperimentResult,
): Record<string, SeriesObservation[]> {
  const observations: Record<string, SeriesObservation[]> = {};
  for (const variant of variants) {
    observations[variant.id] = (report.datasets.builds[variant.id] ?? []).map((item) => ({
      observationId: item.observationId,
      sequence: item.sequence,
      value: item.durationMs,
      durationMs: item.durationMs,
      outcome: null,
    }));
  }
  return observations;
}

export function OverviewDashboard() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const kpis = overviewKpis(report, baseline, candidate, selection.statistic);
  const findings = overviewFindings(report, baseline, candidate, selection.statistic);
  const ranked = rankedTaskChanges(report, baseline, candidate, selection.statistic);
  const { increases, decreases } = splitTaskChanges(ranked, 6);
  const view = selection.distView === "iteration" ? "box" : selection.distView;
  const values = {
    [baseline.id]: durationValues(report, baseline),
    [candidate.id]: durationValues(report, candidate),
  };
  return (
    <>
      <section className="kpi-row" aria-label="Headline comparisons">
        {kpis.map((kpi) => (
          <SummaryKpi
            key={kpi.id}
            kpi={kpi}
            section={kpi.id === "coverage" ? "details" : "builds"}
          />
        ))}
      </section>
      <div className="chart-grid">
        <ChartPanel
          title="Build duration distribution"
          subtitle={`${statisticLabel(selection.statistic)} guides stay on KPI cards. This chart uses raw per-build observations. n = ${values[baseline.id]?.length ?? 0} / ${values[candidate.id]?.length ?? 0}.`}
        >
          <div className="segmented" role="group" aria-label="Distribution view">
            {DISTRIBUTION_VIEWS.filter((item) => item !== "iteration").map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={view === item}
                onClick={() => update({ distView: item as DistributionView })}
              >
                {item === "box" ? "Box + points" : "Histogram"}
              </button>
            ))}
          </div>
          <DistributionChart
            title="Build duration"
            variants={[baseline, candidate]}
            values={values}
            unit="ms"
            valueType="duration"
            view={view}
          />
        </ChartPanel>
        <ChartPanel
          title="Duration by execution order"
          subtitle="Sequence numbers are per variant. Build N for A is not the same execution as Build N for B."
        >
          <SeriesChart
            title="Build duration"
            variants={[baseline, candidate]}
            observations={durationSeries([baseline, candidate], report)}
            unit="ms"
            valueType="duration"
            allowSequence
          />
        </ChartPanel>
      </div>
      <div className="split-grid">
        <section className="wb-panel">
          <h2>Largest task duration changes</h2>
          <p className="panel-note">
            Ranked by absolute {statisticLabel(selection.statistic)} delta. Task durations can
            overlap under Gradle concurrency, so these rows are not wall-clock contributors.
          </p>
          <div className="split-grid">
            <div>
              <h3>Biggest observed increases</h3>
              <TaskChangeList
                rows={increases}
                onSelect={(taskId) => update({ section: "tasks", taskId })}
              />
            </div>
            <div>
              <h3>Biggest observed decreases</h3>
              <TaskChangeList
                rows={decreases}
                onSelect={(taskId) => update({ section: "tasks", taskId })}
              />
            </div>
          </div>
        </section>
        <section className="wb-panel">
          <h2>Findings</h2>
          <ul className="findings-list">
            {findings.map((finding) => (
              <li key={finding.id}>
                <button
                  type="button"
                  onClick={() => update({ section: finding.section as WorkbenchSection })}
                >
                  {finding.text}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="wb-panel">
        <h2>Analysis coverage</h2>
        <DataCoverage chips={coverageChips(report)} />
      </section>
    </>
  );
}

function TaskChangeList({
  rows,
  onSelect,
}: {
  rows: ReturnType<typeof splitTaskChanges>["increases"];
  onSelect: (taskId: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="panel-note">No comparable task-path changes.</p>;
  }
  return (
    <ul className="change-list">
      {rows.map((row) => (
        <li key={row.metric.id}>
          <button type="button" onClick={() => onSelect(row.metric.id)} title={row.path}>
            <span className="change-path">{shortPath(row.path)}</span>
            <span className="muted">
              {" "}
              {row.category} · n {row.baselineCount ?? "—"}/{row.candidateCount ?? "—"} ·{" "}
              {formatSignedMetricValue(
                row.comparison.deltaAbsolute,
                row.metric.unit,
                row.metric.valueType,
              ).text}{" "}
              ({formatDelta(row.comparison)})
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function shortPath(path: string): string {
  if (path.length <= 42) {
    return path;
  }
  return `…${path.slice(-39)}`;
}
