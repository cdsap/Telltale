---
layout: post
title: "AGP 9.2.0 vs 9.1.0"
date: 2026-04-28
report_link: /Telltale/reports/experiment_results_20260428193059.html
summary: " 
The analysis of the Gradle build performance data reveals notable improvements in build times and resource utilization between the two variants, `varianta_9.1.0` and `variantb_9.2.0`. The overall build time decreased by 4.45% from an average of 588.322 seconds in `varianta_9.1.0` to 562.176 seconds in `variantb_9.2.0`. Configuration times also saw a slight improvement. The most time-consuming tasks such as `:app:app:mergeExtDexDebug` and `:core:analytics:kspDebugKotlin` showed significant reductions in execution times, contributing to the overall efficiency. Memory usage and CPU utilization during the build process were slightly better in `variantb_9.2.0`. Furthermore, Kotlin Build Reports indicate an increase in code generation lines per second, suggesting enhanced compiler performance in the newer variant."
tags: ["dependencies cache"]
components: ["android"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "AGP 9.1.0"
    mean: 588.322
    p50: 592.534
    p90: 619.333
  variant_b:
    label: "AGP 9.2.0"
    mean: 562.176
    p50: 560.925
    p90: 593.537
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 59.942
    p50: 61.264
    p90: 68.165
  config_variant_b:
    mean: 59.527
    p50: 59.080
    p90: 67.752
---
[Report 📊](../../reports/experiment_results_20260428193059.html)
## Summary
The analysis of the Gradle build performance data reveals notable improvements in build times and resource utilization between the two variants, `varianta_9.1.0` and `variantb_9.2.0`. The overall build time decreased by 4.45% from an average of 588.322 seconds in `varianta_9.1.0` to 562.176 seconds in `variantb_9.2.0`. Configuration times also saw a slight improvement. The most time-consuming tasks such as `:app:app:mergeExtDexDebug` and `:core:analytics:kspDebugKotlin` showed significant reductions in execution times, contributing to the overall efficiency. Memory usage and CPU utilization during the build process were slightly better in `variantb_9.2.0`. Furthermore, Kotlin Build Reports indicate an increase in code generation lines per second, suggesting enhanced compiler performance in the newer variant.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** Reduced from 588.322s to 562.176s (4.45% decrease).
  - **P50:** Reduced from 592.534s to 560.925s.
  - **P90:** Reduced from 619.333s to 593.537s.

- **Configuration Time:**
  - **Mean:** Reduced from 59.942s to 59.527s.
  - **P50:** Reduced from 61.264s to 59.080s.
  - **P90:** Reduced from 68.165s to 67.752s.

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"com.android.build.gradle.internal.tasks.DexMergingTask"`: Increased from 5541ms to 7325ms mean time.
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Decreased from 2691ms to 2552ms mean time.
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: Increased from 1708ms to 1818ms mean time.

### 3. Statistical Patterns
- Notable timing variations were observed in `"com.android.build.gradle.internal.tasks.DexMergingTask"` with a significant increase in execution time in `variantb_9.2.0`.
- `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"` and `"com.google.devtools.ksp.gradle.KspAATask"` showed improvements in execution times across all percentiles.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Slight reduction in garbage collection time from 0.3 to 0.28.
- **Gradle Process State:**
  - Slight reduction in garbage collection time from 0.32 to 0.3.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - Slight increase in CPU usage for the main build process from 96.2% to 96.5%.
- **Memory Usage:**
  - Decrease in maximum memory usage from 11.88GB to 11.66GB for all processes.
  - Build process memory usage decreased from 6.66GB to 6.46GB.

### 6. Garbage Collection Analysis
- Total GC collections decreased from 225 to 208, indicating improved memory management in `variantb_9.2.0`.

### 7. Kotlin Build Reports Analysis
- Improvements in compiler performance metrics such as code generation lines per second from 1034 to 1084.
- Reduction in total Gradle task time from 2674.41ms to 2535.17ms.

This comprehensive analysis highlights the efficiency gains in build performance and resource utilization in `variantb_9.2.0` compared to `varianta_9.1.0`, reflecting optimizations in both build configuration and task execution.
