import { describe, expect, it } from "vitest";
import { taskCategoryOf } from "../domain/taskCategories";
import type { Metric } from "../domain/types";

function metric(partial: Partial<Metric> & Pick<Metric, "name">): Metric {
  return {
    id: partial.id ?? partial.name,
    family: "task",
    category: "Task Path",
    name: partial.name,
    unit: "ms",
    valueType: "duration",
    direction: "lower-is-better",
    scope: partial.scope ?? { taskPath: partial.name },
    aggregation: { sampleUnit: "task", method: null },
    values: {},
  };
}

describe("taskCategoryOf", () => {
  it("prefers explicit task type", () => {
    expect(taskCategoryOf(metric({ name: "x", scope: { taskPath: "x", taskType: "KotlinCompile" } }))).toBe(
      "Kotlin",
    );
  });

  it("falls back to documented path tokens, otherwise Unclassified", () => {
    expect(taskCategoryOf(metric({ name: ":app:compileDebugKotlin" }))).toBe("Kotlin");
    expect(taskCategoryOf(metric({ name: ":app:dexBuilderDebug" }))).toBe("Dexing");
    expect(taskCategoryOf(metric({ name: ":app:somethingCustom" }))).toBe("Unclassified");
  });

  it("classifies a series taskType hint even when the metric has none", () => {
    expect(
      taskCategoryOf(
        metric({ name: ":app:compileDebugKotlin", scope: { taskPath: ":app:compileDebugKotlin" } }),
        "org.jetbrains.kotlin.gradle.tasks.KotlinCompile",
      ),
    ).toBe("Kotlin");
  });
});
