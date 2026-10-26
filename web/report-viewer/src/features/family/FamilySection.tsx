import { useMemo, useState } from "react";
import type { ExperimentResult, NamedSeries, StatisticName, Variant } from "../../domain/types";
import { DistributionChart } from "../../components/charts/DistributionChart";
import { ComparisonLegend } from "../../components/comparison/ComparisonLegend";
import { MetricInspector } from "../../components/inspectors/MetricInspector";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { MetricRows } from "../../components/MetricRows/MetricRows";
import { SeriesChart } from "../../components/SeriesChart/SeriesChart";
import { ChartPanel } from "../../components/workbench/ChartPanel";
import { metricDisplayName, resourceGroupOf } from "../../domain/metrics";
import {
  canPlotSequence,
  firstSeriesWithPoints,
  metricsInFamily,
  namedSeriesList,
  seriesForMetric,
} from "../../domain/series";

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
  const metrics = useMemo(() => metricsInFamily(report, family), [family, report]);
  const seriesList = namedSeriesList(series ?? {});
  const variantIds = [baseline.id, candidate.id];
  const isResource = family === "resource";
  const categories = useMemo(() => {
    if (isResource) {
      return [...new Set(metrics.map((metric) => resourceGroupOf(metric.category)))].sort();
    }
    return [...new Set(metrics.map((metric) => metric.category).filter(Boolean))].sort();
  }, [isResource, metrics]);
  const defaultMetric =
    metrics.find((metric) => series && seriesForMetric(metric, series)) ?? metrics[0];
  const defaultSeries = firstSeriesWithPoints(seriesList, variantIds);
  const [selectedId, setSelectedId] = useState(defaultMetric?.id ?? defaultSeries?.id ?? null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [view, setView] = useState<"order" | "distribution">("order");
  const selected = metrics.find((metric) => metric.id === selectedId) ?? metrics[0];
  const visibleMetrics = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return metrics.filter((metric) => {
      if (group !== "all") {
        const bucket = isResource ? resourceGroupOf(metric.category) : metric.category;
        if (bucket !== group) {
          return false;
        }
      }
      if (!needle) {
        return true;
      }
      return `${metricDisplayName(metric)} ${metric.id}`.toLowerCase().includes(needle);
    });
  }, [group, isResource, metrics, query]);
  if (metrics.length === 0 && seriesList.length === 0) {
    return (
      <section id={id} className="wb-panel">
        <SectionHeader title={title} />
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
  const chartTitle = selected
    ? metricDisplayName(selected)
    : (selectedSeries?.name ?? title);
  const distributionValues = selectedSeries
    ? Object.fromEntries(
        [baseline, candidate].map((variant) => [
          variant.id,
          (selectedSeries.observations[variant.id] ?? []).map(
            (item) => item.value ?? item.durationMs,
          ),
        ]),
      )
    : {};
  return (
    <section id={id} className="report-block">
      <SectionHeader title={title} description={note} />
      <div className="analysis-toolbar">
        <div className="analysis-toolbar-row">
          <label>
            Search metrics
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="memory, CPU, GC"
            />
          </label>
          {categories.length > 1 ? (
            <label>
              Group
              <select value={group} onChange={(event) => setGroup(event.target.value)}>
                <option value="all">All groups</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
            <label>
              View
              <select
                value={view}
                onChange={(event) => setView(event.target.value as "order" | "distribution")}
              >
                <option value="order">Execution order</option>
                <option value="distribution">Distribution</option>
              </select>
            </label>
          ) : null}
        </div>
      </div>
      {selectedSeries ? (
        <ChartPanel
          title={chartTitle}
          subtitle="Baseline and candidate sequences are independent."
          legend={<ComparisonLegend baseline={baseline} candidate={candidate} />}
        >
          {view === "distribution" ? (
            <DistributionChart
              variants={[baseline, candidate]}
              values={distributionValues}
              unit={selectedSeries.unit || selected?.unit || ""}
              valueType={selected?.valueType ?? "quantity"}
              view="box"
              title={chartTitle}
            />
          ) : (
            <SeriesChart
              title={chartTitle}
              variants={[baseline, candidate]}
              observations={selectedSeries.observations}
              unit={selectedSeries.unit || selected?.unit || ""}
              valueType={selected?.valueType ?? "quantity"}
              allowSequence={selected ? canPlotSequence(selected) : true}
            />
          )}
        </ChartPanel>
      ) : (
        <p className="series-note">No per-build series is available for {title}.</p>
      )}
      {selected ? (
        <MetricInspector
          metric={selected}
          baseline={baseline}
          candidate={candidate}
          kicker="Selected metric"
        />
      ) : null}
      <MetricRows
        metrics={visibleMetrics}
        baseline={baseline}
        candidate={candidate}
        statistic={statistic}
        compact
        caption={`${title} metrics`}
        selectedId={selected?.id}
        onSelect={(metricId) => setSelectedId(metricId)}
      />
    </section>
  );
}
