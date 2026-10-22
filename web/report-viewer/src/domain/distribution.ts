export interface DerivedStats {
  n: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  p50: number | null;
  p90: number | null;
  q1: number | null;
  q3: number | null;
}

export interface HistogramBins {
  edges: number[];
  labels: string[];
  counts: Record<string, number[]>;
}

export function finiteValues(values: Array<number | null | undefined>): number[] {
  return values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

export function quantile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) {
    return null;
  }
  const clamped = Math.min(1, Math.max(0, p));
  const index = (sorted.length - 1) * clamped;
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) {
    return sorted[low] ?? null;
  }
  const left = sorted[low];
  const right = sorted[high];
  if (left == null || right == null) {
    return null;
  }
  return left + (right - left) * (index - low);
}

export function derivedStats(values: Array<number | null | undefined>): DerivedStats {
  const sorted = [...finiteValues(values)].sort((left, right) => left - right);
  const n = sorted.length;
  if (n === 0) {
    return { n: 0, min: null, max: null, mean: null, p50: null, p90: null, q1: null, q3: null };
  }
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    n,
    min: sorted[0] ?? null,
    max: sorted[n - 1] ?? null,
    mean: sum / n,
    p50: quantile(sorted, 0.5),
    p90: quantile(sorted, 0.9),
    q1: quantile(sorted, 0.25),
    q3: quantile(sorted, 0.75),
  };
}

function formatEdge(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }
  if (abs >= 10) {
    return String(Math.round(value * 10) / 10);
  }
  return String(Math.round(value * 100) / 100);
}

export function histogramBins(
  series: Record<string, Array<number | null | undefined>>,
  desiredBins = 8,
): HistogramBins {
  const all = Object.values(series).flatMap((values) => finiteValues(values));
  if (all.length === 0) {
    return { edges: [], labels: [], counts: Object.fromEntries(Object.keys(series).map((id) => [id, []])) };
  }
  const min = Math.min(...all);
  const max = Math.max(...all);
  const bins = Math.max(1, Math.min(desiredBins, all.length));
  if (min === max) {
    return {
      edges: [min, max],
      labels: [formatEdge(min)],
      counts: Object.fromEntries(
        Object.entries(series).map(([id, values]) => [id, [finiteValues(values).length]]),
      ),
    };
  }
  const width = (max - min) / bins;
  const edges = Array.from({ length: bins + 1 }, (_, index) => min + index * width);
  const labels = Array.from({ length: bins }, (_, index) => {
    const start = edges[index] ?? min;
    const end = edges[index + 1] ?? max;
    return `${formatEdge(start)}–${formatEdge(end)}`;
  });
  const counts = Object.fromEntries(
    Object.entries(series).map(([id, values]) => {
      const bucket = Array.from({ length: bins }, () => 0);
      for (const value of finiteValues(values)) {
        let index = Math.floor((value - min) / width);
        if (index >= bins) {
          index = bins - 1;
        }
        if (index < 0) {
          index = 0;
        }
        bucket[index] = (bucket[index] ?? 0) + 1;
      }
      return [id, bucket];
    }),
  );
  return { edges, labels, counts };
}

export function median(values: Array<number | null | undefined>): number | null {
  return derivedStats(values).p50;
}
