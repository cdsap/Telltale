import { REPORT_SCHEMA_MAJOR } from "./reportSchema";
import type {
  Datasets,
  ExperimentResult,
  Metric,
  NamedSeries,
  SeriesObservation,
  Statistic,
  TaskSeries,
  Variant,
} from "../domain/types";

export class ReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportValidationError";
  }
}

const ROOT_FIELDS = [
  "schemaVersion",
  "generatedAt",
  "producer",
  "report",
  "experiment",
  "execution",
  "variants",
  "metrics",
  "datasets",
  "diagnostics",
  "warnings",
  "completeness",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ReportValidationError("Numeric fields must be finite JSON numbers or null.");
  }
  return value;
}

function parseStatistic(value: unknown): Statistic {
  if (!isRecord(value)) {
    throw new ReportValidationError("Metric statistics must be objects.");
  }
  return {
    mean: asNullableNumber(value.mean),
    p50: asNullableNumber(value.p50),
    p90: asNullableNumber(value.p90),
    count: asNullableNumber(value.count),
  };
}

function parseMetric(value: unknown, variantIds: Set<string>): Metric {
  if (!isRecord(value)) {
    throw new ReportValidationError("Each metric must be an object.");
  }
  const id = asString(value.id);
  if (!id) {
    throw new ReportValidationError("Every metric needs an id.");
  }
  if (!isRecord(value.values)) {
    throw new ReportValidationError(`Metric ${id} is missing values.`);
  }
  const values: Record<string, Statistic> = {};
  for (const [variantId, stats] of Object.entries(value.values)) {
    if (!variantIds.has(variantId)) {
      throw new ReportValidationError(
        `Metric ${id} references unknown variant ${variantId}.`,
      );
    }
    values[variantId] = parseStatistic(stats);
  }
  const direction =
    value.direction === "lower-is-better" ||
    value.direction === "higher-is-better"
      ? value.direction
      : null;
  return {
    id,
    family: asString(value.family) ?? "unknown",
    category: asString(value.category) ?? "",
    name: asString(value.name) ?? id,
    unit: asString(value.unit) ?? "",
    valueType: asString(value.valueType),
    direction,
    scope: isRecord(value.scope)
      ? {
          qualifier: asString(value.scope.qualifier),
          taskPath: asString(value.scope.taskPath),
          taskType: asString(value.scope.taskType),
        }
      : null,
    aggregation: isRecord(value.aggregation)
      ? {
          sampleUnit: asString(value.aggregation.sampleUnit) ?? "unknown",
          method: asString(value.aggregation.method),
        }
      : null,
    values,
  };
}

function parseVariants(value: unknown): Variant[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ReportValidationError("A report needs at least one variant.");
  }
  const variants = value.map((item, index) => {
    if (!isRecord(item)) {
      throw new ReportValidationError("Variants must be objects.");
    }
    const id = asString(item.id);
    if (!id) {
      throw new ReportValidationError(`Variant at index ${index} is missing an id.`);
    }
    return {
      id,
      label: asString(item.label) ?? id,
      sourceTag: asString(item.sourceTag),
      role: asString(item.role),
      buildCount: asNullableNumber(item.buildCount),
    };
  });
  const ids = variants.map((variant) => variant.id);
  if (new Set(ids).size !== ids.length) {
    throw new ReportValidationError("Variant ids must be unique.");
  }
  return variants;
}

function parseDatasets(value: unknown): Datasets {
  if (!isRecord(value)) {
    throw new ReportValidationError("datasets must be an object.");
  }
  const buildsRaw = isRecord(value.builds) ? value.builds : {};
  const builds: Datasets["builds"] = {};
  for (const [variantId, observations] of Object.entries(buildsRaw)) {
    if (!Array.isArray(observations)) {
      throw new ReportValidationError(`datasets.builds.${variantId} must be an array.`);
    }
    builds[variantId] = observations.map((item, index) => {
      if (!isRecord(item)) {
        throw new ReportValidationError("Build observations must be objects.");
      }
      return {
        observationId: asString(item.observationId) ?? `${variantId}-${index}`,
        sequence: asNullableNumber(item.sequence),
        durationMs: asNullableNumber(item.durationMs),
        configurationMs: asNullableNumber(item.configurationMs),
        startedAt: asString(item.startedAt),
        scanUrl: asString(item.scanUrl),
      };
    });
  }
  return {
    builds,
    taskSeries: parseTaskSeries(value.taskSeries),
    resourceSeries: parseNamedSeries(value.resourceSeries),
    processSeries: parseNamedSeries(value.processSeries),
    gcSeries: parseNamedSeries(value.gcSeries),
    kotlinBuildReportSeries: parseNamedSeries(value.kotlinBuildReportSeries),
  };
}

function parseSeriesObservations(value: unknown): Record<string, SeriesObservation[]> {
  if (!isRecord(value)) {
    return {};
  }
  const observations: Record<string, SeriesObservation[]> = {};
  for (const [variantId, items] of Object.entries(value)) {
    if (!Array.isArray(items)) {
      continue;
    }
    observations[variantId] = items.filter(isRecord).map((item, index) => ({
      observationId: asString(item.observationId) ?? `${variantId}-${index}`,
      sequence: asNullableNumber(item.sequence),
      value: asNullableNumber(item.value ?? item.durationMs),
      durationMs: asNullableNumber(item.durationMs),
      outcome: asString(item.outcome),
    }));
  }
  return observations;
}

function parseNamedSeries(value: unknown): Record<string, NamedSeries> {
  if (!isRecord(value)) {
    return {};
  }
  const series: Record<string, NamedSeries> = {};
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) {
      continue;
    }
    series[id] = {
      id,
      name: asString(item.name) ?? id,
      unit: asString(item.unit) ?? "",
      observations: parseSeriesObservations(item.observations),
    };
  }
  return series;
}

function parseTaskSeries(value: unknown): Record<string, TaskSeries> {
  if (!isRecord(value)) {
    return {};
  }
  const series: Record<string, TaskSeries> = {};
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) {
      continue;
    }
    series[id] = {
      id,
      path: asString(item.path) ?? id,
      taskType: asString(item.taskType),
      observations: parseSeriesObservations(item.observations),
    };
  }
  return series;
}

export function validateReport(raw: unknown): ExperimentResult {
  if (!isRecord(raw)) {
    throw new ReportValidationError("Report JSON must be an object.");
  }
  for (const field of ROOT_FIELDS) {
    if (!(field in raw)) {
      throw new ReportValidationError(`Missing required field: ${field}`);
    }
  }
  const schemaVersion = asString(raw.schemaVersion);
  if (!schemaVersion) {
    throw new ReportValidationError("schemaVersion must be a string.");
  }
  const major = Number.parseInt(schemaVersion.split(".")[0] ?? "", 10);
  if (major !== REPORT_SCHEMA_MAJOR) {
    throw new ReportValidationError(
      `Unsupported schemaVersion ${schemaVersion}. This viewer reads 1.x.x.`,
    );
  }
  if (!isRecord(raw.producer) || !isRecord(raw.report) || !isRecord(raw.experiment) || !isRecord(raw.execution)) {
    throw new ReportValidationError("producer, report, experiment, and execution must be objects.");
  }
  const reportId = asString(raw.report.id);
  if (!reportId) {
    throw new ReportValidationError("report.id is required.");
  }
  const variants = parseVariants(raw.variants);
  const variantIds = new Set(variants.map((variant) => variant.id));
  if (!Array.isArray(raw.metrics)) {
    throw new ReportValidationError("metrics must be an array.");
  }
  const metrics = raw.metrics.map((metric) => parseMetric(metric, variantIds));
  const metricIds = metrics.map((metric) => metric.id);
  if (new Set(metricIds).size !== metricIds.length) {
    throw new ReportValidationError("Metric ids must be unique.");
  }
  if (!Array.isArray(raw.warnings)) {
    throw new ReportValidationError("warnings must be an array.");
  }
  if (!isRecord(raw.diagnostics) || !isRecord(raw.completeness)) {
    throw new ReportValidationError("diagnostics and completeness must be objects.");
  }
  const requestedTasks = Array.isArray(raw.experiment.requestedTasks)
    ? raw.experiment.requestedTasks.filter((task): task is string => typeof task === "string")
    : [];
  return {
    schemaVersion,
    generatedAt: asString(raw.generatedAt) ?? "",
    producer: {
      name: asString(raw.producer.name) ?? "unknown",
      version: asString(raw.producer.version) ?? "unknown",
      revision: asString(raw.producer.revision),
    },
    report: {
      id: reportId,
      kind: asString(raw.report.kind) ?? "report",
      title: asString(raw.report.title),
      status: asString(raw.report.status) ?? "unknown",
    },
    experiment: {
      id: asString(raw.experiment.id) ?? reportId,
      repository: asString(raw.experiment.repository),
      requestedTasks,
      mode: asString(raw.experiment.mode),
      isProfiler:
        typeof raw.experiment.isProfiler === "boolean" ? raw.experiment.isProfiler : null,
    },
    execution: {
      source: asString(raw.execution.source),
      runId: asString(raw.execution.runId) ?? asNumber(raw.execution.runId)?.toString() ?? null,
      runAttempt: asNullableNumber(raw.execution.runAttempt),
      workflowName: asString(raw.execution.workflowName),
      startedAt: asString(raw.execution.startedAt),
      links: isRecord(raw.execution.links)
        ? { workflow: asString(raw.execution.links.workflow) }
        : null,
    },
    variants,
    metrics,
    datasets: parseDatasets(raw.datasets),
    diagnostics: {
      status: asString(raw.diagnostics.status) ?? "unavailable",
      source: isRecord(raw.diagnostics.source)
        ? {
            tool: asString(raw.diagnostics.source.tool),
            schemaVersion: asString(raw.diagnostics.source.schemaVersion),
            experimentRunId: asString(raw.diagnostics.source.experimentRunId),
            sourceRepo: asString(raw.diagnostics.source.sourceRepo),
          }
        : null,
      groups: Array.isArray(raw.diagnostics.groups)
        ? raw.diagnostics.groups.filter(isRecord).map((group) => ({
            id: asString(group.id) ?? "group",
            family: asString(group.family) ?? "",
            sampleUnit: asString(group.sampleUnit) ?? "diagnostic-sample",
            metricIds: Array.isArray(group.metricIds)
              ? group.metricIds.filter((id): id is string => typeof id === "string")
              : [],
            jobKeysByVariant: isRecord(group.jobKeysByVariant)
              ? Object.fromEntries(
                  Object.entries(group.jobKeysByVariant).map(([key, jobs]) => [
                    key,
                    Array.isArray(jobs)
                      ? jobs.filter((job): job is string => typeof job === "string")
                      : [],
                  ]),
                )
              : {},
          }))
        : [],
    },
    warnings: raw.warnings.filter(isRecord).map((warning) => ({
      code: asString(warning.code) ?? "UNKNOWN",
      severity: asString(warning.severity) ?? "warning",
      source: asString(warning.source),
      message: asString(warning.message) ?? "",
      variantId: asString(warning.variantId),
      metricId: asString(warning.metricId),
    })),
    completeness: {
      requestedVariantIds: Array.isArray(raw.completeness.requestedVariantIds)
        ? raw.completeness.requestedVariantIds.filter((id): id is string => typeof id === "string")
        : [],
      observedVariantIds: Array.isArray(raw.completeness.observedVariantIds)
        ? raw.completeness.observedVariantIds.filter((id): id is string => typeof id === "string")
        : [],
      missingMetricIds: Array.isArray(raw.completeness.missingMetricIds)
        ? raw.completeness.missingMetricIds.filter((id): id is string => typeof id === "string")
        : [],
      diagnostics: asString(raw.completeness.diagnostics) ?? "unavailable",
    },
  };
}
