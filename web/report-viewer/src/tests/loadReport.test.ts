import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertReportByteLength,
  loadReport,
  MAX_REPORT_BYTES,
  ReportLoadError,
  resolveReportUrl,
} from "../api/loadReport";

const sampleText = readFileSync(resolve("public/data/sample.json"), "utf8");
const FIFTY_ITERATION_REPORT_BYTES = 93_243_004;

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

describe("assertReportByteLength", () => {
  it("accepts a 50-iteration report that exceeded the old 32 MiB cap", () => {
    expect(() => assertReportByteLength(FIFTY_ITERATION_REPORT_BYTES)).not.toThrow();
  });

  it("still rejects payloads above the current cap", () => {
    expect(() => assertReportByteLength(MAX_REPORT_BYTES + 1)).toThrow(
      `Report JSON is ${MAX_REPORT_BYTES + 1} bytes, above the ${MAX_REPORT_BYTES} byte limit.`,
    );
  });
});

describe("loadReport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses a same-origin JSON payload under the size limit", async () => {
    const body = new TextEncoder().encode(sampleText);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
      })),
    );
    const report = await loadReport("./data/sample.json");
    expect(report.schemaVersion).toMatch(/^1\./);
  });

  it("rejects an oversized payload before parsing", async () => {
    const body = new TextEncoder().encode("{}");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
      })),
    );
    await expect(loadReport("./data/sample.json", { maxBytes: 1 })).rejects.toThrow(
      "Report JSON is 2 bytes, above the 1 byte limit.",
    );
  });
});
