import { describe, expect, it } from "vitest";
import { compareTaskRows } from "../domain/taskRowSort";
import type { Metric } from "../domain/types";
import type { TaskChangeRow } from "../domain/viewModels";

function row(id: string, baselineMean: number, candidateMean: number, baselineP90: number): TaskChangeRow {
  const metric: Metric = {
    id,
    family: "task",
    category: "Task Path",
    name: id,
    unit: "ms",
    valueType: "duration",
    direction: "lower-is-better",
    scope: { qualifier: null, taskPath: id, taskType: null },
    aggregation: { sampleUnit: "task", method: null },
    values: {
      a: { mean: baselineMean, p50: baselineMean, p90: baselineP90, count: 2 },
      b: { mean: candidateMean, p50: candidateMean, p90: baselineP90 + 10, count: 2 },
    },
  };
  return {
    metric,
    path: id,
    category: "other",
    comparison: { deltaAbsolute: candidateMean - baselineMean, deltaPercent: 10 },
    tone: "neutral",
    baselineValue: baselineMean,
    candidateValue: candidateMean,
    baselineCount: 2,
    candidateCount: 2,
    absDelta: Math.abs(candidateMean - baselineMean),
  };
}

describe("compareTaskRows", () => {
  it("sorts by baseline-p90", () => {
    const left = row("left", 10, 12, 100);
    const right = row("right", 10, 12, 200);
    expect(compareTaskRows(left, right, "baseline-p90", "desc", "a", "b", "mean")).toBeGreaterThan(0);
  });
});
