---
layout: post
title: "Comparing lintDebug in 300 modules project limiting task parallelization (3 workers)"
date: 2025-05-13
report_link: /Telltale/reports/experiment_results_20250513012310.html
summary: " 
The performance comparison between `varianta_main` and `variantb_lint_1.5g` reveals significant differences in build times and resource utilization. `variantb_lint_1.5g` shows a notable reduction in overall build time, clocking in at approximately 1057.511 seconds compared to `varianta_main`'s 1642.304 seconds, marking a decrease of around 35.6%. This variant also uses less memory, with a maximum of 11.64 GB compared to `varianta_main`'s 13.69 GB. However, CPU usage is slightly higher in `variantb_lint_1.5g` for the build process, peaking at 93.95% versus 92.00% in `varianta_main`."
tags: ["dependencies cache"]
---
[Report 📊](../../reports/experiment_results_20250513012310.html)
## Summary
The performance comparison between `varianta_main` and `variantb_lint_1.5g` reveals significant differences in build times and resource utilization. `variantb_lint_1.5g` shows a notable reduction in overall build time, clocking in at approximately 1057.511 seconds compared to `varianta_main`'s 1642.304 seconds, marking a decrease of around 35.6%. This variant also uses less memory, with a maximum of 11.64 GB compared to `varianta_main`'s 13.69 GB. However, CPU usage is slightly higher in `variantb_lint_1.5g` for the build process, peaking at 93.95% versus 92.00% in `varianta_main`.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:**
  - `varianta_main`: 1642.304 seconds
  - `variantb_lint_1.5g`: 1057.511 seconds
  - **Reduction**: 35.6%

- **P50 Build Time:**
  - `varianta_main`: 1591.554 seconds
  - `variantb_lint_1.5g`: 1035.889 seconds
  - **Reduction**: 34.9%

- **P90 Build Time:**
  - `varianta_main`: 1856.659 seconds
  - `variantb_lint_1.5g`: 1153.438 seconds
  - **Reduction**: 37.9%

### 2. Task Type Differences
- Top 3 time-consuming tasks in `varianta_main`:
  1. `:layer_0:module_0_1:lintAnalyzeDebug` - Mean: 43100 ms
  2. `:layer_0:module_0_10:lintAnalyzeDebug` - Mean: 13809 ms
  3. `:layer_0:module_0_100:lintAnalyzeDebug` - Mean: 10623 ms

- Comparison in `variantb_lint_1.5g`:
  1. `:layer_0:module_0_1:lintAnalyzeDebug` - Mean: 47156 ms (Increase)
  2. `:layer_0:module_0_10:lintAnalyzeDebug` - Mean: 31988 ms (Significant increase)
  3. `:layer_0:module_0_100:lintAnalyzeDebug` - Mean: 13289 ms (Increase)

### 3. Statistical Patterns
- `:layer_0:module_0_10:lintAnalyzeDebug` shows a significant increase in execution time in `variantb_lint_1.5g` by over 131% compared to `varianta_main`.
- Other tasks such as `:layer_0:module_0_1:lintAnalyzeDebug` and `:layer_0:module_0_100:lintAnalyzeDebug` also show increases but are less pronounced.

### 4. CPU & Memory Usage Analysis
- **CPU Usage:**
  - All processes maxed out at 100% in both variants.
  - Build process CPU usage was slightly higher in `variantb_lint_1.5g` (93.95%) compared to `varianta_main` (92.00%).

- **Memory Usage:**
  - All processes memory was lower in `variantb_lint_1.5g` with a max of 11.64 GB compared to 13.69 GB in `varianta_main`.
  - Build processes memory was higher in `variantb_lint_1.5g` (7.38 GB) compared to `varianta_main` (6.18 GB).

### 5. Garbage Collection Analysis
- Total GC collections were slightly lower in `variantb_lint_1.5g` with 687.5 collections compared to 689.0 in `varianta_main`.

This analysis highlights the efficiency improvements in `variantb_lint_1.5g` in terms of build time and memory usage, despite a slight increase in CPU usage for the build process and higher execution times for specific tasks.
