---
layout: post
title: "Kotlin 2.4.10 vs 2.4.0"
date: 2026-07-21
report_link: /Telltale/reports/experiment_results_20260721232414.html
summary: " 
In this build performance comparison between `varianta_baseline` and `variantb_kotlin-2.4.10`, we observed a slight increase in overall build time for `variantb_kotlin-2.4.10` with a mean increase of about 4.83 seconds (1.7% increase). Configuration times also increased by approximately 1 second (2.4% increase) in the newer variant. The task execution times showed mixed results, with some tasks like `:app:app:mergeDebugJavaResource` and `:app:app:hiltJavaCompileDebug` showing improvements in `variantb_kotlin-2.4.10`, whereas others like `:app:app:mergeLibDexDebug` and `:app:app:mergeExtDexDebug` had slightly increased times. CPU and memory usage were relatively stable across both variants with no significant changes observed."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "2.4.0"
    mean: 284.826
    p50: 287.720
    p90: 309.706
  variant_b:
    label: "2.4.10"
    mean: 289.659
    p50: 289.488
    p90: 307.925
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 39.371
    p50: 39.848
    p90: 42.496
  config_variant_b:
    mean: 40.329
    p50: 40.699
    p90: 45.402
---
[Report 📊](../../reports/experiment_results_20260721232414.html)
## Summary
In this build performance comparison between `varianta_baseline` and `variantb_kotlin-2.4.10`, we observed a slight increase in overall build time for `variantb_kotlin-2.4.10` with a mean increase of about 4.83 seconds (1.7% increase). Configuration times also increased by approximately 1 second (2.4% increase) in the newer variant. The task execution times showed mixed results, with some tasks like `:app:app:mergeDebugJavaResource` and `:app:app:hiltJavaCompileDebug` showing improvements in `variantb_kotlin-2.4.10`, whereas others like `:app:app:mergeLibDexDebug` and `:app:app:mergeExtDexDebug` had slightly increased times. CPU and memory usage were relatively stable across both variants with no significant changes observed.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: `varianta_baseline` 284.826s vs `variantb_kotlin-2.4.10` 289.659s (1.7% increase)
  - P50: `varianta_baseline` 287.720s vs `variantb_kotlin-2.4.10` 289.488s
  - P90: `varianta_baseline` 309.706s vs `variantb_kotlin-2.4.10` 307.925s

- **Configuration Time:**
  - Mean: `varianta_baseline` 39.371s vs `variantb_kotlin-2.4.10` 40.329s (2.4% increase)
  - P50: `varianta_baseline` 39.848s vs `variantb_kotlin-2.4.10` 40.699s
  - P90: `varianta_baseline` 42.496s vs `variantb_kotlin-2.4.10` 45.402s

### 2. Task Type Differences
- Top 3 most time-consuming tasks for `varianta_baseline`:
  - `:core:checkout:compileDebugKotlin`: 14.688s
  - `:core:contact:compileDebugKotlin`: 14.715s
  - `:core:cart:compileDebugKotlin`: 15.134s

- Comparison in `variantb_kotlin-2.4.10`:
  - `:core:checkout:compileDebugKotlin`: 14.914s (1.5% increase)
  - `:core:contact:compileDebugKotlin`: 14.951s (1.6% increase)
  - `:core:cart:compileDebugKotlin`: 15.256s (0.8% increase)

### 3. Statistical Patterns
- Tasks with notable timing variations:
  - `:app:app:hiltJavaCompileDebug` showed a significant decrease from 4.130s to 3.698s in `variantb_kotlin-2.4.10` (10.4% decrease).
  - `:app:app:mergeExtDexDebug` increased from 14.409s to 14.643s (1.6% increase).

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes: Both variants peaked at 100%.
  - Build process: `varianta_baseline` 95.43% vs `variantb_kotlin-2.4.10` 95.37%.
  - Build child processes: `varianta_baseline` 92.77% vs `variantb_kotlin-2.4.10` 92.93%.

- **Memory Usage:**
  - All processes: `varianta_baseline` maxed at 8.86 GB vs `variantb_kotlin-2.4.10` at 8.93 GB.
  - Build process: `varianta_baseline` 4.05 GB vs `variantb_kotlin-2.4.10` 4.08 GB.
  - Build child processes: `varianta_baseline` 3.72 GB vs `variantb_kotlin-2.4.10` 3.75 GB.

This analysis highlights the nuanced differences in build performance between the two variants, with minor increases in build and configuration times in the newer Kotlin version, alongside a generally stable resource usage profile.
