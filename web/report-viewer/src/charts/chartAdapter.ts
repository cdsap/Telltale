import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import type { HistogramBins } from "../domain/distribution";
import type { Metric, SeriesObservation, StatisticName, Variant } from "../domain/types";
import { statisticValue } from "../domain/comparisons";
import { displayLabel } from "../domain/metrics";
import { sequenceValues, type SequencePoint } from "../domain/series";
import { toChartNumber } from "../domain/units";
import { variantColors, variantDash, variantPointStyle } from "./chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

const STAT_ORDER: StatisticName[] = ["p50", "p90", "mean"];
const STAT_LABELS = ["P50", "P90", "Mean"];

export function histogramBarData(bins: HistogramBins, variants: Variant[]) {
  const colors = variantColors();
  return {
    labels: bins.labels,
    datasets: variants.map((variant, index) => ({
      label: displayLabel(variant),
      data: bins.counts[variant.id] ?? [],
      backgroundColor: colors[index] ?? colors[0],
      borderWidth: 0,
    })),
  };
}

export function percentileBarData(metric: Metric, variants: Variant[]) {
  const colors = variantColors();
  return {
    labels: STAT_LABELS,
    datasets: variants.map((variant, index) => ({
      label: displayLabel(variant),
      data: STAT_ORDER.map((stat) => {
        const value = statisticValue(metric.values[variant.id], stat);
        return value == null ? null : toChartNumber(value, metric.unit, metric.valueType);
      }),
      backgroundColor: colors[index] ?? colors[0],
      borderWidth: 0,
    })),
  };
}

export function sequenceLineData(
  variants: Variant[],
  observationsByVariant: Record<string, SeriesObservation[] | undefined>,
  unit: string,
  valueType: string | null,
) {
  const colors = variantColors();
  const pointsByVariant = new Map<string, SequencePoint[]>();
  const sequences = new Set<number>();
  for (const variant of variants) {
    const points = sequenceValues(observationsByVariant[variant.id]);
    pointsByVariant.set(variant.id, points);
    for (const point of points) {
      sequences.add(point.sequence);
    }
  }
  const labels = [...sequences].sort((left, right) => left - right);
  return {
    labels: labels.map((sequence) => String(sequence)),
    datasets: variants.map((variant, index) => {
      const points = pointsByVariant.get(variant.id) ?? [];
      const bySequence = new Map(points.map((point) => [point.sequence, point.value]));
      return {
        label: displayLabel(variant),
        data: labels.map((sequence) => {
          const value = bySequence.get(sequence);
          return value == null ? null : toChartNumber(value, unit, valueType);
        }),
        borderColor: colors[index] ?? colors[0],
        backgroundColor: colors[index] ?? colors[0],
        borderDash: variantDash(index),
        pointStyle: variantPointStyle(index),
        spanGaps: false,
        tension: 0,
      };
    }),
  };
}
