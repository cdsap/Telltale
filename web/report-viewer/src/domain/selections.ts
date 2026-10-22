import {
  DISTRIBUTION_VIEWS,
  RUNTIME_TABS,
  STATISTICS,
  TASK_SORTS,
  isWorkbenchSection,
  type DistributionView,
  type RuntimeTab,
  type TaskSort,
  type WorkbenchSection,
} from "../app/routes";
import type { ExperimentResult, StatisticName, Variant } from "./types";
import { variantByRole } from "./metrics";

export interface DashboardSelection {
  section: WorkbenchSection;
  statistic: StatisticName;
  baselineId: string;
  candidateId: string;
  taskId: string | null;
  observationId: string | null;
  query: string;
  sort: TaskSort;
  category: string;
  runtimeTab: RuntimeTab;
  distView: DistributionView;
}

const DEFAULT_STATISTIC: StatisticName = "mean";
const DEFAULT_SORT: TaskSort = "delta-abs";
const DEFAULT_RUNTIME: RuntimeTab = "processes";
const DEFAULT_DIST: DistributionView = "histogram";

function firstQuery(params: URLSearchParams, key: string): string | null {
  const value = params.get(key);
  return value && value.length > 0 ? value : null;
}

function knownId(ids: Set<string>, value: string | null, fallback: string): string {
  if (value && ids.has(value)) {
    return value;
  }
  return fallback;
}

export function defaultSelection(report: ExperimentResult): DashboardSelection {
  const baseline = variantByRole(report.variants, "baseline") ?? report.variants[0];
  const candidate =
    variantByRole(report.variants, "candidate") ??
    report.variants.find((variant) => variant.id !== baseline?.id) ??
    baseline;
  return {
    section: "overview",
    statistic: DEFAULT_STATISTIC,
    baselineId: baseline?.id ?? "",
    candidateId: candidate?.id ?? "",
    taskId: null,
    observationId: null,
    query: "",
    sort: DEFAULT_SORT,
    category: "all",
    runtimeTab: DEFAULT_RUNTIME,
    distView: DEFAULT_DIST,
  };
}

export function parseHash(hash: string, report: ExperimentResult): DashboardSelection {
  const defaults = defaultSelection(report);
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const [pathPart, queryPart] = raw.split("?");
  const sectionToken = decodeURIComponent((pathPart ?? "").replace(/^\/+/, ""));
  const params = new URLSearchParams(queryPart ?? "");
  const ids = new Set(report.variants.map((variant) => variant.id));
  const statistic = firstQuery(params, "stat");
  const sort = firstQuery(params, "sort");
  const runtimeTab = firstQuery(params, "runtime");
  const distView = firstQuery(params, "dist");
  let baselineId = knownId(ids, firstQuery(params, "baseline"), defaults.baselineId);
  let candidateId = knownId(ids, firstQuery(params, "candidate"), defaults.candidateId);
  if (baselineId === candidateId && report.variants.length > 1) {
    const other = report.variants.find((variant) => variant.id !== baselineId);
    if (other) {
      candidateId = other.id;
    }
  }
  return {
    section: isWorkbenchSection(sectionToken) ? sectionToken : defaults.section,
    statistic: STATISTICS.includes(statistic as StatisticName)
      ? (statistic as StatisticName)
      : defaults.statistic,
    baselineId,
    candidateId,
    taskId: firstQuery(params, "task"),
    observationId: firstQuery(params, "obs"),
    query: firstQuery(params, "q") ?? "",
    sort: TASK_SORTS.includes(sort as TaskSort) ? (sort as TaskSort) : defaults.sort,
    category: firstQuery(params, "cat") ?? "all",
    runtimeTab: RUNTIME_TABS.includes(runtimeTab as RuntimeTab)
      ? (runtimeTab as RuntimeTab)
      : defaults.runtimeTab,
    distView: DISTRIBUTION_VIEWS.includes(distView as DistributionView)
      ? (distView as DistributionView)
      : defaults.distView,
  };
}

export function serializeHash(selection: DashboardSelection, report?: ExperimentResult): string {
  const defaults = report ? defaultSelection(report) : null;
  const params = new URLSearchParams();
  if (!defaults || selection.statistic !== defaults.statistic) {
    params.set("stat", selection.statistic);
  }
  if (!defaults || selection.baselineId !== defaults.baselineId) {
    params.set("baseline", selection.baselineId);
  }
  if (!defaults || selection.candidateId !== defaults.candidateId) {
    params.set("candidate", selection.candidateId);
  }
  if (selection.taskId) {
    params.set("task", selection.taskId);
  }
  if (selection.observationId) {
    params.set("obs", selection.observationId);
  }
  if (selection.query) {
    params.set("q", selection.query);
  }
  if (!defaults || selection.sort !== defaults.sort) {
    params.set("sort", selection.sort);
  }
  if (selection.category !== "all") {
    params.set("cat", selection.category);
  }
  if (!defaults || selection.runtimeTab !== defaults.runtimeTab) {
    params.set("runtime", selection.runtimeTab);
  }
  if (!defaults || selection.distView !== defaults.distView) {
    params.set("dist", selection.distView);
  }
  const query = params.toString();
  return `#${selection.section}${query ? `?${query}` : ""}`;
}

export function selectedVariants(
  report: ExperimentResult,
  selection: DashboardSelection,
): { baseline: Variant; candidate: Variant } | null {
  const baseline = report.variants.find((variant) => variant.id === selection.baselineId);
  const candidate = report.variants.find((variant) => variant.id === selection.candidateId);
  if (!baseline || !candidate) {
    return null;
  }
  return { baseline, candidate };
}
