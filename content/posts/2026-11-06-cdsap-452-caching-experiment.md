---
layout: post
title: "Gradle 9.9.0 vs 9.8.2"
date: 2026-11-06
report_id: "run-42266898348-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261106183947.html
viewer_link: /Telltale/experiments/run-42266898348-caching-attempt-1/
json_link: /Telltale/data/experiments/run-42266898348-caching-attempt-1.json.gz
report_data: /Telltale/data/experiments/run-42266898348-caching-attempt-1.json.gz
summary: "Build mean -0.57%; Build median -2.42%; Build P90 -0.83%; Configuration mean -3.24%; Configuration median -1.08%; Configuration P90 +3.30%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.8.2"
    mean: 249.599
    p50: 267.797
    p90: 289.883
  variant_b:
    label: "9.9.0"
    mean: 248.184
    p50: 261.329
    p90: 287.474
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 40.479
    p50: 39.868
    p90: 46.963
  config_variant_b:
    mean: 39.168
    p50: 39.437
    p90: 48.512
  summary: "Build mean -0.57%; Build median -2.42%; Build P90 -0.83%; Configuration mean -3.24%; Configuration median -1.08%; Configuration P90 +3.30%."
  insights:
    - "Configuration mean and P90 moved in opposite directions."
---
[Interactive report](/Telltale/experiments/run-42266898348-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261106183947.html)
