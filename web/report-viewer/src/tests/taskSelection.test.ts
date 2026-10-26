import { describe, expect, it } from "vitest";
import { compareValues } from "../domain/comparisons";
import { defaultTaskSelection, pinnedTaskDisplay } from "../domain/taskSelection";
import type { TaskChangeRow } from "../domain/viewModels";
import type { Metric } from "../domain/types";

function row(id: string, delta: number, mean = 20_000): TaskChangeRow {
  const metric: Metric = {
    id,
    family: "task",
    category: "Task Path",
    name: id,
    unit: "ms",
    valueType: "duration",
    direction: "lower-is-better",
    scope: { qualifier: null, taskPath: id, taskType: null },
    aggregation: { sampleUnit: "build", method: "test" },
    values: {
      a: { mean, p50: mean, p90: mean, count: 2 },
      b: { mean: mean + delta, p50: mean + delta, p90: mean + delta, count: 2 },
    },
  };
  const comparison = compareValues(mean, mean + delta);
  return {
    metric,
    path: id,
    category: "Other",
    comparison,
    tone: delta > 0 ? "worse" : delta < 0 ? "better" : "neutral",
    baselineValue: mean,
    candidateValue: mean + delta,
    baselineCount: 2,
    candidateCount: 2,
    absDelta: Math.abs(delta),
  };
}

describe("defaultTaskSelection", () => {
  const rows = [row("small-regression", 400), row("improvement", -900), row("big-regression", 1200)];

  it("selects the largest absolute regression when filtering regressions", () => {
    expect(defaultTaskSelection(rows, "regressions")?.path).toBe("big-regression");
  });

  it("selects the largest absolute improvement when filtering improvements", () => {
    expect(defaultTaskSelection(rows, "improvements")?.path).toBe("improvement");
  });

  it("selects the highest-impact absolute change otherwise", () => {
    expect(defaultTaskSelection(rows, "all")?.path).toBe("big-regression");
  });

  it("pins a selected row that is outside the visible filter", () => {
    const visible = [rows[1]!];
    const result = pinnedTaskDisplay(rows, visible, "big-regression");
    expect(result.pinnedOutside).toBe(true);
    expect(result.displayRows[0]?.path).toBe("big-regression");
    expect(result.displayRows).toHaveLength(2);
  });
});
