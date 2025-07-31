---
layout: post
title: "Gradle 9.0-rc4 vs 8.14.2"
date: 2025-07-31
report_link: /Telltale/reports/experiment_results_20250731015745.html
summary: " 
The analysis of Gradle build performance data reveals a slight increase in overall build time when transitioning from variant A (8.14.2) to variant B (9.0.0-rc4). Specifically, the mean build time increased by approximately 7.5 seconds (0.85% increase), with the P90 time showing an increase of about 8.6 seconds (0.95% increase). Notably, the `:layer_0:module_0_1:kspDebugKotlin` task showed a significant increase in mean execution time by approximately 3.4 seconds (46.5% increase). In contrast, the `:layer_0:module_0_1:parseDebugLocalResources` task saw a decrease in mean execution time by about 4.9 seconds (-28.5%). Memory usage across all processes slightly increased in variant B, with a peak usage of 13.98 GB compared to 13.53 GB in variant A. CPU usage remained maximally utilized at 100% for all processes in both variants."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250731015745.html)
## Summary
The analysis of Gradle build performance data reveals a slight increase in overall build time when transitioning from variant A (8.14.2) to variant B (9.0.0-rc4). Specifically, the mean build time increased by approximately 7.5 seconds (0.85% increase), with the P90 time showing an increase of about 8.6 seconds (0.95% increase). Notably, the `:layer_0:module_0_1:kspDebugKotlin` task showed a significant increase in mean execution time by approximately 3.4 seconds (46.5% increase). In contrast, the `:layer_0:module_0_1:parseDebugLocalResources` task saw a decrease in mean execution time by about 4.9 seconds (-28.5%). Memory usage across all processes slightly increased in variant B, with a peak usage of 13.98 GB compared to 13.53 GB in variant A. CPU usage remained maximally utilized at 100% for all processes in both variants.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - Varianta_8.14.2: 872.077 seconds
  - Variantb_9.0.0-rc4: 879.564 seconds
  - **Increase:** 7.487 seconds (0.85%)
- **P50 Build Time:**
  - Varianta_8.14.2: 874.976 seconds
  - Variantb_9.0.0-rc4: 878.488 seconds
  - **Increase:** 3.512 seconds (0.40%)
- **P90 Build Time:**
  - Varianta_8.14.2: 905.630 seconds
  - Variantb_9.0.0-rc4: 914.242 seconds
  - **Increase:** 8.612 seconds (0.95%)

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`:
    - Varianta Mean: 2.542 seconds
    - Variantb Mean: 2.538 seconds
    - **Decrease:** 0.004 seconds (0.16%)
  - `"com.google.devtools.ksp.gradle.KspTaskJvm"`:
    - Varianta Mean: 3.206 seconds
    - Variantb Mean: 3.247 seconds
    - **Increase:** 0.041 seconds (1.28%)
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`:
    - Varianta Mean: 2.566 seconds
    - Variantb Mean: 2.581 seconds
    - **Increase:** 0.015 seconds (0.58%)

### 3. Statistical Patterns
- Significant timing variations:
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"` showed minimal change.
  - `"com.google.devtools.ksp.gradle.KspTaskJvm"` and `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"` showed slight increases in execution times.

### 4. CPU & Memory Usage Analysis
- **All Processes:**
  - **CPU Usage:** Maxed at 100% for both variants.
  - **Memory Usage:**
    - Varianta Max: 12.9 GB
    - Variantb Max: 13.26 GB
- **Build Process:**
  - **CPU Usage:** Approximately 96.6% for both variants.
  - **Memory Usage:**
    - Varianta Max: 6.62 GB
    - Variantb Max: 6.61 GB
- **Build Child Processes:**
  - **CPU Usage:** Approximately 96% for both variants.
  - **Memory Usage:**
    - Varianta Max: 5.77 GB
    - Variantb Max: 6.16 GB

### 5. Garbage Collection Analysis
- **Total GC Collections:**
  - Gradle Process:
    - Varianta: 267.0
    - Variantb: 269.0
  - Kotlin Process:
    - Varianta: 280.0
    - Variantb: 280.0

The data indicates a minor performance degradation in build times and a slight increase in resource consumption with the newer Gradle variant. Task execution times for critical tasks such as Kotlin compilation and Android resource linking have remained relatively stable, with minor fluctuations.
