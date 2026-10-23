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

export async function loadReport(
  url: string,
  options?: { maxBytes?: number },
): Promise<ExperimentResult> {
  const safeUrl = resolveReportUrl(url);
  const response = await fetch(safeUrl, { credentials: "same-origin" });
  if (!response.ok) {
    throw new ReportLoadError(`Could not load report data (${response.status}).`);
  }
  const buffer = await response.arrayBuffer();
  assertReportByteLength(buffer.byteLength, options?.maxBytes ?? MAX_REPORT_BYTES);
  const text = new TextDecoder().decode(buffer);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ReportLoadError("The report file is not valid JSON.");
  }
  return validateReport(parsed);
}

export function reportUrlFromMount(root: HTMLElement): string {
  return resolveReportUrl(root.dataset.reportUrl);
}
