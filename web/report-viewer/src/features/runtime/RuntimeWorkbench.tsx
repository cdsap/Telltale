import { RUNTIME_TABS, type RuntimeTab } from "../../app/routes";
import { useDashboard } from "../../app/DashboardState";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { FamilySection } from "../family/FamilySection";
import { runtimeSubsections } from "../../domain/coverage";
import { aggregateProcessSeries } from "../../domain/series";

const TAB_LABEL: Record<RuntimeTab, string> = {
  processes: "Processes",
  kotlin: "Kotlin reports",
  gc: "Garbage collection",
};

export function RuntimeWorkbench() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const available = runtimeSubsections(report);
  const tabs = RUNTIME_TABS.filter(
    (tab) => tab !== "kotlin" && available.find((item) => item.id === tab)?.available,
  );
  const active = tabs.includes(selection.runtimeTab) ? selection.runtimeTab : (tabs[0] ?? null);
  const processSeries = aggregateProcessSeries(report.datasets.processSeries);
  return (
    <>
      <SectionHeader
        title="Runtime"
        description="Gradle and Kotlin process measurements. Process and GC samples are separate quantities."
      />
      {tabs.length === 0 ? (
        <Missing title="Runtime process and GC metrics" />
      ) : (
        <>
          {tabs.length > 1 ? (
            <section className="wb-panel">
              <p className="panel-note">
                Process and GC measurements are separate sample types. Per-build timelines use
                published series when they exist.
              </p>
              <div className="segmented" role="tablist" aria-label="Runtime sections">
                {tabs.map((tab) => (
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
          ) : null}
          {active === "processes" ? (
            <FamilySection
              id="processes"
              title="Processes"
              family="process"
              report={report}
              baseline={baseline}
              candidate={candidate}
              statistic={selection.statistic}
              series={processSeries}
              note="Per-PID process series are combined into one timeline per metric."
            />
          ) : null}
          {active === "gc" ? (
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
          ) : null}
        </>
      )}
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
