export type StatisticName = "mean" | "p50" | "p90";

export type MetricDirection = "lower-is-better" | "higher-is-better" | null;

export interface Producer {
  name: string;
  version: string;
  revision: string | null;
}

export interface ReportIdentity {
  id: string;
  kind: string;
  title: string | null;
  status: string;
}

export interface ExperimentInfo {
  id: string;
  repository: string | null;
  requestedTasks: string[];
  mode: string | null;
  isProfiler: boolean | null;
}

export interface ExecutionInfo {
  source: string | null;
  runId: string | null;
  runAttempt: number | null;
  workflowName: string | null;
  startedAt: string | null;
  links: {
    workflow?: string | null;
  } | null;
}

export interface Variant {
  id: string;
  label: string;
  sourceTag: string | null;
  role: "baseline" | "candidate" | string | null;
  buildCount: number | null;
}

export interface Statistic {
  mean: number | null;
  p50: number | null;
  p90: number | null;
  count: number | null;
}

export interface Metric {
  id: string;
  family: string;
  category: string;
  name: string;
  unit: string;
  valueType: string | null;
  direction: MetricDirection;
  scope: {
    qualifier?: string | null;
    taskPath?: string | null;
    taskType?: string | null;
  } | null;
  aggregation: {
    sampleUnit: string;
    method: string | null;
  } | null;
  values: Record<string, Statistic>;
}

export interface BuildObservation {
  observationId: string;
  sequence: number | null;
  durationMs: number | null;
  configurationMs: number | null;
  startedAt: string | null;
  scanUrl: string | null;
}

export interface SeriesObservation {
  observationId: string;
  sequence: number | null;
  value: number | null;
  durationMs: number | null;
  outcome: string | null;
}

export interface NamedSeries {
  id: string;
  name: string;
  unit: string;
  observations: Record<string, SeriesObservation[]>;
}

export interface TaskSeries {
  id: string;
  path: string;
  taskType: string | null;
  observations: Record<string, SeriesObservation[]>;
}

export interface Datasets {
  builds: Record<string, BuildObservation[]>;
  taskSeries: Record<string, TaskSeries>;
  resourceSeries: Record<string, NamedSeries>;
  processSeries: Record<string, NamedSeries>;
  gcSeries: Record<string, NamedSeries>;
  kotlinBuildReportSeries: Record<string, NamedSeries>;
}

export interface DiagnosticGroup {
  id: string;
  family: string;
  sampleUnit: string;
  metricIds: string[];
  jobKeysByVariant: Record<string, string[]>;
}

export interface Diagnostics {
  status: "not-requested" | "unavailable" | "partial" | "present" | string;
  source: {
    tool: string | null;
    schemaVersion: string | null;
    experimentRunId?: string | null;
    sourceRepo?: string | null;
  } | null;
  groups: DiagnosticGroup[];
}

export interface Warning {
  code: string;
  severity: string;
  source: string | null;
  message: string;
  variantId: string | null;
  metricId: string | null;
}

export interface Completeness {
  requestedVariantIds: string[];
  observedVariantIds: string[];
  missingMetricIds: string[];
  diagnostics: string;
}

export interface ExperimentResult {
  schemaVersion: string;
  generatedAt: string;
  producer: Producer;
  report: ReportIdentity;
  experiment: ExperimentInfo;
  execution: ExecutionInfo;
  variants: Variant[];
  metrics: Metric[];
  datasets: Datasets;
  diagnostics: Diagnostics;
  warnings: Warning[];
  completeness: Completeness;
}

export interface Comparison {
  baseline: number | null;
  candidate: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;
  unavailableReason: string | null;
}

export type ComparisonTone = "better" | "worse" | "neutral" | "unavailable";
