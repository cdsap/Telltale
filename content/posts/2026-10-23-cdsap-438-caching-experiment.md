---
layout: post
title: "Gradle 9.8.2 vs 9.8.1 (50 iter)"
date: 2026-10-23
report_id: "run-40030395897-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261023224311.html
viewer_link: /Telltale/experiments/run-40030395897-caching-attempt-1/
json_link: /Telltale/data/experiments/run-40030395897-caching-attempt-1.json
report_data: /Telltale/data/experiments/run-40030395897-caching-attempt-1.json
summary: "variants: varianta_baseline,variantb_gradle-9.8.2"
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.8.1"
    mean: 282.352
    p50: 290.849
    p90: 328.979
  variant_b:
    label: "9.8.2"
    mean: 281.533
    p50: 301.740
    p90: 336.200
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 46.898
    p50: 47.706
    p90: 57.544
  config_variant_b:
    mean: 45.418
    p50: 46.776
    p90: 55.727
---
[Interactive report](/Telltale/experiments/run-40030395897-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261023224311.html)
