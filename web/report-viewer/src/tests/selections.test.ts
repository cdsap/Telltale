import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validateReport } from "../api/validateReport";
import { defaultSelection, parseHash, serializeHash } from "../domain/selections";

const report = validateReport(
  JSON.parse(readFileSync(resolve("public/data/sample.json"), "utf8")),
);

describe("URL selection", () => {
  it("defaults to a 1s duration floor and execution-order duration view", () => {
    const defaults = defaultSelection(report);
    expect(defaults.taskMinDurationMs).toBe(1_000);
    expect(defaults.distView).toBe("iteration");
  });

  it("round-trips section, statistic and variants", () => {
    const parsed = parseHash("#tasks?stat=p50&baseline=cpu_test&candidate=cpu2&q=dex", report);
    expect(parsed.section).toBe("tasks");
    expect(parsed.statistic).toBe("p50");
    expect(parsed.query).toBe("dex");
    expect(serializeHash(parsed, report)).toContain("tasks");
    expect(serializeHash(parsed, report)).toContain("stat=p50");
  });

  it("round-trips the task module filter", () => {
    const parsed = parseHash("#tasks?mod=%3Aapp%3Aapp", report);
    expect(parsed.module).toBe(":app:app");
    expect(serializeHash(parsed, report)).toContain("mod=");
  });

  it("round-trips the task type drill-down filter", () => {
    const parsed = parseHash("#tasks?type=KotlinCompile", report);
    expect(parsed.taskType).toBe("KotlinCompile");
    expect(serializeHash(parsed, report)).toContain("type=KotlinCompile");
  });

  it("ignores unknown sections and metrics without breaking", () => {
    const parsed = parseHash("#not-a-section?stat=nope&baseline=missing", report);
    expect(parsed.section).toBe("overview");
    expect(parsed.statistic).toBe("mean");
    expect(parsed.baselineId).toBe("cpu_test");
  });

  it("keeps baseline and candidate distinct when both ids are present", () => {
    const parsed = parseHash("#overview?baseline=cpu2&candidate=cpu2", report);
    expect(parsed.baselineId).not.toBe(parsed.candidateId);
  });
});
