import { DISTRIBUTION_VIEWS, type DistributionView } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { DistributionChart } from "../../components/charts/DistributionChart";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { ContextDrawer } from "../../components/workbench/ContextDrawer";
import { derivedStats } from "../../domain/distribution";
import { formatIsoDate } from "../../domain/formatting";
import { safeHttpsUrl } from "../../domain/links";
import { displayLabel } from "../../domain/metrics";
import { formatDurationMs, formatSignedMetricValue } from "../../domain/units";
import {
  buildObservations,
  deltaFromMedian,
  durationValues,
  viewerBuildStats,
} from "../../domain/viewModels";
import type {
  BuildObservation,
  ExperimentResult,
  SeriesObservation,
  Variant,
} from "../../domain/types";

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
  const { report, baseline, candidate, selection, update } = useDashboard();
  const variants = [baseline, candidate];
  const rows = variants.flatMap((variant) =>
    buildObservations(report, variant).map((observation, index) => ({ variant, observation, index })),
  );
  const selected = rows.find((row) => row.observation.observationId === selection.observationId);
  const distView = selection.distView === "iteration" ? "histogram" : selection.distView;
  if (rows.length === 0) {
    return (
      <section className="wb-panel">
        <h2>Builds</h2>
        <p className="panel-note">No per-build observations were published for the selected variants.</p>
      </section>
    );
  }
  return (
    <>
      <div className="chart-grid">
        <ChartPanel
          title="Build duration distribution"
          subtitle="Viewer-derived from raw durationMs. Producer mean/P50/P90 stay on the overview cards."
        >
          <div className="segmented" role="group" aria-label="Build chart view">
            {DISTRIBUTION_VIEWS.filter((item) => item !== "iteration").map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={distView === item}
                onClick={() => update({ distView: item as DistributionView })}
              >
                {item === "box" ? "Box + points" : "Histogram"}
              </button>
            ))}
          </div>
          <DistributionChart
            title="Build duration"
            variants={variants}
            values={{
              [baseline.id]: durationValues(report, baseline),
              [candidate.id]: durationValues(report, candidate),
            }}
            unit="ms"
            valueType="duration"
            view={distView}
          />
        </ChartPanel>
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
      </div>
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
      <section className="wb-panel">
        <h2>Build observations</h2>
        <div className="table-wrap">
          <table className="experiment-snapshot-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th className="num">Build</th>
                <th>Started</th>
                <th className="num">Duration</th>
                <th className="num">Configuration</th>
                <th className="num">Δ median</th>
                <th>Scan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ variant, observation, index }) => {
                const scan = safeHttpsUrl(observation.scanUrl);
                const selectedRow = observation.observationId === selection.observationId;
                const medianDelta = deltaFromMedian(
                  observation.durationMs,
                  buildObservations(report, variant),
                );
                return (
                  <tr
                    key={`${variant.id}-${observation.observationId}`}
                    className={selectedRow ? "is-selected" : undefined}
                  >
                    <td>{displayLabel(variant)}</td>
                    <td className="num">{observation.sequence ?? index + 1}</td>
                    <td>{formatIsoDate(observation.startedAt)}</td>
                    <td className="num">
                      {observation.durationMs == null
                        ? "N/A"
                        : formatDurationMs(observation.durationMs).text}
                    </td>
                    <td className="num">
                      {observation.configurationMs == null
                        ? "N/A"
                        : formatDurationMs(observation.configurationMs).text}
                    </td>
                    <td className="num">
                      {formatSignedMetricValue(medianDelta, "ms", "duration").text}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => update({ observationId: observation.observationId })}
                      >
                        {observation.observationId}
                      </button>
                      {scan ? (
                        <>
                          {" "}
                          <a href={scan} rel="noreferrer">
                            scan
                          </a>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <ContextDrawer
        title="Build observation"
        open={Boolean(selected)}
        onClose={() => update({ observationId: null })}
      >
        {selected ? (
          <BuildDetail
            variant={selected.variant}
            observation={selected.observation}
            siblings={buildObservations(report, selected.variant)}
          />
        ) : null}
      </ContextDrawer>
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

function BuildDetail({
  variant,
  observation,
  siblings,
}: {
  variant: Variant;
  observation: BuildObservation;
  siblings: BuildObservation[];
}) {
  const scan = safeHttpsUrl(observation.scanUrl);
  const medianDelta = deltaFromMedian(observation.durationMs, siblings);
  return (
    <dl className="glossary">
      <dt>Observation ID</dt>
      <dd className="change-path">{observation.observationId}</dd>
      <dt>Variant</dt>
      <dd>{displayLabel(variant)}</dd>
      <dt>Sequence</dt>
      <dd>{observation.sequence ?? "—"}</dd>
      <dt>Started</dt>
      <dd>{formatIsoDate(observation.startedAt)}</dd>
      <dt>Duration</dt>
      <dd>
        {observation.durationMs == null ? "N/A" : formatDurationMs(observation.durationMs).text}
      </dd>
      <dt>Configuration</dt>
      <dd>
        {observation.configurationMs == null
          ? "N/A"
          : formatDurationMs(observation.configurationMs).text}
      </dd>
      <dt>Delta from variant median</dt>
      <dd>{formatSignedMetricValue(medianDelta, "ms", "duration").text}</dd>
      <dt>Build scan</dt>
      <dd>
        {scan ? (
          <a href={scan} rel="noreferrer">
            Open scan
          </a>
        ) : (
          "No public scan URL"
        )}
      </dd>
    </dl>
  );
}
