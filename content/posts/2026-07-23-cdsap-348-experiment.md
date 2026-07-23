---
layout: post
title: "AGP 9.3.1 vs 9.3.0"
date: 2026-07-23
report_link: /Telltale/reports/experiment_results_20260723215121.html
summary: " 
The analysis of the Gradle build performance data reveals that the transition from `varianta_baseline` to `variantb_agp-9.3.1` shows a slight increase in overall build time by about 1.57 seconds (0.6% increase). The configuration time also increased by 1.1 seconds (2.8% increase). Notably, the `:app:app:mergeExtDexDebug` task remains the most time-consuming across both variants, with a minimal increase in execution time in the newer variant. CPU and memory usage metrics for all processes and specifically for the build processes show very minor differences, indicating no significant change in resource consumption between the two variants."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.3.0"
    mean: 263.568
    p50: 272.791
    p90: 287.282
  variant_b:
    label: "9.3.1"
    mean: 265.142
    p50: 272.306
    p90: 289.099
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 39.733
    p50: 40.305
    p90: 46.166
  config_variant_b:
    mean: 40.843
    p50: 40.783
    p90: 46.888
---
[Report 📊](../../reports/experiment_results_20260723215121.html)
## Summary
The analysis of the Gradle build performance data reveals that the transition from `varianta_baseline` to `variantb_agp-9.3.1` shows a slight increase in overall build time by about 1.57 seconds (0.6% increase). The configuration time also increased by 1.1 seconds (2.8% increase). Notably, the `:app:app:mergeExtDexDebug` task remains the most time-consuming across both variants, with a minimal increase in execution time in the newer variant. CPU and memory usage metrics for all processes and specifically for the build processes show very minor differences, indicating no significant change in resource consumption between the two variants.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: Increased from 263.568s to 265.142s (0.6% increase).
  - P50: Decreased slightly from 272.791s to 272.306s.
  - P90: Increased from 287.282s to 289.099s.
- **Configuration Time:**
  - Mean: Increased from 39.733s to 40.843s (2.8% increase).
  - P50: Increased slightly from 40.305s to 40.783s.
  - P90: Increased from 46.166s to 46.888s.

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Mean time increased slightly from 3.240s to 3.253s.
  - `"com.google.devtools.ksp.gradle.KspAATask"`: Mean time increased from 2.299s to 2.356s.
  - `"com.android.build.gradle.internal.tasks.DexMergingTask"`: Mean time increased from 6.684s to 6.716s.
- **Significant Task Timing Variations:**
  - `"com.android.build.gradle.internal.tasks.GlobalSyntheticsGeneratorTask"` showed a decrease from 3.046s to 2.891s.
  - `"com.android.build.gradle.internal.tasks.ValidateSigningTask"` increased from 1.089s to 1.174s.

### 3. Statistical Patterns
- Tasks like `"com.android.build.gradle.internal.tasks.DexMergingTask"` and `"com.android.build.gradle.internal.tasks.ValidateSigningTask"` show a consistent increase in execution times across mean, P50, and P90 metrics.
- The decrease in execution time for `"com.android.build.gradle.internal.tasks.GlobalSyntheticsGeneratorTask"` across all statistical measures suggests an optimization in this specific task in `variantb_agp-9.3.1`.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes: Maximum CPU usage remained at 100% for both variants.
  - Build process: Slightly decreased from 95.53% to 95.27%.
  - Build child processes: Increased marginally from 93.5% to 93.77%.
- **Memory Usage:**
  - All processes: Maximum memory usage decreased slightly from 8.62 GB to 8.57 GB.
  - Build process: Decreased from 4.14 GB to 4.10 GB.
  - Build child processes: Decreased from 3.38 GB to 3.34 GB.

This detailed analysis highlights the minor performance changes in the newer variant, with specific tasks showing slight improvements or regressions in execution times. The resource usage remains largely consistent, indicating stable performance characteristics between the two variants.
