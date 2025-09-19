---
layout: post
title: "Gradle 9.1.0 vs 9.0.0"
date: 2025-09-19
report_link: /Telltale/reports/experiment_results_20250919174643.html
summary: " 
The performance comparison between Gradle versions 9.0.0 and 9.1.0 shows minor differences in build times and resource usage. The mean build time for version 9.0.0 is approximately 467 seconds, slightly faster than the 468 seconds for version 9.1.0, a difference of about 1 second or 0.2%. Configuration times are nearly identical, with version 9.0.0 being marginally quicker by about 0.4%. The most time-consuming tasks across both versions are related to Kotlin compilation and Android resource linking, with minor variations in execution times. CPU and memory usage for both the build process and child processes are similar, with no significant differences exceeding 10%. The total garbage collection counts are also comparable, indicating similar memory management efficiency between the two versions."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250919174643.html)
## Summary
The performance comparison between Gradle versions 9.0.0 and 9.1.0 shows minor differences in build times and resource usage. The mean build time for version 9.0.0 is approximately 467 seconds, slightly faster than the 468 seconds for version 9.1.0, a difference of about 1 second or 0.2%. Configuration times are nearly identical, with version 9.0.0 being marginally quicker by about 0.4%. The most time-consuming tasks across both versions are related to Kotlin compilation and Android resource linking, with minor variations in execution times. CPU and memory usage for both the build process and child processes are similar, with no significant differences exceeding 10%. The total garbage collection counts are also comparable, indicating similar memory management efficiency between the two versions.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - **Mean:** 467 seconds (9.0.0) vs. 468 seconds (9.1.0) — a 0.2% increase.
  - **P50:** 466 seconds (9.0.0) vs. 465 seconds (9.1.0) — a 0.2% decrease.
  - **P90:** 487 seconds (9.0.0) vs. 493 seconds (9.1.0) — a 1.2% increase.

- **Configuration Time:**
  - **Mean:** 58 seconds (9.0.0) vs. 58 seconds (9.1.0) — a 0.4% decrease.
  - **P50:** 58 seconds (9.0.0) vs. 57 seconds (9.1.0) — a 1.1% decrease.
  - **P90:** 61 seconds (9.0.0) vs. 62 seconds (9.1.0) — a 2.6% increase.

### 2. Task Type Differences
- **Top Time-Consuming Tasks:**
  - **"KotlinCompile"**
    - **Mean:** 1.688s (9.0.0) vs. 1.694s (9.1.0)
    - **P50:** 1.422s (9.0.0) vs. 1.412s (9.1.0)
    - **P90:** 2.549s (9.0.0) vs. 2.593s (9.1.0)
  - **"KspTaskJvm"**
    - **Mean:** 2.765s (9.0.0) vs. 2.783s (9.1.0)
    - **P50:** 2.604s (9.0.0) vs. 2.613s (9.1.0)
    - **P90:** 3.673s (9.0.0) vs. 3.728s (9.1.0)
  - **"LinkApplicationAndroidResourcesTask"**
    - **Mean:** 2.180s (9.0.0) vs. 2.204s (9.1.0)
    - **P50:** 2.129s (9.0.0) vs. 2.174s (9.1.0)
    - **P90:** 2.489s (9.0.0) vs. 2.463s (9.1.0)

### 3. Statistical Patterns
- **Notable Timing Variations:**
  - "DexMergingTask" shows a significant increase in mean and P90 times in version 9.1.0.
  - "DexArchiveBuilderTask" also shows a notable increase in P90 time in version 9.1.0.

### 4. Process State Analysis
- **Gradle Process State:**
  - **CPU Usage:** 96.32% (9.0.0) vs. 96.34% (9.1.0)
  - **Memory Usage:** 5.22 GB (9.0.0) vs. 5.29 GB (9.1.0)

### 5. CPU & Memory Usage Analysis
- **Overall System Usage:**
  - **CPU:** Max 100% for both versions.
  - **Memory:** Max 11.0 GB (9.0.0) vs. 10.99 GB (9.1.0)

### 6. Garbage Collection Analysis
- **Total GC Collections:**
  - 161 (9.0.0) vs. 157 (9.1.0)

Overall, the differences between Gradle versions 9.0.0 and 9.1.0 are minimal, with slight increases in build and configuration times in the newer version, alongside comparable resource usage and garbage collection performance.
