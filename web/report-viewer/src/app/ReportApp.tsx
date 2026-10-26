import { useEffect, useState } from "react";
import {
  loadReport,
  ReportLoadError,
  reportUrlFromMount,
  type ReportLoadProgress,
} from "../api/loadReport";
import { ReportValidationError } from "../api/validateReport";
import type { ExperimentResult } from "../domain/types";
import { ErrorState } from "../components/EmptyState/EmptyState";
import { SiteHeader } from "../components/Shell/SiteHeader";
import { ReportLoadDialog } from "../components/workbench/ReportLoadDialog";
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

const INITIAL_PROGRESS: ReportLoadProgress = {
  phase: "download",
  loadedBytes: 0,
  totalBytes: null,
};

export function ReportApp({ root }: ReportAppProps) {
  const [report, setReport] = useState<ExperimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ReportLoadProgress>(INITIAL_PROGRESS);

  useEffect(() => {
    let cancelled = false;
    let lastPaint = 0;
    const publishProgress = (next: ReportLoadProgress) => {
      if (cancelled) {
        return;
      }
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      if (
        next.phase !== "download" ||
        now - lastPaint > 80 ||
        next.loadedBytes === 0 ||
        (next.totalBytes != null && next.loadedBytes >= next.totalBytes)
      ) {
        lastPaint = now;
        setProgress(next);
      }
    };
    try {
      const url = reportUrlFromMount(root);
      loadReport(url, { onProgress: publishProgress })
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
        <ReportLoadDialog progress={progress} />
      </>
    );
  }

  return (
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
  );
}

function ActiveSection() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  switch (selection.section) {
    case "builds":
      return <BuildsWorkbench />;
    case "configuration":
      return <BuildsWorkbench field="configurationMs" />;
    case "tasks":
      return <TaskExplorer key="paths" source="paths" />;
    case "task-types":
      return <TaskExplorer key="types" source="types" />;
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
          onNavigate={update}
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
