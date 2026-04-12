---
layout: post
title: "JDK 25 - Gradle 9.1"
date: 2025-09-20
report_link: /Telltale/reports/experiment_results_20250920000122.html
summary: " 
The analysis of the Gradle build performance data reveals some key differences between the two variants, `varianta_gradle_9_1_0` and `variantb_jdk_25`. The overall build time for `varianta_gradle_9_1_0` averaged 461.379 seconds, slightly faster than `variantb_jdk_25` at 469.345 seconds, a difference of about 7.966 seconds or approximately 1.7%. The configuration time showed `varianta_gradle_9_1_0` to be slower on average, taking 57.628 seconds compared to 55.901 seconds for `variantb_jdk_25`, a difference of 1.727 seconds or about 3.1%. Task execution times varied significantly between variants, with `variantb_jdk_25` generally taking longer in tasks related to Kotlin compilation and Android resource linking. Memory usage was slightly higher in `variantb_jdk_25` across all processes, with a maximum of 10.97 GB compared to 10.95 GB in `varianta_gradle_9_1_0`. CPU usage was nearly maxed out for both variants. The total garbage collection counts were higher in `varianta_gradle_9_1_0` with 157 collections compared to 120 in `variantb_jdk_25`."
tags: ["dependencies cache"]
components: ["jdk"]
---
[Report 📊](../../reports/experiment_results_20250920000122.html)
## Summary
The analysis of the Gradle build performance data reveals some key differences between the two variants, `varianta_gradle_9_1_0` and `variantb_jdk_25`. The overall build time for `varianta_gradle_9_1_0` averaged 461.379 seconds, slightly faster than `variantb_jdk_25` at 469.345 seconds, a difference of about 7.966 seconds or approximately 1.7%. The configuration time showed `varianta_gradle_9_1_0` to be slower on average, taking 57.628 seconds compared to 55.901 seconds for `variantb_jdk_25`, a difference of 1.727 seconds or about 3.1%. Task execution times varied significantly between variants, with `variantb_jdk_25` generally taking longer in tasks related to Kotlin compilation and Android resource linking. Memory usage was slightly higher in `variantb_jdk_25` across all processes, with a maximum of 10.97 GB compared to 10.95 GB in `varianta_gradle_9_1_0`. CPU usage was nearly maxed out for both variants. The total garbage collection counts were higher in `varianta_gradle_9_1_0` with 157 collections compared to 120 in `variantb_jdk_25`.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Mean: `varianta_gradle_9_1_0` = 461.379s, `variantb_jdk_25` = 469.345s (1.7% slower)
  - P50: `varianta_gradle_9_1_0` = 460.131s, `variantb_jdk_25` = 465.722s
  - P90: `varianta_gradle_9_1_0` = 471.945s, `variantb_jdk_25` = 481.620s

- **Configuration Time:**
  - Mean: `varianta_gradle_9_1_0` = 57.628s, `variantb_jdk_25` = 55.901s (3.1% faster)
  - P50: `varianta_gradle_9_1_0` = 56.977s, `variantb_jdk_25` = 55.178s
  - P90: `varianta_gradle_9_1_0` = 59.407s, `variantb_jdk_25` = 58.580s

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"KotlinCompile"`: Mean time `varianta_gradle_9_1_0` = 1.666s vs. `variantb_jdk_25` = 1.695s
  - `"KspTaskJvm"`: Mean time `varianta_gradle_9_1_0` = 2.732s vs. `variantb_jdk_25` = 2.768s
  - `"LinkApplicationAndroidResourcesTask"`: Mean time `varianta_gradle_9_1_0` = 2.130s vs. `variantb_jdk_25` = 2.229s

### 3. Statistical Patterns
- Tasks like `"DexMergingTask"` and `"compileDebugKotlin"` showed more than 10% difference in execution times, indicating potential areas for optimization in `variantb_jdk_25`.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Garbage collection time was slightly higher in `variantb_jdk_25` (0.42 vs. 0.37).

- **Gradle Process State:**
  - Garbage collection time was lower in `variantb_jdk_25` (0.15 vs. 0.18).

### 5. CPU & Memory Usage Analysis
- **Overall System Usage:**
  - CPU: Maxed at 100% for both variants.
  - Memory: `varianta_gradle_9_1_0` = 10.95 GB, `variantb_jdk_25` = 10.97 GB.

- **Main Gradle Process:**
  - CPU: `varianta_gradle_9_1_0` = 96.3%, `variantb_jdk_25` = 96.18%.
  - Memory: `varianta_gradle_9_1_0` = 5.27 GB, `variantb_jdk_25` = 5.17 GB.

### 6. Garbage Collection Analysis
- Total GC collections were higher in `varianta_gradle_9_1_0` (157 vs. 120), suggesting more frequent memory cleanup operations.

This detailed analysis highlights areas where performance tuning could potentially improve build efficiency, particularly in reducing the execution times of key tasks and optimizing garbage collection processes in `varianta_gradle_9_1_0`.
