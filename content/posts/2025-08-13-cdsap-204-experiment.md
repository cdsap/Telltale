---
layout: post
title: "Configuration Cache read-only mode in CI - Gradle 9.1.0-RC1"
date: 2025-08-13
report_link: /Telltale/reports/experiment_results_20250813174036.html
summary: " 
The performance comparison between Gradle build variants `varianta_9.0.0` and `variantb_9.1.0-rc-1` reveals a slight increase in overall build time in the newer variant by approximately 2.36 seconds (1.16% increase). Notably, the `hiltJavaCompileDebug` task in `variantb_9.1.0-rc-1` shows a significant improvement, reducing its execution time by almost 50%. However, this variant also exhibits increased execution times for several Kotlin compilation tasks (`kspDebugKotlin`), particularly in the `domain` and `repository` modules. Memory usage across all processes is slightly reduced in the newer variant, while CPU usage remains maximally utilized in both variants. The total garbage collection counts remain unchanged across variants."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250813174036.html)
## Summary
The performance comparison between Gradle build variants `varianta_9.0.0` and `variantb_9.1.0-rc-1` reveals a slight increase in overall build time in the newer variant by approximately 2.36 seconds (1.16% increase). Notably, the `hiltJavaCompileDebug` task in `variantb_9.1.0-rc-1` shows a significant improvement, reducing its execution time by almost 50%. However, this variant also exhibits increased execution times for several Kotlin compilation tasks (`kspDebugKotlin`), particularly in the `domain` and `repository` modules. Memory usage across all processes is slightly reduced in the newer variant, while CPU usage remains maximally utilized in both variants. The total garbage collection counts remain unchanged across variants.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - `varianta_9.0.0`: Mean = 204.263s, P50 = 201.901s, P90 = 217.722s
  - `variantb_9.1.0-rc-1`: Mean = 209.029s, P50 = 209.785s, P90 = 217.381s
  - **Increase by 4.766s (2.34%) in mean time.**

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - **`KotlinCompile`**:
    - `varianta_9.0.0`: Mean = 2.567s, P50 = 2.292s, P90 = 3.657s
    - `variantb_9.1.0-rc-1`: Mean = 2.563s, P50 = 2.319s, P90 = 3.802s
  - **`CheckAarMetadataTask`**:
    - `varianta_9.0.0`: Mean = 1.121s, P50 = 1.104s, P90 = 1.284s
    - `variantb_9.1.0-rc-1`: Mean = 0.634s, P50 = 0.617s, P90 = 0.774s
    - **Significant reduction by 43.4% in mean time.**
  - **`LinkApplicationAndroidResourcesTask`**:
    - `varianta_9.0.0`: Mean = 2.130s, P50 = 2.131s, P90 = 2.304s
    - `variantb_9.1.0-rc-1`: Mean = 2.303s, P50 = 2.317s, P90 = 2.434s
    - **Increase by 8.13% in mean time.**

### 3. Statistical Patterns
- **Notable Timing Variations:**
  - `hiltJavaCompileDebug` shows a significant improvement in `variantb_9.1.0-rc-1` with a reduction from 11.257s to 5.291s in mean time.
  - `mergeExtDexDebug` also improved from 15.876s to 11.614s in mean time.

### 4. CPU & Memory Usage Analysis
- **CPU Usage:**
  - Both variants reached the maximum CPU usage of 100% for all processes.
- **Memory Usage:**
  - `varianta_9.0.0`: Max = 7.77 GB
  - `variantb_9.1.0-rc-1`: Max = 7.60 GB
  - **Slight reduction by 2.19% in maximum memory usage.**

### 5. Garbage Collection Analysis
- **Total GC Collections:**
  - Both variants reported 101 total collections in the main Gradle process, indicating no significant change in garbage collection behavior between the variants.

This analysis underscores the nuanced performance shifts between the two Gradle build variants, with specific improvements in task execution times and memory usage, balanced against minor increases in overall build time and specific task durations.
