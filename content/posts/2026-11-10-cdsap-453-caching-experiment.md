---
layout: post
title: "Gradle 9.9.1 vs 9.9.0"
date: 2026-11-10
report_id: "run-42881519222-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261110194452.html
viewer_link: /Telltale/experiments/run-42881519222-caching-attempt-1/
json_link: /Telltale/data/experiments/run-42881519222-caching-attempt-1.json.gz
report_data: /Telltale/data/experiments/run-42881519222-caching-attempt-1.json.gz
summary: "Build mean +0.10%; Build median +8.40%; Build P90 -2.99%; Configuration mean +0.00%; Configuration median +1.09%; Configuration P90 -5.13%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.9.0"
    mean: 244.192
    p50: 238.010
    p90: 298.851
  variant_b:
    label: "9.9.1"
    mean: 244.437
    p50: 258.004
    p90: 289.918
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 36.704
    p50: 37.446
    p90: 44.928
  config_variant_b:
    mean: 36.705
    p50: 37.856
    p90: 42.625
  summary: "Build mean +0.10%; Build median +8.40%; Build P90 -2.99%; Configuration mean +0.00%; Configuration median +1.09%; Configuration P90 -5.13%."
  insights:
    - "Build mean and P90 moved in opposite directions."
    - "Build median changed +8.40%."
    - "Configuration mean and P90 moved in opposite directions."
---
[Interactive report](/Telltale/experiments/run-42881519222-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261110194452.html)
