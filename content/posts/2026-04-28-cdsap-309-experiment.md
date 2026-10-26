---

layout: post
title: "Gradle 9.5.0 vs 9.4.1"
date: 2026-04-28
report_link: /Telltale/reports/experiment_results_20260428174824.html
report_data: /Telltale/data/experiments/experiment-cdsap-309-caching.json
json_link: /Telltale/data/experiments/experiment-cdsap-309-caching.json
viewer_link: /Telltale/experiments/experiment-cdsap-309-caching/
summary: "Build mean +1.99%; Build median +0.12%; Build P90 +2.98%; Configuration mean +3.25%; Configuration median +1.27%; Configuration P90 +10.32%."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.4.1"
    mean: 575.288
    p50: 577.342
    p90: 619.129
  variant_b:
    label: "9.5.0"
    mean: 586.719
    p50: 578.024
    p90: 637.590
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 61.569
    p50: 59.097
    p90: 75.886
  config_variant_b:
    mean: 63.573
    p50: 59.848
    p90: 83.721
  summary: "Build mean +1.99%; Build median +0.12%; Build P90 +2.98%; Configuration mean +3.25%; Configuration median +1.27%; Configuration P90 +10.32%."
  insights:
    - "Configuration P90 changed +10.32%."
---
[Interactive report](/Telltale/experiments/experiment-cdsap-309-caching/)
[Report 📊](../../reports/experiment_results_20260428174824.html)
## Summary
The analysis of the Gradle build performance data reveals a slight increase in build time in variantb_9.5.0 compared to varianta_9.4.1, with the mean build time increasing by approximately 11.4 seconds (2%). The configuration time also saw an increase, with the mean time rising by about 2 seconds (3.2%). Notably, the most time-consuming tasks across both variants include 'KotlinCompile', 'KspAATask', and 'LinkApplicationAndroidResourcesTask', with minor increases in execution times in variantb_9.5.0.

In terms of resource usage, both CPU and memory usage for all processes and specifically for the build processes show very close figures between the two variants, with no significant deviations. The total garbage collection (GC) counts are nearly identical, indicating stable memory management across builds.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: 575.288s for varianta_9.4.1, 586.719s for variantb_9.5.0 (2% increase).
  - P50: 577.342s for varianta_9.4.1, 578.024s for variantb_9.5.0.
  - P90: 619.129s for varianta_9.4.1, 637.590s for variantb_9.5.0.

- **Configuration Time:**
  - Mean: 61.569s for varianta_9.4.1, 63.573s for variantb_9.5.0 (3.2% increase).
  - P50: 59.097s for varianta_9.4.1, 59.848s for variantb_9.5.0.
  - P90: 75.886s for varianta_9.4.1, 83.721s for variantb_9.5.0.

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - 'KotlinCompile': Mean time increased from 2.618s to 2.672s.
  - 'KspAATask': Mean time increased from 1.759s to 1.800s.
  - 'LinkApplicationAndroidResourcesTask': Mean time increased from 1.700s to 1.720s.

### 3. Statistical Patterns
- Tasks such as 'DexMergingTask' and 'compileKotlin' across various modules showed a consistent increase in execution times by around 1-2%.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes: Max CPU usage was 100% for both variants.
  - Build process: Max CPU usage was 96.2% for varianta_9.4.1 and 96.233% for variantb_9.5.0.
  - Build child processes: Max CPU usage was 94.233% for varianta_9.4.1 and 94.4% for variantb_9.5.0.

- **Memory Usage:**
  - All processes: Max memory usage was 12.18GB for varianta_9.4.1 and 11.94GB for variantb_9.5.0.
  - Build process: Max memory usage was 6.89GB for varianta_9.4.1 and 6.71GB for variantb_9.5.0.
  - Build child processes: Max memory usage was 4.27GB for varianta_9.4.1 and 4.21GB for variantb_9.5.0.

### 6. Garbage Collection Analysis
- Total GC collections were 221 for varianta_9.4.1 and 220 for variantb_9.5.0, indicating no significant change in memory management efficiency between the variants.

### 7. Kotlin Build Reports Analysis
- Incremental compilation times slightly increased in variantb_9.5.0.
- Compiler code analysis and IR translation stages also saw minor increases in time.
- Code generation lines per second decreased from 1078 to 1047, suggesting a slight decrease in performance in this area for variantb_9.5.0.

Overall, the transition from varianta_9.4.1 to variantb_9.5.0 shows a minor increase in build and configuration times, with marginal increases in resource usage. The performance metrics suggest a stable but slightly slower build process in the newer variant.
