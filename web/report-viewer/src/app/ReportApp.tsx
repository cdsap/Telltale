import { useEffect, useMemo, useState } from "react";
import { loadReport, reportUrlFromMount } from "../api/loadReport";
import { ReportValidationError } from "../api/validateReport";
import { ReportLoadError } from "../api/loadReport";
import type { ExperimentResult, StatisticName } from "../domain/types";
import { variantByRole } from "../domain/metrics";
import { reportSections } from "../domain/coverage";
import { ErrorState } from "../components/EmptyState/EmptyState";
import { SiteHeader } from "../components/Shell/SiteHeader";
import { SectionNav } from "../components/SectionNav/SectionNav";
import { Overview } from "../features/overview/Overview";
import { Builds } from "../features/builds/Builds";
import { Tasks } from "../features/tasks/Tasks";
import { FamilySection } from "../features/family/FamilySection";
import { Diagnostics } from "../features/diagnostics/Diagnostics";
import { MetricTable } from "../components/MetricTable/MetricTable";

interface ReportAppProps {
  root: HTMLElement;
}

const STATISTICS: StatisticName[] = ["mean", "p50", "p90"];

export function ReportApp({ root }: ReportAppProps) {
  const [report, setReport] = useState<ExperimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statistic, setStatistic] = useState<StatisticName>("mean");
  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const url = reportUrlFromMount(root);
      loadReport(url)
        .then((loaded) => {
          if (cancelled) {
            return;
          }
          setReport(loaded);
          setBaselineId(variantByRole(loaded.variants, "baseline")?.id ?? loaded.variants[0]?.id ?? null);
          setCandidateId(
            variantByRole(loaded.variants, "candidate")?.id ??
              loaded.variants[1]?.id ??
              loaded.variants[0]?.id ??
              null,
          );
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

  const baseline = useMemo(
    () => report?.variants.find((variant) => variant.id === baselineId),
    [baselineId, report],
  );
  const candidate = useMemo(
    () => report?.variants.find((variant) => variant.id === candidateId),
    [candidateId, report],
  );
  const sections = report ? reportSections(report) : [];

  if (error) {
    return (
      <>
        <SiteHeader />
        <ErrorState title="This report cannot be shown" detail={error} />
      </>
    );
  }
  if (!report || !baseline || !candidate) {
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
      <main className="main">
        <Overview
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          jsonUrl={root.dataset.reportUrl ?? null}
          legacyCsvUrl={root.dataset.csvUrl}
          legacyHtmlUrl={root.dataset.htmlUrl}
        />
        <SectionNav sections={sections} />
        <section className="experiment-snapshot statistic-bar" aria-label="Statistic">
          <h2 className="experiment-snapshot-title">Statistic</h2>
          <fieldset className="controls" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="visually-hidden">Statistic</legend>
            {STATISTICS.map((name) => (
              <label key={name}>
                <input
                  type="radio"
                  name="statistic"
                  value={name}
                  checked={statistic === name}
                  onChange={() => setStatistic(name)}
                />{" "}
                {name.toUpperCase()}
              </label>
            ))}
          </fieldset>
        </section>
        <Builds report={report} variants={[baseline, candidate]} />
        <Tasks
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
        />
        <FamilySection
          id="resources"
          title="Resources"
          family="resource"
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          series={report.datasets.resourceSeries}
        />
        <FamilySection
          id="processes"
          title="Processes"
          family="process"
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          series={report.datasets.processSeries}
        />
        <FamilySection
          id="kotlin"
          title="Kotlin"
          family="kotlin"
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          series={report.datasets.kotlinBuildReportSeries}
        />
        <FamilySection
          id="gc"
          title="GC"
          family="gc"
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          series={report.datasets.gcSeries}
        />
        <Diagnostics
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
        />
        <MetricTable
          report={report}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
        />
      </main>
    </>
  );
}
