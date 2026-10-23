export const WORKBENCH_SECTIONS = [
  "overview",
  "builds",
  "tasks",
  "task-types",
  "resources",
  "runtime",
  "kotlin",
  "diagnostics",
  "metrics",
  "details",
] as const;

export type WorkbenchSection = (typeof WORKBENCH_SECTIONS)[number];

export const SECTION_LABELS: Record<WorkbenchSection, string> = {
  overview: "Overview",
  builds: "Builds",
  tasks: "Tasks",
  "task-types": "Task types",
  resources: "Resources",
  runtime: "Runtime",
  kotlin: "Kotlin reports",
  diagnostics: "Diagnostics",
  metrics: "Metrics",
  details: "Details",
};

export const RUNTIME_TABS = ["processes", "kotlin", "gc"] as const;
export type RuntimeTab = (typeof RUNTIME_TABS)[number];

export const DISTRIBUTION_VIEWS = ["histogram", "box", "iteration"] as const;
export type DistributionView = (typeof DISTRIBUTION_VIEWS)[number];

export const TASK_SORTS = [
  "delta-abs",
  "delta-pct",
  "baseline",
  "candidate",
  "p90-delta",
  "name",
  "count",
] as const;
export type TaskSort = (typeof TASK_SORTS)[number];

export const STATISTICS = ["mean", "p50", "p90"] as const;

export function isWorkbenchSection(value: string): value is WorkbenchSection {
  return (WORKBENCH_SECTIONS as readonly string[]).includes(value);
}
