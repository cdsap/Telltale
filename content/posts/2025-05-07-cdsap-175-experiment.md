---
layout: post
title: "Gradle 8.14 vs 8.13 in an Android Project"
date: 2025-05-07
report_link: /Telltale/reports/experiment_results_20250507175828.html
summary: " 
The performance comparison between two Gradle build variants shows a slight improvement in overall build time for variant B (218.791s) compared to variant A (221.317s), with a decrease of about 1.14%. The most time-consuming tasks across both variants include `:app:l8DexDesugarLibDemoDebug`, `:app:mergeExtDexDemoDebug`, and `:core:designsystem:compileDemoDebugKotlin`, with variant B generally showing better performance in these tasks. Memory usage is slightly lower in variant B for all processes and build child processes. The total garbage collection counts are slightly higher in variant B for both Gradle and Kotlin processes."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250507175828.html)
## Summary
The performance comparison between two Gradle build variants shows a slight improvement in overall build time for variant B (218.791s) compared to variant A (221.317s), with a decrease of about 1.14%. The most time-consuming tasks across both variants include `:app:l8DexDesugarLibDemoDebug`, `:app:mergeExtDexDemoDebug`, and `:core:designsystem:compileDemoDebugKotlin`, with variant B generally showing better performance in these tasks. Memory usage is slightly lower in variant B for all processes and build child processes. The total garbage collection counts are slightly higher in variant B for both Gradle and Kotlin processes.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:** Variant A: 221.317s, Variant B: 218.791s (1.14% faster)
- **P50 Build Time:** Variant A: 219.952s, Variant B: 219.323s
- **P90 Build Time:** Variant A: 232.196s, Variant B: 226.016s

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `:app:l8DexDesugarLibDemoDebug`: Variant A: 39.349s, Variant B: 38.865s
  - `:app:mergeExtDexDemoDebug`: Variant A: 42.602s, Variant B: 42.595s
  - `:core:designsystem:compileDemoDebugKotlin`: Variant A: 18.574s, Variant B: 18.088s

### 3. Statistical Patterns
- Tasks with notable timing variations include `:core:data:compileDemoDebugKotlin` and `:feature:bookmarks:kspDemoDebugKotlin`, with variant B showing improvements in execution time.

### 4. Process State Analysis
#### Kotlin Process State
- **Garbage Collection Time (Mean):** Both variants have a mean GC time of 0.1s, with a slight increase in P90 for variant B (0.13s to 0.12s).

#### Gradle Process State
- **Garbage Collection Time (Mean):** Consistent at 0.13s across both variants.

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - **Max CPU Usage:** 100% for both variants.
  - **Max Memory Usage:** Variant A: 10.7 GB, Variant B: 10.54 GB.
- **Build Process:**
  - **Max CPU Usage:** Variant A: 93.48%, Variant B: 93.64%.
  - **Max Memory Usage:** Variant A: 5.32 GB, Variant B: 5.3 GB.
- **Build Child Processes:**
  - **Max CPU Usage:** Variant A: 92.46%, Variant B: 91.88%.
  - **Max Memory Usage:** Variant A: 4.46 GB, Variant B: 4.31 GB.

### 6. Garbage Collection Analysis
- **Total GC Collections for Gradle Process:** Variant A: 69, Variant B: 70.
- **Total GC Collections for Kotlin Process:** Consistent at 48 for both variants, with a slight increase in P90 for variant B (56.8 vs. 56).

Overall, variant B demonstrates a marginal improvement in build performance, particularly in terms of build time and memory efficiency, while maintaining similar levels of CPU usage and garbage collection activity.
