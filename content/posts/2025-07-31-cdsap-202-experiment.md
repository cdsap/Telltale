---
layout: post
title: "KGP 2.2.20-Beta2 vs 2.2.0 without cache size"
date: 2025-07-31
report_link: /Telltale/reports/experiment_results_20250731154917.html
summary: " 
The analysis of the Gradle build performance comparison between `varianta_2.2.0` and `variantb_2.2.20-Beta2` reveals several key findings. The overall build time for `variantb_2.2.20-Beta2` is slightly longer, with a mean time of 762.133 seconds compared to 750.638 seconds for `varianta_2.2.0`, marking a 1.53% increase. Significant differences are noted in task execution times, particularly for `:core:account:kspDebugKotlin` which shows a 44% increase in mean execution time in `variantb_2.2.20-Beta2`. The CPU and memory usage are closely matched between the variants, with both maxing out CPU usage at 100% and memory usage peaking around 14 GB. The Kotlin Build Reports indicate that `variantb_2.2.20-Beta2` has a slightly longer compiler code analysis time but a quicker code generation rate."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250731154917.html)
## Summary
The analysis of the Gradle build performance comparison between `varianta_2.2.0` and `variantb_2.2.20-Beta2` reveals several key findings. The overall build time for `variantb_2.2.20-Beta2` is slightly longer, with a mean time of 762.133 seconds compared to 750.638 seconds for `varianta_2.2.0`, marking a 1.53% increase. Significant differences are noted in task execution times, particularly for `:core:account:kspDebugKotlin` which shows a 44% increase in mean execution time in `variantb_2.2.20-Beta2`. The CPU and memory usage are closely matched between the variants, with both maxing out CPU usage at 100% and memory usage peaking around 14 GB. The Kotlin Build Reports indicate that `variantb_2.2.20-Beta2` has a slightly longer compiler code analysis time but a quicker code generation rate.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - `varianta_2.2.0`: 750.638 seconds
  - `variantb_2.2.20-Beta2`: 762.133 seconds (1.53% increase)
- **P50 Build Time:**
  - `varianta_2.2.0`: 741.872 seconds
  - `variantb_2.2.20-Beta2`: 752.778 seconds
- **P90 Build Time:**
  - `varianta_2.2.0`: 794.976 seconds
  - `variantb_2.2.20-Beta2`: 828.511 seconds

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `:core:account:kspDebugKotlin`: 
    - `varianta_2.2.0`: Mean = 7471 ms
    - `variantb_2.2.20-Beta2`: Mean = 10797 ms (44% increase)
  - `:core:analytics:kspDebugKotlin`: 
    - `varianta_2.2.0`: Mean = 5876 ms
    - `variantb_2.2.20-Beta2`: Mean = 8997 ms (53% increase)
  - `:core:alarm:kspDebugKotlin`: 
    - `varianta_2.2.0`: Mean = 6217 ms
    - `variantb_2.2.20-Beta2`: Mean = 9616 ms (54% increase)

### 3. Statistical Patterns
- Tasks with notable timing variations:
  - `:core:account:kspDebugKotlin`, `:core:analytics:kspDebugKotlin`, and `:core:alarm:kspDebugKotlin` show significant increases in execution times in `variantb_2.2.20-Beta2`.

### 4. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes: Max 100% for both variants.
  - Build process: Max ~96.45% for both variants.
- **Memory Usage:**
  - All processes: Max ~14.1 GB for both variants.
  - Build processes: Max ~8.3 GB for both variants.

### 5. Garbage Collection Analysis
- Total GC collections are identical across both variants, with a total of 218 collections.

### 6. Kotlin Build Reports Analysis
- **Compiler Execution Stages Comparison:**
  - Code analysis time increased from 480.58 ms to 548.71 ms in `variantb_2.2.20-Beta2`.
  - Code generation improved slightly from 438.05 ms to 432.34 ms in `variantb_2.2.20-Beta2`.

### 7. Summary
The analysis indicates that while `variantb_2.2.20-Beta2` shows a slight increase in overall build time and significant increases in specific task execution times, it maintains similar levels of CPU and memory usage compared to `varianta_2.2.0`. The increase in compiler analysis time could be contributing to longer build times, despite improvements in code generation speed.
