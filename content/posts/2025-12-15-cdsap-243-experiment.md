---
layout: post
title: "Terminating Kotlin Process before R8 Task execution"
date: 2025-12-15
report_link: /Telltale/reports/experiment_results_20251215230916.html
summary: " 
The analysis of the Gradle build performance data reveals that variant B (`kill_process_before_r8`) generally performs better than variant A (`r8`). Specifically, the overall build time for variant B is shorter by approximately 8.3 seconds (1.7% improvement). This trend is consistent across various task types, where variant B often shows reduced execution times. Notably, the `R8Task`, one of the most time-consuming tasks, executes about 4.4 seconds faster in variant B. Memory usage is also slightly lower in variant B across all processes, with a maximum reduction of about 1.55 GB in overall system memory usage. CPU usage remains high and nearly maxed out for both variants, indicating a CPU-bound process."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20251215230916.html)
## Summary
The analysis of the Gradle build performance data reveals that variant B (`kill_process_before_r8`) generally performs better than variant A (`r8`). Specifically, the overall build time for variant B is shorter by approximately 8.3 seconds (1.7% improvement). This trend is consistent across various task types, where variant B often shows reduced execution times. Notably, the `R8Task`, one of the most time-consuming tasks, executes about 4.4 seconds faster in variant B. Memory usage is also slightly lower in variant B across all processes, with a maximum reduction of about 1.55 GB in overall system memory usage. CPU usage remains high and nearly maxed out for both variants, indicating a CPU-bound process.

## Detailed Report

### 1. Build Time Comparison
- **Overall Build Time:**
  - Variant A: Mean = 507.045s, P50 = 505.061s, P90 = 531.210s
  - Variant B: Mean = 498.696s, P50 = 495.041s, P90 = 520.179s
  - **Improvement:** Mean = 8.349s (1.7%), P50 = 10.02s (2.0%), P90 = 11.031s (2.1%)

- **Configuration Time:**
  - Variant A: Mean = 46.039s, P50 = 44.979s, P90 = 49.190s
  - Variant B: Mean = 45.163s, P50 = 45.009s, P90 = 48.926s
  - **Improvement:** Mean = 0.876s (1.9%), P50 = -0.030s (-0.07%), P90 = 0.264s (0.5%)

### 2. Task Type Differences
- **Top 3 Time-Consuming Tasks:**
  - `"R8Task"`: Variant A Mean = 89.472s vs. Variant B Mean = 85.032s (4.44s faster in B)
  - `"org.jetbrains.kotlin.gradle.tasks.KotlinCompile"`: Variant A Mean = 3.493s vs. Variant B Mean = 3.505s (0.012s slower in B)
  - `"com.android.build.gradle.internal.lint.AndroidLintAnalysisTask"`: Variant A Mean = 3.561s vs. Variant B Mean = 3.254s (0.307s faster in B)

### 3. Statistical Patterns
- Tasks with notable timing variations:
  - `"R8Task"` shows a consistent improvement in Variant B across all percentiles.
  - `"AndroidLintAnalysisTask"` also shows improved performance in Variant B, especially at the P50 level.

### 4. CPU & Memory Usage Analysis
- **All Processes:**
  - CPU: Max usage is 100% for both variants.
  - Memory: Variant A Max = 11.8 GB, Variant B Max = 10.25 GB (1.55 GB less in B)

- **Build Process:**
  - CPU: Variant A Max = 96.87%, Variant B Max = 96.83%
  - Memory: Variant A Max = 7.36 GB, Variant B Max = 7.34 GB

- **Build Child Processes:**
  - CPU: Variant A Max = 94.13%, Variant B Max = 94.47%
  - Memory: Variant A Max = 3.56 GB, Variant B Max = 3.58 GB

### 5. Summary
Variant B shows a consistent improvement in build performance, particularly in overall build time and memory usage. The reduction in execution time for critical tasks like `"R8Task"` and `"AndroidLintAnalysisTask"` contributes significantly to this performance gain. Memory optimizations in Variant B also suggest better resource management, making it the preferable variant based on this data.
