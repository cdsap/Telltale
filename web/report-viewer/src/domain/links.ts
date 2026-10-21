import type { ExperimentResult, Variant } from "./types";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") {
    return null;
  }
  if (parsed.username || parsed.password) {
    return null;
  }
  return parsed.toString();
}

export function develocityOrigin(report: ExperimentResult): string | null {
  for (const observations of Object.values(report.datasets.builds)) {
    for (const observation of observations) {
      const scan = safeHttpsUrl(observation.scanUrl);
      if (!scan) {
        continue;
      }
      const url = new URL(scan);
      if (url.pathname.startsWith("/s/")) {
        return url.origin;
      }
    }
  }
  return null;
}

export function variantScanSearchUrl(
  report: ExperimentResult,
  variant: Variant,
): string | null {
  const origin = develocityOrigin(report);
  const tag = variant.sourceTag;
  if (!origin || !tag) {
    return null;
  }
  const times = (report.datasets.builds[variant.id] ?? [])
    .map((observation) => (observation.startedAt ? Date.parse(observation.startedAt) : Number.NaN))
    .filter((value) => Number.isFinite(value));
  const params = new URLSearchParams();
  params.set("search.tags", tag);
  if (times.length > 0) {
    params.set("search.startTimeMin", String(Math.min(...times) - TWO_DAYS_MS));
    params.set("search.startTimeMax", String(Math.max(...times) + TWO_DAYS_MS));
  }
  return `${origin}/scans?${params.toString()}`;
}

export function workflowUrl(report: ExperimentResult): string | null {
  const fromJson = safeHttpsUrl(report.execution.links?.workflow ?? null);
  const runId = report.execution.runId;
  if (runId && /^[0-9]+$/.test(runId)) {
    return `https://github.com/cdsap/Telltale/actions/runs/${runId}`;
  }
  return fromJson;
}

export function csvFilename(report: ExperimentResult): string {
  return `${report.report.id}.csv`;
}
