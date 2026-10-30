---
layout: post
title: "Gradle 9.9.0-rc-1 vs 9.8.2 - 350 modules"
date: 2026-10-30
report_id: "experiment-cdsap-444-caching"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261030234057.html
viewer_link: /Telltale/experiments/experiment-cdsap-444-caching/
json_link: /Telltale/data/experiments/experiment-cdsap-444-caching.json.gz
report_data: /Telltale/data/experiments/experiment-cdsap-444-caching.json.gz
summary: "Build mean +6.89%; Build median +14.35%; Build P90 +3.85%; Configuration mean +5.94%; Configuration median +8.03%; Configuration P90 +2.72%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.8.2"
    mean: 540.427
    p50: 545.577
    p90: 641.183
  variant_b:
    label: "9.9.0-rc-1"
    mean: 577.683
    p50: 623.842
    p90: 665.862
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 60.109
    p50: 61.844
    p90: 71.972
  config_variant_b:
    mean: 63.678
    p50: 66.807
    p90: 73.928
  summary: "Build mean +6.89%; Build median +14.35%; Build P90 +3.85%; Configuration mean +5.94%; Configuration median +8.03%; Configuration P90 +2.72%."
  insights:
    - "Build mean changed +6.89%."
    - "Build median changed +14.35%."
    - "Configuration mean changed +5.94%."
---
[Interactive report](/Telltale/experiments/experiment-cdsap-444-caching/)
[Report 📊](../../reports/experiment_results_20261030234057.html)
