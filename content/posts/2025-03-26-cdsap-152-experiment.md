---
layout: post
title: "Using R8 in a different process with 4gb and G1"
date: 2025-03-26
report_link: /Telltale/reports/experiment_results_20250326203450.html
summary: " 
The performance comparison between two Gradle build variants, `varianta_main_r8` and `variantb_r8_different_process`, reveals several key differences. The overall build time for `variantb_r8_different_process` is slightly higher by approximately 10.6 seconds (2.04% increase) compared to `varianta_main_r8`. Notably, `variantb_r8_different_process` shows a significant increase in memory usage, with a maximum of 14.24 GB compared to 11.2 GB for `varianta_main_r8`, marking a 27.14% increase. Additionally, `variantb_r8_different_process` has fewer total garbage collection (GC) events in the Gradle process but more in the Kotlin process, suggesting different memory management behaviors. The `R8Task` and `L8DexDesugarLibTask` are among the most time-consuming tasks, with `variantb_r8_different_process` showing longer execution times, especially in `L8DexDesugarLibTask` where the mean time increased by over 47%."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250326203450.html)
## Summary
The performance comparison between two Gradle build variants, `varianta_main_r8` and `variantb_r8_different_process`, reveals several key differences. The overall build time for `variantb_r8_different_process` is slightly higher by approximately 10.6 seconds (2.04% increase) compared to `varianta_main_r8`. Notably, `variantb_r8_different_process` shows a significant increase in memory usage, with a maximum of 14.24 GB compared to 11.2 GB for `varianta_main_r8`, marking a 27.14% increase. Additionally, `variantb_r8_different_process` has fewer total garbage collection (GC) events in the Gradle process but more in the Kotlin process, suggesting different memory management behaviors. The `R8Task` and `L8DexDesugarLibTask` are among the most time-consuming tasks, with `variantb_r8_different_process` showing longer execution times, especially in `L8DexDesugarLibTask` where the mean time increased by over 47%.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - `varianta_main_r8`: 519.017 seconds
  - `variantb_r8_different_process`: 529.645 seconds
  - **Difference**: +10.628 seconds (+2.04%)
- **P50 Build Time:**
  - `varianta_main_r8`: 516.637 seconds
  - `variantb_r8_different_process`: 524.536 seconds
- **P90 Build Time:**
  - `varianta_main_r8`: 537.050 seconds
  - `variantb_r8_different_process`: 551.347 seconds

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"R8Task"`:
    - `varianta_main_r8`: Mean: 180.886 seconds, P50: 179.733 seconds, P90: 262.373 seconds
    - `variantb_r8_different_process`: Mean: 183.153 seconds, P50: 206.333 seconds, P90: 264.743 seconds
  - `"L8DexDesugarLibTask"`:
    - `varianta_main_r8`: Mean: 23.098 seconds, P50: 16.647 seconds, P90: 46.107 seconds
    - `variantb_r8_different_process`: Mean: 34.003 seconds, P50: 29.022 seconds, P90: 59.783 seconds
  - `"DexMergingTask"`:
    - `varianta_main_r8`: Mean: 19.908 seconds, P50: 19.256 seconds, P90: 23.524 seconds
    - `variantb_r8_different_process`: Mean: 21.653 seconds, P50: 22.247 seconds, P90: 27.910 seconds

### 3. Statistical Patterns
- Significant timing variations observed in `"L8DexDesugarLibTask"` with over 47% increase in mean execution time in `variantb_r8_different_process`.
- The `"R8Task"` shows a substantial increase in P50 values in `variantb_r8_different_process`, indicating higher median build times.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Slight increase in garbage collection time in `variantb_r8_different_process`.
- **Gradle Process State:**
  - Lower garbage collection times in `variantb_r8_different_process`.

### 5. CPU & Memory Usage Analysis
- **Overall System Usage:**
  - CPU usage maxed at 100% for both variants.
  - Memory usage was significantly higher in `variantb_r8_different_process` (14.24 GB max) compared to `varianta_main_r8` (11.2 GB max).
- **Main Gradle Process:**
  - Similar CPU usage patterns.
  - Slightly lower memory usage in `variantb_r8_different_process`.
- **Build Child Processes:**
  - Higher memory usage in `variantb_r8_different_process` (up to 8.32 GB).

### 6. Garbage Collection Analysis
- **Total GC Collections:**
  - Gradle process: 233 for `varianta_main_r8` vs. 112 for `variantb_r8_different_process`.
  - Kotlin process: 45 for `varianta_main_r8` vs. 52 for `variantb_r8_different_process`.

### 7. Kotlin Build Reports Analysis
- Incremental compilation time shows an increase in `variantb_r8_different_process`.
- Code generation and analysis lines per second were lower in `variantb_r8_different_process`, indicating less efficiency in these areas.

The data indicates that while `variantb_r8_different_process` has a slightly slower build time and higher memory usage, it benefits from fewer GC events in the Gradle process, potentially indicating more efficient memory management in some areas but not universally across all metrics.
