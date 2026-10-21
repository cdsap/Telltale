import { describe, expect, it } from "vitest";
import { formatDurationMs, formatMetricValue } from "../domain/units";

describe("formatDurationMs", () => {
  it("keeps milliseconds below one second", () => {
    expect(formatDurationMs(812).text).toMatch(/812/);
    expect(formatDurationMs(812).text).toMatch(/ms/);
  });

  it("shows seconds for typical build times", () => {
    const display = formatDurationMs(8120);
    expect(display.text).toMatch(/8\.12/);
    expect(display.text).toMatch(/s/);
    expect(display.title).toMatch(/8,120|8120/);
  });

  it("shows minutes for long builds", () => {
    expect(formatDurationMs(810730).text).toMatch(/min/);
  });
});

describe("formatMetricValue", () => {
  it("renders missing values as N/A", () => {
    expect(formatMetricValue(null, "ms", "duration").text).toBe("N/A");
  });
});
