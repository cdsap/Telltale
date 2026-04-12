---
layout: post
title: "Gradle 9.2.1 vs 9.3.0"
date: 2026-01-17
report_link: /Telltale/reports/experiment_results_20260117014008.html
summary: " 
The analysis of the Gradle build performance data reveals minor differences between the two variants, `varianta_9.2.1` and `variantb_9.3.0`. The overall build time for `varianta_9.2.1` averaged 638.4 seconds, slightly faster than `variantb_9.3.0` at 639.8 seconds, a difference of about 1.4 seconds. Configuration times also showed a slight increase in `variantb_9.3.0` by approximately 0.9 seconds. The most time-consuming tasks across both variants include `:core:account:kspDebugKotlin`, `:core:analytics:kspDebugKotlin`, and `:core:article:kspDebugKotlin`, with execution times closely matched between variants. Memory and CPU usage for all processes and specifically for the build processes were nearly identical in both variants, indicating consistent resource utilization. The total garbage collection counts were also similar, with `varianta_9.2.1` having 290 collections compared to 288 in `variantb_9.3.0`."
tags: ["dependencies cache"]
components: ["gradle"]
---
[Report 📊](../../reports/experiment_results_20260117014008.html)
## Summary
The analysis of the Gradle build performance data reveals minor differences between the two variants, `varianta_9.2.1` and `variantb_9.3.0`. The overall build time for `varianta_9.2.1` averaged 638.4 seconds, slightly faster than `variantb_9.3.0` at 639.8 seconds, a difference of about 1.4 seconds. Configuration times also showed a slight increase in `variantb_9.3.0` by approximately 0.9 seconds. The most time-consuming tasks across both variants include `:core:account:kspDebugKotlin`, `:core:analytics:kspDebugKotlin`, and `:core:article:kspDebugKotlin`, with execution times closely matched between variants. Memory and CPU usage for all processes and specifically for the build processes were nearly identical in both variants, indicating consistent resource utilization. The total garbage collection counts were also similar, with `varianta_9.2.1` having 290 collections compared to 288 in `variantb_9.3.0`.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** `varianta_9.2.1` = 638.4s, `variantb_9.3.0` = 639.8s (0.22% slower)
  - **P50:** `varianta_9.2.1` = 636.3s, `variantb_9.3.0` = 638.3s
  - **P90:** `varianta_9.2.1` = 662.3s, `variantb_9.3.0` = 661.4s

- **Configuration Time:**
  - **Mean:** `varianta_9.2.1` = 55.3s, `variantb_9.3.0` = 56.2s (1.68% slower)
  - **P50:** `varianta_9.2.1` = 54.8s, `variantb_9.3.0` = 55.9s
  - **P90:** `varianta_9.2.1` = 58.4s, `variantb_9.3.0` = 60.2s

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Mean times are 2539ms for `varianta_9.2.1` and 2536ms for `variantb_9.3.0`.
  - `"com.android.build.gradle.internal.res.LinkApplicationAndroidResourcesTask"`: Mean times are 2200ms for `varianta_9.2.1` and 2159ms for `variantb_9.3.0`.
  - `"com.google.devtools.ksp.gradle.KspAATask"`: Mean times are 3839ms for `varianta_9.2.1` and 3836ms for `variantb_9.3.0`.

### 3. Statistical Patterns
- Minor variations in task execution times are observed, but none exceed a 10% difference, indicating consistent performance across variants.

### 4. Process State Analysis
- **CPU & Memory Usage:**
  - **All Processes:**
    - **Max CPU:** Both variants reached 100%.
    - **Max Memory:** `varianta_9.2.1` = 13.95 GB, `variantb_9.3.0` = 13.94 GB.
  - **Build Process:**
    - **Max CPU:** `varianta_9.2.1` = 97%, `variantb_9.3.0` = 96.88%.
    - **Max Memory:** `varianta_9.2.1` = 9.34 GB, `variantb_9.3.0` = 9.38 GB.
  - **Build Child Processes:**
    - **Max CPU:** `varianta_9.2.1` = 94.66%, `variantb_9.3.0` = 94.7%.
    - **Max Memory:** `varianta_9.2.1` = 3.7 GB, `variantb_9.3.0` = 3.65 GB.

### 6. Garbage Collection Analysis
- **Total GC Collections:** `varianta_9.2.1` had 290 collections, while `variantb_9.3.0` had 288 collections, showing minimal difference in garbage collection activity.

Overall, the performance metrics between the two variants are closely matched with only minor differences in build and configuration times, suggesting that updates in `variantb_9.3.0` have not significantly impacted the performance metrics measured.
