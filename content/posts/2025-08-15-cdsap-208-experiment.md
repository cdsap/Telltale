---
layout: post
title: "KSP 2.2.10 with KSP2 Enabled"
date: 2025-08-15
report_link: /Telltale/reports/experiment_results_20250815225634.html
summary: " 
The analysis of the Gradle build performance data reveals that Variant B (`variantb_2.2.10-ksp2`) generally has longer build times compared to Variant A (`varianta_2.2.10`). Specifically, the mean build time for Variant B is approximately 8.2% longer than Variant A, translating to an increase of about 30.3 seconds. This trend is consistent across the P50 and P90 percentiles as well. In task execution, Variant B shows longer times particularly in Kotlin-related tasks, suggesting a possible area for optimization. Memory usage is also higher in Variant B by approximately 15.3%, which could be contributing to the increased build times. The total garbage collection (GC) events are significantly higher in Variant B, indicating more frequent memory management operations which could be impacting performance."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250815225634.html)
## Summary
The analysis of the Gradle build performance data reveals that Variant B (`variantb_2.2.10-ksp2`) generally has longer build times compared to Variant A (`varianta_2.2.10`). Specifically, the mean build time for Variant B is approximately 8.2% longer than Variant A, translating to an increase of about 30.3 seconds. This trend is consistent across the P50 and P90 percentiles as well. In task execution, Variant B shows longer times particularly in Kotlin-related tasks, suggesting a possible area for optimization. Memory usage is also higher in Variant B by approximately 15.3%, which could be contributing to the increased build times. The total garbage collection (GC) events are significantly higher in Variant B, indicating more frequent memory management operations which could be impacting performance.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - Variant A: 371.257 seconds
  - Variant B: 401.582 seconds
  - **Difference:** Variant B is 30.325 seconds (8.2%) slower.
- **P50 Build Time:**
  - Variant A: 371.581 seconds
  - Variant B: 399.533 seconds
  - **Difference:** Variant B is 27.952 seconds (7.5%) slower.
- **P90 Build Time:**
  - Variant A: 385.551 seconds
  - Variant B: 416.519 seconds
  - **Difference:** Variant B is 30.968 seconds (8.0%) slower.

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  1. `:core:cart:kspDebugKotlin`
     - Variant A Mean: 7821 ms
     - Variant B Mean: 14365 ms
     - **Difference:** Variant B is 65.2% slower.
  2. `:core:identity:kspDebugKotlin`
     - Variant A Mean: 6025 ms
     - Variant B Mean: 13202 ms
     - **Difference:** Variant B is 119.0% slower.
  3. `:core:checkout:kspDebugKotlin`
     - Variant A Mean: 7043 ms
     - Variant B Mean: 13829 ms
     - **Difference:** Variant B is 96.3% slower.

### 3. Statistical Patterns
- Tasks related to `kspDebugKotlin` in Variant B consistently show more than double the execution time compared to Variant A, particularly in core modules like `cart`, `identity`, and `checkout`.

### 4. CPU & Memory Usage Analysis
- **All Processes:**
  - Memory Usage Max:
    - Variant A: 10.8 GB
    - Variant B: 12.45 GB
    - **Difference:** Variant B uses 15.3% more memory.
- **Build Process:**
  - CPU Usage Max:
    - Variant A: 96.1%
    - Variant B: 96.67%
  - Memory Usage Max:
    - Variant A: 5.36 GB
    - Variant B: 7.68 GB
    - **Difference:** Variant B uses 43.3% more memory.

### 6. Garbage Collection Analysis
- **Total GC Collections:**
  - Variant A: 146
  - Variant B: 193
  - **Difference:** Variant B has 32.2% more GC events, suggesting less efficient memory management.

This comprehensive analysis highlights the need for optimizations in Variant B, particularly in Kotlin compilation tasks and memory management, to improve overall build performance.
