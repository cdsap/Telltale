---
layout: post
title: "Gradle 9.8.2 vs 9.8.1"
date: 2026-10-22
report_id: "run-39785918884-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261022133625.html
viewer_link: /Telltale/experiments/run-39785918884-caching-attempt-1/
json_link: /Telltale/data/experiments/run-39785918884-caching-attempt-1.json
report_data: /Telltale/data/experiments/run-39785918884-caching-attempt-1.json
summary: "variants: varianta_baseline,variantb_gradle-9.8.2"
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.8.1"
    mean: 296.355
    p50: 331.224
    p90: 340.137
  variant_b:
    label: "9.8.2"
    mean: 310.278
    p50: 323.754
    p90: 369.558
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 47.675
    p50: 52.675
    p90: 52.968
  config_variant_b:
    mean: 50.030
    p50: 50.691
    p90: 60.801
---
[Interactive report](/Telltale/experiments/run-39785918884-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261022133625.html)
