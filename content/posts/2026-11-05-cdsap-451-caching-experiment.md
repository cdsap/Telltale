---
layout: post
title: "AGP 9.5.1 vs 9.4.1"
date: 2026-11-05
report_id: "run-42076045414-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261105181454.html
viewer_link: /Telltale/experiments/run-42076045414-caching-attempt-1/
json_link: /Telltale/data/experiments/run-42076045414-caching-attempt-1.json.gz
report_data: /Telltale/data/experiments/run-42076045414-caching-attempt-1.json.gz
summary: "Build mean +3.24%; Build median +6.49%; Build P90 +1.44%; Configuration mean -3.65%; Configuration median -3.50%; Configuration P90 -11.05%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.4.1"
    mean: 248.366
    p50: 257.388
    p90: 294.583
  variant_b:
    label: "9.5.1"
    mean: 256.406
    p50: 274.080
    p90: 298.813
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 42.510
    p50: 42.265
    p90: 55.340
  config_variant_b:
    mean: 40.960
    p50: 40.787
    p90: 49.225
  summary: "Build mean +3.24%; Build median +6.49%; Build P90 +1.44%; Configuration mean -3.65%; Configuration median -3.50%; Configuration P90 -11.05%."
  insights:
    - "Build median changed +6.49%."
    - "Configuration P90 changed -11.05%."
---
[Interactive report](/Telltale/experiments/run-42076045414-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261105181454.html)
