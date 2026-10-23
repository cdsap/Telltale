import { useEffect, useState } from "react";
import { loadReport, ReportLoadError, reportUrlFromMount } from "../api/loadReport";
import { ReportValidationError } from "../api/validateReport";
import type { ExperimentResult } from "../domain/types";
import { ErrorState } from "../components/EmptyState/EmptyState";
import { SiteHeader } from "../components/Shell/SiteHeader";
import { FamilySection } from "../features/family/FamilySection";
import { Diagnostics } from "../features/diagnostics/Diagnostics";
import { MetricTable } from "../components/MetricTable/MetricTable";
import { OverviewDashboard } from "../features/overview/OverviewDashboard";
import { BuildsWorkbench } from "../features/builds/BuildsWorkbench";
import { TaskExplorer } from "../features/tasks/TaskExplorer";
import { RuntimeWorkbench } from "../features/runtime/RuntimeWorkbench";
import { ExperimentDetails } from "../features/details/ExperimentDetails";
import { DashboardProvider, useDashboard } from "./DashboardState";
import { WorkbenchLayout } from "./WorkbenchLayout";

interface ReportAppProps {
  root: HTMLElement;
}

export function ReportApp({ root }: ReportAppProps) {
  const [report, setReport] = useState<ExperimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const url = reportUrlFromMount(root);
      loadReport(url)
        .then((loaded) => {
          if (!cancelled) {
            setReport(loaded);
          }
        })
        .catch((caught: unknown) => {
          if (cancelled) {
            return;
          }
          const message =
            caught instanceof ReportValidationError || caught instanceof ReportLoadError
              ? caught.message
              : "Could not load this experiment report.";
          setError(message);
        });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not load this experiment report.";
      setError(message);
    }
    return () => {
      cancelled = true;
    };
  }, [root]);

  if (error) {
    return (
      <>
        <SiteHeader />
        <ErrorState title="This report cannot be shown" detail={error} />
      </>
    );
  }
  if (!report) {
    return (
      <>
        <SiteHeader />
        <p className="main">Loading experiment report…</p>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <DashboardProvider
        report={report}
        jsonUrl={root.dataset.reportUrl ?? null}
        legacyCsvUrl={root.dataset.csvUrl}
        legacyHtmlUrl={root.dataset.htmlUrl}
      >
        <WorkbenchLayout>
          <ActiveSection />
        </WorkbenchLayout>
      </DashboardProvider>
    </>
  );
}

function ActiveSection() {
  const { report, baseline, candidate, selection } = useDashboard();
  switch (selection.section) {
    case "builds":
      return <BuildsWorkbench />;
    case "tasks":
      return <TaskExplorer source="paths" />;
    case "task-types":
      return <TaskExplorer source="types" />;
    case "resources":
      return (
        <FamilySection
          id="resources"
          title="Resources"
          family="resource"
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={selection.statistic}
          series={report.datasets.resourceSeries}
          note="Resource units come from the JSON. Lower memory is not marked better unless the metric direction says so."
        />
      );
    case "kotlin":
      return (
        <FamilySection
          id="kotlin"
          title="Kotlin Build Reports"
          family="kotlin"
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={selection.statistic}
          series={report.datasets.kotlinBuildReportSeries}
          note="Kotlin compiler metrics from Kotlin Build Reports. Per-build timelines use published series."
        />
      );
    case "runtime":
      return <RuntimeWorkbench />;
    case "diagnostics":
      return (
        <Diagnostics
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={selection.statistic}
        />
      );
    case "metrics":
      return (
        <MetricTable
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={selection.statistic}
        />
      );
    case "details":
      return <ExperimentDetails />;
    default:
      return <OverviewDashboard />;
  }
}
