---
layout: post
title: "K2 with Kotlin 2.2"
date: 2025-06-27
report_link: /Telltale/reports/experiment_results_20250627151715.html
summary: " 
The analysis of Gradle build performance data reveals several key differences between `varianta_kotlin_2.2.0` and `variantb_k2_kotlin_2.2.0`. Notably, the overall build time for variant B is longer by approximately 42.7 seconds (7.3% increase). In task execution, the `:layer_0:module_0_10:kspDebugKotlin` task shows a significant increase in execution time in variant B, suggesting a potential area for optimization. Memory usage is higher in variant B across all processes, with a notable increase in the main build process (up to 6.7 GB in variant B compared to 5.1 GB in variant A). Garbage collection activities also increased in variant B, indicating heavier memory management activities. These findings suggest that variant B may be less efficient in terms of both time and resource usage compared to variant A."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250627151715.html)
## Summary
The analysis of Gradle build performance data reveals several key differences between `varianta_kotlin_2.2.0` and `variantb_k2_kotlin_2.2.0`. Notably, the overall build time for variant B is longer by approximately 42.7 seconds (7.3% increase). In task execution, the `:layer_0:module_0_10:kspDebugKotlin` task shows a significant increase in execution time in variant B, suggesting a potential area for optimization. Memory usage is higher in variant B across all processes, with a notable increase in the main build process (up to 6.7 GB in variant B compared to 5.1 GB in variant A). Garbage collection activities also increased in variant B, indicating heavier memory management activities. These findings suggest that variant B may be less efficient in terms of both time and resource usage compared to variant A.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - Varianta: 581.085 seconds
  - Variantb: 623.762 seconds
  - **Difference:** 42.677 seconds more in variantb (7.3% increase)
- **P50 Build Time:**
  - Varianta: 577.115 seconds
  - Variantb: 621.142 seconds
  - **Difference:** 44.027 seconds more in variantb
- **P90 Build Time:**
  - Varianta: 598.178 seconds
  - Variantb: 643.598 seconds
  - **Difference:** 45.42 seconds more in variantb

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  1. `:layer_0:module_0_10:kspDebugKotlin`
     - Varianta Mean: 9444 ms
     - Variantb Mean: 14032 ms
     - **Difference:** 4588 ms more in variantb (48.6% increase)
  2. `:layer_0:module_0_1:kspDebugKotlin`
     - Varianta Mean: 10481 ms
     - Variantb Mean: 14536 ms
     - **Difference:** 4055 ms more in variantb (38.7% increase)
  3. `:layer_0:module_0_1:compileDebugKotlin`
     - Varianta Mean: 10968 ms
     - Variantb Mean: 14359 ms
     - **Difference:** 3391 ms more in variantb (30.9% increase)

### 3. Statistical Patterns
- Tasks with notable timing variations include `:layer_0:module_0_10:kspDebugKotlin`, `:layer_0:module_0_1:kspDebugKotlin`, and `:layer_0:module_0_1:compileDebugKotlin`, all showing more than 30% increase in execution time in variantb.
- Variantb consistently shows longer execution times across these key tasks, indicating a trend of decreased performance efficiency.

### 4. Process State Analysis
- **Kotlin Process State:**
  - Garbage Collection Time:
    - Varianta Mean: 0.5
    - Variantb Mean: 0.28
    - **Difference:** 0.22 less in variantb
- **Gradle Process State:**
  - Garbage Collection Time:
    - Varianta Mean: 0.23
    - Variantb Mean: 0.56
    - **Difference:** 0.33 more in variantb

### 5. CPU & Memory Usage Analysis
- **Overall System Usage:**
  - CPU: Max 100% for both variants.
  - Memory: Max 11.72 GB for variantb vs. 11.19 GB for varianta.
- **Main Gradle Process:**
  - CPU: Max 97% for both variants.
  - Memory: Max 6.61 GB for variantb vs. 4.85 GB for varianta.
- **Build Child Processes:**
  - CPU: Max 95.84% for varianta vs. 95.48% for variantb.
  - Memory: Max 5.48 GB for varianta vs. 4.27 GB for variantb.

### 6. Garbage Collection Analysis
- **Total GC Collections:**
  - Gradle Process: 284 for variantb vs. 202 for varianta.
  - Kotlin Process: 97 for variantb vs. 166 for varianta.
- Variantb shows a higher number of GC collections in the Gradle process, indicating more frequent memory management operations.

### 7. Kotlin Build Reports Analysis
- **Compiler Execution Stages Comparison:**
  - Compiler initialization time is slightly longer in variantb.
  - Total Gradle task time is also longer in variantb, consistent with the overall build time analysis.
- **Incremental Compilation Insights:**
  - Incremental compilation time is longer in variantb, aligning with the observed performance degradation.
- **Classpath and Cache Insights:**
  - Slight variations in the handling of classpath snapshots and cache operations between the variants.

Overall, variantb exhibits longer build times, higher resource consumption, and more frequent garbage collections, suggesting areas for potential optimization to match the efficiency of varianta.
