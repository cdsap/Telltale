import { validateReport } from "./validateReport";
import type { ExperimentResult } from "../domain/types";

// 50-iteration Android reports are ~90 MiB pretty-printed (~48 MiB compact)
// because datasets.taskSeries stores one point per build.
export const MAX_REPORT_BYTES = 128 * 1024 * 1024;

export class ReportLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportLoadError";
  }
}

export function resolveReportUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl || rawUrl.trim() === "") {
    throw new ReportLoadError("No report URL was provided.");
  }
  const trimmed = rawUrl.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    let parsed: URL;
    try {
      parsed = new URL(trimmed, window.location.href);
    } catch {
      throw new ReportLoadError("The report URL is not a valid address.");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new ReportLoadError("Report URLs must be http(s) or a same-origin path.");
    }
    if (parsed.origin !== window.location.origin) {
      throw new ReportLoadError("Report data must be loaded from the same origin.");
    }
    return parsed.pathname + parsed.search;
  }
  if (trimmed.includes("\\") || trimmed.includes("\0")) {
    throw new ReportLoadError("The report URL contains invalid characters.");
  }
  const normalized = trimmed.startsWith("/") || trimmed.startsWith("./")
    ? trimmed
    : `./${trimmed}`;
  const parts = normalized.split("/");
  if (parts.some((part) => part === "..")) {
    throw new ReportLoadError("Report URLs cannot include parent-directory segments.");
  }
  return normalized;
}

export function assertReportByteLength(
  byteLength: number,
  limit = MAX_REPORT_BYTES,
): void {
  if (byteLength > limit) {
    throw new ReportLoadError(
      `Report JSON is ${byteLength} bytes, above the ${limit} byte limit.`,
    );
  }
}

export type ReportLoadPhase = "download" | "parse" | "validate";

export interface ReportLoadProgress {
  phase: ReportLoadPhase;
  loadedBytes: number;
  totalBytes: number | null;
}

export interface LoadReportOptions {
  maxBytes?: number;
  onProgress?: (progress: ReportLoadProgress) => void;
}

export function formatByteSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function headerValue(response: Response, name: string): string | null {
  try {
    return response.headers?.get(name) ?? null;
  } catch {
    return null;
  }
}

function contentLengthBytes(response: Response): number | null {
  const encoding = headerValue(response, "content-encoding");
  if (encoding && encoding !== "identity") {
    return null;
  }
  const raw = headerValue(response, "content-length");
  if (!raw) {
    return null;
  }
  const total = Number(raw);
  return Number.isFinite(total) && total > 0 ? total : null;
}

function concatBytes(chunks: Uint8Array[], byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function readResponseBytes(
  response: Response,
  maxBytes: number,
  onProgress?: (progress: ReportLoadProgress) => void,
): Promise<Uint8Array> {
  const announced = contentLengthBytes(response);
  if (announced != null) {
    assertReportByteLength(announced, maxBytes);
  }
  onProgress?.({ phase: "download", loadedBytes: 0, totalBytes: announced });
  const body = response.body;
  if (!body || typeof body.getReader !== "function") {
    const buffer = await response.arrayBuffer();
    assertReportByteLength(buffer.byteLength, maxBytes);
    onProgress?.({
      phase: "download",
      loadedBytes: buffer.byteLength,
      totalBytes: buffer.byteLength,
    });
    return new Uint8Array(buffer);
  }
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value || value.byteLength === 0) {
      continue;
    }
    loaded += value.byteLength;
    assertReportByteLength(loaded, maxBytes);
    chunks.push(value);
    onProgress?.({ phase: "download", loadedBytes: loaded, totalBytes: announced });
  }
  const bytes = concatBytes(chunks, loaded);
  onProgress?.({
    phase: "download",
    loadedBytes: bytes.byteLength,
    totalBytes: bytes.byteLength,
  });
  return bytes;
}

function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function loadReport(
  url: string,
  options?: LoadReportOptions,
): Promise<ExperimentResult> {
  const safeUrl = resolveReportUrl(url);
  const maxBytes = options?.maxBytes ?? MAX_REPORT_BYTES;
  const onProgress = options?.onProgress;
  const response = await fetch(safeUrl, { credentials: "same-origin" });
  if (!response.ok) {
    throw new ReportLoadError(`Could not load report data (${response.status}).`);
  }
  const bytes = await readResponseBytes(response, maxBytes, onProgress);
  onProgress?.({
    phase: "parse",
    loadedBytes: bytes.byteLength,
    totalBytes: bytes.byteLength,
  });
  await yieldToPaint();
  const text = new TextDecoder().decode(bytes);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ReportLoadError("The report file is not valid JSON.");
  }
  onProgress?.({
    phase: "validate",
    loadedBytes: bytes.byteLength,
    totalBytes: bytes.byteLength,
  });
  return validateReport(parsed);
}

export function reportUrlFromMount(root: HTMLElement): string {
  return resolveReportUrl(root.dataset.reportUrl);
}
