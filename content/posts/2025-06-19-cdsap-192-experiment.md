---
layout: post
title: "9.0.0-RC1 vs 8.14.2 - Android project 350 modules"
date: 2025-06-19
report_link: /Telltale/reports/experiment_results_20250619015633.html
summary: " 
The analysis of the Gradle build performance data reveals several key insights across different metrics and task types. The overall build times for `varianta_9.0.0-rc1` averaged around 878.54 seconds, slightly slower than `variantb_8.14.2` at 869.71 seconds, showing a minor difference of about 1%. Among the most time-consuming tasks, `:layer_0:module_0_1:compileDebugKotlin` and related Kotlin compilation tasks consistently took longer in `varianta_9.0.0-rc1` compared to `variantb_8.14.2`. Memory usage was slightly higher in `variantb_8.14.2` with a maximum of 12.75 GB compared to 12.67 GB in `varianta_9.0.0-rc1`. CPU usage for all processes hit the maximum of 100% for both variants, indicating full utilization during the build. The total garbage collection counts were slightly higher in `varianta_9.0.0-rc1` for both Gradle and Kotlin processes, suggesting a bit more frequent memory cleanup."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250619015633.html)
## Summary
The analysis of the Gradle build performance data reveals several key insights across different metrics and task types. The overall build times for `varianta_9.0.0-rc1` averaged around 878.54 seconds, slightly slower than `variantb_8.14.2` at 869.71 seconds, showing a minor difference of about 1%. Among the most time-consuming tasks, `:layer_0:module_0_1:compileDebugKotlin` and related Kotlin compilation tasks consistently took longer in `varianta_9.0.0-rc1` compared to `variantb_8.14.2`. Memory usage was slightly higher in `variantb_8.14.2` with a maximum of 12.75 GB compared to 12.67 GB in `varianta_9.0.0-rc1`. CPU usage for all processes hit the maximum of 100% for both variants, indicating full utilization during the build. The total garbage collection counts were slightly higher in `varianta_9.0.0-rc1` for both Gradle and Kotlin processes, suggesting a bit more frequent memory cleanup.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - `varianta_9.0.0-rc1`: Mean = 878.54s, P50 = 872.42s, P90 = 914.88s
  - `variantb_8.14.2`: Mean = 869.71s, P50 = 865.15s, P90 = 898.43s
  - The build time for `varianta_9.0.0-rc1` is approximately 1% slower than `variantb_8.14.2`.

### 2. Task Type Differences
- Top 3 most time-consuming tasks for `varianta_9.0.0-rc1`:
  - `:layer_0:module_0_1:compileDebugKotlin`: Mean = 12422ms
  - `:layer_0:module_0_11:compileDebugKotlin`: Mean = 12305ms
  - `:layer_0:module_0_12:compileDebugKotlin`: Mean = 11635ms
- Comparison in `variantb_8.14.2`:
  - `:layer_0:module_0_1:compileDebugKotlin`: Mean = 13593ms
  - `:layer_0:module_0_11:compileDebugKotlin`: Mean = 13484ms
  - `:layer_0:module_0_12:compileDebugKotlin`: Mean = 12828ms
- These tasks show a consistent pattern where `variantb_8.14.2` has slightly higher execution times.

### 3. Statistical Patterns
- Notable timing variations are observed in Kotlin compilation tasks, with `variantb_8.14.2` generally taking longer, indicating a trend where `varianta_9.0.0-rc1` performs slightly better in these specific tasks.

### 4. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes reached a maximum of 100% CPU usage for both variants.
- **Memory Usage:**
  - `varianta_9.0.0-rc1`: Max = 12.67 GB
  - `variantb_8.14.2`: Max = 12.75 GB
  - `variantb_8.14.2` shows a slightly higher memory usage.

### 5. Garbage Collection Analysis
- **Total GC Collections:**
  - `varianta_9.0.0-rc1`: Gradle = 269, Kotlin = 282
  - `variantb_8.14.2`: Gradle = 268, Kotlin = 280
  - Slightly more frequent garbage collections in `varianta_9.0.0-rc1` could indicate more aggressive memory management.

### 6. Kotlin Build Reports Analysis
- Not available in the provided data.

Overall, while the differences between the variants are minimal, `variantb_8.14.2` shows a trend of slightly higher resource usage and longer task execution times for key Kotlin compilation tasks.
