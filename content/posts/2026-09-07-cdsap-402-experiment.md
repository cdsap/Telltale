---
layout: post
title: "Kotlin 2.4.20 vs 2.4.10"
date: 2026-09-07
report_link: /Telltale/reports/experiment_results_20260907203912.html
summary: " 
The analysis of the Gradle build performance data reveals a noticeable increase in build times when comparing the baseline variant (`varianta_baseline`) to the updated Kotlin version (`variantb_kotlin-2.4.20`). Specifically, the overall build time increased by approximately 13.7 seconds (5.5%) from an average of 250.6 seconds in the baseline to 264.3 seconds in the Kotlin 2.4.20 variant. Configuration times also saw a slight increase. The most time-consuming tasks across both variants include Kotlin compilation and various Android build tasks, with significant increases observed particularly in Kotlin compilation tasks in the updated variant. Memory usage saw a slight increase in the updated variant, particularly in build child processes, which aligns with the observed increases in task execution times."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "2.4.10"
    mean: 250.604
    p50: 259.877
    p90: 276.753
  variant_b:
    label: "2.4.20"
    mean: 264.277
    p50: 273.209
    p90: 300.890
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 42.313
    p50: 41.974
    p90: 48.135
  config_variant_b:
    mean: 42.865
    p50: 42.929
    p90: 49.492
---
[Report 📊](../../reports/experiment_results_20260907203912.html)
## Summary
The analysis of the Gradle build performance data reveals a noticeable increase in build times when comparing the baseline variant (`varianta_baseline`) to the updated Kotlin version (`variantb_kotlin-2.4.20`). Specifically, the overall build time increased by approximately 13.7 seconds (5.5%) from an average of 250.6 seconds in the baseline to 264.3 seconds in the Kotlin 2.4.20 variant. Configuration times also saw a slight increase. The most time-consuming tasks across both variants include Kotlin compilation and various Android build tasks, with significant increases observed particularly in Kotlin compilation tasks in the updated variant. Memory usage saw a slight increase in the updated variant, particularly in build child processes, which aligns with the observed increases in task execution times.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Baseline Mean:** 250.6 seconds
  - **Kotlin 2.4.20 Mean:** 264.3 seconds (5.5% increase)
  - **Baseline P50:** 259.9 seconds
  - **Kotlin 2.4.20 P50:** 273.2 seconds
  - **Baseline P90:** 276.8 seconds
  - **Kotlin 2.4.20 P90:** 300.9 seconds

- **Configuration Time:**
  - **Baseline Mean:** 42.3 seconds
  - **Kotlin 2.4.20 Mean:** 42.9 seconds (1.3% increase)
  - **Baseline P50:** 41.9 seconds
  - **Kotlin 2.4.20 P50:** 42.9 seconds
  - **Baseline P90:** 48.1 seconds
  - **Kotlin 2.4.20 P90:** 49.5 seconds

### 2. Task Type Differences
- **Top 3 Most Time-Consuming Tasks:**
  - **"KotlinCompile"**
    - **Baseline Mean:** 3.3 seconds
    - **Kotlin 2.4.20 Mean:** 3.6 seconds (9.8% increase)
  - **"DexMergingTask"**
    - **Baseline Mean:** 6.9 seconds
    - **Kotlin 2.4.20 Mean:** 7.3 seconds (5.8% increase)
  - **"GlobalSyntheticsGeneratorTask"**
    - **Baseline Mean:** 5.6 seconds
    - **Kotlin 2.4.20 Mean:** 5.6 seconds (0.2% decrease)

### 3. Statistical Patterns
- Notable timing variations were observed in the "KotlinCompile" and "DexMergingTask" tasks, with the updated Kotlin variant showing slower performance. The P90 values indicate that the variability in build times has also increased in the updated variant.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - Both variants reached the maximum CPU usage of 100% for all processes.
  - The main build process and child processes showed a slight decrease in CPU usage in the updated variant.

- **Memory Usage:**
  - **All Processes:**
    - **Baseline Max:** 9.03 GB
    - **Kotlin 2.4.20 Max:** 9.29 GB (2.9% increase)
  - **Build Process:**
    - **Baseline Max:** 4.49 GB
    - **Kotlin 2.4.20 Max:** 4.52 GB (0.7% increase)
  - **Build Child Processes:**
    - **Baseline Max:** 3.42 GB
    - **Kotlin 2.4.20 Max:** 3.68 GB (7.6% increase)

Overall, the transition to Kotlin 2.4.20 has led to increased build and configuration times, with a slight increase in memory usage, particularly in build child processes. These changes suggest a trade-off between adopting newer Kotlin features and the impact on build performance.
