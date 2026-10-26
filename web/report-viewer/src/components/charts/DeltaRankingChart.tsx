import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartEvent, ActiveElement } from "chart.js";
import { comparisonTone } from "../../domain/comparisons";
import { shortTypeName } from "../../domain/series";
import { toChartNumber } from "../../domain/units";
import { rankedByAbsDelta, type TaskChangeRow } from "../../domain/viewModels";

interface DeltaRankingChartProps {
  rows: TaskChangeRow[];
  selectedId: string | null;
  onSelect: (taskId: string) => void;
  limit?: number;
}

export function DeltaRankingChart({
  rows,
  selectedId,
  onSelect,
  limit = 16,
}: DeltaRankingChartProps) {
  const ranked = useMemo(() => rankedByAbsDelta(rows).slice(0, limit), [limit, rows]);
  if (ranked.length === 0) {
    return <p className="panel-note">No comparable duration changes in the current filters.</p>;
  }
  const labels = ranked.map((row) => {
    const path = shortTypeName(row.path);
    return path.length > 42 ? `…${path.slice(-40)}` : path;
  });
  const data = ranked.map((row) =>
    toChartNumber(row.comparison.deltaAbsolute ?? 0, row.metric.unit, row.metric.valueType),
  );
  const colors = ranked.map((row) => {
    const tone = comparisonTone(row.comparison, row.metric.direction);
    if (row.metric.id === selectedId) {
      return tone === "better" ? "#15803D" : tone === "worse" ? "#B42318" : "#64748B";
    }
    return tone === "better" ? "rgba(21, 128, 61, 0.72)" : tone === "worse" ? "rgba(180, 35, 24, 0.72)" : "#94A3B8";
  });
  return (
    <div className="chart-canvas chart-primary" role="img" aria-label="Task duration change ranking">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Δ mean (s)",
              data,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        }}
        options={{
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
            const index = elements[0]?.index;
            if (index == null) {
              return;
            }
            const row = ranked[index];
            if (row) {
              onSelect(row.metric.id);
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => ranked[items[0]?.dataIndex ?? 0]?.path ?? "",
                label: (item) => {
                  const row = ranked[item.dataIndex];
                  if (!row) {
                    return "";
                  }
                  const seconds = toChartNumber(
                    row.comparison.deltaAbsolute ?? 0,
                    row.metric.unit,
                    row.metric.valueType,
                  );
                  return `Δ mean ${seconds >= 0 ? "+" : ""}${seconds.toFixed(3)} s`;
                },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: "Δ mean (seconds)", font: { size: 11 } },
              grid: { color: "#E2E8F0" },
              ticks: { maxTicksLimit: 8, maxRotation: 0 },
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 11, family: "ui-monospace, Menlo, monospace" } },
            },
          },
        }}
      />
    </div>
  );
}
