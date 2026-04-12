---
layout: post
title: "JDK 25 Parallel GC - Gradle 9.1"
date: 2025-09-23
report_link: /Telltale/reports/experiment_results_20250923213836.html
summary: " 
The performance comparison between `varianta_gradle_9_1_0` and `variantb_jdk_25_parallel` reveals several key insights. The overall build time for `varianta_gradle_9_1_0` averaged 466.318 seconds, slightly higher than `variantb_jdk_25_parallel` at 448.495 seconds, marking a decrease of about 3.82%. Configuration times also show a decrease from 59.939 seconds in `varianta_gradle_9_1_0` to 53.989 seconds in `variantb_jdk_25_parallel`, a reduction of approximately 9.92%. Notably, garbage collection (GC) was more efficient in `variantb_jdk_25_parallel` with significantly fewer total collections (74) compared to `varianta_gradle_9_1_0` (157). Memory usage peaked slightly higher in `variantb_jdk_25_parallel` at 11.49 GB compared to 10.98 GB in `varianta_gradle_9_1_0`. CPU usage was maximized at 100% for both variants, indicating full utilization during the builds."
tags: ["dependencies cache"]
components: ["jdk"]
---
[Report 📊](../../reports/experiment_results_20250923213836.html)
## Summary
The performance comparison between `varianta_gradle_9_1_0` and `variantb_jdk_25_parallel` reveals several key insights. The overall build time for `varianta_gradle_9_1_0` averaged 466.318 seconds, slightly higher than `variantb_jdk_25_parallel` at 448.495 seconds, marking a decrease of about 3.82%. Configuration times also show a decrease from 59.939 seconds in `varianta_gradle_9_1_0` to 53.989 seconds in `variantb_jdk_25_parallel`, a reduction of approximately 9.92%. Notably, garbage collection (GC) was more efficient in `variantb_jdk_25_parallel` with significantly fewer total collections (74) compared to `varianta_gradle_9_1_0` (157). Memory usage peaked slightly higher in `variantb_jdk_25_parallel` at 11.49 GB compared to 10.98 GB in `varianta_gradle_9_1_0`. CPU usage was maximized at 100% for both variants, indicating full utilization during the builds.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - `varianta_gradle_9_1_0`: Mean: 466.318s, P50: 464.060s, P90: 493.302s
  - `variantb_jdk_25_parallel`: Mean: 448.495s, P50: 446.847s, P90: 464.009s
  - **Reduction**: Mean: 3.82%, P50: 3.71%, P90: 5.94%

- **Configuration Time:**
  - `varianta_gradle_9_1_0`: Mean: 59.939s, P50: 58.788s, P90: 65.043s
  - `variantb_jdk_25_parallel`: Mean: 53.989s, P50: 53.649s, P90: 57.712s
  - **Reduction**: Mean: 9.92%, P50: 8.74%, P90: 11.27%

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - `"KotlinCompile"`: `varianta_gradle_9_1_0` Mean: 1.675s vs `variantb_jdk_25_parallel` Mean: 1.627s
  - `"KspTaskJvm"`: `varianta_gradle_9_1_0` Mean: 2.752s vs `variantb_jdk_25_parallel` Mean: 2.643s
  - `"DexMergingTask"`: `varianta_gradle_9_1_0` Mean: 3.816s vs `variantb_jdk_25_parallel` Mean: 4.119s (Increase)

### 3. Statistical Patterns
- Notable timing variations are seen in `"DexMergingTask"` where `variantb_jdk_25_parallel` shows an increase in execution time by about 7.94% compared to `varianta_gradle_9_1_0`.

### 4. Process State Analysis
- **Gradle Process State:**
  - `varianta_gradle_9_1_0`: GC Time Mean: 0.18% vs `variantb_jdk_25_parallel`: GC Time Mean: 0.24%
  - `variantb_jdk_25_parallel` shows a higher percentage of time spent in garbage collection.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - Both variants reached a maximum CPU usage of 100%, indicating full utilization.
- **Memory Usage:**
  - `varianta_gradle_9_1_0`: Max: 10.98 GB
  - `variantb_jdk_25_parallel`: Max: 11.49 GB
  - Slight increase in memory usage in `variantb_jdk_25_parallel`.

### 6. Garbage Collection Analysis
- `varianta_gradle_9_1_0` had a total of 157 GC collections compared to 74 in `variantb_jdk_25_parallel`, indicating more efficient memory management in the latter.

This detailed analysis provides a comprehensive view of the build performance differences between the two variants, highlighting areas of efficiency and potential bottlenecks.
