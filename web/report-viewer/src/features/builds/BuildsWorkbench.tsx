import { useDashboard } from "../../app/DashboardState";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { derivedStats } from "../../domain/distribution";
import { displayLabel } from "../../domain/metrics";
import { formatDurationMs } from "../../domain/units";
import { viewerBuildStats } from "../../domain/viewModels";
import type { ExperimentResult, SeriesObservation, Variant } from "../../domain/types";

function asSeries(
  variants: Variant[],
  report: ExperimentResult,
  field: "durationMs" | "configurationMs",
): Record<string, SeriesObservation[]> {
  const observations: Record<string, SeriesObservation[]> = {};
  for (const variant of variants) {
    observations[variant.id] = (report.datasets.builds[variant.id] ?? []).map((item) => ({
      observationId: item.observationId,
      sequence: item.sequence,
      value: item[field],
      durationMs: item[field],
      outcome: null,
    }));
  }
  return observations;
}

export function BuildsWorkbench() {
  const { report, baseline, candidate } = useDashboard();
  const variants = [baseline, candidate];
  const hasObservations = variants.some(
    (variant) => (report.datasets.builds[variant.id] ?? []).length > 0,
  );
  if (!hasObservations) {
    return (
      <section className="wb-panel">
        <h2>Builds</h2>
        <p className="panel-note">No per-build observations were published for the selected variants.</p>
      </section>
    );
  }
  return (
    <>
      <ChartPanel title="Duration by execution order">
        <SeriesChart
          title="Build duration"
          variants={variants}
          observations={asSeries(variants, report, "durationMs")}
          unit="ms"
          valueType="duration"
          allowSequence
        />
      </ChartPanel>
      <ChartPanel title="Configuration time by build">
        <SeriesChart
          title="Configuration time"
          variants={variants}
          observations={asSeries(variants, report, "configurationMs")}
          unit="ms"
          valueType="duration"
          allowSequence
        />
      </ChartPanel>
      <section className="wb-panel">
        <h2>Viewer-derived summary</h2>
        <p className="panel-note">
          min/max are calculated in the viewer from published observations, not producer aggregates.
        </p>
        <div className="table-wrap">
          <table className="experiment-snapshot-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th className="num">n</th>
                <th className="num">mean</th>
                <th className="num">p50</th>
                <th className="num">p90</th>
                <th className="num">min</th>
                <th className="num">max</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => {
                const stats = viewerBuildStats(report, variant).duration;
                return (
                  <tr key={variant.id}>
                    <td>{displayLabel(variant)}</td>
                    <td className="num">{stats.n}</td>
                    <StatCells stats={stats} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function StatCells({ stats }: { stats: ReturnType<typeof derivedStats> }) {
  return (
    <>
      <td className="num">{stats.mean == null ? "N/A" : formatDurationMs(stats.mean).text}</td>
      <td className="num">{stats.p50 == null ? "N/A" : formatDurationMs(stats.p50).text}</td>
      <td className="num">{stats.p90 == null ? "N/A" : formatDurationMs(stats.p90).text}</td>
      <td className="num">{stats.min == null ? "N/A" : formatDurationMs(stats.min).text}</td>
      <td className="num">{stats.max == null ? "N/A" : formatDurationMs(stats.max).text}</td>
    </>
  );
}

