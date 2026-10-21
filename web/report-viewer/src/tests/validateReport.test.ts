import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ReportValidationError, validateReport } from "../api/validateReport";

const sample = JSON.parse(
  readFileSync(resolve("public/data/sample.json"), "utf8"),
) as unknown;

describe("validateReport", () => {
  it("accepts the sample experiment-result fixture", () => {
    const report = validateReport(sample);
    expect(report.schemaVersion).toBe("1.0.0");
    expect(report.variants.map((variant) => variant.id)).toEqual(["cpu_test", "cpu2"]);
    expect(report.metrics.some((metric) => metric.id === "build.duration")).toBe(true);
  });

  it("rejects an unsupported schema major version", () => {
    expect(() => validateReport({ ...(sample as object), schemaVersion: "2.0.0" })).toThrow(
      ReportValidationError,
    );
  });

  it("rejects a missing root field", () => {
    const { metrics: _metrics, ...rest } = sample as { metrics: unknown };
    expect(() => validateReport(rest)).toThrow(/Missing required field: metrics/);
  });

  it("rejects metric values for unknown variants", () => {
    const clone = structuredClone(sample) as {
      metrics: Array<{ values: Record<string, unknown> }>;
    };
    clone.metrics[0].values.ghost = { mean: 1, p50: 1, p90: 1, count: 1 };
    expect(() => validateReport(clone)).toThrow(/unknown variant/);
  });

  it("rejects non-finite statistics", () => {
    const clone = structuredClone(sample) as {
      metrics: Array<{ values: Record<string, { mean: number }> }>;
    };
    const firstVariant = Object.keys(clone.metrics[0].values)[0];
    clone.metrics[0].values[firstVariant].mean = Number.NaN;
    expect(() => validateReport(clone)).toThrow(/finite/);
  });
});
