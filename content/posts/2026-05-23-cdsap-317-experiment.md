---
layout: post
title: "Kotlin 2.3.21 vs 2.3.20"
date: 2026-05-23
report_link: /Telltale/reports/experiment_results_20260523100604.html
summary: " 
The performance comparison between `varianta_baseline` and `variantb_kotlin-2.3.21` reveals several key differences. The overall build time for `variantb_kotlin-2.3.21` is slightly higher, with a mean increase of about 4.4 seconds (1.66% longer). Notably, the configuration time has improved in `variantb_kotlin-2.3.21` by approximately 1.8 seconds (4.4% faster). In task-specific performance, the `:core:cart:compileDebugKotlin` task showed a significant increase in execution time in `variantb_kotlin-2.3.21`, taking about 5.6 seconds longer on average, which is a 65% increase. Memory usage also saw a slight increase in `variantb_kotlin-2.3.21` across all metrics, with a notable increase in build child processes memory by 0.46 GB (14.5% higher)."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "2.3.20"
    mean: 265.725
    p50: 264.847
    p90: 285.050
  variant_b:
    label: "2.3.21"
    mean: 270.138
    p50: 271.717
    p90: 289.119
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 40.455
    p50: 40.044
    p90: 45.854
  config_variant_b:
    mean: 38.658
    p50: 38.566
    p90: 42.180
---
[Report 📊](../../reports/experiment_results_20260523100604.html)
## Summary
The performance comparison between `varianta_baseline` and `variantb_kotlin-2.3.21` reveals several key differences. The overall build time for `variantb_kotlin-2.3.21` is slightly higher, with a mean increase of about 4.4 seconds (1.66% longer). Notably, the configuration time has improved in `variantb_kotlin-2.3.21` by approximately 1.8 seconds (4.4% faster). In task-specific performance, the `:core:cart:compileDebugKotlin` task showed a significant increase in execution time in `variantb_kotlin-2.3.21`, taking about 5.6 seconds longer on average, which is a 65% increase. Memory usage also saw a slight increase in `variantb_kotlin-2.3.21` across all metrics, with a notable increase in build child processes memory by 0.46 GB (14.5% higher).

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: `varianta_baseline` 265.725s vs `variantb_kotlin-2.3.21` 270.138s (1.66% increase)
  - P50: `varianta_baseline` 264.847s vs `variantb_kotlin-2.3.21` 271.717s
  - P90: `varianta_baseline` 285.050s vs `variantb_kotlin-2.3.21` 289.119s

- **Configuration Time:**
  - Mean: `varianta_baseline` 40.455s vs `variantb_kotlin-2.3.21` 38.658s (4.44% decrease)
  - P50: `varianta_baseline` 40.044s vs `variantb_kotlin-2.3.21` 38.566s
  - P90: `varianta_baseline` 45.854s vs `variantb_kotlin-2.3.21` 42.180s

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: 
    - Mean: `varianta_baseline` 3.209s vs `variantb_kotlin-2.3.21` 3.435s
  - `"com.google.devtools.ksp.gradle.KspAATask"`: 
    - Mean: `varianta_baseline` 2.512s vs `variantb_kotlin-2.3.21` 2.514s
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: 
    - Mean: `varianta_baseline` 2.032s vs `variantb_kotlin-2.3.21` 2.107s

### 3. Statistical Patterns
- Significant timing variations observed in:
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Slight increase in mean time by 0.226s.
  - `"com.android.build.gradle.internal.tasks.DexArchiveBuilderTask"`: Increased mean time by 0.189s (12.7% increase).

### 4. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU: Max usage remained at 100% for both variants.
  - Memory: Max increased from 8.28 GB to 8.81 GB in `variantb_kotlin-2.3.21`.

- **Build Process:**
  - CPU: Max usage slightly decreased from 96.2% to 96.133%.
  - Memory: Increased from 4.04 GB to 4.12 GB.

- **Build Child Processes:**
  - CPU: Increased from 93.3% to 94.467%.
  - Memory: Increased from 3.19 GB to 3.65 GB (14.5% increase).

### 5. Summary and Formatting Requirements
- The report uses markdown formatting for clarity and readability.
- Key tasks and metrics are highlighted with quotes for emphasis.
- The summary provides a concise overview of the findings, focusing on significant differences in build performance and resource usage.
