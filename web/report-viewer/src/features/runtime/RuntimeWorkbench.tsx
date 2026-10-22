import { RUNTIME_TABS, type RuntimeTab } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { FamilySection } from "../family/FamilySection";
import { runtimeSubsections } from "../../domain/coverage";

const TAB_LABEL: Record<RuntimeTab, string> = {
  processes: "Processes",
  kotlin: "Kotlin",
  gc: "Garbage collection",
};

export function RuntimeWorkbench() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const available = runtimeSubsections(report);
  const active = selection.runtimeTab;
  return (
    <>
      <section className="wb-panel">
        <h2>Runtime</h2>
        <p className="panel-note">
          Process, Kotlin compiler, and GC measurements are separate sample types. They are not a
          JVM timeline unless a timestamped series is published.
        </p>
        <div className="segmented" role="tablist" aria-label="Runtime sections">
          {RUNTIME_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active === tab}
              onClick={() => update({ runtimeTab: tab })}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
      </section>
      {active === "processes" ? (
        available.find((item) => item.id === "processes")?.available ? (
          <FamilySection
            id="processes"
            title="Processes"
            family="process"
            report={report}
            baseline={baseline}
            candidate={candidate}
            statistic={selection.statistic}
            series={report.datasets.processSeries}
            note="Source: Develocity process metrics or custom values when present."
          />
        ) : (
          <Missing title="Processes" />
        )
      ) : null}
      {active === "kotlin" ? (
        available.find((item) => item.id === "kotlin")?.available ? (
          <FamilySection
            id="kotlin"
            title="Kotlin"
            family="kotlin"
            report={report}
            baseline={baseline}
            candidate={candidate}
            statistic={selection.statistic}
            series={report.datasets.kotlinBuildReportSeries}
            note="Kotlin Build Report metrics. Task-family filters live in Tasks."
          />
        ) : (
          <Missing title="Kotlin Build Reports" />
        )
      ) : null}
      {active === "gc" ? (
        available.find((item) => item.id === "gc")?.available ? (
          <FamilySection
            id="gc"
            title="GC"
            family="gc"
            report={report}
            baseline={baseline}
            candidate={candidate}
            statistic={selection.statistic}
            series={report.datasets.gcSeries}
            note="GC time and collection counts are different quantities with different denominators."
          />
        ) : (
          <Missing title="Garbage collection" />
        )
      ) : null}
    </>
  );
}

function Missing({ title }: { title: string }) {
  return (
    <section className="wb-panel">
      <h2>{title}</h2>
      <p className="panel-note">
        {title} were not exported in this report. Missing is not zero; this section has no
        measurements to chart.
      </p>
    </section>
  );
}
