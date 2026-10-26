import { describe, expect, it } from "vitest";
import {
  DEFAULT_TASK_MIN_DURATION_MS,
  filterTaskRows,
  matchesTaskMinDelta,
  matchesTaskMinDuration,
} from "../domain/taskTableFilters";
import type { Metric, Variant } from "../domain/types";
import type { TaskChangeRow } from "../domain/viewModels";

const baseline: Variant = {
  id: "a",
  label: "A",
  role: "baseline",
  sourceTag: null,
  buildCount: 2,
};
const candidate: Variant = {
  id: "b",
  label: "B",
  role: "candidate",
  sourceTag: null,
  buildCount: 2,
};

function row(path: string, delta: number, mean = 100): TaskChangeRow {
  const metric: Metric = {
    id: path,
    family: "task",
    category: "Task Path",
    name: path,
    unit: "ms",
    valueType: "duration",
    direction: "lower-is-better",
    scope: { qualifier: null, taskPath: path, taskType: null },
    aggregation: { sampleUnit: "task", method: null },
    values: {
      a: { mean, p50: mean, p90: mean, count: 2 },
      b: { mean: mean + delta, p50: mean, p90: mean, count: 2 },
    },
  };
  return {
    metric,
    path,
    category: "Other",
    comparison: { deltaAbsolute: delta, deltaPercent: 10 },
    tone: delta > 0 ? "worse" : delta < 0 ? "better" : "neutral",
    baselineValue: mean,
    candidateValue: mean + delta,
    baselineCount: 2,
    candidateCount: 2,
    absDelta: Math.abs(delta),
  };
}

describe("matchesTaskMinDelta", () => {
  it("filters rows below threshold", () => {
    expect(matchesTaskMinDelta(row("t", 50), 100)).toBe(false);
    expect(matchesTaskMinDelta(row("t", 150), 100)).toBe(true);
  });
});

describe("matchesTaskMinDuration", () => {
  it("defaults to a 1s floor instead of 10s", () => {
    expect(DEFAULT_TASK_MIN_DURATION_MS).toBe(1_000);
  });

  it("uses peak mean on either variant", () => {
    expect(matchesTaskMinDuration(row("t", 0), 1_000, "a", "b")).toBe(false);
    const heavy = row("t", 0);
    heavy.metric.values.b = { mean: 1_200, p50: 1_200, p90: 1_200, count: 2 };
    expect(matchesTaskMinDuration(heavy, 1_000, "a", "b")).toBe(true);
  });
});

describe("filterTaskRows", () => {
  const rows = [
    row(":app:compile", 200, 2_000),
    row(":lib:compile", -50, 1_500),
    row(":app:dex", 10, 80),
  ];

  it("keeps path rows at or above the duration floor", () => {
    const filtered = filterTaskRows(
      rows,
      {
        query: "",
        isTypes: false,
        module: "all",
        category: "all",
        taskType: "",
        taskFilter: "all",
        minDeltaMs: 0,
        minDurationMs: 1_000,
      },
      new Map(),
      baseline,
      candidate,
    );
    expect(filtered.map((item) => item.path)).toEqual([":app:compile", ":lib:compile"]);
  });

  it("skips the duration floor for task types", () => {
    const filtered = filterTaskRows(
      rows,
      {
        query: "",
        isTypes: true,
        module: "all",
        category: "all",
        taskType: "",
        taskFilter: "all",
        minDeltaMs: 0,
        minDurationMs: 1_000,
      },
      new Map(),
      baseline,
      candidate,
    );
    expect(filtered).toHaveLength(3);
  });
});
