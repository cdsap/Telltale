import { comparisonTone } from "../../domain/comparisons";
import { formatDelta } from "../../domain/formatting";
import type { Comparison, MetricDirection } from "../../domain/types";
import { formatSignedMetricValue } from "../../domain/units";

interface MetricDeltaProps {
  comparison: Comparison;
  unit: string;
  valueType: string | null;
  direction: MetricDirection | null;
  /** Skip semantic color for tiny duration changes (ms). */
  practicalMs?: number;
}

export function MetricDelta({
  comparison,
  unit,
  valueType,
  direction,
  practicalMs = 50,
}: MetricDeltaProps) {
  const absolute = formatSignedMetricValue(comparison.deltaAbsolute, unit, valueType);
  const percent = formatDelta(comparison);
  const small =
    comparison.deltaAbsolute != null &&
    (valueType === "duration" || unit === "ms") &&
    Math.abs(comparison.deltaAbsolute) < practicalMs;
  const tone =
    !direction || small ? "neutral" : comparisonTone(comparison, direction);
  const toneClass =
    tone === "better" ? "is-improvement" : tone === "worse" ? "is-regression" : "";
  return (
    <span className={`metric-delta ${toneClass}`}>
      {absolute.text}
      {percent !== "N/A" ? ` (${percent})` : ""}
    </span>
  );
}
