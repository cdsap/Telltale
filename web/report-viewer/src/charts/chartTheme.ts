import type { ChartOptions } from "chart.js";

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return value.trim() || fallback;
}

export function variantColors(): [string, string] {
  return [
    cssVar("--color-variant-a", "rgba(0, 123, 255, 0.85)"),
    cssVar("--color-variant-b", "rgba(108, 117, 125, 0.85)"),
  ];
}

function cartesianOptions(yLabel: string) {
  const muted = cssVar("--secondary", "rgb(108, 108, 108)");
  const line = cssVar("--border", "rgb(238, 238, 238)");
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label(context: { parsed: { y: number | null }; dataset: { label?: string } }) {
            const value = context.parsed.y;
            const formatted =
              typeof value === "number"
                ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
                : "N/A";
            return `${context.dataset.label}: ${formatted} ${yLabel}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: muted } },
      y: {
        title: { display: true, text: yLabel, color: muted, font: { size: 11 } },
        grid: { color: line },
        ticks: { color: muted, font: { size: 10 } },
        beginAtZero: true,
      },
    },
  };
}

export function lineOptions(yLabel: string): ChartOptions<"line"> {
  return {
    ...cartesianOptions(yLabel),
    elements: {
      point: { radius: 3 },
      line: { borderWidth: 2 },
    },
  };
}

export function variantPointStyle(index: number): "circle" | "triangle" {
  return index === 0 ? "circle" : "triangle";
}

export function variantDash(index: number): number[] {
  return index === 0 ? [] : [6, 3];
}

export function barOptions(yLabel: string): ChartOptions<"bar"> {
  return cartesianOptions(yLabel);
}
