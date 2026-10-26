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
    cssVar("--color-variant-a", "#2563EB"),
    cssVar("--color-variant-b", "#7C3AED"),
  ];
}

function cartesianOptions(yLabel: string, sparseX = false) {
  const muted = cssVar("--secondary", "#475569");
  const line = cssVar("--border", "#E2E8F0");
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
          title(items: Array<{ label?: string }>) {
            const label = items[0]?.label ?? "";
            return /^\d+$/.test(label) ? `Build ${label}` : label;
          },
          label(context: { parsed?: { y?: number | null }; dataset?: { label?: string } }) {
            const value = context.parsed?.y;
            const formatted =
              typeof value === "number"
                ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : "N/A";
            return `${context.dataset?.label ?? ""}: ${formatted} ${yLabel}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: muted,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: sparseX ? 8 : 12,
          font: { size: 11 },
        },
      },
      y: {
        title: { display: true, text: yLabel, color: muted, font: { size: 11 } },
        grid: { color: line },
        ticks: {
          color: muted,
          font: { size: 10 },
          maxTicksLimit: 6,
          callback(value: string | number) {
            if (typeof value !== "number") {
              return value;
            }
            const abs = Math.abs(value);
            if (abs >= 1_000_000_000) {
              return `${(value / 1_000_000_000).toFixed(1)}B`;
            }
            if (abs >= 1_000_000) {
              return `${(value / 1_000_000).toFixed(1)}M`;
            }
            if (abs >= 10_000) {
              return `${Math.round(value / 1000)}k`;
            }
            return value;
          },
        },
        beginAtZero: true,
      },
    },
  };
}

export function lineOptions(yLabel: string): ChartOptions<"line"> {
  return {
    ...cartesianOptions(yLabel, true),
    elements: {
      point: { radius: 2, hoverRadius: 5 },
      line: { borderWidth: 2 },
    },
  } as ChartOptions<"line">;
}

export function variantPointStyle(index: number): "circle" | "triangle" {
  return index === 0 ? "circle" : "triangle";
}

export function variantDash(index: number): number[] {
  return index === 0 ? [] : [6, 3];
}

export function barOptions(yLabel: string): ChartOptions<"bar"> {
  return cartesianOptions(yLabel, false) as ChartOptions<"bar">;
}
