---
layout: post
title: "Nowinandroid with Gradle 8.14-rc2"
date: 2025-04-18
report_link: /Telltale/reports/experiment_results_20250418182639.html
summary: " 
The analysis of the Gradle build performance data reveals that variant B (Gradle 8.14 rc2) generally exhibits slightly longer build times compared to variant A (Gradle 8.13). Specifically, the mean build time for variant B is about 5.06% longer, translating to an increase of approximately 29.1 seconds. Notably, the P90 times also show a similar trend with variant B taking roughly 39.8 seconds longer. In task execution, the most significant differences are observed in tasks like `:feature:foryou:kspDemoDebugKotlin` and `:app:mergeExtDexDemoDebug`, where variant B is slower by significant margins. CPU and memory usage are relatively consistent between variants, with minor fluctuations. The total garbage collection (GC) counts are slightly lower in variant B for both Gradle and Kotlin processes, suggesting a marginal improvement in memory management efficiency."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250418182639.html)
## Summary
The analysis of the Gradle build performance data reveals that variant B (Gradle 8.14 rc2) generally exhibits slightly longer build times compared to variant A (Gradle 8.13). Specifically, the mean build time for variant B is about 5.06% longer, translating to an increase of approximately 29.1 seconds. Notably, the P90 times also show a similar trend with variant B taking roughly 39.8 seconds longer. In task execution, the most significant differences are observed in tasks like `:feature:foryou:kspDemoDebugKotlin` and `:app:mergeExtDexDemoDebug`, where variant B is slower by significant margins. CPU and memory usage are relatively consistent between variants, with minor fluctuations. The total garbage collection (GC) counts are slightly lower in variant B for both Gradle and Kotlin processes, suggesting a marginal improvement in memory management efficiency.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - Variant A: 575.603 seconds
  - Variant B: 604.707 seconds
  - **Difference:** Variant B is 5.06% slower (29.1 seconds longer).
- **P50 Build Time:**
  - Variant A: 562.685 seconds
  - Variant B: 567.665 seconds
  - **Difference:** Variant B is 0.89% slower (4.98 seconds longer).
- **P90 Build Time:**
  - Variant A: 671.996 seconds
  - Variant B: 711.761 seconds
  - **Difference:** Variant B is 5.92% slower (39.8 seconds longer).

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `KotlinCompile`:
    - Variant A Mean: 4.783 seconds
    - Variant B Mean: 4.689 seconds
  - `LinkApplicationAndroidResourcesTask`:
    - Variant A Mean: 3.133 seconds
    - Variant B Mean: 2.317 seconds
  - `KspTaskJvm`:
    - Variant A Mean: 8.114 seconds
    - Variant B Mean: 7.812 seconds

### 3. Statistical Patterns
- Significant timing variations are observed in:
  - `:feature:foryou:kspDemoDebugKotlin`:
    - Variant A Mean: 48.240 seconds
    - Variant B Mean: 53.641 seconds
    - **Difference:** Variant B is 11.18% slower.
  - `:app:mergeExtDexDemoDebug`:
    - Variant A Mean: 267.401 seconds
    - Variant B Mean: 271.859 seconds
    - **Difference:** Variant B is 1.67% slower.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Slight decrease in GC time from 0.07 in variant A to 0.07 in variant B.
- **Gradle Process State:**
  - Gradle process GC time remains nearly constant at about 0.29.

### 5. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes: Maxed at 100% for both variants.
  - Build process: Peaked at 96.04% for both variants.
  - Build child processes: Slightly higher in variant B (90.78% vs. 90.7%).
- **Memory Usage:**
  - All processes: Peaked at 12.07 GB in variant B compared to 11.98 GB in variant A.
  - Build processes: Consistent at 6.05 GB for both variants.
  - Build child processes: Slightly higher in variant B (4.94 GB vs. 4.85 GB).

### 6. Garbage Collection Analysis
- **Total GC Collections:**
  - Gradle process: Reduced from 203 in variant A to 197 in variant B.
  - Kotlin process: Reduced from 39 in variant A to 38 in variant B.

### 7. Kotlin Build Reports Analysis
- **Compiler Performance Metrics:**
  - Slight improvements in code generation and analysis lines per second in variant B.
- **Incremental Compilation Insights:**
  - Incremental compilation time slightly reduced in variant B.

This detailed analysis highlights the nuanced performance differences between the two Gradle variants, with variant B showing a trend towards longer build times but potentially more efficient garbage collection.
