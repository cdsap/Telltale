import { Bar, Scatter } from "react-chartjs-2";
import type { ChartDataset, ChartOptions } from "chart.js";
import { histogramBarData } from "../../charts/chartAdapter";
import { barOptions, variantColors, variantDash, variantPointStyle } from "../../charts/chartTheme";
import { derivedStats, histogramBins } from "../../domain/distribution";
import { displayLabel } from "../../domain/metrics";
import type { Variant } from "../../domain/types";
import { axisUnitLabel, toChartNumber } from "../../domain/units";
import type { DistributionView } from "../../app/routes";

function guideLine(
  variantLabel: string,
  statLabel: string,
  index: number,
  value: number,
  unit: string,
  valueType: string | null,
  color: string,
  dashIndex: number,
  borderWidth: number,
): ChartDataset<"scatter"> {
  return {
    label: `${variantLabel} ${statLabel}`,
    data: [
      { x: index + 0.62, y: toChartNumber(value, unit, valueType) },
      { x: index + 1.38, y: toChartNumber(value, unit, valueType) },
    ],
    showLine: true,
    pointRadius: 0,
    borderColor: color,
    borderWidth,
    borderDash: variantDash(dashIndex),
  };
}

interface DistributionChartProps {
  variants: Variant[];
  values: Record<string, Array<number | null | undefined>>;
  unit: string;
  valueType: string | null;
  view: DistributionView;
  title: string;
}

export function DistributionChart({
  variants,
  values,
  unit,
  valueType,
  view,
  title,
}: DistributionChartProps) {
  const yLabel = axisUnitLabel(unit, valueType);
  const counts = variants.map((variant) => (values[variant.id] ?? []).filter((item) => item != null).length);
  const n = counts.join(" / ");
  if (counts.every((count) => count === 0)) {
    return (
      <p className="series-note" role="note">
        No per-build observations are available for {title}.
      </p>
    );
  }
  if (view === "histogram") {
    const bins = histogramBins(values);
    const options = barOptions("builds");
    return (
      <div className="chart-canvas">
        <Bar
          data={histogramBarData(bins, variants)}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
            },
          }}
        />
        <p className="visually-hidden">
          Histogram of {title} in {yLabel} for {n} observations.
        </p>
      </div>
    );
  }
  const colors = variantColors();
  const datasets: ChartDataset<"scatter">[] = [];
  for (const [index, variant] of variants.entries()) {
    const raw = (values[variant.id] ?? []).filter(
      (value): value is number => value != null && Number.isFinite(value),
    );
    const stats = derivedStats(raw);
    const color = colors[index] ?? colors[0];
    datasets.push({
      label: displayLabel(variant),
      data: raw.map((value, pointIndex) => ({
        x: index + 1 + ((pointIndex % 5) - 2) * 0.04,
        y: toChartNumber(value, unit, valueType),
      })),
      backgroundColor: color,
      pointStyle: variantPointStyle(index),
    });
    if (stats.p50 != null) {
      datasets.push(
        guideLine(displayLabel(variant), "median", index, stats.p50, unit, valueType, color, 0, 2),
      );
    }
    if (stats.p90 != null) {
      datasets.push(
        guideLine(displayLabel(variant), "P90", index, stats.p90, unit, valueType, color, 1, 1.5),
      );
    }
  }
  const scatterOptions: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
    },
    scales: {
      x: {
        min: 0.5,
        max: variants.length + 0.5,
        ticks: {
          callback(value) {
            const variant = variants[Number(value) - 1];
            return variant ? displayLabel(variant) : "";
          },
        },
      },
      y: {
        title: { display: true, text: yLabel },
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="chart-canvas">
      <Scatter data={{ datasets }} options={scatterOptions} />
      <p className="visually-hidden">
        Individual {title} observations in {yLabel} with median and P90 reference lines. n = {n}.
      </p>
    </div>
  );
}
