---
layout: post
title: "Gradle 9.9.2 vs 9.9.1"
date: 2026-11-20
report_id: "run-44766852322-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261120162401.html
viewer_link: /Telltale/experiments/run-44766852322-caching-attempt-1/
json_link: /Telltale/data/experiments/run-44766852322-caching-attempt-1.json.gz
report_data: /Telltale/data/experiments/run-44766852322-caching-attempt-1.json.gz
summary: "Build mean +3.56%; Build median +11.74%; Build P90 +0.59%; Configuration mean -0.16%; Configuration median +5.97%; Configuration P90 -7.93%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.9.1"
    mean: 242.649
    p50: 229.726
    p90: 301.779
  variant_b:
    label: "9.9.2"
    mean: 251.282
    p50: 256.686
    p90: 303.573
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 39.020
    p50: 36.309
    p90: 53.789
  config_variant_b:
    mean: 38.956
    p50: 38.477
    p90: 49.524
  summary: "Build mean +3.56%; Build median +11.74%; Build P90 +0.59%; Configuration mean -0.16%; Configuration median +5.97%; Configuration P90 -7.93%."
  insights:
    - "Build median changed +11.74%."
    - "Configuration median changed +5.97%."
    - "Configuration P90 changed -7.93%."
---
[Interactive report](/Telltale/experiments/run-44766852322-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261120162401.html)
