import { Bar, Scatter } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { histogramBarData } from "../../charts/chartAdapter";
import { barOptions, variantColors, variantPointStyle } from "../../charts/chartTheme";
import { histogramBins } from "../../domain/distribution";
import { displayLabel } from "../../domain/metrics";
import type { Variant } from "../../domain/types";
import { axisUnitLabel, toChartNumber } from "../../domain/units";
import type { DistributionView } from "../../app/routes";

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
    return (
      <div className="chart-canvas">
        <Bar
          data={histogramBarData(bins, variants)}
          options={{
            ...barOptions("builds"),
            plugins: {
              ...barOptions("builds").plugins,
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
  const scatterData = {
    datasets: variants.map((variant, index) => ({
      label: displayLabel(variant),
      data: (values[variant.id] ?? [])
        .filter((value): value is number => value != null && Number.isFinite(value))
        .map((value, pointIndex) => ({
          x: index + 1 + ((pointIndex % 5) - 2) * 0.04,
          y: toChartNumber(value, unit, valueType),
        })),
      backgroundColor: colors[index] ?? colors[0],
      pointStyle: variantPointStyle(index),
    })),
  };
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
      <Scatter data={scatterData} options={scatterOptions} />
      <p className="visually-hidden">
        Individual {title} observations in {yLabel}. n = {n}.
      </p>
    </div>
  );
}
