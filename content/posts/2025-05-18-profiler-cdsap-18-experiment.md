---
layout: post
title: "[Catchup] anvil vs metro - incremental build"
date: 2025-05-18
report_link: /Telltale/reports/experiment_results_20250518005731.html
summary: " 
The analysis of the Gradle build performance data reveals a notable improvement in overall build times when comparing variant B (metro_0_3_2) to variant A (anvil). Specifically, variant B is faster by approximately 6.7 seconds (26.012s for A vs. 19.291s for B), translating to a 25.8% decrease in build time. This improvement is consistent across the 50th and 90th percentiles as well. In task execution, the `:app-scaffold:compileDebugKotlin` task shows a significant increase in execution time in variant B, while `:app-scaffold:kspDebugKotlin` is notably faster. The Kotlin build reports highlight a substantial increase in IR translation time for variant B, suggesting a potential area for optimization. Memory and CPU usage are slightly higher in variant B for all processes, with the build child processes in variant B utilizing significantly more CPU resources. Lastly, garbage collection data indicates fewer total collections in variant B, suggesting more efficient memory management."
tags: ["gradle-profiler"]
---
[Report 📊](../../reports/experiment_results_20250518005731.html)
## Summary
The analysis of the Gradle build performance data reveals a notable improvement in overall build times when comparing variant B (metro_0_3_2) to variant A (anvil). Specifically, variant B is faster by approximately 6.7 seconds (26.012s for A vs. 19.291s for B), translating to a 25.8% decrease in build time. This improvement is consistent across the 50th and 90th percentiles as well. In task execution, the `:app-scaffold:compileDebugKotlin` task shows a significant increase in execution time in variant B, while `:app-scaffold:kspDebugKotlin` is notably faster. The Kotlin build reports highlight a substantial increase in IR translation time for variant B, suggesting a potential area for optimization. Memory and CPU usage are slightly higher in variant B for all processes, with the build child processes in variant B utilizing significantly more CPU resources. Lastly, garbage collection data indicates fewer total collections in variant B, suggesting more efficient memory management.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:** Variant A: 26.012s, Variant B: 19.291s (25.8% faster)
- **P50 Build Time:** Variant A: 24.497s, Variant B: 18.205s (25.7% faster)
- **P90 Build Time:** Variant A: 31.493s, Variant B: 23.995s (23.8% faster)

### 2. Task Type Differences
- Top 3 time-consuming tasks for Variant A:
  - `:app-scaffold:compileDebugKotlin`: Mean: 5.342s, P50: 5.024s, P90: 6.243s
  - `:libraries:summarizer:compileReleaseKotlin`: Mean: 1.534s, P50: 1.384s, P90: 2.351s
  - `:libraries:compose-extensions:compileReleaseKotlin`: Mean: 1.510s, P50: 1.330s, P90: 2.169s

- Comparison in Variant B:
  - `:app-scaffold:compileDebugKotlin`: Mean: 6.088s (14.0% increase), P50: 5.795s, P90: 7.429s
  - `:libraries:summarizer:compileReleaseKotlin`: Mean: 1.754s (14.3% increase), P50: 1.579s, P90: 2.493s
  - `:libraries:compose-extensions:compileReleaseKotlin`: Mean: 1.633s (8.1% increase), P50: 1.531s, P90: 2.347s

### 3. Statistical Patterns
- Notable timing variations:
  - `:app-scaffold:kspDebugKotlin`: Variant A: 1.470s vs. Variant B: 1.053s (28.4% faster in B)
  - `:app-scaffold:compileDebugKotlin`: Variant A: 5.342s vs. Variant B: 6.088s (14.0% slower in B)

### 5. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU Max: Both variants peak at 100%.
  - Memory Max: Variant A: 8.61 GB, Variant B: 8.8 GB (2.2% increase)
- **Build Process:**
  - CPU Max: Variant A: 89.29%, Variant B: 86.74% (2.9% decrease)
  - Memory Max: Variant A: 4.0 GB, Variant B: 4.41 GB (10.3% increase)
- **Build Child Processes:**
  - CPU Max: Variant A: 70.26%, Variant B: 80.81% (15.0% increase)
  - Memory Max: Variant A: 3.6 GB, Variant B: 3.41 GB (5.3% decrease)

### 6. Garbage Collection Analysis
- **Gradle GC Collections:** Variant A: 546, Variant B: 441 (19.2% decrease)
- **Kotlin GC Collections:** Variant A: 240, Variant B: 224 (6.7% decrease)

### 7. Kotlin Build Reports Analysis
- **Compiler IR Translation:** Variant A: 379.2ms vs. Variant B: 649.8ms (71.3% increase in B)
- **Incremental Compilation in Daemon:** Variant A: 1020.79ms vs. Variant B: 1233.37ms (20.8% increase in B)
- **Code Generation Lines per Second:** Variant A: 5242 vs. Variant B: 4101 (21.8% decrease in B)
