import { useDashboard } from "../../app/DashboardState";
import { DistributionChart } from "../../components/charts/DistributionChart";
import { ComparisonLegend } from "../../components/comparison/ComparisonLegend";
import { MetricDelta } from "../../components/comparison/MetricDelta";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { DataCoverage } from "../../components/workbench/DataCoverage";
import { formatSignedMetricValue } from "../../domain/units";
import { formatDelta } from "../../domain/formatting";
import type { Comparison, Metric } from "../../domain/types";
import { isMaterialPercent } from "../../domain/comparisons";
import {
  buildFieldSeries,
  buildFieldValues,
  coverageChips,
  overviewOutcome,
  rankedTaskChanges,
  splitTaskChanges,
} from "../../domain/viewModels";

export function OverviewDashboard() {
  const { report, baseline, candidate, selection, update } = useDashboard();
  const outcome = overviewOutcome(report, baseline, candidate);
  const ranked = rankedTaskChanges(report, baseline, candidate, "mean").filter((row) =>
    isMaterialPercent(row.comparison.deltaPercent),
  );
  const { increases, decreases } = splitTaskChanges(ranked, 5);
  const variants = [baseline, candidate];
  const showDistribution = selection.distView !== "iteration";
  const openTask = (taskId: string) => update({ section: "tasks", taskId });
  return (
    <>
      <SectionHeader
        title="Overview"
        description="Did the candidate materially change build performance?"
      />
      <section className="outcome-strip" aria-label="Experiment outcome">
        <h2>{outcome.headline}</h2>
        <p className="panel-note">{outcome.summary}</p>
        <dl className="outcome-stats">
          <div>
            <dt>Mean</dt>
            <dd>
              <OutcomeDelta duration={outcome.duration} comparison={outcome.mean} />
            </dd>
          </div>
          <div>
            <dt>Median</dt>
            <dd>
              <OutcomeDelta duration={outcome.duration} comparison={outcome.median} practicalMs={0} />
            </dd>
          </div>
          <div>
            <dt>P90</dt>
            <dd>
              <OutcomeDelta duration={outcome.duration} comparison={outcome.p90} practicalMs={0} />
            </dd>
          </div>
          <div>
            <dt>Samples</dt>
            <dd>
              {outcome.baselineN ?? "—"} / {outcome.candidateN ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
      <ChartPanel
        title="Build duration"
        subtitle={
          showDistribution
            ? "Each build is one point. Median (solid) and P90 (dashed) are drawn per variant. Sequences are independent."
            : "Sequence numbers are per variant. Build N for A is not the same execution as Build N for B."
        }
        legend={
          <ComparisonLegend
            baseline={baseline}
            candidate={candidate}
            baselineN={outcome.baselineN}
            candidateN={outcome.candidateN}
          />
        }
        actions={
          <div className="segmented" aria-label="Duration view">
            <button
              type="button"
              aria-pressed={showDistribution}
              onClick={() => update({ distView: "box" })}
            >
              Distribution
            </button>
            <button
              type="button"
              aria-pressed={!showDistribution}
              onClick={() => update({ distView: "iteration" })}
            >
              Execution order
            </button>
          </div>
        }
      >
        {showDistribution ? (
          <DistributionChart
            variants={variants}
            values={buildFieldValues(report, variants, "durationMs")}
            unit="ms"
            valueType="duration"
            view={selection.distView === "histogram" ? "histogram" : "box"}
            title="Build duration"
          />
        ) : (
          <SeriesChart
            title="Build duration"
            variants={variants}
            observations={buildFieldSeries(report, variants, "durationMs")}
            unit="ms"
            valueType="duration"
            allowSequence
          />
        )}
      </ChartPanel>
      <ChartPanel
        title="Configuration"
        size="secondary"
        subtitle="Supporting phase comparison. Same independent-sample caveat as duration."
      >
        <SeriesChart
          title="Configuration time"
          variants={variants}
          observations={buildFieldSeries(report, variants, "configurationMs")}
          unit="ms"
          valueType="duration"
          allowSequence
        />
      </ChartPanel>
      <section className="wb-panel">
        <h2>Investigation candidates</h2>
        <p className="panel-note">
          Ranked by absolute mean duration delta among tasks that moved by at least 5%. Task
          durations can overlap under Gradle concurrency, so these rows are not wall-clock
          contributors.
        </p>
        <div className="split-grid">
          <div>
            <h3>Largest increases</h3>
            <TaskChangeList rows={increases} onSelect={openTask} />
          </div>
          <div>
            <h3>Largest decreases</h3>
            <TaskChangeList rows={decreases} onSelect={openTask} />
          </div>
        </div>
      </section>
      <section className="wb-panel">
        <h2>Analysis coverage</h2>
        <DataCoverage chips={coverageChips(report)} />
      </section>
    </>
  );
}

function TaskChangeList({
  rows,
  onSelect,
}: {
  rows: ReturnType<typeof splitTaskChanges>["increases"];
  onSelect: (taskId: string) => void;
}) {
  if (rows.length === 0) {
    return <p className="panel-note">No comparable task-path changes.</p>;
  }
  return (
    <ul className="change-list">
      {rows.map((row) => (
        <li key={row.metric.id}>
          <button type="button" onClick={() => onSelect(row.metric.id)} title={row.path}>
            <span className="change-path">{shortPath(row.path)}</span>
            <span className="muted">
              {" "}
              {row.category} · n {row.baselineCount ?? "—"}/{row.candidateCount ?? "—"} ·{" "}
              {formatSignedMetricValue(
                row.comparison.deltaAbsolute,
                row.metric.unit,
                row.metric.valueType,
              ).text}{" "}
              ({formatDelta(row.comparison)})
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function OutcomeDelta({
  duration,
  comparison,
  practicalMs,
}: {
  duration: Metric | null;
  comparison: Comparison;
  practicalMs?: number;
}) {
  if (!duration) {
    return "N/A";
  }
  return (
    <MetricDelta
      comparison={comparison}
      unit={duration.unit}
      valueType={duration.valueType}
      direction={duration.direction}
      practicalMs={practicalMs}
    />
  );
}

function shortPath(path: string): string {
  if (path.length <= 42) {
    return path;
  }
  return `…${path.slice(-39)}`;
}
