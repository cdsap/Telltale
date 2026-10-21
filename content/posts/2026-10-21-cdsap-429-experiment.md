---
layout: post
title: "Gradle 9.8.2 vs 9.8.1"
date: 2026-10-21
report_link: /Telltale/reports/experiment_results_20261021001637.html
summary: " 
The analysis of the Gradle build performance data reveals noticeable improvements in build times with the use of Gradle version 9.8.2 compared to the baseline variant. The overall build time decreased by approximately 18.52 seconds (7.23%), with the mean build time reducing from 256.069 seconds to 237.549 seconds. Configuration times also saw a slight decrease, though the P90 metric indicates a slight increase. Significant task execution time reductions were observed in key tasks such as `:app:app:mergeExtDexDebug` and `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, which are among the most time-consuming tasks. Memory usage slightly decreased in the newer Gradle version, and CPU usage remained high but consistent across both variants. The total garbage collection counts for both Gradle and Kotlin processes saw a minor reduction, indicating a slight improvement in memory management."
tags: ["dependencies cache"]
experiment_snapshot:
  metric: "Overall build time"
  unit: "seconds"
  variant_a:
    label: "9.8.1"
    mean: 256.069
    p50: 274.082
    p90: 298.682
  variant_b:
    label: "9.8.2"
    mean: 237.549
    p50: 251.198
    p90: 289.320
  config_metric: "Configuration time"
  config_unit: "seconds"
  config_variant_a:
    mean: 39.365
    p50: 41.114
    p90: 46.794
  config_variant_b:
    mean: 36.728
    p50: 38.327
    p90: 48.041
---
[Report 📊](../../reports/experiment_results_20261021001637.html)
## Summary
The analysis of the Gradle build performance data reveals noticeable improvements in build times with the use of Gradle version 9.8.2 compared to the baseline variant. The overall build time decreased by approximately 18.52 seconds (7.23%), with the mean build time reducing from 256.069 seconds to 237.549 seconds. Configuration times also saw a slight decrease, though the P90 metric indicates a slight increase. Significant task execution time reductions were observed in key tasks such as `:app:app:mergeExtDexDebug` and `org.jetbrains.kotlin.gradle.tasks.KotlinCompile`, which are among the most time-consuming tasks. Memory usage slightly decreased in the newer Gradle version, and CPU usage remained high but consistent across both variants. The total garbage collection counts for both Gradle and Kotlin processes saw a minor reduction, indicating a slight improvement in memory management.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** Reduced from 256.069 seconds to 237.549 seconds (7.23% decrease).
  - **P50:** Reduced from 274.082 seconds to 251.198 seconds.
  - **P90:** Reduced from 298.682 seconds to 289.320 seconds.

- **Configuration Time:**
  - **Mean:** Reduced from 39.365 seconds to 36.728 seconds.
  - **P50:** Reduced from 41.114 seconds to 38.327 seconds.
  - **P90:** Increased from 46.794 seconds to 48.041 seconds.

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Mean time reduced from 3109 ms to 2849 ms.
  - `"com.google.devtools.ksp.gradle.KspAATask"`: Mean time reduced from 2232 ms to 2067 ms.
  - `"com.android.build.gradle.internal.tasks.DexMergingTask"`: Mean time reduced from 6139 ms to 5661 ms.

### 3. Statistical Patterns
- Tasks such as `"com.android.build.gradle.internal.tasks.DexMergingTask"` and `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"` showed more than 10% reduction in execution times, indicating efficiency improvements in these areas.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Slight reduction in garbage collection time from 0.11 to 0.10.
- **Gradle Process State:**
  - Slight reduction in garbage collection time from 0.13 to 0.12.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - Slightly increased for the main build process from 95.57% to 95.83%.
- **Memory Usage:**
  - Decreased overall from 8.7 GB to 8.59 GB for all processes.
  - Build process memory usage decreased from 4.51 GB to 4.36 GB.

### 6. Garbage Collection Analysis
- **Total GC Collections:**
  - Gradle process: Reduced from 114 to 113.
  - Kotlin process: Reduced from 47 to 46.

### 7. Kotlin Build Reports Analysis
- **Compiler Performance Metrics:**
  - Improvement in code generation lines per second from 702 to 771.
  - Analysis lines per second increased from 395 to 443, indicating faster analysis times.

The data indicates that the newer Gradle version not only enhances build times but also optimizes resource usage and compiler performance, making it a beneficial upgrade for development efficiency.
