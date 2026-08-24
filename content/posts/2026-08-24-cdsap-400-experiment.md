---
layout: post
title: "Gradle 9.7.1 vs 9.7.0"
date: 2026-08-24
report_link: /Telltale/reports/experiment_results_20260824114748.html
summary: " 
The performance comparison between `varianta_baseline` and `variantb_gradle-9.7.1` reveals a slight improvement in build times with the newer Gradle version. The overall build time decreased by approximately 8.4 seconds (3.2%) from a mean of 261.671 seconds in the baseline to 253.267 seconds in Gradle 9.7.1. Configuration times also saw a reduction, dropping by about 3 seconds (6.4%) from a mean of 47.111 seconds to 44.089 seconds. The most time-consuming tasks across both variants include `com.android.build.gradle.internal.tasks.DexMergingTask`, `:build-logic:convention:compileKotlin`, and `:core:cart:compileDebugKotlin`, with the newer variant generally showing slight improvements in execution times. CPU and memory usage remained largely consistent between the two variants, with no significant changes observed."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.7.0"
    mean: 261.671
    p50: 271.669
    p90: 285.130
  variant_b:
    label: "9.7.1"
    mean: 253.267
    p50: 264.306
    p90: 275.461
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 47.111
    p50: 47.658
    p90: 49.773
  config_variant_b:
    mean: 44.089
    p50: 45.848
    p90: 49.104
---
[Report 📊](../../reports/experiment_results_20260824114748.html)
## Summary
The performance comparison between `varianta_baseline` and `variantb_gradle-9.7.1` reveals a slight improvement in build times with the newer Gradle version. The overall build time decreased by approximately 8.4 seconds (3.2%) from a mean of 261.671 seconds in the baseline to 253.267 seconds in Gradle 9.7.1. Configuration times also saw a reduction, dropping by about 3 seconds (6.4%) from a mean of 47.111 seconds to 44.089 seconds. The most time-consuming tasks across both variants include `com.android.build.gradle.internal.tasks.DexMergingTask`, `:build-logic:convention:compileKotlin`, and `:core:cart:compileDebugKotlin`, with the newer variant generally showing slight improvements in execution times. CPU and memory usage remained largely consistent between the two variants, with no significant changes observed.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** Reduced from 261.671s to 253.267s (3.2% decrease).
  - **P50:** Reduced from 271.669s to 264.306s.
  - **P90:** Reduced from 285.130s to 275.461s.
- **Configuration Time:**
  - **Mean:** Reduced from 47.111s to 44.089s (6.4% decrease).
  - **P50:** Reduced from 47.658s to 45.848s.
  - **P90:** Reduced from 49.773s to 49.104s.

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"com.android.build.gradle.internal.tasks.DexMergingTask"`: Mean time slightly reduced from 7.206s to 7.122s.
  - `":build-logic:convention:compileKotlin"`: Mean time reduced from 8.685s to 8.246s.
  - `":core:cart:compileDebugKotlin"`: Mean time reduced from 9.073s to 8.787s.
- **Significant Timing Variations:**
  - `":app:app:processDebugNavigationResources"` saw a notable decrease from 2.907s to 2.058s.
  - `":core:checkout:parseDebugLocalResources"` decreased from 2.809s to 1.962s.
  - `":model:article-contact:parseDebugLocalResources"` decreased from 2.830s to 2.082s.

### 3. Statistical Patterns
- **Notable Timing Variations:**
  - `":app:app:processDebugNavigationResources"` and `":core:checkout:parseDebugLocalResources"` showed over 30% reduction in mean execution times, indicating significant performance improvements in these areas.
- **Performance Trends:**
  - Variantb_gradle-9.7.1 consistently shows reduced execution times across most tasks, especially in resource-intensive tasks like `":build-logic:convention:compileKotlin"` and `":core:cart:compileDebugKotlin"`.

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - **CPU Usage:** Maxed at 100% for both variants.
  - **Memory Usage:** Slightly increased from a max of 9.15GB to 9.12GB.
- **Build Process:**
  - **CPU Usage:** Remained stable at a max of 95.7%.
  - **Memory Usage:** Increased slightly from a max of 4.5GB to 4.49GB.
- **Build Child Processes:**
  - **CPU Usage:** Increased marginally from 93.93% to 94.07%.
  - **Memory Usage:** Decreased from 3.54GB to 3.51GB.

This analysis highlights the efficiency gains in build performance with the newer Gradle version, particularly in overall build and configuration times, and in the execution of several key tasks. The CPU and memory usage metrics indicate stable resource consumption, with minor fluctuations between the variants.
