---
layout: post
title: "Nowinandroid with Metro"
date: 2026-01-09
report_link: /Telltale/reports/experiment_results_20260109145525.html
summary: " 
The analysis of the Gradle build performance data reveals that variant `variantb_useMetro_false` generally has longer build times compared to `varianta_useMetro_true`. Specifically, the mean build time for `variantb_useMetro_false` is approximately 15.7% longer, translating to about 18.9 seconds more. Configuration times are also slightly higher in `variantb_useMetro_false` by about 3.9%. Task execution times show significant variability, with some tasks like `com.google.devtools.ksp.gradle.KspAATask` showing drastic differences (over 75% faster in `varianta_useMetro_true`). Memory usage is slightly higher in `variantb_useMetro_false` across all processes, with the build process memory usage notably about 18% higher. The total garbage collection (GC) counts are also higher in `variantb_useMetro_false` for both Gradle and Kotlin processes, indicating potentially less efficient memory management."
tags: ["dependencies cache"]
components: ["metro"]
---
[Report 📊](../../reports/experiment_results_20260109145525.html)
## Summary
The analysis of the Gradle build performance data reveals that variant `variantb_useMetro_false` generally has longer build times compared to `varianta_useMetro_true`. Specifically, the mean build time for `variantb_useMetro_false` is approximately 15.7% longer, translating to about 18.9 seconds more. Configuration times are also slightly higher in `variantb_useMetro_false` by about 3.9%. Task execution times show significant variability, with some tasks like `com.google.devtools.ksp.gradle.KspAATask` showing drastic differences (over 75% faster in `varianta_useMetro_true`). Memory usage is slightly higher in `variantb_useMetro_false` across all processes, with the build process memory usage notably about 18% higher. The total garbage collection (GC) counts are also higher in `variantb_useMetro_false` for both Gradle and Kotlin processes, indicating potentially less efficient memory management.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: `varianta_useMetro_true` = 120.548s, `variantb_useMetro_false` = 139.476s (15.7% longer)
  - P50: `varianta_useMetro_true` = 121.150s, `variantb_useMetro_false` = 138.161s
  - P90: `varianta_useMetro_true` = 124.045s, `variantb_useMetro_false` = 146.975s

- **Configuration Time:**
  - Mean: `varianta_useMetro_true` = 36.237s, `variantb_useMetro_false` = 37.654s (3.9% longer)
  - P50: `varianta_useMetro_true` = 36.210s, `variantb_useMetro_false` = 37.402s
  - P90: `varianta_useMetro_true` = 37.997s, `variantb_useMetro_false` = 39.389s

### 2. Task Type Differences
- Top 3 time-consuming tasks for `varianta_useMetro_true`:
  1. `com.google.devtools.ksp.gradle.KspAATask`: Mean = 23.170s
  2. `:app:mergeExtDexDemoDebug`: Mean = 41.241s
  3. `:core:designsystem:compileDemoDebugKotlin`: Mean = 20.930s

- Top 3 time-consuming tasks for `variantb_useMetro_false`:
  1. `:app:mergeExtDexDemoDebug`: Mean = 37.218s
  2. `:core:designsystem:compileDemoDebugKotlin`: Mean = 22.173s
  3. `com.google.devtools.ksp.gradle.KspAATask`: Mean = 5.587s (75.9% faster than `varianta_useMetro_true`)

### 3. Statistical Patterns
- Notable timing variations:
  - `com.google.devtools.ksp.gradle.KspAATask` shows a significant reduction in execution time in `variantb_useMetro_false`.
  - `:core:common:compileKotlin` is significantly faster in `variantb_useMetro_false`.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Slight variations in GC time, with `varianta_useMetro_true` having marginally higher GC time.

- **Gradle Process State:**
  - GC time is slightly higher in `variantb_useMetro_false`.

### 5. CPU & Memory Usage Analysis
- **Overall System Usage:**
  - CPU usage is maxed at 100% for both variants.
  - Memory usage is higher in `variantb_useMetro_false` (Max = 8.06 GB vs. 7.69 GB).

- **Main Gradle Process:**
  - CPU usage is slightly higher in `variantb_useMetro_false`.
  - Memory usage is significantly higher in `variantb_useMetro_false` (Max = 4.58 GB vs. 3.88 GB).

- **Build Child Processes:**
  - CPU and memory usage are slightly higher in `variantb_useMetro_false`.

### 6. Garbage Collection Analysis
- Total GC collections are higher in `variantb_useMetro_false` for both Gradle and Kotlin processes, indicating less efficient memory management.

This comprehensive analysis highlights the efficiency of `varianta_useMetro_true` in terms of build and configuration times, as well as certain task executions, while also pointing out the higher resource consumption and less efficient garbage collection in `variantb_useMetro_false`.
