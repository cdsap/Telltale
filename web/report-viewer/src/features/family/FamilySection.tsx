import { useMemo, useState } from "react";
import type { ExperimentResult, NamedSeries, StatisticName, Variant } from "../../domain/types";
import { compareMetric } from "../../domain/metrics";
import { comparisonTone } from "../../domain/comparisons";
import {
  canPlotSequence,
  firstSeriesWithPoints,
  headlineMetrics,
  metricsInFamily,
  namedSeriesList,
  seriesForMetric,
} from "../../domain/series";
import { MetricCard } from "../../components/MetricCard/MetricCard";
import { MetricRows } from "../../components/MetricRows/MetricRows";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";

interface FamilySectionProps {
  id: string;
  title: string;
  family: string;
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
  series?: Record<string, NamedSeries>;
  note?: string;
}

export function FamilySection({
  id,
  title,
  family,
  report,
  baseline,
  candidate,
  statistic,
  series,
  note,
}: FamilySectionProps) {
  const metrics = metricsInFamily(report, family);
  const seriesList = namedSeriesList(series ?? {});
  const variantIds = [baseline.id, candidate.id];
  const defaultMetric =
    metrics.find((metric) => series && seriesForMetric(metric, series)) ?? metrics[0];
  const defaultSeries = firstSeriesWithPoints(seriesList, variantIds);
  const [selectedId, setSelectedId] = useState(defaultMetric?.id ?? defaultSeries?.id ?? null);
  const selected = metrics.find((metric) => metric.id === selectedId) ?? metrics[0];
  const cards = useMemo(
    () => headlineMetrics(metrics, baseline, candidate, statistic, 2),
    [baseline, candidate, metrics, statistic],
  );
  if (metrics.length === 0 && seriesList.length === 0) {
    return (
      <section id={id} className="wb-panel">
        <h2>{title}</h2>
        <p className="panel-note">
          {title} were not exported in this report. Missing is not zero; this section has no
          measurements to chart.
        </p>
      </section>
    );
  }
  const matchedSeries = selected && series ? seriesForMetric(selected, series) : undefined;
  const selectedSeries =
    (selectedId && series?.[selectedId]) ||
    matchedSeries ||
    seriesList.find((item) => item.id === selectedId) ||
    defaultSeries;
  return (
    <section id={id} className="report-block">
      {cards.length > 0 ? (
        <div className="snapshot-grid">
          {cards.map((metric) => {
            const comparison = compareMetric(metric, baseline.id, candidate.id, statistic);
            return (
              <MetricCard
                key={metric.id}
                title={
                  metric.category &&
                  metric.category !== metric.name &&
                  metric.category !== title
                    ? `${metric.category} · ${metric.name}`
                    : metric.name
                }
                metric={metric}
                baseline={baseline}
                candidate={candidate}
                statistic={statistic}
                comparison={comparison}
                tone={comparisonTone(comparison, metric.direction)}
              />
            );
          })}
        </div>
      ) : null}
      <div className="experiment-snapshot">
        <h2 className="experiment-snapshot-title">{title}</h2>
        {note ? <p className="series-note">{note}</p> : null}
        {seriesList.length > 0 ? (
          <label className="series-picker">
            Timeline
            <select
              value={selectedSeries?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {seriesList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {selectedSeries ? (
          <>
            <p className="experiment-snapshot-metric">
              {(selected?.name === selectedSeries.name
                ? selected.name
                : selectedSeries.name)} by build
            </p>
            <SeriesChart
              title={selectedSeries.name}
              variants={[baseline, candidate]}
              observations={selectedSeries.observations}
              unit={selectedSeries.unit || selected?.unit || ""}
              valueType={selected?.valueType ?? "quantity"}
              allowSequence={selected ? canPlotSequence(selected) : true}
            />
          </>
        ) : (
          <p className="series-note">No per-build series is available for {title}.</p>
        )}
        <MetricRows
          metrics={metrics}
          baseline={baseline}
          candidate={candidate}
          statistic={statistic}
          caption={`${title} metrics`}
          selectedId={selected?.id}
          onSelect={series ? (metricId) => setSelectedId(metricId) : undefined}
        />
      </div>
    </section>
  );
}
