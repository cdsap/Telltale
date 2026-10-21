import type { ExperimentResult, StatisticName, Variant } from "../../domain/types";
import { comparisonTone } from "../../domain/comparisons";
import {
  BUILD_CONFIGURATION_ID,
  BUILD_DURATION_ID,
  compareMetric,
  metricById,
} from "../../domain/metrics";
import { ExperimentHeader } from "../../components/ExperimentHeader/ExperimentHeader";
import { MetricCard } from "../../components/MetricCard/MetricCard";
import { WarningBanner } from "../../components/WarningBanner/WarningBanner";

interface OverviewProps {
  report: ExperimentResult;
  baseline: Variant;
  candidate: Variant;
  statistic: StatisticName;
  jsonUrl: string | null;
  legacyCsvUrl?: string | null;
  legacyHtmlUrl?: string | null;
}

export function Overview({
  report,
  baseline,
  candidate,
  statistic,
  jsonUrl,
  legacyCsvUrl,
  legacyHtmlUrl,
}: OverviewProps) {
  const duration = metricById(report, BUILD_DURATION_ID);
  const configuration = metricById(report, BUILD_CONFIGURATION_ID);
  const durationCmp = compareMetric(duration, baseline.id, candidate.id, statistic);
  const configurationCmp = compareMetric(
    configuration,
    baseline.id,
    candidate.id,
    statistic,
  );
  return (
    <>
      <ExperimentHeader
        report={report}
        baseline={baseline}
        candidate={candidate}
        jsonUrl={jsonUrl}
        legacyCsvUrl={legacyCsvUrl}
        legacyHtmlUrl={legacyHtmlUrl}
      />
      <WarningBanner warnings={report.warnings} />
      <section id="overview" className="snapshot-grid" aria-label="Headline comparisons">
        {duration ? (
          <MetricCard
            title="Overall build time"
            metric={duration}
            baseline={baseline}
            candidate={candidate}
            statistic={statistic}
            comparison={durationCmp}
            tone={comparisonTone(durationCmp, duration.direction)}
          />
        ) : null}
        {configuration ? (
          <MetricCard
            title="Configuration time"
            metric={configuration}
            baseline={baseline}
            candidate={candidate}
            statistic={statistic}
            comparison={configurationCmp}
            tone={comparisonTone(configurationCmp, configuration.direction)}
          />
        ) : null}
      </section>
    </>
  );
}
