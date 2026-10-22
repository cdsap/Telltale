import type { Metric } from "./types";
import { taskPathOf } from "./series";

/**
 * Documented task classification used by the Tasks workspace.
 *
 * Order of evidence:
 * 1. Explicit `scope.taskType` from the producer, when present.
 * 2. Conservative path/name tokens listed below.
 * 3. `Unclassified` when neither source is conclusive.
 *
 * This mapping is a UI filter, not a claim about Gradle's task graph.
 * Users can still search the raw path. Do not treat a category as a
 * semantic proof of what the task did.
 */
export const TASK_CATEGORIES = [
  "Kotlin",
  "Java",
  "Dexing",
  "Resources",
  "KSP",
  "Tests",
  "Other",
  "Unclassified",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

const TYPE_RULES: Array<{ category: TaskCategory; needles: string[] }> = [
  { category: "Kotlin", needles: ["kotlin", "ktlint", "kapt"] },
  { category: "KSP", needles: ["ksp"] },
  { category: "Java", needles: ["java", "javac"] },
  { category: "Dexing", needles: ["dex", "d8", "r8"] },
  { category: "Resources", needles: ["resource", "merge", "processdebugmanifest", "processmanifest"] },
  { category: "Tests", needles: ["test", "androidtest"] },
];

function classifyToken(value: string): TaskCategory | null {
  const lowered = value.toLowerCase();
  for (const rule of TYPE_RULES) {
    if (rule.needles.some((needle) => lowered.includes(needle))) {
      return rule.category;
    }
  }
  return null;
}

export function taskCategoryOf(metric: Metric): TaskCategory {
  const type = metric.scope?.taskType?.trim();
  if (type) {
    return classifyToken(type) ?? "Other";
  }
  const fromName = classifyToken(`${taskPathOf(metric)} ${metric.name} ${metric.category}`);
  return fromName ?? "Unclassified";
}
