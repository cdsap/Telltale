import { Line } from "react-chartjs-2";
import type { SeriesObservation, Variant } from "../../domain/types";
import { sequenceLineData } from "../../charts/chartAdapter";
import { lineOptions } from "../../charts/chartTheme";
import { axisUnitLabel } from "../../domain/units";

interface SeriesChartProps {
  title: string;
  variants: Variant[];
  observations: Record<string, SeriesObservation[] | undefined>;
  unit: string;
  valueType: string | null;
  allowSequence: boolean;
  blockedReason?: string;
}

export function SeriesChart({
  title,
  variants,
  observations,
  unit,
  valueType,
  allowSequence,
  blockedReason,
}: SeriesChartProps) {
  const yLabel = axisUnitLabel(unit, valueType);
  if (!allowSequence) {
    return (
      <p className="series-note" role="note">
        {blockedReason ??
          "This metric is a pooled diagnostic sample. It has no per-build timeline."}
      </p>
    );
  }
  const hasPoints = variants.some((variant) => (observations[variant.id] ?? []).length > 0);
  if (!hasPoints) {
    return (
      <p className="series-note" role="note">
        No per-build series is available for {title}.
      </p>
    );
  }
  return (
    <div className="experiment-snapshot-chart-wrap">
      <Line
        data={sequenceLineData(variants, observations, unit, valueType)}
        options={lineOptions(yLabel)}
      />
    </div>
  );
}
