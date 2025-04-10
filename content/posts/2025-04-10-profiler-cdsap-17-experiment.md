---
layout: post
title: "CatchUp using Metro with abi scenario"
date: 2025-04-10
report_link: /Telltale/reports/experiment_results_20250410030420.html
summary: " 
The performance comparison between `varianta_main` and `variantb_z/metro` reveals that `variantb_z/metro` generally has a shorter build time with a mean reduction of 25.1% (6.622 seconds). Notably, `variantb_z/metro` also exhibits higher CPU usage in build child processes, suggesting more intensive parallel task execution. In the Kotlin Build Reports, `variantb_z/metro` shows a significant increase in Compiler IR translation time, which could indicate more complex translation processes. Memory usage is slightly lower in `variantb_z/metro` across all processes, contributing to its efficiency."
tags: ["gradle-profiler"]
---
[Report 📊](../../reports/experiment_results_20250410030420.html)
## Summary
The performance comparison between `varianta_main` and `variantb_z/metro` reveals that `variantb_z/metro` generally has a shorter build time with a mean reduction of 25.1% (6.622 seconds). Notably, `variantb_z/metro` also exhibits higher CPU usage in build child processes, suggesting more intensive parallel task execution. In the Kotlin Build Reports, `variantb_z/metro` shows a significant increase in Compiler IR translation time, which could indicate more complex translation processes. Memory usage is slightly lower in `variantb_z/metro` across all processes, contributing to its efficiency.

## Detailed Report

### 1. Build Time Comparison
- **Mean Build Time:** `varianta_main` averages 26.486 seconds, while `variantb_z/metro` is faster at 19.864 seconds, a decrease of 25.1%.
- **P50 Build Time:** `varianta_main` has a median time of 24.948 seconds compared to `variantb_z/metro` at 18.476 seconds.
- **P90 Build Time:** At the 90th percentile, `varianta_main` completes in 34.027 seconds, whereas `variantb_z/metro` finishes in 24.451 seconds.

### 2. Task Type Differences
- **":app-scaffold:compileDebugKotlin"** is the most time-consuming task in both variants, with `varianta_main` at 5.399 seconds and `variantb_z/metro` at 6.146 seconds.
- **":services:github:compileReleaseKotlin"** and **":services:producthunt:compileReleaseKotlin"** also show notable time differences, indicating variability in compilation tasks across variants.

### 3. Statistical Patterns
- Tasks like **":app-scaffold:kspDebugKotlin"** perform better in `variantb_z/metro` by approximately 25%.
- Conversely, **":app-scaffold:compileDebugKotlin"** shows a 13.8% increase in build time in `variantb_z/metro`, suggesting some inefficiencies in this specific compilation task.

### 5. CPU & Memory Usage Analysis
- **All Processes CPU Usage:** Both variants reach a maximum of 100%, with `variantb_z/metro` slightly lower on average.
- **All Processes Memory Usage:** `varianta_main` uses up to 9.27 GB, while `variantb_z/metro` uses up to 8.79 GB.
- **Build Process CPU Usage:** Similar usage with a maximum of around 85% for both variants.
- **Build Processes Memory Usage:** `varianta_main` uses more memory, peaking at 4.97 GB compared to 4.27 GB for `variantb_z/metro`.
- **Build Child Processes CPU Usage:** `variantb_z/metro` shows higher usage, peaking at 77.86%, which is about 10% higher than `varianta_main`.
- **Build Child Processes Memory Usage:** `variantb_z/metro` also uses more memory in child processes, peaking at 3.37 GB compared to 3.16 GB for `varianta_main`.

### 7. Kotlin Build Reports Analysis
- **Compiler IR Translation:** `variantb_z/metro` shows a dramatic increase in time spent on IR translation, indicating a more complex process.
- **Analysis Lines per Second:** `varianta_main` analyzes more lines per second, suggesting more efficient code analysis.
- **Code Generation Lines per Second:** `varianta_main` also performs better in code generation efficiency.

This analysis highlights the efficiency improvements in `variantb_z/metro` in terms of build time and resource usage, despite some task-specific inefficiencies.
