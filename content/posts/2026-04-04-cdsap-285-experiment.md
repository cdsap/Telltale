---
layout: post
title: "Gradle 9.4.1 vs 9.5.0-rc-1"
date: 2026-04-04
report_link: /Telltale/reports/experiment_results_20260404005622.html
summary: " 
The performance comparison between `varianta_main` and `variantb_9.5.0-rc-1` reveals minor differences in build times and task execution times. The overall build time for `variantb_9.5.0-rc-1` is slightly higher by about 0.9% compared to `varianta_main`, translating to an increase of approximately 4.376 seconds. The configuration time shows a negligible decrease of about 0.7% in `variantb_9.5.0-rc-1`. Notably, the most time-consuming tasks across both variants are similar, with minor variations in execution times. Memory and CPU usage metrics for all processes and specifically for the build processes are closely matched between the two variants, indicating similar resource consumption. The total garbage collection counts are also comparable, suggesting efficient memory management in both scenarios."
tags: ["dependencies cache"]
components: ["gradle"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "Gradle 9.4.1"
    mean: 492.041
    p50: 489.819
    p90: 510.167
  variant_b:
    label: "Gradle 9.5.0-rc-1"
    mean: 496.417
    p50: 492.510
    p90: 520.371
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 53.798
    p50: 53.609
    p90: 57.270
  config_variant_b:
    mean: 53.409
    p50: 53.535
    p90: 57.586
---
[Report 📊](../../reports/experiment_results_20260404005622.html)
## Summary
The performance comparison between `varianta_main` and `variantb_9.5.0-rc-1` reveals minor differences in build times and task execution times. The overall build time for `variantb_9.5.0-rc-1` is slightly higher by about 0.9% compared to `varianta_main`, translating to an increase of approximately 4.376 seconds. The configuration time shows a negligible decrease of about 0.7% in `variantb_9.5.0-rc-1`. Notably, the most time-consuming tasks across both variants are similar, with minor variations in execution times. Memory and CPU usage metrics for all processes and specifically for the build processes are closely matched between the two variants, indicating similar resource consumption. The total garbage collection counts are also comparable, suggesting efficient memory management in both scenarios.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - `varianta_main`: Mean = 492.041s, P50 = 489.819s, P90 = 510.167s
  - `variantb_9.5.0-rc-1`: Mean = 496.417s, P50 = 492.510s, P90 = 520.371s
  - Percentage Increase: Mean = 0.89%, P50 = 0.55%, P90 = 2.00%

- **Configuration Time:**
  - `varianta_main`: Mean = 53.798s, P50 = 53.609s, P90 = 57.270s
  - `variantb_9.5.0-rc-1`: Mean = 53.409s, P50 = 53.535s, P90 = 57.586s
  - Percentage Decrease: Mean = 0.72%, P50 = -0.14%, P90 = -1.19%

### 2. Task Type Differences
- Top 3 most time-consuming tasks:
  - `"KotlinCompile"`: Mean = 2081ms in `varianta_main` vs. 2111ms in `variantb_9.5.0-rc-1`
  - `"KspAATask"`: Mean = 1657ms in `varianta_main` vs. 1669ms in `variantb_9.5.0-rc-1`
  - `"LinkApplicationAndroidResourcesTask"`: Mean = 1735ms in `varianta_main` vs. 1757ms in `variantb_9.5.0-rc-1`

### 3. Statistical Patterns
- Minor variations in task execution times, with most tasks showing less than 2% difference between variants.

### 4. CPU & Memory Usage Analysis
- **Overall System Usage:**
  - CPU: Max 100% for both variants.
  - Memory: Max 11.12GB for `varianta_main` and 11.21GB for `variantb_9.5.0-rc-1`.

- **Main Gradle Process:**
  - CPU: Max 96.16% for `varianta_main` and 96.14% for `variantb_9.5.0-rc-1`.
  - Memory: Max 6.04GB for `varianta_main` and 6.15GB for `variantb_9.5.0-rc-1`.

- **Build Child Processes:**
  - CPU: Max 93.08% for `varianta_main` and 92.88% for `variantb_9.5.0-rc-1`.
  - Memory: Max 4.06GB for `varianta_main` and 4.05GB for `variantb_9.5.0-rc-1`.

### 6. Garbage Collection Analysis
- Total GC collections are closely matched with 203 for `varianta_main` and 200 for `variantb_9.5.0-rc-1`.

### 7. Kotlin Build Reports Analysis
- **Compiler Performance Metrics:**
  - Code generation lines per second are slightly higher in `varianta_main` (1059) compared to `variantb_9.5.0-rc-1` (1045).
  - Analysis lines per second are also higher in `varianta_main` (640) compared to `variantb_9.5.0-rc-1` (626).

Overall, the differences between the two variants are minimal, suggesting that the updates in `variantb_9.5.0-rc-1` do not significantly impact the build performance or resource utilization compared to `varianta_main`.
