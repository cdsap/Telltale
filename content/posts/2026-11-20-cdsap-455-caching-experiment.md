---
layout: post
title: "AGP 9.5.2 vs 9.5.1"
date: 2026-11-20
report_id: "run-44795987343-caching-attempt-2"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261120205649.html
viewer_link: /Telltale/experiments/run-44795987343-caching-attempt-2/
json_link: /Telltale/data/experiments/run-44795987343-caching-attempt-2.json.gz
report_data: /Telltale/data/experiments/run-44795987343-caching-attempt-2.json.gz
summary: "Build mean +2.52%; Build median +9.40%; Build P90 -1.14%; Configuration mean +1.57%; Configuration median -0.20%; Configuration P90 +4.75%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.5.1"
    mean: 244.287
    p50: 238.856
    p90: 299.995
  variant_b:
    label: "9.5.2"
    mean: 250.440
    p50: 261.300
    p90: 296.576
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 37.968
    p50: 37.842
    p90: 46.577
  config_variant_b:
    mean: 38.565
    p50: 37.768
    p90: 48.788
  summary: "Build mean +2.52%; Build median +9.40%; Build P90 -1.14%; Configuration mean +1.57%; Configuration median -0.20%; Configuration P90 +4.75%."
  insights:
    - "Build mean and P90 moved in opposite directions."
    - "Build median changed +9.40%."
---
[Interactive report](/Telltale/experiments/run-44795987343-caching-attempt-2/)
[Report 📊](../../reports/experiment_results_20261120205649.html)
