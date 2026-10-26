import type { ExperimentResult, Variant } from "../../domain/types";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { buildFieldSeries, buildObservations } from "../../domain/viewModels";

interface BuildsProps {
  report: ExperimentResult;
  variants: Variant[];
}

export function Builds({ report, variants }: BuildsProps) {
  const hasRows = variants.some((variant) => buildObservations(report, variant).length > 0);
  if (!hasRows) {
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
            observations={buildFieldSeries(report, variants, "durationMs")}
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
            observations={buildFieldSeries(report, variants, "configurationMs")}
            unit="ms"
            valueType="duration"
            allowSequence
          />
        </article>
      </div>
    </section>
  );
}
