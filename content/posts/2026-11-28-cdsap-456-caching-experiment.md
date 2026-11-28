---
layout: post
title: "AGP 9.5.3 vs 9.5.2"
date: 2026-11-28
report_id: "run-46087746152-caching-attempt-1"
report_kind: "caching"
report_schema_version: "1.0.0"
report_link: /Telltale/reports/experiment_results_20261128010626.html
viewer_link: /Telltale/experiments/run-46087746152-caching-attempt-1/
json_link: /Telltale/data/experiments/run-46087746152-caching-attempt-1.json.gz
report_data: /Telltale/data/experiments/run-46087746152-caching-attempt-1.json.gz
summary: "Build mean +4.67%; Build median +13.43%; Build P90 -1.08%; Configuration mean +3.99%; Configuration median +3.09%; Configuration P90 -1.65%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.5.2"
    mean: 242.350
    p50: 236.991
    p90: 295.686
  variant_b:
    label: "9.5.3"
    mean: 253.670
    p50: 268.818
    p90: 292.489
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 36.839
    p50: 36.787
    p90: 45.693
  config_variant_b:
    mean: 38.309
    p50: 37.924
    p90: 44.941
  summary: "Build mean +4.67%; Build median +13.43%; Build P90 -1.08%; Configuration mean +3.99%; Configuration median +3.09%; Configuration P90 -1.65%."
  insights:
    - "Build mean and P90 moved in opposite directions."
    - "Build median changed +13.43%."
    - "Configuration mean and P90 moved in opposite directions."
---
[Interactive report](/Telltale/experiments/run-46087746152-caching-attempt-1/)
[Report 📊](../../reports/experiment_results_20261128010626.html)
