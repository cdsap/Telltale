import { afterEach, describe, expect, it, vi } from "vitest";
import { ReportLoadError, resolveReportUrl } from "../api/loadReport";

describe("resolveReportUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts a same-origin relative path", () => {
    expect(resolveReportUrl("./data/sample.json")).toBe("./data/sample.json");
  });

  it("accepts a site-root JSON path used on GitHub Pages", () => {
    expect(resolveReportUrl("/Telltale/data/experiments/run-1-caching-attempt-1.json")).toBe(
      "/Telltale/data/experiments/run-1-caching-attempt-1.json",
    );
  });

  it("rejects parent-directory traversal", () => {
    expect(() => resolveReportUrl("../secret.json")).toThrow(ReportLoadError);
  });

  it("rejects javascript URLs", () => {
    expect(() => resolveReportUrl("javascript:alert(1)")).toThrow(ReportLoadError);
  });

  it("rejects a different origin", () => {
    expect(() => resolveReportUrl("https://evil.example/report.json")).toThrow(
      /same origin/,
    );
  });
});
