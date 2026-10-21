import { useMemo, useState } from "react";
import type { ExperimentResult, NamedSeries, StatisticName, Variant } from "../../domain/types";
import { compareMetric } from "../../domain/metrics";
import { comparisonTone } from "../../domain/comparisons";
import {
  canPlotSequence,
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
  const [selectedId, setSelectedId] = useState(metrics[0]?.id ?? seriesList[0]?.id ?? null);
  const selected = metrics.find((metric) => metric.id === selectedId) ?? metrics[0];
  const cards = useMemo(
    () => headlineMetrics(metrics, baseline, candidate, statistic, 2),
    [baseline, candidate, metrics, statistic],
  );
  if (metrics.length === 0 && seriesList.length === 0) {
    return null;
  }
  const selectedSeries = selected
    ? series
      ? seriesForMetric(selected, series)
      : undefined
    : (seriesList.find((item) => item.id === selectedId) ?? seriesList[0]);
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
                  metric.category && metric.category !== metric.name
                    ? metric.category
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
        {selectedSeries ? (
          <>
            <p className="experiment-snapshot-metric">
              {(selected?.name ?? selectedSeries.name)} by build
            </p>
            <SeriesChart
              title={selected?.name ?? selectedSeries.name}
              variants={[baseline, candidate]}
              observations={selectedSeries.observations}
              unit={selectedSeries.unit || selected?.unit || ""}
              valueType={selected?.valueType ?? "quantity"}
              allowSequence={selected ? canPlotSequence(selected) : true}
            />
          </>
        ) : null}
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
