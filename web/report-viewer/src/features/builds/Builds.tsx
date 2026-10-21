import type { ExperimentResult, Variant } from "../../domain/types";
import { displayLabel } from "../../domain/metrics";
import { formatDurationMs } from "../../domain/units";
import { safeHttpsUrl } from "../../domain/links";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import type { SeriesObservation } from "../../domain/types";

interface BuildsProps {
  report: ExperimentResult;
  variants: Variant[];
}

function buildSeries(
  report: ExperimentResult,
  variants: Variant[],
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

export function Builds({ report, variants }: BuildsProps) {
  const rows = variants.flatMap((variant) =>
    (report.datasets.builds[variant.id] ?? []).map((observation, index) => ({
      variant,
      observation,
      index,
    })),
  );
  if (rows.length === 0) {
    return null;
  }
  return (
    <section id="builds" className="report-block">
      <div className="snapshot-grid">
        <article className="experiment-snapshot">
          <h2 className="experiment-snapshot-title">Build time by build</h2>
          <SeriesChart
            title="Build time"
            variants={variants}
            observations={buildSeries(report, variants, "durationMs")}
            unit="ms"
            valueType="duration"
            allowSequence
          />
        </article>
        <article className="experiment-snapshot">
          <h2 className="experiment-snapshot-title">Configuration time by build</h2>
          <SeriesChart
            title="Configuration time"
            variants={variants}
            observations={buildSeries(report, variants, "configurationMs")}
            unit="ms"
            valueType="duration"
            allowSequence
          />
        </article>
      </div>
      <div className="experiment-snapshot">
        <h2 className="experiment-snapshot-title">Build scans</h2>
        <div className="table-wrap">
          <table className="experiment-snapshot-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th className="num">Build</th>
                <th className="num">Duration</th>
                <th>Scan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ variant, observation, index }) => {
                const scan = safeHttpsUrl(observation.scanUrl);
                return (
                  <tr key={`${variant.id}-${observation.observationId}`}>
                    <td>{displayLabel(variant)}</td>
                    <td className="num">{observation.sequence ?? index + 1}</td>
                    <td className="num">
                      {observation.durationMs == null
                        ? "N/A"
                        : formatDurationMs(observation.durationMs).text}
                    </td>
                    <td>
                      {scan ? (
                        <a href={scan} rel="noreferrer">
                          {observation.observationId}
                        </a>
                      ) : (
                        observation.observationId
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
