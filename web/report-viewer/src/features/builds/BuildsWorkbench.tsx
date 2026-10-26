import { useState } from "react";
import { useDashboard } from "../../app/DashboardState";
import { DistributionChart } from "../../components/charts/DistributionChart";
import { ComparisonLegend } from "../../components/comparison/ComparisonLegend";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { compareTitle, displayLabel } from "../../domain/metrics";
import { derivedStats } from "../../domain/distribution";
import { formatDurationMs, formatSignedMetricValue } from "../../domain/units";
import {
  buildFieldSeries,
  buildFieldValues,
  buildObservations,
  observedBuildCount,
  viewerBuildStats,
} from "../../domain/viewModels";
import type { ExperimentResult, Variant } from "../../domain/types";

function statDelta(left: number | null, right: number | null): number | null {
  if (left == null || right == null) {
    return null;
  }
  return right - left;
}

type BuildStatBlock = ReturnType<typeof derivedStats>;
type BuildMetric = "durationMs" | "configurationMs";
type BuildView = "order" | "distribution";

interface BuildMetricSummaryProps {
  title: string;
  deltaLabel: string;
  variants: Variant[];
  baseline: Variant;
  candidate: Variant;
  statsFor: (variant: Variant) => BuildStatBlock;
}

function BuildMetricSummary({
  title,
  deltaLabel,
  variants,
  baseline,
  candidate,
  statsFor,
}: BuildMetricSummaryProps) {
  const baselineStats = statsFor(baseline);
  const candidateStats = statsFor(candidate);
  return (
    <section className="wb-panel">
      <h2>{title}</h2>
      <p className="panel-note">
        Derived in the viewer from per-build observations. Δ row is {compareTitle(baseline, candidate)}{" "}
        (candidate − baseline).
      </p>
      <div className="table-wrap">
        <table className="experiment-snapshot-table">
          <thead>
            <tr>
              <th>Variant</th>
              <th className="num">n</th>
              <th className="num">mean</th>
              <th className="num">p50</th>
              <th className="num">p90</th>
              <th className="num">min</th>
              <th className="num">max</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => {
              const stats = statsFor(variant);
              return (
                <tr key={variant.id}>
                  <td>{displayLabel(variant)}</td>
                  <td className="num">{stats.n}</td>
                  <StatCells stats={stats} />
                </tr>
              );
            })}
            <tr className="comparison-row">
              <th scope="row">{deltaLabel}</th>
              <td className="num">—</td>
              <DeltaCells left={baselineStats} right={candidateStats} />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface BuildMetricSectionProps {
  title: string;
  deltaLabel: string;
  field: BuildMetric;
  report: ExperimentResult;
  variants: Variant[];
  baseline: Variant;
  candidate: Variant;
}

function BuildMetricSection({
  title,
  deltaLabel,
  field,
  report,
  variants,
  baseline,
  candidate,
}: BuildMetricSectionProps) {
  const [view, setView] = useState<BuildView>("order");
  const statsFor = (variant: Variant) =>
    field === "durationMs"
      ? viewerBuildStats(report, variant).duration
      : viewerBuildStats(report, variant).configuration;
  const hasPoints = variants.some((variant) => statsFor(variant).n > 0);
  if (!hasPoints) {
    return (
      <section className="wb-panel">
        <h2>{title}</h2>
        <p className="panel-note">
          {title} was not exported in this report. Missing is not zero; this section has no
          measurements to chart.
        </p>
      </section>
    );
  }
  return (
    <section className="build-metric-section">
      <ChartPanel
        title={title}
        subtitle={
          view === "order"
            ? "Sequence numbers are per variant. Build N for A is not the same execution as Build N for B."
            : "All observations per variant. Not paired by index."
        }
        legend={
          <ComparisonLegend
            baseline={baseline}
            candidate={candidate}
            baselineN={observedBuildCount(report, baseline)}
            candidateN={observedBuildCount(report, candidate)}
          />
        }
        actions={
          <div className="segmented" aria-label={`${title} view`}>
            <button
              type="button"
              aria-pressed={view === "distribution"}
              onClick={() => setView("distribution")}
            >
              Distribution
            </button>
            <button
              type="button"
              aria-pressed={view === "order"}
              onClick={() => setView("order")}
            >
              Execution order
            </button>
          </div>
        }
      >
        {view === "distribution" ? (
          <DistributionChart
            variants={variants}
            values={buildFieldValues(report, variants, field)}
            unit="ms"
            valueType="duration"
            view="histogram"
            title={title}
          />
        ) : (
          <SeriesChart
            title={title}
            variants={variants}
            observations={buildFieldSeries(report, variants, field)}
            unit="ms"
            valueType="duration"
            allowSequence
          />
        )}
      </ChartPanel>
      <BuildMetricSummary
        title={`${title} summary`}
        deltaLabel={deltaLabel}
        variants={variants}
        baseline={baseline}
        candidate={candidate}
        statsFor={statsFor}
      />
    </section>
  );
}

interface BuildsWorkbenchProps {
  field?: BuildMetric;
}

export function BuildsWorkbench({ field = "durationMs" }: BuildsWorkbenchProps) {
  const { report, baseline, candidate } = useDashboard();
  const variants = [baseline, candidate];
  const isConfiguration = field === "configurationMs";
  const title = isConfiguration ? "Configuration time" : "Build duration";
  const hasObservations = variants.some(
    (variant) => buildObservations(report, variant).length > 0,
  );
  if (!hasObservations) {
    return (
      <section className="wb-panel">
        <SectionHeader title={isConfiguration ? "Configuration" : "Builds"} />
        <p className="panel-note">No per-build observations were published for the selected variants.</p>
      </section>
    );
  }
  return (
    <>
      <SectionHeader
        title={isConfiguration ? "Configuration" : "Builds"}
        description={
          isConfiguration
            ? "Configuration time across independent execution sequences."
            : "Build duration across independent execution sequences."
        }
      />
      <BuildMetricSection
        title={title}
        deltaLabel={isConfiguration ? "Δ configuration" : "Δ duration"}
        field={field}
        report={report}
        variants={variants}
        baseline={baseline}
        candidate={candidate}
      />
    </>
  );
}

function StatCells({ stats }: { stats: BuildStatBlock }) {
  return (
    <>
      <td className="num">{stats.mean == null ? "N/A" : formatDurationMs(stats.mean).text}</td>
      <td className="num">{stats.p50 == null ? "N/A" : formatDurationMs(stats.p50).text}</td>
      <td className="num">{stats.p90 == null ? "N/A" : formatDurationMs(stats.p90).text}</td>
      <td className="num">{stats.min == null ? "N/A" : formatDurationMs(stats.min).text}</td>
      <td className="num">{stats.max == null ? "N/A" : formatDurationMs(stats.max).text}</td>
    </>
  );
}

function DeltaCells({ left, right }: { left: BuildStatBlock; right: BuildStatBlock }) {
  const fields = ["mean", "p50", "p90", "min", "max"] as const;
  return (
    <>
      {fields.map((stat) => {
        const delta = statDelta(left[stat], right[stat]);
        const formatted = formatSignedMetricValue(delta, "ms", "duration");
        const toneClass =
          delta == null ? "" : delta < 0 ? "is-improvement" : delta > 0 ? "is-regression" : "";
        return (
          <td key={stat} className={`num ${toneClass}`} title={formatted.title}>
            {formatted.text}
          </td>
        );
      })}
    </>
  );
}
