---
layout: post
title: "Gradle 9.6.0 vs 9.5.1"
date: 2026-06-19
report_link: /Telltale/reports/experiment_results_20260619171337.html
summary: " 
The analysis of the Gradle build performance data reveals a slight increase in overall build time when comparing the baseline variant (`varianta_baseline`) to the `variantb_gradle-9.6.0`. Specifically, the mean build time increased by approximately 3.6 seconds (1.3% increase), with the P90 time showing a more significant increase of 11.5 seconds (4.0% increase). Notably, the configuration times slightly decreased in the new variant by about 0.5 seconds. In terms of resource usage, there was a noticeable increase in memory consumption across all processes, with the maximum memory usage rising from 8.35 GB to 9.11 GB (9.1% increase). CPU usage remained maximized at 100% for all processes in both variants."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.5.1"
    mean: 271.269
    p50: 270.452
    p90: 288.783
  variant_b:
    label: "9.6.0"
    mean: 274.904
    p50: 275.492
    p90: 300.299
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 39.154
    p50: 39.954
    p90: 43.014
  config_variant_b:
    mean: 38.616
    p50: 39.316
    p90: 43.956
---
[Report 📊](../../reports/experiment_results_20260619171337.html)
## Summary
The analysis of the Gradle build performance data reveals a slight increase in overall build time when comparing the baseline variant (`varianta_baseline`) to the `variantb_gradle-9.6.0`. Specifically, the mean build time increased by approximately 3.6 seconds (1.3% increase), with the P90 time showing a more significant increase of 11.5 seconds (4.0% increase). Notably, the configuration times slightly decreased in the new variant by about 0.5 seconds. In terms of resource usage, there was a noticeable increase in memory consumption across all processes, with the maximum memory usage rising from 8.35 GB to 9.11 GB (9.1% increase). CPU usage remained maximized at 100% for all processes in both variants.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: Increased from 271.269 seconds to 274.904 seconds (+3.6 seconds, +1.3%).
  - P50: Increased from 270.452 seconds to 275.492 seconds (+5.04 seconds, +1.9%).
  - P90: Increased from 288.783 seconds to 300.299 seconds (+11.5 seconds, +4.0%).

- **Configuration Time:**
  - Mean: Decreased from 39.154 seconds to 38.616 seconds (-0.538 seconds, -1.4%).
  - P50: Decreased from 39.954 seconds to 39.316 seconds (-0.638 seconds, -1.6%).
  - P90: Increased from 43.014 seconds to 43.956 seconds (+0.942 seconds, +2.2%).

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Slight increase in mean time from 3.325 seconds to 3.538 seconds.
  - `"com.google.devtools.ksp.gradle.KspAATask"`: Virtually unchanged, mean time from 2.550 seconds to 2.551 seconds.
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: Increased from 1.967 seconds to 2.120 seconds.

### 3. Statistical Patterns
- Tasks such as `"com.android.build.gradle.internal.tasks.DexMergingTask"` showed a decrease in execution time, while `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"` increased notably in the P90 metric from 2.290 seconds to 2.818 seconds.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes: Maximized at 100% for both variants.
  - Build process: Slight increase from 95.63% to 95.73%.
  - Build child processes: Slight decrease from 92.67% to 92.17%.

- **Memory Usage:**
  - All processes: Increased from 8.35 GB to 9.11 GB (+9.1%).
  - Build process: Increased from 4.06 GB to 4.36 GB (+7.4%).
  - Build child processes: Increased from 3.22 GB to 3.70 GB (+14.9%).

The data indicates that while the newer Gradle variant (`variantb_gradle-9.6.0`) slightly increases build times, it also uses more memory, which could be a concern for resource-constrained environments. The configuration time improvements are minimal, suggesting that the newer version's changes might not significantly optimize configuration phases.
