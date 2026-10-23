import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertReportByteLength,
  formatByteSize,
  loadReport,
  MAX_REPORT_BYTES,
  ReportLoadError,
  resolveReportUrl,
  type ReportLoadProgress,
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

  it("reports download and parse progress from a streamed body", async () => {
    const body = new TextEncoder().encode(sampleText);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => streamedResponse(body, { contentLength: body.byteLength, chunkSize: 64 })),
    );
    const events: ReportLoadProgress[] = [];
    const report = await loadReport("./data/sample.json", {
      onProgress: (progress) => events.push({ ...progress }),
    });
    expect(report.schemaVersion).toMatch(/^1\./);
    expect(events[0]).toEqual({
      phase: "download",
      loadedBytes: 0,
      totalBytes: body.byteLength,
    });
    expect(events.some((event) => event.phase === "download" && event.loadedBytes === body.byteLength)).toBe(
      true,
    );
    expect(events.some((event) => event.phase === "parse")).toBe(true);
    expect(events.at(-1)?.phase).toBe("validate");
  });

  it("rejects an oversized stream before the whole body is buffered", async () => {
    const body = new TextEncoder().encode(sampleText);
    vi.stubGlobal("fetch", vi.fn(async () => streamedResponse(body, { chunkSize: 32 })));
    await expect(loadReport("./data/sample.json", { maxBytes: 40 })).rejects.toThrow(
      /above the 40 byte limit/,
    );
  });
});

describe("formatByteSize", () => {
  it("formats compact report sizes in MiB", () => {
    expect(formatByteSize(48_075_548)).toBe("45.8 MiB");
  });
});

function streamedResponse(
  body: Uint8Array,
  options: { contentLength?: number; chunkSize?: number; contentEncoding?: string },
) {
  const chunkSize = options.chunkSize ?? 64;
  let offset = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= body.byteLength) {
        controller.close();
        return;
      }
      const end = Math.min(offset + chunkSize, body.byteLength);
      controller.enqueue(body.slice(offset, end));
      offset = end;
    },
  });
  return {
    ok: true,
    status: 200,
    headers: {
      get(name: string) {
        const key = name.toLowerCase();
        if (key === "content-length" && options.contentLength != null) {
          return String(options.contentLength);
        }
        if (key === "content-encoding") {
          return options.contentEncoding ?? null;
        }
        return null;
      },
    },
    body: stream,
  };
}
