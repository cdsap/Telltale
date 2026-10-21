import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateReport } from "../api/validateReport";
import {
  safeHttpsUrl,
  variantScanSearchUrl,
  workflowUrl,
} from "../domain/links";
import { metricsCsv } from "../domain/csv";

const sample = validateReport(
  JSON.parse(readFileSync(resolve("public/data/sample.json"), "utf8")),
);

describe("safeHttpsUrl", () => {
  it("keeps https scan URLs", () => {
    expect(safeHttpsUrl("https://ge.solutions-team.gradle.com/s/abc")).toContain(
      "/s/abc",
    );
  });

  it("rejects javascript and credentials", () => {
    expect(safeHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpsUrl("https://user:pass@evil.example/s/x")).toBeNull();
  });
});

describe("report links", () => {
  it("builds a Develocity tag search per variant", () => {
    const url = variantScanSearchUrl(sample, sample.variants[0]);
    expect(url).toContain("https://ge.solutions-team.gradle.com/scans?");
    expect(url).toContain("search.tags=cdsap-431_varianta_cpu_test");
  });

  it("uses the Telltale workflow run id", () => {
    expect(workflowUrl(sample)).toBe(
      "https://github.com/cdsap/Telltale/actions/runs/39611234158",
    );
  });

  it("writes a CSV with variant statistics", () => {
    const csv = metricsCsv(sample);
    expect(csv).toContain("Category,Metric,Unit");
    expect(csv).toContain("Build time");
    expect(csv).toContain("varianta_cpu_test mean");
    expect(csv).toContain("810730");
  });
});
