import { describe, expect, it } from "vitest";
import { sortMetrics } from "../domain/metricRowSort";
import type { Metric } from "../domain/types";

const baseline = { id: "a", label: "a", sourceTag: "a", role: "baseline" as const, buildCount: 2 };
const candidate = { id: "b", label: "b", sourceTag: "b", role: "candidate" as const, buildCount: 2 };

function metric(partial: Partial<Metric> & Pick<Metric, "id" | "name">): Metric {
  return {
    family: "task",
    category: partial.category ?? "Task Path",
    unit: "ms",
    valueType: "duration",
    direction: "lower-is-better",
    scope: { qualifier: null, taskPath: partial.name, taskType: null },
    aggregation: { sampleUnit: "task", method: null },
    values: {
      a: { mean: 10, p50: 10, p90: 10, count: 2 },
      b: { mean: 20, p50: 20, p90: 20, count: 2 },
    },
    ...partial,
  };
}

describe("sortMetrics", () => {
  it("sorts metrics by delta descending", () => {
    const rows = sortMetrics(
      [
        metric({ id: "small", name: "small", values: { a: { mean: 10, p50: 10, p90: 10, count: 2 }, b: { mean: 11, p50: 11, p90: 11, count: 2 } } }),
        metric({ id: "large", name: "large", values: { a: { mean: 10, p50: 10, p90: 10, count: 2 }, b: { mean: 30, p50: 30, p90: 30, count: 2 } } }),
      ],
      baseline,
      candidate,
      "mean",
      "delta",
      "desc",
    );
    expect(rows.map((row) => row.id)).toEqual(["large", "small"]);
  });
});
